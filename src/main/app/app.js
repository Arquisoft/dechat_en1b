angular.module("chatApp", ["chatServices"])
	.controller("chatController", ["$scope", "chatService", function($scope, chatService) {
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
                $scope.chats = chatService.loadChats($scope.currentUser);
                $scope.currentChat = Object.values($scope.chats)[0];
            }
        };
        $scope.logout = function() {
            $scope.chats = null;
            $scope.currentChat = null;
            $scope.userIsLogged = false;
            $scope.currentUser = null;
        };
        $scope.changeChat = function(event) {
            let chatID = event.target.getAttribute("data-contact");
            $scope.currentChat = $scope.chats[chatID];
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