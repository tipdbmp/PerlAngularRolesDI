package Service::DB::Role;
use strict;
use warnings FATAL => 'all';
use v5.14;
use Moo::Role;
use Input::Validator;
use Function::Parameters { func => 'function_strict', fn => 'method_strict' };
with 'Injector';

requires '_init_validator'; # '_resultset';

has 'db', is => 'ro', init_arg => undef, lazy => 1, default => fn()
{
    state $db = $self->injector->get('Service::DB');
};


# This attribute is different (creates a new object) for each class
# the role is "mixed in" but it is the same (same object) for the
# instances of that class.
has 'validator', is => 'ro', init_arg => undef, lazy => 1, builder => '_build_validator';
fn _build_validator()
{
    state $attr = {};
    my $ref = ref $self;

    $attr->{$ref} //= Input::Validator->new
    (
        messages =>
        {
            REQUIRED => 'This field is required.',
            # REGEXP_CONSTRAINT_FAILED => 'dada?',
            # LENGTH_CONSTRAINT_FAILED => 'not enough length'
        },
        # explicit => 1,
        # trim => 0, # doesn't work =)
    );

    $attr->{$ref};
};


# fn READ(:$id) { my $o = $self->me->find($id); return $o->TO_JSON if $o; }
# fn READ_ALL   { [ map { $_->TO_JSON } $self->me->all ]; }

# fn DELETE(:$id)
# {
#     my $o = $self->me->find($id);
#     return undef if !$o;
#     $o->delete->TO_JSON;
# }

1;