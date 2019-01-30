angular.module("chatServices", [])
    .service("chatService", [ChatService]);

function ChatService() {
    //In the future this will call the SOLID library
    this.loadChats = function (profileID) {
        return [
                {
                    currentText: "",
                    contact: {
                        name: "Paco",
                        pic: "Paco.jpg"
                    },
                    messages: [
                        {user: "Paco", text: "Hey"},
                        {user: "Yo", text: "Que tal?"},
                        {user: "Paco", text: "Bien"}
                    ]
                },
                {
                    currentText: "",
                    contact: {
                        name: "Julio",
                        pic: "Julio.jpg"
                    },
                    messages: [
                        {user: "Yo", text: "Hey"},
                        {user: "Julio", text: "Hola perro"}
                    ]
                }
            ];
        };
}
