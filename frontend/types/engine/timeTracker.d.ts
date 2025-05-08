import { API_gestor } from "../backend-comunication/api_comunication";
import { baseResponse } from "../types/utilityTypes";
export type ruleType = "only notify" | "notify & close" | "notify, close & block";
export interface TimeTrackerRuleObj {
    id: string;
    site_or_app_name: string;
    minutesDailyLimit: number;
    rule: ruleType;
    category: string;
    remainingTimeMin: number;
}
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
    /**
     *
     * @returns a new id for a time tracker rule (actual timestamp)
     */
    getNextTimeTrackerRuleId(): string;
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
    /**
 * Merges PWA rules with extension rules, maintaining coherence based on PWA policy.
 * Policy: For rules with the same ID in both batches, the minimum of the remaining times
 * is kept in the PWA rule within the resulting array.
 * Rules present only in the PWA batch are included as they are.
 * Rules present only in the Extension batch are ignored.
 * In case of changing update also db
 *
 * @param PWArules - Rules from the PWA (have priority for the base structure).
 * @param ExtRules - Rules from the extension.
 * @param lk - License Key
 * @returns A new array containing the merged rules derived from PWArules,
 * with remaining times updated based on ExtRules where applicable.
 */
    mergeAndCheckCoerence(PWArules: TimeTrackerRuleObj[], ExtRules: TimeTrackerRuleObj[], lk: string): Promise<TimeTrackerRuleObj[]>;
}
