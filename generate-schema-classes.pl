use DBIx::Class::Schema::Loader qw/ make_schema_at /;
make_schema_at
(
    'Service::DB::Schema',
    {
        debug => 1,
        dump_directory => './lib',
        components => ['Helper::Row::ToJSON'],
    },
    [
        'dbi:mysql:vlezin', 'root', 'table',
        # { loader_class => 'MyLoader' } # optionally

    ],
);