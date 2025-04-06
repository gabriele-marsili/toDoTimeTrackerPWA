export type ruleType = "only notify" | "notify & close" | "notify, close & block";
export declare class TimeTrackerRule {
    id: string;
    site_or_app_name: string;
    minutesDailyLimit: number;
    rule: ruleType;
    category: string;
    remainingTimeMin: number;
    constructor(id: string, site_or_app_name: string, minutesDailyLimit: number, rule: ruleType, category: string);
}
