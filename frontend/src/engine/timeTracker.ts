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

    /**
     * 
     * @returns a new id for a time tracker rule (actual timestamp)
     */
    public getNextTimeTrackerRuleId(): string {
        return new Date().getTime().toString()
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

    public fromRuleObj(ruleObj: TimeTrackerRuleObj): TimeTrackerRule {
        const rule = new TimeTrackerRule(
            ruleObj.id,
            ruleObj.site_or_app_name,
            ruleObj.minutesDailyLimit,
            ruleObj.rule,
            ruleObj.category
        );
        rule.remainingTimeMin = ruleObj.remainingTimeMin;
        this.rules.set(rule.id, rule)
        return rule;
    }

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
    public async mergeAndCheckCoerence(PWArules: TimeTrackerRuleObj[], ExtRules: TimeTrackerRuleObj[], lk: string): Promise<TimeTrackerRuleObj[]> {
        let changed = false //flag
        interface ttRuleObjChanged extends TimeTrackerRuleObj {
            changed: boolean
        }
        // Create a map of extension rules for efficient lookup by rule ID.
        // => allows finding an extension rule by its ID in O(1) on average.
        const extRulesMap = new Map<string, TimeTrackerRuleObj>();
        for (const extRule of ExtRules) {
            extRulesMap.set(extRule.id, extRule);
        }
        // Time Complexity: O(M), where M is the number of rules in ExtRules.

        // Iterate through the PWA rules and merge with corresponding extension rules if found.
        // Use .map() to create a new array and transform each PWA rule.
        const mergedRules: ttRuleObjChanged[] = PWArules.map((pwaRule) => {
            // Create a shallow copy of the PWA rule to avoid mutating the original array.
            const mergedRule: ttRuleObjChanged = { ...pwaRule, changed: false };

            // Look up O(1) the corresponding rule in the extension rules map.
            const matchingExtRule = extRulesMap.get(pwaRule.id);

            if (matchingExtRule && matchingExtRule.remainingTimeMin < pwaRule.remainingTimeMin) {
                changed = true;
                mergedRule.changed = true
                mergedRule.remainingTimeMin = matchingExtRule.remainingTimeMin
            }

            return mergedRule;
        });
        // Time Complexity: O(N), where N is the number of rules in PWArules,
        // as the map lookup inside the loop is O(1) on average.

        // Total Time Complexity: O(M) + O(N) = O(N + M)

        let parsedMergedRules: TimeTrackerRuleObj[] = []
        if (changed) {
            for (let r of mergedRules) {
                let parsedR: TimeTrackerRuleObj = { ...r }
                if (r.changed) {
                    await this.addOrUpdateRule(lk, this.fromRuleObj(parsedR));
                }
                parsedMergedRules.push(parsedR)
            }
            return parsedMergedRules;
        }else{
            return mergedRules.map((r) =>  {return { ...r } as TimeTrackerRuleObj})
        }
        
    }
}
