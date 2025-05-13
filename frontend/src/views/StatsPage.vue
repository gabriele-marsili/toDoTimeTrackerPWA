<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="main-app">
        <Sidebar :activeSection="'stats'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">
            <header class="header-section box elevated rounded-2xl">
                <div class="header-item">
                    <span class="material-symbols-outlined icon">paid</span>
                    <span>Total Karma Points: </span>
                    <span class="value"> {{ karmaPoints.total }}</span>
                </div>

                <div class="period-selection">
                    <span>Select Period: </span>
                    <div class="custom-select">
                        <span class="material-symbols-outlined menu-icon select-icon">calendar_month</span>
                        <select class="selettore" v-model="selectedPeriod" @change="setPeriod(selectedPeriod)">
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="quarter">Last Quarter</option>
                            <option value="year">Last Year</option>
                            <option value="custom">Custom Period</option>
                        </select>
                    </div>
                </div>

                <div v-if="selectedPeriod === 'custom'" class="custom-date-picker">
                    <span>Start Date : </span>
                    <DatePicker v-model="customStartDate" />
                    <span>End Date : </span>
                    <DatePicker v-model="customEndDate" />
                    <button @click="applyCustomPeriod" class="baseButton">Apply</button>
                </div>

                <div class="trend-interval-selection">
                    <span>Trend Interval: </span>

                    <div class="custom-select">
                        <span class="material-symbols-outlined menu-icon select-icon">calendar_today</span>
                        <select class="selettore" v-model="trendInterval" @change="setTrendInterval(trendInterval)">
                            <option value="day">Day</option>
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                        </select>
                    </div>

                </div>
            </header>

            <div class="content-area invisible-scrollbar">

                <h3 class="section-title">To-Do Actions Statistics</h3>
                <div class="charts-grid">
                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Completion by Category</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.categoryCompletionChart }">
                            <canvas ref="categoryCompletionChart"></canvas>
                            <div v-if="!chartDataStatus.categoryCompletionChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>

                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Completion and Addition Trend</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.completionTrendChart }">
                            <canvas ref="completionTrendChart"></canvas>
                            <div v-if="!chartDataStatus.completionTrendChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>

                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Karma Points by Category</h4>
                        <div class="chart-canvas-wrapper" :class="{ 'blurred-content': !chartDataStatus.karmaChart }">
                            <canvas ref="karmaChart"></canvas>
                            <div v-if="!chartDataStatus.karmaChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>

                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Punctuality Rate</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.punctualityChart }">
                            <canvas ref="punctualityChart"></canvas>
                            <div v-if="!chartDataStatus.punctualityChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>

                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Distribution by Priority</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.priorityChart }">
                            <canvas ref="priorityChart"></canvas>
                            <div v-if="!chartDataStatus.priorityChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>

                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Average Completion Time</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.averageCompletionTimeChart }">
                            <canvas ref="averageCompletionTimeChart"></canvas>
                            <div v-if="!chartDataStatus.averageCompletionTimeChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 class="section-title">Calendar Events Statistics</h3>
                <div class="charts-grid-2">
                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Time Distribution by Event Category</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.calendarCategoryChart }">
                            <canvas ref="calendarCategoryChart"></canvas>
                            <div v-if="!chartDataStatus.calendarCategoryChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>

                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Events by Day of the Week</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.busyDaysChart }">
                            <canvas ref="busyDaysChart"></canvas>
                            <div v-if="!chartDataStatus.busyDaysChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>

                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Events by Hour of the Day</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.busyHoursChart }">
                            <canvas ref="busyHoursChart"></canvas>
                            <div v-if="!chartDataStatus.busyHoursChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h3 class="section-title">Time Tracker Rules Statistics</h3>
                <div class="charts-grid-3">
                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Time Spent per Rule</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.timeSpentChart }">
                            <canvas ref="timeSpentChart"></canvas>
                            <div v-if="!chartDataStatus.timeSpentChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>

                    <div class="chart-container canvas-box elevated rounded-2xl">
                        <h4>Time Limit Usage Rate</h4>
                        <div class="chart-canvas-wrapper"
                            :class="{ 'blurred-content': !chartDataStatus.TimeLimitUsageRateChart }">
                            <canvas ref="TimeLimitUsageRateChart"></canvas>
                            <div v-if="!chartDataStatus.TimeLimitUsageRateChart" class="no-data-overlay">
                                <p>No data available for this period.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import { onMounted, ref,toRaw } from 'vue';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { userDBentry } from '../types/userTypes';
import { useRouter } from 'vue-router';
import { delay } from '../utils/generalUtils';
import { ToDoAction, ToDoHandler, ToDoPriority } from '../engine/toDoEngine';
import { StatsHandler } from '../engine/statsHandler';
import { TimeTrackerHandler, TimeTrackerRule } from '../engine/timeTracker';
import { CalendarEvent, CalendarEventHandler } from '../engine/calendarEvent';
import DatePicker from '../components/DatePicker.vue';
import { Chart, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, CategoryScale, PieController, DoughnutController, BarController, LineController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ExtComunicator } from '../comunicator/extComunicator';


Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    PieController,
    DoughnutController,
    BarController,
    LineController,
    ChartDataLabels
);

