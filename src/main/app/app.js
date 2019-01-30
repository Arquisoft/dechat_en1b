angular.module("chatApp", ["chatServices"])
	.controller("chatController", ["$scope", "chatService", function($scope, chatService) {
		$scope.chats = chatService.loadChats("12345"); //Test
        $scope.currentChat = $scope.chats[0];
        $scope.userIsLogged = true;
        $scope.currentUser = "Miguel";
        $scope.currentText = "";
        //User input functions
        $scope.send = function() {
            if ($scope.currentChat.currentText.length <= 0)
                return;
            $scope.currentChat.messages.push({
                user: $scope.currentUser,
                text: $scope.currentChat.currentText
            });
            $scope.currentChat.currentText = "";
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
        $scope.changeChat = function(event) {
            let child = event.path[0];
            //Get index inside of parent
            var i = 0;
            while( (child = child.previousElementSibling) != null ) 
                i++;
            $scope.currentChat = $scope.chats[i];
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

