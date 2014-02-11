package Service::DB;
use strict;
use warnings FATAL => 'all';
use v5.14;
use Moo;
use Service::DB::Schema;
use Function::Parameters { func => 'function_strict', fn => 'method_strict' };

has [qw|dsn user password|], is => 'ro', required => 1;

has 'schema', is => 'ro', init_arg => undef, builder => '_schema_builder', lazy => 1;
fn _schema_builder()
{
    return Service::DB::Schema->connect
    ({
        dsn               => $self->dsn,
        user              => $self->user,
        password          => $self->password,
        RaiseError        => 1,
        AutoCommit        => 1,
        mysql_enable_utf8 => 1,
    });
}

1;