export class User {

    constructor(username) {
        this.username = username;
    }

    uid?: string;
    username?: string;
    status?: string = "online";
    profilePicture?: string = "../assets/images/profile.png";
}
