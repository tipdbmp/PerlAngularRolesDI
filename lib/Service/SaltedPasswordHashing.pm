package Service::SaltedPasswordHashing;
use strict;
use warnings FATAL => 'all';
use v5.14;
use Moo;
use Service::DB::Schema;
use Function::Parameters { func => 'function_strict', fn => 'method_strict' };

use Data::Entropy::Algorithms ();
use MIME::Base64 ();
use Digest::SHA3 ();

fn hashed_password_and_salt_from(:$password)
{
    my $salt            = Data::Entropy::Algorithms::rand_bits(512);
    $salt               = MIME::Base64::encode_base64($salt);
    $salt               =~ s/\s+//g;
    my $hashed_password = Digest::SHA3::sha3_512_base64($password . $salt);

    return $hashed_password, $salt;
}

1;