package Injector;

our ($VERSION, @ISA, @EXPORT, @EXPORT_OK);
BEGIN
{
    require Exporter;
    $VERSION   = 0.01;
    @ISA       = qw|Exporter|;
    @EXPORT    = qw||;
    @EXPORT_OK = qw|injector|;
}

use strict;
use warnings FATAL => 'all';
use v5.14;


package _Injector;
use Moo;
with 'Injector::Role';

package Injector;
sub injector
{
    state $injector = _Injector->new->injector;
}


1;