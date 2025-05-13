import { onMounted, ref } from 'vue';
import TimeTrackerRuleItem from './TimeTrackerRuleItem.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import { TimeTrackerRule } from '../engine/timeTracker';
const currentRule = ref(new TimeTrackerRule('', '', 1, 'notify & close', ''));
const notificationManager = ref(null);
const minutes = ref(0);
const hours = ref(0);
const rules = ref([]);
const showAddNewRuleBox = ref(false);
function sendNotify(type, text) {
    if (notificationManager.value) {
        notificationManager.value.showNotification({
            type: type,
            message: text,
        });
    }
    else {
        console.log("notification manager not found");
    }
}
function addNewRule() {
    let errors = [];
    if (currentRule.value.category == "") {
        errors.push("Missing Category");
    }
    if (currentRule.value.site_or_app_name == "") {
        errors.push("Missing Site/App name");
    }
    if (hours.value == 0 && minutes.value == 0) {
        errors.push("Hours and Minutes can't be both 0");
    }
    if (hours.value == 24 && minutes.value > 0) {
        errors.push("If hours are 24 minutes must be 0");
    }
    if (errors.length > 0) {
        sendNotify("error", errors[0]);
        return;
    }
    const id = "Rule " + Date.now().toString(); 
    const newRule = new TimeTrackerRule(id, currentRule.value.site_or_app_name, hours.value * 60 + minutes.value, currentRule.value.rule, currentRule.value.category);
    rules.value.push(newRule);
}
function cancelAddRule() {
    currentRule.value.category = "";
    currentRule.value.site_or_app_name = "";
    currentRule.value.rule = "notify & close";
    hours.value = 0;
    minutes.value = 0;
    showAddNewRuleBox.value = false;
}
function onRuleUpdate(updatedRule) {
    const index = rules.value.findIndex(r => r.id === updatedRule.id);
    if (index !== -1) {
        rules.value[index] = updatedRule;
    }
}
function onRuleDelete(ruleToDelete) {
    rules.value = rules.value.filter(r => r.id !== ruleToDelete.id);
}
function onRuleCopy(ruleToCopy) {
    const copiedRule = new TimeTrackerRule(Date.now().toString(), ruleToCopy.site_or_app_name, ruleToCopy.minutesDailyLimit, ruleToCopy.rule, ruleToCopy.category);
    rules.value.push(copiedRule);
}
onMounted(() => {
    let i = 0;
    while (i < 10) {
        i++;
        let r = new TimeTrackerRule('id ' + i, 'site ' + i, i * 10, 'notify & close', 'category ye');
        rules.value.push(r);
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['rule-list', 'add-rule-content', 'add-rule-content', 'rule-list', 'form-group', 'form-group', 'form-group', 'form-group', 'form-group',];
    // CSS variable injection 
    // CSS variable injection end 
    // @ts-ignore
    /** @type { [typeof NotificationManager, ] } */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(NotificationManager, new NotificationManager({
        ref: ("notificationManager"),
    }));
    const __VLS_1 = __VLS_0({
        ref: ("notificationManager"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    // @ts-ignore navigation for `const notificationManager = ref()`
    /** @type { typeof __VLS_ctx.notificationManager } */ ;
    var __VLS_5 = {};
    var __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("rule-list") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("add-rule") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showAddNewRuleBox = true;
            } },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("rule-items") },
    });
    for (const [rule] of __VLS_getVForSourceType((__VLS_ctx.rules))) {
        // @ts-ignore
        /** @type { [typeof TimeTrackerRuleItem, ] } */ ;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent(TimeTrackerRuleItem, new TimeTrackerRuleItem({
            ...{ 'onUpdate': {} },
            ...{ 'onDelete': {} },
            ...{ 'onCopy': {} },
            key: ((rule.id)),
            rule: ((rule)),
        }));
        const __VLS_7 = __VLS_6({
            ...{ 'onUpdate': {} },
            ...{ 'onDelete': {} },
            ...{ 'onCopy': {} },
            key: ((rule.id)),
            rule: ((rule)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
        let __VLS_11;
        const __VLS_12 = {
            onUpdate: (__VLS_ctx.onRuleUpdate)
        };
        const __VLS_13 = {
            onDelete: (__VLS_ctx.onRuleDelete)
        };
        const __VLS_14 = {
            onCopy: (__VLS_ctx.onRuleCopy)
        };
        let __VLS_8;
        let __VLS_9;
        var __VLS_10;
    }
    if (__VLS_ctx.showAddNewRuleBox) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("add-rule-content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("eventDate"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            ...{ class: ("baseInputField") },
            type: ("datetime-local"),
        });
        (__VLS_ctx.currentRule.site_or_app_name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("title"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            ...{ class: ("baseInputField") },
            type: ("number"),
            max: ("24"),
            min: ("0"),
            placeholder: ("Hours Limit"),
        });
        (__VLS_ctx.hours);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("title"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            ...{ class: ("baseInputField") },
            type: ("number"),
            max: ("60"),
            min: ("0"),
            placeholder: ("Minutes Limit"),
        });
        (__VLS_ctx.minutes);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("category"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            ...{ class: ("baseInputField") },
            type: ("text"),
            value: ((__VLS_ctx.currentRule.category)),
            placeholder: ("Rule Category"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("form-group") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ("rule"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            id: ("rule"),
            value: ((__VLS_ctx.currentRule.rule)),
            modelModifiers: { string: true, },
            ...{ class: ("selettore") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("only notify"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("notify & close"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("notify, close & block"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("add-rule-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.addNewRule) },
            ...{ class: ("baseButton") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.cancelAddRule) },
            ...{ class: ("baseButton") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
    }
    ['rule-list', 'add-rule', 'rule-items', 'modal', 'add-rule-content', 'form-group', 'baseInputField', 'form-group', 'baseInputField', 'form-group', 'baseInputField', 'form-group', 'baseInputField', 'form-group', 'selettore', 'add-rule-actions', 'baseButton', 'material-symbols-outlined', 'g-icon', 'baseButton', 'material-symbols-outlined', 'g-icon',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'notificationManager': __VLS_5,
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            TimeTrackerRuleItem: TimeTrackerRuleItem,
            NotificationManager: NotificationManager,
            currentRule: currentRule,
            notificationManager: notificationManager,
            minutes: minutes,
            hours: hours,
            rules: rules,
            showAddNewRuleBox: showAddNewRuleBox,
            addNewRule: addNewRule,
            cancelAddRule: cancelAddRule,
            onRuleUpdate: onRuleUpdate,
            onRuleDelete: onRuleDelete,
            onRuleCopy: onRuleCopy,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeRefs: {},
});
; /* PartiallyEnd: #4569/main.vue */