const notificationManager = ref(null);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const textColor = isDarkMode.value ? 'white' : 'black';
const api_gestor = API_gestor.getInstance();
const userHandler = UserHandler.getInstance(api_gestor)
const userInfo = ref<userDBentry>({ // State for user info
    username: "",
    avatarImagePath: "", // Use defaultImagePath if necessary in rendering
    age: 0,
    categories: [],
    createdAt: new Date(),
    email: "",
    firstName: "",
    lastName: "",
    licenseIsValid: false,
    licenseKey: "",
    notifications: false,
    permissions: false, // Assuming permissions is boolean or similar
    phone: "",
    timeTrackerActive: false, // Assuming this property exists
    karmaCoinsBalance: 0,
    friends: [],
    fcmToken: "",
    karmaBoost : 0,
    frame : ""
});
const router = useRouter();
const todoHandler = ToDoHandler.getInstance(api_gestor);
const timeTrackerHandler = TimeTrackerHandler.getInstance(api_gestor)
const calendarEventsHandler = CalendarEventHandler.getInstance(api_gestor)
const extComunicator = ExtComunicator.getInstance(timeTrackerHandler, userInfo.value.licenseKey)

const todos = ref<ToDoAction[]>([])
const calendarEvents = ref<CalendarEvent[]>([])
const ttRules = ref<TimeTrackerRule[]>([])


// Charts refs - Ensure all canvas elements have a ref
const karmaChart = ref<HTMLCanvasElement | null>(null);
const categoryCompletionChart = ref<HTMLCanvasElement | null>(null);
const completionTrendChart = ref<HTMLCanvasElement | null>(null);
const punctualityChart = ref<HTMLCanvasElement | null>(null);
const priorityChart = ref<HTMLCanvasElement | null>(null);
const calendarCategoryChart = ref<HTMLCanvasElement | null>(null);
const busyDaysChart = ref<HTMLCanvasElement | null>(null);
const busyHoursChart = ref<HTMLCanvasElement | null>(null);
const timeSpentChart = ref<HTMLCanvasElement | null>(null);
const averageCompletionTimeChart = ref<HTMLCanvasElement | null>(null);
const TimeLimitUsageRateChart = ref<HTMLCanvasElement | null>(null);


// Chart instances for cleanup
const chartInstances = ref<any[]>([]); // Array to hold all Chart instances
const chartDataStatus = ref<Record<string, boolean>>({});

// Period selection
const selectedPeriod = ref('month');
const customStartDate = ref<Date>(new Date());
const customEndDate = ref<Date>(new Date());
const trendInterval = ref<'day' | 'week' | 'month'>('day');

// Stats results - Ensure all stats you want to display are here
const completionByCategory = ref<{ category: string; completed: number; total: number; percentage: number }[]>([]);
const karmaPoints = ref<{ total: number; byCategory: { category: string; points: number }[] }>({ total: 0, byCategory: [] });
const completionTrend = ref<{ labels: string[]; completed: number[]; added: number[] }>({ labels: [], completed: [], added: [] });
const punctualityRate = ref<{ onTime: number; late: number; percentage: number }>({ onTime: 0, late: 0, percentage: 0 });
const priorityDistribution = ref<{ priority: ToDoPriority; count: number; percentage: number }[]>([]);
const timeDistribution = ref<{ category: string; hours: number; percentage: number }[]>([]);
const busyPeriods = ref<{ byDay: { day: string; count: number }[]; byHour: { hour: number; count: number }[] }>({ byDay: [], byHour: [] });
const timeSpent = ref<{ rule: string; limitMinutes: number; remainingMinutes: number; timeSpentMinutes: number; percentage: number }[]>([]);
const averageCompletionTime = ref<number>(0);


// Stats service
const statsHandler = ref<StatsHandler>(StatsHandler.getInstance());

// Setup periods
function setPeriod(period: string) {
    selectedPeriod.value = period;

    const now = new Date();
    let startDate: Date;

    switch (period) {
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        case 'custom':
            // Do nothing here, applyCustomPeriod will handle setting the period
            applyDarkMode()
            return;
        default:
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
    }

    statsHandler.value.setPeriod(startDate, now);
    loadStats();
}

