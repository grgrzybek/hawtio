/// <reference path="../_module.ts" />
/// <reference path="../../../../../d.ts/angularjs/angular.d.ts" />
module Core {

  export var AppController = _module.controller("Core.AppController", ["$scope", "$route", "$location", ($scope, $route, $location) => {
    $scope.app = "app";
  }]);

}
