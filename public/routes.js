app.config(function($routeProvider)
{
    $routeProvider
    .when('/page1',
    {
        controller:  'page1-ctrl',
        templateUrl: 'page1/my/_.html',
    })
    .when('/view-template',
    {
        controller:  'view-template-ctrl',
        templateUrl: 'view-template/my/_.html',
    })
    .otherwise({ redirectTo: '/page1' })
    ;
});

//$(document).ready(function()
//{
//    'use strict';
//});