const loadStats = async () => {
    try {
        const lk = userInfo.value.licenseKey
        if (lk === "") {
            throw new Error("Invalid license key")
        }

        // Load data
        const todoRes = await todoHandler.loadAllToDos(lk);
        if (!todoRes.success) {
            throw new Error(todoRes.errorMessage)
        }
        todos.value = todoRes.toDos.map(x => todoHandler.fromToDoObj(x));


        const calendarEventsRes = await calendarEventsHandler.loadAllEvents(lk)
        if (!calendarEventsRes.success) {
            throw new Error(calendarEventsRes.errorMessage)
        }
        calendarEvents.value = calendarEventsRes.events.map(e => calendarEventsHandler.fromCalendarObj(e));


        const timeTrackerRulesRes = await timeTrackerHandler.loadAllRules(lk)
        if (!timeTrackerRulesRes.success) {
            throw new Error(timeTrackerRulesRes.errorMessage)
        }
        ttRules.value = timeTrackerRulesRes.rules.map(r => timeTrackerHandler.fromRuleObj(r));
        const rulesByExt = await extComunicator.requestTimeTrackerRules()
        let mergedRules = await timeTrackerHandler.mergeAndCheckCoerence(ttRules.value, rulesByExt, userInfo.value.licenseKey)
        ttRules.value = mergedRules.map(r => timeTrackerHandler.fromRuleObj(r));


        const categoryKarmaMap = userInfo.value.categories.reduce((map, category) => {
            map[category.name] = category.points;
            return map;
        }, {} as Record<string, number>);

        // Generate statistics using the loaded data and current period
        console.log("stats (load stats):\n")
        completionByCategory.value = statsHandler.value.getCompletionByCategory(todos.value, userInfo.value.categories.map(c => c.name));
        console.log("completionByCategory.value", completionByCategory.value)
        karmaPoints.value = statsHandler.value.getKarmaPoints(todos.value, categoryKarmaMap);
        console.log("karmaPoints.value", karmaPoints.value)

        completionTrend.value = statsHandler.value.getCompletionTrend(
            todos.value,
            trendInterval.value
        );
        console.log("completionTrend.value", completionTrend.value)


        punctualityRate.value = statsHandler.value.getPunctualityRate(todos.value);
        console.log("punctualityRate.value", punctualityRate.value);

        priorityDistribution.value = statsHandler.value.getPriorityDistribution(todos.value);
        console.log("priorityDistribution.value", priorityDistribution.value)
        averageCompletionTime.value = statsHandler.value.getAverageCompletionTime(todos.value);
        console.log("averageCompletionTime.value", averageCompletionTime.value);
        timeDistribution.value = statsHandler.value.getTimeDistributionByCategory(calendarEvents.value);
        console.log("timeDistribution.value", timeDistribution.value)
        busyPeriods.value = statsHandler.value.getBusyPeriods(calendarEvents.value);
        console.log("busyPeriods.value", busyPeriods.value)
        timeSpent.value = statsHandler.value.getTimeSpent(ttRules.value);
        console.log("timeSpent.value", timeSpent.value)

        // Now that stats are calculated, update charts
        updateCharts();

    } catch (error: any) {
        sendNotify("error", "Error loading stats: " + error.message)
        console.error("Error loading stats:", error);
    }
};


// Define setTrendInterval function here
function setTrendInterval(interval: 'day' | 'week' | 'month') {
    trendInterval.value = interval;
    // Recalculate trend data for the new interval
    completionTrend.value = statsHandler.value.getCompletionTrend(
        todos.value,
        trendInterval.value
    );
    console.log("completionTrend.value (in setTrendInterval)", completionTrend.value)
    // Call updateCharts after trend data is updated
    if (todos.value.length > 0 && completionTrend.value.labels.length > 0) {
        updateCharts();
    } else {
        // Clear charts if no data
        updateCharts();
    }
}


const applyCustomPeriod = () => {
    if (customStartDate.value && customEndDate.value) {
        selectedPeriod.value = 'custom';
        console.log("customStartDate.value: ", customStartDate.value)
        console.log("customEndDate.value: ", customEndDate.value)
        const startDate = customStartDate.value;
        const endDate = customEndDate.value;
        // Validate dates if necessary (e.g., start before end)
        if (startDate > endDate) {
            sendNotify("warning", "Start date cannot be after end date.");
            return;
        }
        // Check if dates are valid after parsing
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            sendNotify("error", "Invalid date format selected.");
            return;
        }

        statsHandler.value.setPeriod(startDate, endDate);
        loadStats();
    } else {
        sendNotify("warning", "Please select both start and end dates for the custom period.");
    }
};


