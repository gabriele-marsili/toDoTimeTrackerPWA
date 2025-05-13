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
const userInfo = ref<userDBentry>({
    username: "",
    avatarImagePath: "",
    age: 0,
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

        
        updateCharts();

    } catch (error: any) {
        sendNotify("error", "Error loading stats: " + error.message)
        console.error("Error loading stats:", error);
    }
};


// Define setTrendInterval function here
function setTrendInterval(interval: 'day' | 'week' | 'month') {
    trendInterval.value = interval;
    
    completionTrend.value = statsHandler.value.getCompletionTrend(
        todos.value,
        trendInterval.value
    );
    console.log("completionTrend.value (in setTrendInterval)", completionTrend.value)
    
    if (todos.value.length > 0 && completionTrend.value.labels.length > 0) {
        updateCharts();
    } else {
        
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
        
        if (startDate > endDate) {
            sendNotify("warning", "Start date cannot be after end date.");
            return;
        }
        
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
        averageCompletionTimeChart: averageCompletionTime.value > 0, 
        calendarCategoryChart: timeDistribution.value.length > 0,
        busyDaysChart: busyPeriods.value.byDay.some(d => d.count > 0),
        busyHoursChart: busyPeriods.value.byHour.some(h => h.count > 0),
        timeSpentChart: timeSpent.value.length > 0,         
        TimeLimitUsageRateChart: timeSpent.value.some(item => item.timeSpentMinutes > 0)
    };
    console.log("chartDataStatus in update charts:\n", chartDataStatus)

    chartInstances.value.forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances.value = []; 


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


    if (TimeLimitUsageRateChart.value) {
        if (timeSpent.value.some(item => item.timeSpentMinutes > 0)) {
            chartDataStatus.value.TimeLimitUsageRateChart = true; 
            createTimeLimitUsageRateChart();
        } else {
            chartDataStatus.value.TimeLimitUsageRateChart = false; 
            const ctx = TimeLimitUsageRateChart.value.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, TimeLimitUsageRateChart.value.width, TimeLimitUsageRateChart.value.height);
        }
    } else {
        chartDataStatus.value.TimeLimitUsageRateChart = false;
    }


};

// --- Chart Creation Functions ---

const createAverageCompletionTimeChart = () => {
    
    if (!averageCompletionTimeChart.value || averageCompletionTime.value <= 0) {
        
        const ctx = averageCompletionTimeChart.value?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, averageCompletionTimeChart.value!.width, averageCompletionTimeChart.value!.height);
           
        }
        return;
    }

    const ctx = averageCompletionTimeChart.value!.getContext('2d');
    if (!ctx) return;

    const data = {
        labels: ['Average Time'],
        datasets: [{
            label: 'Average Completion Time (Minutes)',
            data: [averageCompletionTime.value], 
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx!, {
        type: 'bar', 
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (Minutes)', 
                        color: textColor
                    },
                    ticks: {
                        color: textColor 
                    }
                },
                x: {
                    ticks: {
                        color: textColor 
                    }
                }
            },
            plugins: {
                legend: {
                    display: false, 
                    labels: {
                        color: textColor 
                    }
                },
                title: {
                    display: false, 
                    text: 'Average Completion Time'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw as number;
                            return `${label}: ${value.toFixed(2)} minutes`; 
                        }
                    }
                },
                datalabels: {
                    color: textColor,
                    anchor: 'end',
                    align: 'top',
                    formatter: (value: number) => {
                        return value.toFixed(2);
                    },
                    display: (context: any) => {
                        
                        const value = context.dataset.data[context.dataIndex];
                        return value > 0;
                    }
                }
            },
        },
        plugins: [ChartDataLabels] 
    });

    chartInstances.value.push(chart as Chart);
};

