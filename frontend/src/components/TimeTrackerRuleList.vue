<template>
    <NotificationManager ref="notificationManager" />

    <div class="rule-list" :class="viewMode">
        <div class="add-rule baseButton">
            <button @click="showAddNewRuleBox = true">Add New Rule</button>
        </div>
        <div class="rule-items" :class="viewMode">
            <TimeTrackerRuleItem v-for="rule in rules" :key="rule.id" :rule="rule" @edit="onRuleEdit"
                @delete="onRuleDelete" />
        </div>
    </div>

    <div v-if="showAddNewRuleBox" class="modal">
        <div class="add-rule-content">
            <h3>Add New Time Tracker Rule</h3>
            <div class="form-group">
                <label for="siteAppName">Site / App Name:</label>
                <input id="siteAppName" class="baseInputField" type="text" v-model="currentRule.site_or_app_name" />
            </div>
            <div class="form-group">
                <label for="Hours Limit">Hours Limit:</label>
                <input id="Hours Limit" class="baseInputField" type="number" max="24" min="0" v-model="hours"
                    placeholder="Hours Limit" />
            </div>
            <div class="form-group">
                <label for="Minutes Limit">Minutes Limit:</label>
                <input id="Minutes Limit" class="baseInputField" type="number" max="60" min="0" v-model="minutes"
                    placeholder="Minutes Limit" />
            </div>

            <div class="form-group">
                <label for="category">Category:</label>

                <select class="selettore" name="catgory" id="todo_category" v-model="currentRule.category">
                    <option v-for="category in userInfo.categories" :key="category.name" :value="category.name">{{
                        category.name }} ({{ category.points }} points)</option>
                </select>

            </div>

            <div class="form-group">
                <label for="rule">Rule</label>
                <select id="rule" v-model.string="currentRule.rule" class="selettore">
                    <option value="only notify">
                        "Only Notify"
                    </option>
                    <option value="notify & close">
                        "Notify & Close"
                    </option>
                    <option value="notify, close & block">
                        "Notify, Close & Block"
                    </option>
                </select>
            </div>

            <div class="add-rule-actions">
                <button class="baseButton" @click="addNewRule">Apply
                    <span class="material-symbols-outlined g-icon">check_circle</span>
                </button>
                <button class="baseButton" @click="cancelAddRule">Cancel
                    <span class="material-symbols-outlined g-icon">cancel</span>
                </button>
            </div>
        </div>
    </div>

    <div v-if="showEditRuleBox" class="modal">
        <div class="add-rule-content">
            <h3>Edit Rule :</h3>
            <div class="form-group">
                <label for="siteAppName">Site / App Name:</label>
                <input id="siteAppName" class="baseInputField" type="text" v-model="ruleToEdit.site_or_app_name" />
            </div>
            <div class="form-group">
                <label for="Hours Limit">Hours Limit:</label>
                <input id="Hours Limit" class="baseInputField" type="number" max="24" min="0" v-model="hours"
                    placeholder="Hours Limit" />
            </div>
            <div class="form-group">
                <label for="Minutes Limit">Minutes Limit:</label>
                <input id="Minutes Limit" class="baseInputField" type="number" max="60" min="0" v-model="minutes"
                    placeholder="Minutes Limit" />
            </div>
            <div class="form-group">
                <label for="category">Category:</label>
                <input id="category" class="baseInputField" type="text" v-model="ruleToEdit.category"
                    placeholder="Rule Category" />
            </div>

            <div class="form-group">
                <label for="rule">Rule</label>
                <select id="rule" v-model.string="ruleToEdit.rule" class="selettore">
                    <option value="only notify">
                        "Only Notify"
                    </option>
                    <option value="notify & close">
                        "Notify & Close"
                    </option>
                    <option value="notify, close & block">
                        "Notify, Close & Block"
                    </option>
                </select>
            </div>

            <div class="add-rule-actions">
                <button class="baseButton" @click="editRule">Apply
                    <span class="material-symbols-outlined g-icon">check_circle</span>
                </button>
                <button class="baseButton" @click="cancelEditRule">Cancel
                    <span class="material-symbols-outlined g-icon">cancel</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue';
