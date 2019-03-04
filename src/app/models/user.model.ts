export class User {

    constructor(username, profilePicture) {
        this.username = username;
        this.profilePicture = profilePicture;
    }

    uid?: string;
    username?: string;
    status?: string = "online";
    profilePicture?: string = "../assets/images/profile.png";
}
