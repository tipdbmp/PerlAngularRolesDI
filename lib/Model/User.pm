package Model::User;
use strict;
use warnings FATAL => 'all';
use v5.14;
use Function::Parameters { func => 'function_strict', fn => 'method_strict' };
use Moo;

with 'Service::DB::Role';
with 'Service::SaltedPasswordHashing::Role';
has 'username', is => 'ro', required => 1;

has '_resultset', is => 'ro', init_arg => undef, lazy => 1, default => fn()
{
    state $resultset = $self->db->schema->resultset('User');
},
handles => [qw|find|];

fn to_json()
{
    return $self->find({ username => $self->username })->TO_JSON;
}

fn is_present()
{
    # return !!$self->db->schema->resultset('User')->find({ username => $self->username });
    return !!$self->find({ username => $self->username });
}

fn is_username_valid()
{
    $self->validator->validate({ username => $self->username });
    return 0, $self->validator->errors if $self->validator->has_errors;
    return 1, $self->validator->values;
}

fn BUILD(@_)
{
    $self->_init_validator;
}

# Initialize the validation object but just once.
#
fn _init_validator()
{
    state $initialized = 0;
    return if $initialized;
    $initialized = 1;

    $self->validator
        ->field('username')
        ->required(1)
        ->length(2, 32)
        ->regexp(qr/[-_A-Za-z0-9]/)
        ->trim(1)
        ->messages
        ({
            REQUIRED                 => 'This field is required.',
            REGEXP_CONSTRAINT_FAILED => 'Expected only the characters: -, _, A-Z, a-z, 0-9.',
            LENGTH_CONSTRAINT_FAILED => 'The length should be between 2 and 32 characters.',
        });
        ;
};

1;