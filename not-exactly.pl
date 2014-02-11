use strict;
use warnings FATAL => 'all';
use v5.14;
use FindBin;
use lib "$FindBin::Bin/lib";

# use Beam::Wire;
# my $injector   = Beam::Wire->new(file => 'injector.yaml');
# my $service_db = $injector->get('Service::DB');
# # use DDP; p $service_db;
# my $User = $service_db->schema->resultset('User');
# # my @users = $User->all;
# # use DDP;
# # say p $_ for @users;

# # my $user = !!$User->find({ username => 'John1'});

# use DDP; p $user;



use Model::User;
# use DDP;
# my ($is_valid, $data);

# my $user1 = Model::User->new(username => 'ab');
# ($is_valid, $data) = $user1->is_username_valid;
# say p $is_valid;
# say p $data;

# my $user2 = Model::User->new(username => 'x' x 33);
# ($is_valid, $data) = $user2->is_username_valid;
# say p $is_valid;
# say p $data;

# say $user1->is_present;

my $user = Model::User->new(username => 'van-dam');
say $user->is_present;