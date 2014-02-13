package Injector::Role;
use strict;
use warnings FATAL => 'all';
use v5.14;
use Moo::Role;
# use Function::Parameters { func => 'function_strict', fn => 'method_strict' };
use Beam::Wire;

has 'injector', is => 'ro', init_arg => undef, lazy => 1, default => sub
{
    state $injector = Beam::Wire->new(file => 'injector.yaml');
};

1;