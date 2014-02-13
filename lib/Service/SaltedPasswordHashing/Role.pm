package Service::SaltedPasswordHashing::Role;
use strict;
use warnings FATAL => 'all';
use v5.14;
use Moo::Role;
use Function::Parameters { func => 'function_strict', fn => 'method_strict' };

has 'salted_pwd_hashing', is => 'ro', required => 1;

1;