// Update all charts
const updateCharts = () => {
    chartDataStatus.value = {
        categoryCompletionChart: completionByCategory.value.some(cat => cat.percentage > 0),
        karmaChart: karmaPoints.value.byCategory.some(cat => cat.points > 0),
        completionTrendChart: (completionTrend.value.added.some(addedQuantity => addedQuantity > 0)) || (completionTrend.value.completed.some(completedQuantity => completedQuantity > 0)), // Controlla se ci sono etichette nel trend
        punctualityChart: punctualityRate.value.onTime > 0 || punctualityRate.value.late > 0,
        priorityChart: priorityDistribution.value.some(item => item.count > 0),
        averageCompletionTimeChart: averageCompletionTime.value > 0, // Usa il nuovo ref
        calendarCategoryChart: timeDistribution.value.length > 0,
        busyDaysChart: busyPeriods.value.byDay.some(d => d.count > 0), // Controlla se ci sono conteggi > 0
        busyHoursChart: busyPeriods.value.byHour.some(h => h.count > 0), // Controlla se ci sono conteggi > 0
        timeSpentChart: timeSpent.value.length > 0, // Controlla se ci sono regole con tempo risparmiato
        // Rule Effectiveness potrebbe basarsi su timeSpent.value.some(item => item.timeSpentMinutes > 0) se vuoi essere più specifico
        TimeLimitUsageRateChart: timeSpent.value.some(item => item.timeSpentMinutes > 0)
    };
    console.log("chartDataStatus in update charts:\n", chartDataStatus)

    // Destroy existing charts to prevent memory leaks
    chartInstances.value.forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances.value = []; // Clear the array

    // Create new charts only if the canvas ref exists AND there is data (usando il nuovo stato)
    // Aggiungi anche la pulizia del canvas se non ci sono dati

    // categoryCompletionChart
    if (categoryCompletionChart.value) {
        if (chartDataStatus.value.categoryCompletionChart) {
            createCategoryCompletionChart();
        } else {
            // Pulisci il canvas se non ci sono dati
            const ctx = categoryCompletionChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, categoryCompletionChart.value.width, categoryCompletionChart.value.height);
        }
    }

    // karmaChart
    if (karmaChart.value) {
        if (chartDataStatus.value.karmaChart) {
            createKarmaChart();
        } else {
            const ctx = karmaChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, karmaChart.value.width, karmaChart.value.height);
        }
    }

    // completionTrendChart
    if (completionTrendChart.value) {
        if (chartDataStatus.value.completionTrendChart) {
            createCompletionTrendChart();
        } else {
            const ctx = completionTrendChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, completionTrendChart.value.width, completionTrendChart.value.height);
        }
    }

    // punctualityChart
    if (punctualityChart.value) {
        if (chartDataStatus.value.punctualityChart) {
            createPunctualityChart();
        } else {
            const ctx = punctualityChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, punctualityChart.value.width, punctualityChart.value.height);
        }
    }

    // priorityChart
    if (priorityChart.value) {
        if (chartDataStatus.value.priorityChart) {
            createPriorityChart();
        } else {
            const ctx = priorityChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, priorityChart.value.width, priorityChart.value.height);
        }
    }

    if (averageCompletionTimeChart.value) {
        if (chartDataStatus.value.averageCompletionTimeChart) {
            createAverageCompletionTimeChart();
        } else {
            const ctx = averageCompletionTimeChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, averageCompletionTimeChart.value.width, averageCompletionTimeChart.value.height);
            // Nota: La logica nell'overlay gestisce la visualizzazione del messaggio
        }
    }

    // calendarCategoryChart
    if (calendarCategoryChart.value) {
        if (chartDataStatus.value.calendarCategoryChart) {
            createCalendarCategoryChart();
        } else {
            const ctx = calendarCategoryChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, calendarCategoryChart.value.width, calendarCategoryChart.value.height);
        }
    }

    // busyDaysChart
    if (busyDaysChart.value) {
        if (chartDataStatus.value.busyDaysChart) {
            createBusyDaysChart();
        } else {
            const ctx = busyDaysChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, busyDaysChart.value.width, busyDaysChart.value.height);
        }
    }


    // busyHoursChart
    if (busyHoursChart.value) {
        if (chartDataStatus.value.busyHoursChart) {
            createBusyHoursChart();
        } else {
            const ctx = busyHoursChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, busyHoursChart.value.width, busyHoursChart.value.height);
        }
    }


    // timeSpentChart
    if (timeSpentChart.value) {
        if (chartDataStatus.value.timeSpentChart) {
            createtimeSpentChart();
        } else {
            const ctx = timeSpentChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, timeSpentChart.value.width, timeSpentChart.value.height);
        }
    }


    // TimeLimitUsageRateChart (creato solo se timeSpentChart ha dati e c'è almeno 1 minuto risparmiato)
    if (TimeLimitUsageRateChart.value) {
        // La condizione è più specifica per questo grafico
        if (timeSpent.value.some(item => item.timeSpentMinutes > 0)) {
            chartDataStatus.value.TimeLimitUsageRateChart = true; // Aggiorna lo stato specifico
            createTimeLimitUsageRateChart();
        } else {
            chartDataStatus.value.TimeLimitUsageRateChart = false; // Aggiorna lo stato specifico
            const ctx = TimeLimitUsageRateChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, TimeLimitUsageRateChart.value.width, TimeLimitUsageRateChart.value.height);
        }
    } else {
        // Se il ref non è ancora disponibile, imposta lo stato su false
        chartDataStatus.value.TimeLimitUsageRateChart = false;
    }


};

// --- Chart Creation Functions ---

const createAverageCompletionTimeChart = () => {
    // Already checked for ref and data availability in updateCharts
    // We also check if the average time is > 0 before creating
    if (!averageCompletionTimeChart.value || averageCompletionTime.value <= 0) {
        // Optional: display a message or placeholder if no data
        const ctx = averageCompletionTimeChart.value?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, averageCompletionTimeChart.value!.width, averageCompletionTimeChart.value!.height);
            // You might add text like "No completed tasks in this period" here
        }
        return;
    }

    const ctx = averageCompletionTimeChart.value!.getContext('2d');
    if (!ctx) return;

    const data = {
        labels: ['Average Time'], // Un'unica etichetta per la barra
        datasets: [{
            label: 'Average Completion Time (Minutes)',
            data: [averageCompletionTime.value], // Il singolo valore calcolato
            backgroundColor: 'rgba(153, 102, 255, 0.7)', // Un colore a scelta
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, {
        type: 'bar', // Un grafico a barre
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (Minutes)', // Etichetta dell'asse y
                        color: textColor
                    },
                    ticks: {
                        color: textColor // Use theme variable
                    }
                },
                x: {
                    ticks: {
                        color: textColor // Use theme variable
                    }
                }
            },
            plugins: {
                legend: {
                    display: false, // Potresti voler nascondere la legenda per una singola barra
                    labels: {
                        color: textColor // Use theme variable
                    }
                },
                title: {
                    display: false, // Il titolo è già nell'h4
                    text: 'Average Completion Time'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw as number;
                            return `${label}: ${value.toFixed(2)} minutes`; // Formatta il tooltip
                        }
                    }
                },
                datalabels: { // Aggiungi datalabels per mostrare il valore sulla barra
                    color: textColor, // Usa la variabile del tema
                    anchor: 'end', // Posiziona alla fine della barra
                    align: 'top', // Allinea in alto
                    formatter: (value: number) => {
                        return value.toFixed(2); // Formatta il valore mostrato
                    },
                    display: (context: any) => {
                        // Mostra il datalabel solo se il valore è maggiore di 0
                        const value = context.dataset.data[context.dataIndex];
                        return value > 0;
                    }
                }
            },
        },
        plugins: [ChartDataLabels] // Assicurati che ChartDataLabels sia registrato qui se usato in options.plugins
    });

    chartInstances.value.push(chart as Chart);
};

