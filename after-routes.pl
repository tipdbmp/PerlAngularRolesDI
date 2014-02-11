# Kind of easier to develope
# DEVELOPMENT CORS
# use Plack::Builder;
# builder
# {
#     # enable 'CrossOrigin',
#     #     origins => '*';
#     #     methods => ['GET', 'POST', 'PUT', 'DELETE'],

#     enable 'CrossOrigin',
#         origins => '*',
#         # methods => '*', #['GET', 'POST', 'PUT', 'DELETE'],
#         max_age => 1*1*1*30
#         ;

#     app->start;
# };
# DEVELOPMENT CORS

# use Plack::App::File;
# my $app = Plack::App::File->new(root => 'C:\Users\Sisa\Desktop\js-pracs\angular.js\0037-simpletodo')->to_app;

use Plack::Builder;
use FindBin;

# print "$FindBin::Bin \n";
builder {
    enable "Plack::Middleware::Static",
        path => qr{^/public}, root => "$FindBin::Bin";

    # Don't want to put login in the templates directory.
    push @{ app->renderer->paths }, "$FindBin::Bin/public";

    app->start;
};


# DEVELOPMENT no CORS
# app->start;
# DEVELOPMENT no CORS


# PRODUCTION
# app->start('fastcgi');
# PRODUCTION