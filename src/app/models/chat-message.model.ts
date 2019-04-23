export class ChatMessage {

    constructor(userName, message, date?) {
        this.userName = userName;
        this.message = message;
        this.timeSent = date || new Date();
    }

    webId: string;

    userName?: string;
    message?: string;
    timeSent?: Date;

}
