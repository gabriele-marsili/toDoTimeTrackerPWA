export type category = { name: string, points: number }
export type friend = { 
    licenseKey : string,
}
export type friendRequest = {
    by_username : string,
    by_licenseKey : string
}
export type userDBentry = {
    age: number,
    categories: category[],
    createdAt: Date,
    email: string,
    firstName: string,
    lastName: string,
    licenseIsValid: boolean,
    licenseKey: string,
    notifications: boolean,
    permissions: boolean,
    phone: string,
    timeTrackerActive: boolean,
    username: string,    
    karmaCoinsBalance: number,
    friends: friend[],
    avatarImagePath: string,
    fcmToken : string,
    karmaBoost : number,
    frame : string
}