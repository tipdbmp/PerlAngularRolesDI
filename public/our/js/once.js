// var __1_time_only = (function()
var __once = (function()
{
    var has_been_called = {};

    return function(unique_id, callback)
    {
        if (!has_been_called[unique_id])
        {
            callback();
            // it's called now
            has_been_called[unique_id] = true;
        }
    };
}());