import TimeTrackerRuleItem from './TimeTrackerRuleItem.vue';
import NotificationManager from '../gestors/NotificationManager.vue'
import { TimeTrackerRule, ruleType } from '../engine/timeTracker';
import { TimeTrackerHandler } from '../engine/timeTracker';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { useRouter } from 'vue-router';
import { delay } from '../utils/generalUtils';
import { userDBentry } from '../types/userTypes';
import { ExtComunicator } from '../comunicator/extComunicator';

const emit = defineEmits(["ttRuleListEvent"])
const router = useRouter();
const currentRule = ref<TimeTrackerRule>(
    new TimeTrackerRule('', '', 1, 'notify & close', '')
);
const ruleToEdit = ref<TimeTrackerRule>(
    new TimeTrackerRule('', '', 1, 'notify & close', '')
);
const props = defineProps<{ viewMode: "list" | "grid" }>();

var backupEditValues = {
    id: '',
    category: '',
    minutesDailyLimit: 0,
    remainingTimeMin: 0,
    rule: 'notify & close',
    site_or_app_name: ''
}
const notificationManager = ref(null);
const minutes = ref(0)
const hours = ref(0)
const rules = ref<TimeTrackerRule[]>([]);
const showAddNewRuleBox = ref(false);
const showEditRuleBox = ref(false);
const api_gestor = API_gestor.getInstance()
const timeTrackerRuleHandler = TimeTrackerHandler.getInstance(api_gestor)
let licenseKey = ""
const userHandler = UserHandler.getInstance(api_gestor)
const defaultImagePath = "../../public/user.avif"
const userInfo = ref<userDBentry>({
    username: "",
    avatarImagePath: defaultImagePath,
    age: 1,
    categories: [],
    createdAt: new Date(),
    email: "",
    firstName: "",
    lastName: "",
    licenseIsValid: false,
    licenseKey: "",
    notifications: false,
    permissions: false,
    phone: "",
    timeTrackerActive: false,
    karmaCoinsBalance: 0,
    friends: [],
    fcmToken: ""
});
const extComunicator = ExtComunicator.getInstance(timeTrackerRuleHandler, userInfo.value.licenseKey)

function sendNotify(type: "info" | "warning" | "error" | "success", text: string) {
    if (notificationManager.value) {
        (notificationManager.value as any).showNotification({
            type: type,
            message: text,
        })
    } else {
        console.log("notification manager not found")
    }
}


async function addNewRule() {
    let errors = [];
    if (currentRule.value.category == "") {
        errors.push("Missing Category")
    }
    if (currentRule.value.site_or_app_name == "") {
        errors.push("Missing Site/App name")
    }
    if (hours.value == 0 && minutes.value == 0) {
        errors.push("Hours and Minutes can't be both 0")
    }
    if (hours.value == 24 && minutes.value > 0) {
        errors.push("If hours are 24 minutes must be 0")
    }

    if (errors.length > 0) {
        sendNotify("error", errors[0])
        return;
    }
    const id = timeTrackerRuleHandler.getNextTimeTrackerRuleId()
    const newRule = new TimeTrackerRule(id, currentRule.value.site_or_app_name, hours.value * 60 + minutes.value, currentRule.value.rule, currentRule.value.category);
    const addRuleRes = await timeTrackerRuleHandler.addOrUpdateRule(licenseKey, newRule)
    if (!addRuleRes.success) {
        sendNotify("error", "Error adding new rule : " + addRuleRes.errorMessage)
    } else {
        rules.value.push(newRule);
        sendNotify("success", "Successfully added rule for site " + newRule.site_or_app_name);
        showAddNewRuleBox.value = false;
        emit("ttRuleListEvent", { action: "add new rule", needUpdate: true })
        //notify ext:
        extComunicator.updateTTrulesInExt(rules.value)
    }


}


