export type ruleType = "only notify" | "notify & close" | "notify, close & block"
export class TimeTrackerRule {
    public id : string
    public site_or_app_name : string
    public minutesDailyLimit : number
    public rule : ruleType
    public category : string
    public remainingTimeMin : number
    
    constructor(id:string,site_or_app_name:string,minutesDailyLimit:number,rule:ruleType, category:string){
        this.id = id;
        this.category = category;
        this.minutesDailyLimit = minutesDailyLimit
        this.rule = rule;
        this.site_or_app_name = site_or_app_name
        this.remainingTimeMin = minutesDailyLimit
    }


}