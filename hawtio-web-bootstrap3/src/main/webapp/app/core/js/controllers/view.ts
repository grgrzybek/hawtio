/// <reference path="../_module.ts" />
/// <reference path="../../../../../d.ts/angularjs/angular.d.ts" />
module Core {

  export var ViewController = _module.controller("Core.ViewController", ["$scope", function($scope) {
    $scope.viewPartial = "app/core/html/help.html";
  }]);

}