async function editRule() {
    let errors = [];
    if (ruleToEdit.value.category == "") {
        errors.push("Missing Category")
    }
    if (ruleToEdit.value.site_or_app_name == "") {
        errors.push("Missing Site/App name")
    }
    if (hours.value == 0 && minutes.value == 0) {
        errors.push("Hours and Minutes can't be both 0")
    }
    if (hours.value == 24 && minutes.value > 0) {
        errors.push("If hours are 24 minutes must be 0")
    }

    if (errors.length > 0) {
        sendNotify("error", errors[0])
        return;
    }

    let r = rules.value.find(rule => rule.id == ruleToEdit.value.id);
    if (!r) {
        sendNotify("error", "Rule not found, can't edit this rule");
        return;
    }

    ruleToEdit.value.minutesDailyLimit = 60 * hours.value + minutes.value
    if (ruleToEdit.value.minutesDailyLimit != backupEditValues.minutesDailyLimit || ruleToEdit.value.site_or_app_name != backupEditValues.site_or_app_name) {
        ruleToEdit.value.remainingTimeMin = 60 * hours.value + minutes.value
    }

    const editRes = await timeTrackerRuleHandler.addOrUpdateRule(licenseKey, ruleToEdit.value)
    if (!editRes.success) {
        sendNotify("error", "Error editing rule : " + editRes.errorMessage)
    } else {

        sendNotify("success", "Successfully edited rule for site " + r.site_or_app_name);
        showEditRuleBox.value = false;
        hours.value = 0
        minutes.value = 0
        emit("ttRuleListEvent", { action: "edit rule " + r.id, needUpdate: true })
        //notify ext:
        extComunicator.updateTTrulesInExt(rules.value)
    }
}

function cancelEditRule() {
    let r = rules.value.find(rule => rule.id == currentRule.value.id);
    if (r) {
        r.category = backupEditValues.category
        r.id = backupEditValues.id
        r.minutesDailyLimit = backupEditValues.minutesDailyLimit
        r.remainingTimeMin = backupEditValues.remainingTimeMin
        r.rule = backupEditValues.rule as ruleType
        r.site_or_app_name = backupEditValues.site_or_app_name
    }
    ruleToEdit.value.category = backupEditValues.category
    ruleToEdit.value.id = backupEditValues.id
    ruleToEdit.value.minutesDailyLimit = backupEditValues.minutesDailyLimit
    ruleToEdit.value.remainingTimeMin = backupEditValues.remainingTimeMin
    ruleToEdit.value.rule = backupEditValues.rule as ruleType
    ruleToEdit.value.site_or_app_name = backupEditValues.site_or_app_name
    showEditRuleBox.value = false;
}

function cancelAddRule() {
    currentRule.value.category = ""
    currentRule.value.site_or_app_name = ""
    currentRule.value.rule = "notify & close";
    hours.value = 0;
    minutes.value = 0
    showAddNewRuleBox.value = false;
}

//set backup rule & open edit box
function onRuleEdit(rule_To_Edit: TimeTrackerRule) {
    ruleToEdit.value = rule_To_Edit
    backupEditValues.category = rule_To_Edit.category
    backupEditValues.id = rule_To_Edit.id
    backupEditValues.minutesDailyLimit = rule_To_Edit.minutesDailyLimit
    backupEditValues.remainingTimeMin = rule_To_Edit.remainingTimeMin
    backupEditValues.rule = rule_To_Edit.rule
    backupEditValues.site_or_app_name = rule_To_Edit.site_or_app_name
    showEditRuleBox.value = true;
}

