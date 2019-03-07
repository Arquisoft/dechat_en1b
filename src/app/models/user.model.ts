export class User {

    constructor(webId, username, profilePicture) {
        this.webId = webId;
        this.username = username;
        this.profilePicture = profilePicture;
    }

    webId?: string;
    username?: string;
    status?: string = "online";
    profilePicture?: string = "../assets/images/profile.png";
}
