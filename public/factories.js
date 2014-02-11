app.factory('HAS_DB', function() { return 1; });

app.factory('$rest', function(Restangular)
{
    var xbase = '/localhost:5000/';
//    var xbase = '/localhost:3000/';
//    var xbase = '';

    return {
        all: function(route)     { return Restangular.all(xbase + route); },
        one: function(route, id) { return Restangular.one(xbase + route, id); },
    };
});

