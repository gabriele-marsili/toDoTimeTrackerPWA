export class TimeTrackerRule {
    id;
    site_or_app_name;
    minutesDailyLimit;
    rule;
    category;
    remainingTimeMin;
    constructor(id, site_or_app_name, minutesDailyLimit, rule, category) {
        this.id = id;
        this.category = category;
        this.minutesDailyLimit = minutesDailyLimit;
        this.rule = rule;
        this.site_or_app_name = site_or_app_name;
        this.remainingTimeMin = minutesDailyLimit;
    }
}
