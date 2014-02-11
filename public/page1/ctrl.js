app.controller('page1-ctrl', function
(
    $scope
  , $rest
  , HAS_DB
)
{
    $scope.A = 'A';
    $scope.isCollapsed = false;

if (HAS_DB)
{
    $rest.one('echo', 'abcd').get().then(function(msg)
    {
        $scope.msg = msg;
    });
}

//    __once('page1-1', function()
//    {
//
//    });
});
