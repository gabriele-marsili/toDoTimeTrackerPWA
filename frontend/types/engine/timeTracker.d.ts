import { API_gestor } from "../backend-comunication/api_comunication";
import { baseResponse } from "../types/utilityTypes";
export type ruleType = "only notify" | "notify & close" | "notify, close & block";
export type TimeTrackerRuleObj = {
    id: string;
    site_or_app_name: string;
    minutesDailyLimit: number;
    rule: ruleType;
    category: string;
    remainingTimeMin: number;
};
export declare class TimeTrackerRule {
    id: string;
    site_or_app_name: string;
    minutesDailyLimit: number;
    rule: ruleType;
    category: string;
    remainingTimeMin: number;
    constructor(id: string, site_or_app_name: string, minutesDailyLimit: number, rule: ruleType, category: string);
    getAsObj(): TimeTrackerRuleObj;
}
export declare class TimeTrackerHandler {
    private static instance;
    private apiGestor;
    private rules;
    private constructor();
    static getInstance(apiGestor: API_gestor): TimeTrackerHandler;
    addOrUpdateRule(licenseKey: string, rule: TimeTrackerRule): Promise<baseResponse>;
    removeRule(licenseKey: string, id: string): Promise<baseResponse>;
    getRule(id: string): TimeTrackerRule | undefined;
    getAllRules(): TimeTrackerRule[];
    loadAllRules(licenseKey: string): Promise<{
        success: boolean;
        errorMessage: string;
        rules: TimeTrackerRuleObj[];
    }>;
    fromRuleObj(ruleObj: TimeTrackerRuleObj): TimeTrackerRule;
}
