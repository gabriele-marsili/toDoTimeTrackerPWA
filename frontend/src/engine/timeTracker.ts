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

export class TimeTrackerRule {
    public id: string;
    public site_or_app_name: string;
    public minutesDailyLimit: number;
    public rule: ruleType;
    public category: string;
    public remainingTimeMin: number;

    constructor(id: string, site_or_app_name: string, minutesDailyLimit: number, rule: ruleType, category: string) {
        this.id = id;
        this.category = category;
        this.minutesDailyLimit = minutesDailyLimit;
        this.rule = rule;
        this.site_or_app_name = site_or_app_name;
        this.remainingTimeMin = minutesDailyLimit;
    }

    public getAsObj(): TimeTrackerRuleObj {
        return {
            id: this.id,
            site_or_app_name: this.site_or_app_name,
            minutesDailyLimit: this.minutesDailyLimit,
            rule: this.rule,
            category: this.category,
            remainingTimeMin: this.remainingTimeMin
        };
    }
}


export class TimeTrackerHandler {
    private static instance: TimeTrackerHandler;
    private apiGestor: API_gestor;

    private rules: Map<string, TimeTrackerRule> = new Map();

    private constructor(apiGestor: API_gestor) {
        this.apiGestor = apiGestor;
    }

    public static getInstance(apiGestor: API_gestor): TimeTrackerHandler {
        if (!TimeTrackerHandler.instance) {
            TimeTrackerHandler.instance = new TimeTrackerHandler(apiGestor);
        }
        return TimeTrackerHandler.instance;
    }

    public async addOrUpdateRule(licenseKey: string, rule: TimeTrackerRule): Promise<baseResponse> {
        try {
            const response = await this.apiGestor.addOrUpdateTimeTrackerRule(licenseKey, rule);
            if (!response.success) throw new Error(response.errorMessage);

            this.rules.set(rule.id, rule);
            return { success: true, errorMessage: "" };
        } catch (error: any) {
            console.error("Error in addOrUpdateRule:", error);
            return { success: false, errorMessage: error.message };
        }
    }

    public async removeRule(licenseKey: string, id: string): Promise<baseResponse> {
        try {
            if (!this.rules.has(id)) throw new Error(`Rule with id ${id} does not exist.`);

            const response = await this.apiGestor.removeTimeTrackerRule(licenseKey, id);
            if (!response.success) throw new Error(response.errorMessage);

            this.rules.delete(id);
            return { success: true, errorMessage: "" };
        } catch (error: any) {
            console.error("Error in removeRule:", error);
            return { success: false, errorMessage: error.message };
        }
    }

    public getRule(id: string): TimeTrackerRule | undefined {
        return this.rules.get(id);
    }

    public getAllRules(): TimeTrackerRule[] {
        return Array.from(this.rules.values());
    }

    public async loadAllRules(licenseKey: string): Promise<{
        success: boolean;
        errorMessage: string;
        rules: TimeTrackerRuleObj[];
    }> {
        try {
            const response = await this.apiGestor.getTimeTrackerRules(licenseKey);
            if (!response.success) throw new Error(response.errorMessage);

            this.rules.clear();
            for (const ruleObj of response.rules) {
                const rule = this.fromRuleObj(ruleObj);
                this.rules.set(rule.id, rule);
            }

            return {
                success: true,
                errorMessage: "",
                rules: response.rules
            };
        } catch (error: any) {
            console.error("Error in loadAllRules:", error);
            return {
                success: false,
                errorMessage: error.message,
                rules: []
            };
        }
    }

    private fromRuleObj(ruleObj: TimeTrackerRuleObj): TimeTrackerRule {
        const rule = new TimeTrackerRule(
            ruleObj.id,
            ruleObj.site_or_app_name,
            ruleObj.minutesDailyLimit,
            ruleObj.rule,
            ruleObj.category
        );
        rule.remainingTimeMin = ruleObj.remainingTimeMin;
        return rule;
    }
}
