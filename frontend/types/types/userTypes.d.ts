export declare enum UserPrestigeTitle {
    TaskPeasant = "Task Peasant",
    SquireOfSmallChores = "Squire of Small Chores",
    ApprenticeOfProcrastination = "Apprentice of Procrastination",
    ChecklistPadawan = "Checklist Padawan",
    ErrandIntern = "Errand Intern",
    KnightOfTheToDoTable = "Knight of the To-Do Table",
    DukeOfDeadlines = "Duke of Deadlines",
    TimeTamingBaron = "Time-Taming Baron",
    MasterOfMundanity = "Master of Mundanity",
    ViscountOfVictory = "Viscount of Victory",
    TheTaskfather = "The Taskfather",
    GrandAdmiralOfGoals = "Grand Admiral of Goals",
    TheChosenOne = "The Chosen One (of Productivity)",
    EarlOfEfficiency = "Earl of Efficiency",
    HighlordOfHabits = "Highlord of Habits",
    TheTerminatorOfTasks = "The Terminator of Tasks",
    DreadSovereign = "Dread Sovereign of the Schedule",
    EmperorOfExecution = "Emperor of Execution",
    ChecklistCrusader = "Checklist Crusader",
    ProductivityPaladin = "Productivity Paladin",
    KingInTheNorth = "King in the North (of Notes)",
    TheOneWhoGetsThingsDone = "The One Who Gets Things Done",
    OverlordOfOrganization = "Overlord of Organization",
    SupremeBeingOfTheBulletPoints = "Supreme Being of the Bullet Points"
}
export type UserPrestigeLevel = {
    title: UserPrestigeTitle;
    description: string;
    minTasksCompleted: number;
};
export declare const prestigeLevels: UserPrestigeLevel[];
export type category = {
    name: string;
    points: number;
};
export type friend = {
    licenseKey: string;
};
export type friendRequest = {
    by_username: string;
    by_licenseKey: string;
};
export type userDBentry = {
    age: number;
    categories: category[];
    createdAt: Date;
    email: string;
    firstName: string;
    lastName: string;
    licenseIsValid: boolean;
    licenseKey: string;
    notifications: boolean;
    permissions: boolean;
    phone: string;
    timeTrackerActive: boolean;
    username: string;
    karmaCoinsBalance: number;
    friends: friend[];
    avatarImagePath: string;
    fcmToken: string;
};