const createCategoryCompletionChart = () => {
    // Already checked for ref and data availability in updateCharts
    const ctx = categoryCompletionChart.value!.getContext('2d'); // Use non-null assertion after check
    if (!ctx) return; // Explicit check for context

    const data = {
        labels: completionByCategory.value.map(stat => stat.category),
        datasets: [{
            label: 'Completion (%)',
            data: completionByCategory.value.map(stat => stat.percentage),
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)', // Teal
                'rgba(54, 162, 235, 0.7)', // Blue
                'rgba(255, 206, 86, 0.7)', // Yellow
                'rgba(255, 99, 132, 0.7)', // Red
                'rgba(153, 102, 255, 0.7)', // Purple
                'rgba(255, 159, 64, 0.7)', // Orange
                'rgba(200, 100, 100, 0.7)', // Example new color 1 (Brownish Red)
                'rgba(140, 200, 120, 0.7)', // Example new color 2 (Greenish)
                'rgba(120, 120, 220, 0.7)', // Example new color 3 (Indigo)
                'rgba(220, 120, 200, 0.7)', // Example new color 4 (Pinkish Purple)
                'rgba(100, 180, 180, 0.7)', // Example new color 5 (Cyan)
                'rgba(180, 180, 100, 0.7)', // Example new color 6 (Olive)
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(200, 100, 100, 1)',
                'rgba(140, 200, 120, 1)',
                'rgba(120, 120, 220, 1)',
                'rgba(220, 120, 200, 1)',
                'rgba(100, 180, 180, 1)',
                'rgba(180, 180, 100, 1)',
            ],
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw as number;
                            // Only show tooltip if percentage is > 0
                            if (value > 0) {
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                            // Return an empty string or a specific message for 0% if needed
                            // return value === 0 ? `${label}: 0%` : '';
                            return ''; // Hide tooltip for 0% slices
                        }
                    }
                },
                datalabels: { // <-- Add this configuration block for datalabels
                    color: textColor, // Use theme variable for datalabel text color
                    formatter: (value: number) => {
                        // Only show datalabel if percentage is > 0
                        return value > 0 ? value.toFixed(1) + '%' : '';
                    },
                    display: (context: any) => {
                        // Only display datalabel if the slice percentage is > 0
                        const value = context.dataset.data[context.dataIndex];
                        return value > 0;
                    }
                }
            },
            // Add layout padding to make space for legend and labels if needed
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }
        },
    });

    chartInstances.value.push(chart as Chart);
};


const createKarmaChart = () => {
    // Already checked for ref and data availability in updateCharts
    const ctx = karmaChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


    const data = {
        labels: karmaPoints.value.byCategory.map(cat => cat.category),
        datasets: [{
            label: 'Karma Points',
            data: karmaPoints.value.byCategory.map(cat => cat.points),
            backgroundColor: [
                'rgba(255, 206, 86, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(100, 100, 100, 0.7)',
            ],
            borderColor: [
                'rgba(255, 206, 86, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(100, 100, 100, 1)',
            ],
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor // Use theme variable
                    }
                },
                title: {
                    display: false,
                    text: 'Karma Points by Category'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw as number;
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        },
    });

    chartInstances.value.push(chart as Chart);
};


const createCompletionTrendChart = () => {
    // Already checked for ref and data availability in updateCharts
    const ctx = completionTrendChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


    const data = {
        labels: completionTrend.value.labels,
        datasets: [
            {
                label: 'Added',
                data: completionTrend.value.added,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                type: 'bar' as const
            },
            {
                label: 'Completed',
                data: completionTrend.value.completed,
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                type: 'line' as const,
                fill: false,
                tension: 0.1
            }
        ]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    // Added suggestedMax to ensure small values are visible
                    suggestedMax: Math.max(...completionTrend.value.completed, ...completionTrend.value.added, 3), // Set a suggested max, e.g., at least 3 or slightly above max data
                    ticks: {
                        color: textColor // Use theme variable
                    },
                    title: {
                        display: true,
                        text: 'To Do Quantity',
                        color: textColor // Use theme variable
                    }
                },
                x: {
                    ticks: {
                        color: textColor // Use theme variable
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor // Use theme variable
                    }
                },
                title: {
                    display: false,
                    text: 'To Do Completion Trend'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        },
    });

    chartInstances.value.push(chart as Chart);
};

const createPunctualityChart = () => {
    // Already checked for ref and data availability in updateCharts
    const ctx = punctualityChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


    const data = {
        labels: ['On Time', 'Late'],
        datasets: [{
            label: 'To Do Actions',
            data: [punctualityRate.value.onTime, punctualityRate.value.late],
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 99, 132, 0.7)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor // Use theme variable
                    }
                },
                title: {
                    display: false,
                    text: 'Punctuality Rate'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw as number;
                            const total = punctualityRate.value.onTime + punctualityRate.value.late;
                            const percentage = total > 0 ? (value / total) * 100 : 0;
                            return `${label}: ${value} (${percentage.toFixed(1)}%)`;
                        }
                    }
                }
            },
        },
    });

    chartInstances.value.push(chart as Chart);
};

