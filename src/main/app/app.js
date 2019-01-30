angular.module("chatApp", [])
	.controller("chatController", ["$scope", function($scope) {
		$scope.messages = [
			{user: "Paco", text: "Hey"},
			{user: "Julio", text: "Que tal?"},
			{user: "Paco", text: "Bien"}
		];
        $scope.contacts = [
            {id: 1, name: "Paco", pic: "Paco.jpg"},
			{id: 2, name: "Julio", pic: "Julio.jpg"}
        ];
        $scope.userIsLogged = false;
        $scope.currentUser = null;
        $scope.currentText = "";
        //User input functions
        $scope.send = function() {
            $scope.messages.push({
                user: $scope.currentUser,
                text: $scope.currentText
            });
            $scope.currentText = "";
        };
        $scope.login = function() {
            $scope.currentUser = prompt("User name:");
            if ($scope.currentUser) {
                $scope.userIsLogged = true;
            }
        };
        $scope.logout = function() {
            $scope.userIsLogged = false;
        };
}]).directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });
                event.preventDefault();
            }
        });
    };
});

