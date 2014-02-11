sub CREATE
{
    my $url     = shift;
    my $cb      = shift;
    post $url   => sub
    {
        my $self    = shift;
        my @params  = $self->param;
        my %params;
        $params{$_} = $self->param($_) for @params;
        my $json    = $self->req->json;
        $cb->($self, %params, json => $json);
    };
}

sub READ
{
    my $url     = shift;
    my $cb      = shift;
    get $url    => sub
    {
        my $self    = shift;
        my @params  = $self->param;
        my %params;
        $params{$_} = $self->param($_) for @params;
        $cb->($self, %params);
    };
}

sub UPDATE
{
    my $url     = shift;
    my $cb      = shift;
    put $url    => sub
    {
        my $self    = shift;
        # my @params  = $self->param;
        # my %params;
        # $params{$_} = $self->param($_) for @params;
        # use DDP; p $params;
        # p $json;
        my $json    = $self->req->json;
        # $cb->($self, %params, json => $json);
        $cb->($self, json => $json);
    };
}

sub DELETE
{
    my $url     = shift;
    my $cb      = shift;
    any ['delete'], $url    => sub
    {
        my $self    = shift;
        my @params  = $self->param;
        my %params;
        $params{$_} = $self->param($_) for @params;
        my $json    = $self->req->json;
        $cb->($self, %params, json => $json);
    };
}

1;