const createPriorityChart = () => {
    // Already checked for ref and data availability in updateCharts
    const hasData = priorityDistribution.value.some(item => item.count > 0);
    if (!priorityChart.value || !hasData) return;

    const ctx = priorityChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


    const data = {
        labels: priorityDistribution.value.map(item => `Priority ${item.priority}`), // Use priority enum values as labels
        datasets: [{
            label: 'Number of To Do Actions',
            data: priorityDistribution.value.map(item => item.count),
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)', // High (Red)
                'rgba(255, 159, 64, 0.7)', // Medium (Orange)
                'rgba(54, 162, 235, 0.7)', // Low (Blue)
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor // Use theme variable
                    }
                },
                title: {
                    display: false,
                    text: 'Distribution by Priority'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw as number;
                            const total = priorityDistribution.value.reduce((sum, item) => sum + item.count, 0);
                            const percentage = total > 0 ? (value / total) * 100 : 0;
                            return `${label}: ${value} (${percentage.toFixed(1)}%)`;
                        }
                    }
                }
            },
        },
    });

    chartInstances.value.push(chart as Chart);
};

const createCalendarCategoryChart = () => {
    // Already checked for ref and data availability in updateCharts
    const ctx = calendarCategoryChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


    const data = {
        labels: timeDistribution.value.map(item => item.category),
        datasets: [{
            label: 'Hours Dedicated',
            data: timeDistribution.value.map(item => item.hours),
            backgroundColor: [
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(100, 100, 100, 0.7)',
            ],
            borderColor: [
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(100, 100, 100, 1)',
            ],
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor // Use theme variable
                    }
                },
                title: {
                    display: false,
                    text: 'Time Distribution by Event Category'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw as number;
                            return `${label}: ${value.toFixed(1)} hours`;
                        }
                    }
                }
            },
        },
    });

    chartInstances.value.push(chart as Chart);
};


const createBusyDaysChart = () => {
    // Already checked for ref and data availability in updateCharts
    const ctx = busyDaysChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


    // Order days correctly (Sunday=0, Monday=1, ...) and translate
    const orderedDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedBusyDays = orderedDays.map(dayName => {
        const found = busyPeriods.value.byDay.find(d => d.day === dayName);
        return found || { day: dayName, count: 0 };
    });


    const data = {
        labels: sortedBusyDays.map(item => item.day),
        datasets: [{
            label: 'Number of Events',
            data: sortedBusyDays.map(item => item.count),
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor }, // Use theme variable
                    title: {
                        display: true,
                        text: 'Event Count',
                        color: textColor // Use theme variable
                    }
                },
                x: {
                    ticks: { color: textColor } // Use theme variable
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw as number;
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        },
    });

    chartInstances.value.push(chart as Chart);
};


const createBusyHoursChart = () => {
    // Already checked for ref and data availability in updateCharts
    const ctx = busyHoursChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


    // Ensure hours are ordered 0-23
    const orderedHours = Array.from({ length: 24 }, (_, i) => i);
    const sortedBusyHours = orderedHours.map(hour => {
        const found = busyPeriods.value.byHour.find(h => h.hour === hour);
        return found || { hour: hour, count: 0 };
    });


    const data = {
        labels: sortedBusyHours.map(item => `${item.hour}:00`),
        datasets: [{
            label: 'Number of Events',
            data: sortedBusyHours.map(item => item.count),
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor }, // Use theme variable
                    title: {
                        display: true,
                        text: 'Event Count',
                        color: textColor // Use theme variable
                    }
                },
                x: {
                    ticks: { color: textColor } // Use theme variable
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw as number;
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        },
    });

    chartInstances.value.push(chart as Chart);
};


