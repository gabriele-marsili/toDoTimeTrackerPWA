export type category = {name:string, points:number}
export type userRegistrationForm = {
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    age: string,
    phone: string,
    
    categories: category[],
    
    notifications: boolean,
    permissions: boolean,
    timeTracker: boolean,
    acceptTerms: boolean,
}