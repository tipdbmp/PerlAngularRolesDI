app.filter('reverse', function()
{
    return function(input, uppercase)
    {
        return input.split("").reverse().join("");
    }
});