const createtimeSpentChart = () => {
    const ctx = timeSpentChart.value!.getContext('2d'); // Usa il ref corretto del canvas
    if (!ctx) return; // Explicit check for context


    const data = {
        labels: timeSpent.value.map(item => item.rule), // Usa timeSpent.value
        datasets: [
            {
                label: 'Daily Limit (Minutes)',
                data: timeSpent.value.map(item => item.limitMinutes), // Prendi i valori del limite
                // Colore grigio semi-trasparente per l'effetto "retro candela opaca"
                backgroundColor: 'rgba(169, 169, 169, 0.4)', // Grigio con 40% di opacità
                borderColor: 'rgba(169, 169, 169, 0.6)', // Bordo leggermente meno trasparente
                borderWidth: 1,
                // Imposta l'asse x e y per assicurarsi che le barre si sovrappongano
                xAxisID: 'x',
                yAxisID: 'y'
            },


            // Dataset per il Tempo Speso (il tuo dataset originale)
            {
                label: 'Minutes Spent',
                // Calcola il tempo speso come limite - tempo rimanente
                data: timeSpent.value.map(item => item.limitMinutes - item.remainingMinutes),
                backgroundColor: 'rgba(75, 192, 192, 0.7)', // Il tuo colore originale
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                // Imposta l'asse x e y per assicurarsi che le barre si sovrappongano
                xAxisID: 'x',
                yAxisID: 'y'
            }
        ]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor }, // Use theme variable
                    title: {
                        display: true,
                        text: 'Minutes',
                        color: textColor // Use theme variable
                    },
                    // Assicurati che gli assi siano configurati correttamente
                    stacked: false, // Non è uno stacked bar chart tradizionale, ma barre sovrapposte
                },
                x: {
                    ticks: { color: textColor }, // Use theme variable
                    // Assicurati che gli assi siano configurati correttamente
                    stacked: false,
                }
            },
            plugins: {

                legend: {
                    display: true, // Imposta su true
                    labels: {
                        color: textColor // Usa la variabile del tema
                    }
                },

                title: { display: false },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw as number;
                            const index = context.dataIndex;
                            const ruleData = timeSpent.value[index]; // Accedi ai dati della regola
                            const limit = ruleData.limitMinutes;
                            const spent = ruleData.limitMinutes - ruleData.remainingMinutes;

                            // Mostra entrambi i valori nel tooltip indipendentemente dalla barra su cui passi il mouse
                            return `Spent: ${spent} min | Limit: ${limit} min`;
                        },
                        title: function (context) {
                            // Usa il nome della regola come titolo del tooltip
                            return context[0].label;
                        }
                    }
                },

                // Aggiungi datalabels se vuoi mostrare i valori sulle barre
                datalabels: {
                    color: textColor,
                    anchor: 'end',
                    align: 'top',
                    formatter: (value: number, context: any) => {
                        // Mostra solo il valore del tempo speso sulla barra del tempo speso
                        if (context.dataset.label === 'Minutes Spent') {
                            return value > 0 ? value.toFixed(0) : ''; // Mostra intero, non decimali per i minuti
                        }
                        return ''; // Non mostrare datalabel sulla barra del limite
                    },
                    display: (context: any) => {
                        // Mostra il datalabel solo sulla barra del tempo speso e se il valore è > 0
                        const value = context.dataset.data[context.dataIndex];
                        return context.dataset.label === 'Minutes Spent' && value > 0;
                    }
                }
            },
            //plugins: [ChartDataLabels] // Assicurati che ChartDataLabels sia registrato se lo usi qui
        },
    });

    chartInstances.value.push(chart as any); // Usa 'any' per evitare l'errore di complessità del tipo
};


const createTimeLimitUsageRateChart = () => {
    // Already checked for ref and data availability in updateCharts
    const ctx = TimeLimitUsageRateChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


    const data = {
        labels: timeSpent.value.map(item => item.rule),
        datasets: [{
            label: 'Usage Rate (%)',
            data: timeSpent.value.map(item => item.percentage),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, { // Use non-null assertion
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: textColor, callback: (value) => value + '%' }, // Use theme variable
                    title: {
                        display: true,
                        text: 'Usage Rate (%)',
                        color: textColor // Use theme variable
                    }
                },
                x: {
                    ticks: { color: textColor } // Use theme variable
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw as number;
                            return `${label}: ${value.toFixed(1)}%`;
                        }
                    }
                }
            },
        },
    });

    chartInstances.value.push(chart as Chart);
};


function sendNotify(type: "info" | "warning" | "error" | "success", text: string) {
    if (notificationManager.value) {
        (notificationManager.value as any).showNotification({
            type: type,
            message: text,
        })
    } else {
        console.log("Notification manager not found")
    }
}

const handleSectionChange = (newSection: any) => {
    console.log(`Navigating to section: ${newSection}`);
};

function applyDarkMode() {
    // Apply theme
    if (isDarkMode.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    }

}

onMounted(async () => {
    applyDarkMode()
    // Load user info to get license key and time tracker status
    const userInfoRes = await userHandler.getUserInfo(true);
    console.log("userInfoRes (stats page):\n", userInfoRes);
    if (!userInfoRes.userInfo_DB) { // => user not logged
        sendNotify("warning", "Not logged in, please log in");
        await delay(1500);
        router.push("/welcome");
        return;
    }

    userInfo.value = userInfoRes.userInfo_DB as userDBentry;
    extComunicator.licenseKey = userInfo.value.licenseKey
    // Set initial period and load stats
    setPeriod('month');

    //comuncation with ext:
    const rawUserInfo = toRaw(userInfo.value)
    extComunicator.notifyPwaReady(rawUserInfo);            

    //ottengo rules da ext + controllo (ed eventuale update db + update locale)
    const extRuls = await extComunicator.requestTimeTrackerRules()
    if (Array.isArray(extRuls)) {
        let mergedRules = await timeTrackerHandler.mergeAndCheckCoerence(ttRules.value, extRuls, userInfo.value.licenseKey)
        ttRules.value = []
        for (let r of mergedRules) {
            ttRules.value.push(timeTrackerHandler.fromRuleObj(r));
        }
    }

    extComunicator.on("ASK_RULES_FROM_EXT",async()=>{
        const rawRules = toRaw(ttRules.value).map(r => toRaw(r))
        extComunicator.updateTTrulesInExt(rawRules)
    })

    extComunicator.on("RULES_UPDATED_FROM_EXT", async (payload: { timeTrackerRules: TimeTrackerRule[] }) => {
        //check + merge per coerenza
        if (Array.isArray(payload.timeTrackerRules)) {
            let mergedRules = await timeTrackerHandler.mergeAndCheckCoerence(ttRules.value, payload.timeTrackerRules, userInfo.value.licenseKey)
            ttRules.value = []
            for (let r of mergedRules) {
                ttRules.value.push(timeTrackerHandler.fromRuleObj(r));
            }
        }
    })
});

</script>