const createCategoryCompletionChart = () => {
    const ctx = categoryCompletionChart.value!.getContext('2d'); 
    if (!ctx) return; 

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
                'rgba(200, 100, 100, 0.7)', 
                'rgba(140, 200, 120, 0.7)', 
                'rgba(120, 120, 220, 0.7)', 
                'rgba(220, 120, 200, 0.7)', 
                'rgba(100, 180, 180, 0.7)', 
                'rgba(180, 180, 100, 0.7)', 
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

    const chart = new Chart(ctx!, { 
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
                            
                            if (value > 0) {
                                return `${label}: ${value.toFixed(1)}%`;
                            }
                            
                            return '';
                        }
                    }
                },
                datalabels: {
                    color: textColor,
                    formatter: (value: number) => {
                       
                        return value > 0 ? value.toFixed(1) + '%' : '';
                    },
                    display: (context: any) => {
                       
                        const value = context.dataset.data[context.dataIndex];
                        return value > 0;
                    }
                }
            },
 
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
    const ctx = karmaChart.value!.getContext('2d'); 
    if (!ctx) return; 


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

    const chart = new Chart(ctx!, { 
        type: 'doughnut',
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
    const ctx = completionTrendChart.value!.getContext('2d'); 
    if (!ctx) return; 


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

    const chart = new Chart(ctx!, { 
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    
                    suggestedMax: Math.max(...completionTrend.value.completed, ...completionTrend.value.added, 3), 
                    ticks: {
                        color: textColor 
                    },
                    title: {
                        display: true,
                        text: 'To Do Quantity',
                        color: textColor 
                    }
                },
                x: {
                    ticks: {
                        color: textColor 
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor 
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
    const ctx = punctualityChart.value!.getContext('2d'); 
    if (!ctx) return; 


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

    const chart = new Chart(ctx!, { 
        type: 'doughnut',
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
    const hasData = priorityDistribution.value.some(item => item.count > 0);
    if (!priorityChart.value || !hasData) return;

    const ctx = priorityChart.value!.getContext('2d'); 
    if (!ctx) return; 


    const data = {
        labels: priorityDistribution.value.map(item => `Priority ${item.priority}`),
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

    const chart = new Chart(ctx!, { 
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
    const ctx = calendarCategoryChart.value!.getContext('2d'); 
    if (!ctx) return;


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

    const chart = new Chart(ctx!, { 
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
    const ctx = busyDaysChart.value!.getContext('2d'); 
    if (!ctx) return; 


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

    const chart = new Chart(ctx!, { 
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor }, 
                    title: {
                        display: true,
                        text: 'Event Count',
                        color: textColor 
                    }
                },
                x: {
                    ticks: { color: textColor } 
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
    
    const ctx = busyHoursChart.value!.getContext('2d'); 
    if (!ctx) return;


    
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

    const chart = new Chart(ctx!, { 
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor }, 
                    title: {
                        display: true,
                        text: 'Event Count',
                        color: textColor 
                    }
                },
                x: {
                    ticks: { color: textColor } 
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
    const ctx = timeSpentChart.value!.getContext('2d'); 
    if (!ctx) return; 


    const data = {
        labels: timeSpent.value.map(item => item.rule), 
        datasets: [
            {
                label: 'Daily Limit (Minutes)',
                data: timeSpent.value.map(item => item.limitMinutes), 
                
                backgroundColor: 'rgba(169, 169, 169, 0.4)',
                borderColor: 'rgba(169, 169, 169, 0.6)', 
                borderWidth: 1,
                
                xAxisID: 'x',
                yAxisID: 'y'
            },


            
            {
                label: 'Minutes Spent',
                
                data: timeSpent.value.map(item => item.limitMinutes - item.remainingMinutes),
                backgroundColor: 'rgba(75, 192, 192, 0.7)', 
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                
                xAxisID: 'x',
                yAxisID: 'y'
            }
        ]
    };

    const chart = new Chart(ctx!, { 
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor }, 
                    title: {
                        display: true,
                        text: 'Minutes',
                        color: textColor 
                    },
                    
                    stacked: false,
                },
                x: {
                    ticks: { color: textColor }, 
                    stacked: false,
                }
            },
            plugins: {

                legend: {
                    display: true,
                    labels: {
                        color: textColor 
                    }
                },

                title: { display: false },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw as number;
                            const index = context.dataIndex;
                            const ruleData = timeSpent.value[index]; 
                            const limit = ruleData.limitMinutes;
                            const spent = ruleData.limitMinutes - ruleData.remainingMinutes;

                            return `Spent: ${spent} min | Limit: ${limit} min`;
                        },
                        title: function (context) {
                            return context[0].label;
                        }
                    }
                },

                datalabels: {
                    color: textColor,
                    anchor: 'end',
                    align: 'top',
                    formatter: (value: number, context: any) => {
                        if (context.dataset.label === 'Minutes Spent') {
                            return value > 0 ? value.toFixed(0) : ''; 
                        }
                        return '';
                    },
                    display: (context: any) => {
                        const value = context.dataset.data[context.dataIndex];
                        return context.dataset.label === 'Minutes Spent' && value > 0;
                    }
                }
            },
           
        },
    });

    chartInstances.value.push(chart as any); 
};


const createTimeLimitUsageRateChart = () => {    
    const ctx = TimeLimitUsageRateChart.value!.getContext('2d'); 
    if (!ctx) return; 


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

    const chart = new Chart(ctx!, { 
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: textColor, callback: (value) => value + '%' }, 
                    title: {
                        display: true,
                        text: 'Usage Rate (%)',
                        color: textColor 
                    }
                },
                x: {
                    ticks: { color: textColor } 
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
    setPeriod('month');

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
    
    padding: 15px;
    border-radius: 8px;
    color: var(--text-color);
    
    box-sizing: border-box;
    width: 95%;
    display: flex;
    flex-direction: column;
    transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.elevated {
    box-shadow: var(--shadow);
    
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
    
}

.icon {
    font-size: 1.6em;
    margin-right: 5px;
    color: #FFD700;
 
}

.period-selection,
.trend-interval-selection {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1em;
    color: var(--text-color);
    
}

.period-selection select,
.trend-interval-selection select {
    padding: 5px;
    border-radius: 5px;
    border: 1px solid var(--button-border);
    
    background-color: var(--background);
    
    color: var(--text-color);
    
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

    border-radius: 1rem;
    box-sizing: border-box;
    max-height: 400px;

    overflow: hidden;
   
    position: relative;
    margin-bottom: 5%;
    margin-right: 2%;
    margin-left: 2%;

    & canvas {
        width: 98% !important;
        height: 90% !important;
    }
}

.chart-container h4 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.2em;
    color: var(--accent-color);
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
    position: relative;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

.chart-container h4 {
    text-align: center;
    margin-bottom: 0.5rem;
}

.chart-canvas-wrapper {
    position: relative;
    flex-grow: 1;
}


.chart-canvas-wrapper canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
}

.blurred-content canvas {
    filter: blur(4px);
    pointer-events: none;
}

.no-data-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0);    
    color: #555;    
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;    
    text-align: center;
    font-size: 1.2rem; 
    font-weight: bold;
}
</style>