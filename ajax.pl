use strict;
use warnings FATAL => 'all';
use v5.14;
use Function::Parameters { func => 'function_strict', fn => 'method_strict' };
use Mojolicious::Lite;
# use DB::Todo;
BEGIN { require 'before-routes.pl'; }

# CREATE '/add_todo'   => fn(:$json)       { $self->render(json => DB::Todo->new->CREATE(text => $json->{text} )); };
# READ   '/todos'      => fn()             { $self->render(json => DB::Todo->new->READ_ALL);          };
# READ   '/todo/:id'   => fn(:$id)         { $self->render(json => DB::Todo->new->READ(id => $id));   };
# UPDATE '/todos/:id'  => fn(:$json)       { $self->render(json => DB::Todo->new->UPDATE(id => $json->{id}, text => $json->{text}, done => $json->{done})); };
# DELETE '/todo/:id'   => fn(:$id, :$json) { $self->render(json => DB::Todo->new->DELETE(id => $id)); };

# READ 'stuffs/:id'     => fn(%params) { $self->render(json => stuffs_id(%params) ); };
# READ 'nice/:id/:dude' => fn(%params) { $self->render(json => nice_id(%params));    };

READ 'echo/:msg'      => fn(:$msg)   { $self->render(json => { echo => $msg })     };


any [qw|get post|], '/' => fn()
{
    my %vars =
    (
        username_required => '',
        password_required => '',
        username          => '',
        error             => '',
    );

    if ($self->req->method eq 'GET')
    {
        $self->render(template => 'login', format => 'html', handler => 'ep', %vars);
        return;
    }
    else
    {
        my $username = $self->param('username');

        if (!$username)
        {
            $vars{'error'} = 'Enter your username.';
            $vars{'username_required'} = 1;
            return $self->render(template => 'login', format => 'html', handler => 'ep', %vars);
        }

        my $password = $self->param('password');
        if (!$password)
        {
            $vars{'error'} = 'Enter your password.';
            $vars{'password_required'} = 1;
            $vars{'username'} = $username;
            return $self->render(template => 'login', format => 'html', handler => 'ep', %vars);
        }

        $vars{'error'} = 'The username or password you entered is incorrect.';
        $vars{'username_required'} = 1;
        $vars{'password_required'} = 1;
        $vars{'username'} = $username;
        $self->render(template => 'login', format => 'html', handler => 'ep', %vars);
    }
};


require 'after-routes.pl';