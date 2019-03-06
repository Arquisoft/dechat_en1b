export class ChatMessage {

    constructor(userName, message, millis?) {
        this.userName = userName;
        this.message = message;
        this.timeSent = new Date(millis);
    }

    $key?: string;
    userName?: string;
    message?: string;
    timeSent?: Date = new Date();
}
