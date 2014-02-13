use strict;
use warnings FATAL => 'all';
use v5.14;
use FindBin;
use lib "$FindBin::Bin/lib";
use Injector qw|injector|;

my $user = injector->get('Model::User', args => { username => 'van-dam' });
say $user->username;
my ($hashed_password, $salt) = $user->salted_pwd_hashing->hashed_password_and_salt_from(password => 'abcd');
say "\$hashed_password:        $hashed_password";
say "\$hashed_password length: ", length $hashed_password;
say "\$salt:                   $salt";
say "\$salt length             ", length $salt;

say $user->is_present;
use DDP; say p $user->to_json;