<style scoped>
/* Use variables defined in style.css */

.main-app {
    display: flex;
    width: 100vw;
    min-height: 100vh;
    overflow-x: hidden;
    background-color: var(--background);
    color: var(--color);
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 5%;
    box-sizing: border-box;
    overflow-x: hidden;
    font-family: 'Poppins', sans-serif;
    min-height: 100vh;
    padding-bottom: 20px;
    padding-right: 15px;
}


.canvas-box {
    background-color: var(--background);
    /* Use dark background variable */
    padding: 15px;
    border-radius: 8px;
    color: var(--text-color);
    /* Use base color variable */
    box-sizing: border-box;
    width: 95%;
    display: flex;
    flex-direction: column;
    transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.elevated {
    box-shadow: var(--shadow);
    /* Use shadow variable from style.css */
}

.rounded-2xl {
    border-radius: 1rem;
}


.header-section {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin-top: 2%;
    width: 97%;
    flex-wrap: wrap;
    gap: 20px;
    margin-left: 2%;
    margin-bottom: 2%;
    padding: 20px;
    
}


.header-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 1em;
}

.header-item .value {
    font-weight: bold;
    margin-left: 5px;
    color: #FFD700;
    /* Use accent color variable */
}

.icon {
    font-size: 1.6em;
    margin-right: 5px;
    color: #FFD700;
    /* Use accent color variable */
}

.period-selection,
.trend-interval-selection {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1em;
    color: var(--text-color);
    /* Use base color for labels */
}

.period-selection select,
.trend-interval-selection select {
    padding: 5px;
    border-radius: 5px;
    border: 1px solid var(--button-border);
    /* Use button-border or input-field-border */
    background-color: var(--background);
    /* Use base background */
    color: var(--text-color);
    /* Use base color */
    cursor: pointer;
}

.custom-date-picker {
    display: flex;
    align-items: center;
    gap: 10px;
}

.content-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 30px;
    margin-left: 3%;
    width: 97%;
    margin-bottom: 2%;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto !important;
    min-height: 0;
}

.content-area h3.section-title {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1.8em;
    color: var(--accent-color);
    border-bottom: 2px solid var(--button-border);
    padding-bottom: 5px;
    width: 100%;
    text-align: center;
}

.charts-grid,
.charts-grid-2,
.charts-grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    width: 100%;
    overflow-x: hidden;
    padding-right: 15px;
    box-sizing: border-box;
    min-height: 850px;
}

.charts-grid-2 {
    min-height: 400px;
}

.charts-grid-3 {
    min-height: 100%;
    margin-bottom: 1%;
}



.chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 15px;
    background-color: var(--charts-background-color);
    color: var(--text-color);
    /* Use base color for text within the box */
    border-radius: 1rem;
    box-sizing: border-box;
    max-height: 400px;
    /* Adjust as needed to fit reasonably */
    overflow: hidden;
    /* Hide anything exceeding the max height */
    position: relative;
    margin-bottom: 5%;
    margin-right: 2%;
    margin-left: 2%;

    /* Target canvas inside the container */
    & canvas {
        width: 98% !important;
        height: 90% !important;
        /* This forces canvas to fill container height */
    }
}

.chart-container h4 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.2em;
    color: var(--accent-color);
    /* Use accent color for chart titles as requested */
    text-align: center;
    width: 100%;
}

.custom-select {
    position: relative;
    display: flex;
    align-items: center;
}

.menu-icon {
    font-size: 18px;
    display: inline-flex;
}

.select-icon {
    position: absolute;
    right: 10px;
    pointer-events: none;
}

.custom-select .selettore {
    width: 140px;
}

.chart-container {
    /* Assicurati che il container abbia una posizione relativa se il suo contenuto (il wrapper) è assoluto */
    position: relative;
    /* Aggiungi altri stili per i tuoi box (padding, margins, etc.) */
    padding: 1rem;
    /* Esempio */
    display: flex;
    flex-direction: column;
    /* Per impilare titolo e wrapper */
}

.chart-container h4 {
    text-align: center;
    /* Centra il titolo */
    margin-bottom: 0.5rem;
    /* Spazio tra titolo e grafico */
    /* Aggiungi stili per il titolo */
}

.chart-canvas-wrapper {
    position: relative;
    /* Importante per posizionare l'overlay */
    flex-grow: 1;
    /* Permette al wrapper di espandersi */
    /* Imposta un'altezza minima se necessario, anche se maintainAspectRatio: false lo gestisce */
    /* min-height: 200px; Esempio */
}


.chart-canvas-wrapper canvas {
    display: block;
    /* Assicurati che il canvas sia un blocco per evitare spazio extra */
    width: 100% !important;
    /* Chart.js a volte imposta width inline, override */
    height: 100% !important;
    /* Chart.js a volte imposta height inline, override */
}

.blurred-content canvas {
    /* Applica il blur al canvas quando la classe 'blurred-content' è presente sul wrapper */
    filter: blur(4px);
    /* Regola il valore del blur come preferisci */
    pointer-events: none;
    /* Rendi il canvas non interattivo quando sfocato */
}

.no-data-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0);
    /* Sfondo bianco semi-trasparente */
    color: #555;
    /* Colore testo */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    /* Assicurati che l'overlay sia sopra il canvas */
    text-align: center;
    font-size: 1.2rem;
    /* Dimensione testo */
    font-weight: bold;
}
</style>