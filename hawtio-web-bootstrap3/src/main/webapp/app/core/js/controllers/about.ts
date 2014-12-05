/// <reference path="../_module.ts" />
/// <reference path="../../../../../d.ts/angularjs/angular.d.ts" />
module Core {

  export var AboutController = _module.controller("Core.AboutController", ["$scope", function($scope) {
    $scope.message = "Hello " + (new Date().toLocaleString());
  }]);

}