async function onRuleDelete(ruleToDelete: TimeTrackerRule) {
    try {
        const deleteRes = await timeTrackerRuleHandler.removeRule(licenseKey, ruleToDelete.id)
        if (!deleteRes.success) {
            throw new Error(deleteRes.errorMessage)
        }
        rules.value = rules.value.filter(r => r.id !== ruleToDelete.id);
        sendNotify("success", "Successfully deleted rule for site " + ruleToDelete.site_or_app_name)
        emit("ttRuleListEvent", { action: "edit rule " + ruleToDelete.id, needUpdate: true })
        //notify ext:
        extComunicator.updateTTrulesInExt(rules.value)
    } catch (error: any) {
        sendNotify("error", "Error deleting rule : " + error.message)
    }

}

async function askTimeTrackerRules() {
    try {
        const ttRulesRes = await timeTrackerRuleHandler.loadAllRules(licenseKey)
        if (ttRulesRes.success) {
            const tt_rules = ttRulesRes.rules

            for (let rule of tt_rules) {
                rules.value.push(timeTrackerRuleHandler.fromRuleObj(rule))
            }
        } else {
            throw new Error(ttRulesRes.errorMessage);
        }
    } catch (error: any) {
        sendNotify("error", `Error obtaining todo actions : ${error.message} `)
    }
}

onMounted(async () => {
    const userInfoRes = await userHandler.getUserInfo(true)
    console.log("userInfoRes (time tracker rule):\n", userInfoRes)
    if (!userInfoRes.userInfo_DB) { // => user not logged 

        //redirect to welcome
        await delay(2000)
        //redirect to welcome
        router.push("/welcome")
        return;
    }
    userInfo.value = userInfoRes.userInfo_DB
    licenseKey = userInfoRes.userInfo_DB.licenseKey
    extComunicator.licenseKey = licenseKey;
    await askTimeTrackerRules()

    const rawUserInfo = toRaw(userInfo.value)
    extComunicator.notifyPwaReady(rawUserInfo);

    //ottengo rules da ext + controllo (ed eventuale update db + update locale)
    let extRuls = await extComunicator.requestTimeTrackerRules()
    
    console.log("extRuls in tt rule list =  ",extRuls)
    if (Array.isArray(extRuls)) {
        let mergedRules = await timeTrackerRuleHandler.mergeAndCheckCoerence(rules.value, extRuls, userInfo.value.licenseKey)
        rules.value = []
        for (let r of mergedRules) {
            rules.value.push(timeTrackerRuleHandler.fromRuleObj(r));
        }
    }

    extComunicator.on("ASK_RULES_FROM_EXT",async()=>{
        const rawRules = toRaw(rules.value)
        extComunicator.updateTTrulesInExt(rawRules)
    })

    extComunicator.on("RULES_UPDATED_FROM_EXT", async (payload: { timeTrackerRules: TimeTrackerRule[] }) => {
        //check + merge per coerenza
        
        if (Array.isArray(payload.timeTrackerRules)) {
            let mergedRules = await timeTrackerRuleHandler.mergeAndCheckCoerence(rules.value, extRuls, userInfo.value.licenseKey)
            rules.value = []
            for (let r of mergedRules) {
                rules.value.push(timeTrackerRuleHandler.fromRuleObj(r));
            }
        }
    })

})
</script>

<style scoped>
.rule-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
    height: 100%;
}

.rule-list {
    scrollbar-width: none;
}

.add-rule {
    max-width: 140px;
    margin-bottom: 10px;
    align-self: center;
    margin-top: 1%;
}

.rule-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.rule-list.grid {
    min-width: 85%;
}

.rule-items.grid {
    min-width: 95%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.add-rule-content {
    background: #212121;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;
    text-align: center;
    border: 1px solid #15b680d4;
}

.add-rule-content h3 {
    margin-bottom: 10px;
}

.add-rule-content::-webkit-scrollbar,
.rule-list::-webkit-scrollbar {
    display: none;
}

.add-rule-actions {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px
}
</style>