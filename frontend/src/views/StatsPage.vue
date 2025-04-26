<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="main-app custom-scrollbar">
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
                    <select v-model="selectedPeriod" @change="setPeriod(selectedPeriod)">
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                        <option value="custom">Custom Period</option>
                    </select>
                </div>

                <div v-if="selectedPeriod === 'custom'" class="custom-date-picker">
                    <DatePicker v-model="customStartDate" placeholder="Start Date" />
                    <DatePicker v-model="customEndDate" placeholder="End Date" />
                    <button @click="applyCustomPeriod" class="baseButton">Apply</button>
                </div>

                <div class="trend-interval-selection">
                    <span>Trend Interval: </span>
                    <select v-model="trendInterval" @change="setTrendInterval(trendInterval)">
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                    </select>
                </div>
            </header>

            <div class="content-area">

                <h3 class="section-title">To-Do Actions Statistics</h3>
                <div class="charts-grid">
                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Completion by Category</h4>
                        <canvas ref="categoryCompletionChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Completion and Addition Trend</h4>
                        <canvas ref="completionTrendChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Karma Points by Category</h4>
                        <canvas ref="karmaChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Punctuality Rate</h4>
                        <canvas ref="punctualityChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Distribution by Priority</h4>
                        <canvas ref="priorityChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl disabled-chart">
                        <h4>Average Completion Time</h4>
                        <p>Data not available (requires implementation in StatsHandler)</p>
                    </div>

                    <div class="chart-container box elevated rounded-2xl disabled-chart">
                        <h4>Recurring Tasks</h4>
                        <p>Data not available (requires implementation in StatsHandler)</p>
                    </div>
                </div>

                <h3 class="section-title">Calendar Events Statistics</h3>
                <div class="charts-grid">
                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Time Distribution by Event Category</h4>
                        <canvas ref="calendarCategoryChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Events by Day of the Week</h4>
                        <canvas ref="busyDaysChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Events by Hour of the Day</h4>
                        <canvas ref="busyHoursChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl disabled-chart">
                        <h4>Average Event Duration by Category</h4>
                        <p>Data not available (requires implementation in StatsHandler)</p>
                    </div>
                </div>

                <h3 class="section-title">Time Tracker Rules Statistics</h3>
                <div class="charts-grid">
                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Time Saved per Rule</h4>
                        <canvas ref="timeSavedChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Rule Effectiveness</h4>
                        <canvas ref="ruleEffectivenessChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl disabled-chart">
                        <h4>Most Limited Categories</h4>
                        <p>Data not available (requires implementation in StatsHandler)</p>
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
import { onMounted, ref } from 'vue';
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

// Import Chart.js components
import { Chart, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, CategoryScale, PieController, DoughnutController, BarController, LineController } from 'chart.js';

// Register the necessary Chart.js components
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
    LineController
);


const notificationManager = ref(null);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
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
    fcmToken: "" // Assuming this property exists
});
const router = useRouter();
const todoHandler = ToDoHandler.getInstance(api_gestor);
const timeTrackerHandler = TimeTrackerHandler.getInstance(api_gestor)
const calendarEventsHandler = CalendarEventHandler.getInstance(api_gestor)

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
const timeSavedChart = ref<HTMLCanvasElement | null>(null);
const ruleEffectivenessChart = ref<HTMLCanvasElement | null>(null);


// Chart instances for cleanup
const chartInstances = ref<Chart[]>([]); // Array to hold all Chart instances

// Period selection
const selectedPeriod = ref('month');
const customStartDate = ref('');
const customEndDate = ref('');
const trendInterval = ref<'day' | 'week' | 'month'>('day');

// Stats results - Ensure all stats you want to display are here
const completionByCategory = ref<{ category: string; completed: number; total: number; percentage: number }[]>([]);
const karmaPoints = ref<{ total: number; byCategory: { category: string; points: number }[] }>({ total: 0, byCategory: [] });
const completionTrend = ref<{ labels: string[]; completed: number[]; added: number[] }>({ labels: [], completed: [], added: [] });
const punctualityRate = ref<{ onTime: number; late: number; percentage: number }>({ onTime: 0, late: 0, percentage: 0 });
const priorityDistribution = ref<{ priority: ToDoPriority; count: number; percentage: number }[]>([]);
const timeDistribution = ref<{ category: string; hours: number; percentage: number }[]>([]);
const busyPeriods = ref<{ byDay: { day: string; count: number }[]; byHour: { hour: number; count: number }[] }>({ byDay: [], byHour: [] });
const timeSaved = ref<{ rule: string; limitMinutes: number; remainingMinutes: number; savedMinutes: number; percentage: number }[]>([]);


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


        const categoryKarmaMap = userInfo.value.categories.reduce((map, category) => {
            map[category.name] = category.points;
            return map;
        }, {} as Record<string, number>);

        // Generate statistics using the loaded data and current period
        completionByCategory.value = statsHandler.value.getCompletionByCategory(todos.value);
        karmaPoints.value = statsHandler.value.getKarmaPoints(todos.value, categoryKarmaMap);
        // Trend data depends on interval, so call updateCompletionTrend separately after loading todos
        updateCompletionTrend(); // This call should now find the function
        punctualityRate.value = statsHandler.value.getPunctualityRate(todos.value);
        priorityDistribution.value = statsHandler.value.getPriorityDistribution(todos.value);
        timeDistribution.value = statsHandler.value.getTimeDistributionByCategory(calendarEvents.value);
        busyPeriods.value = statsHandler.value.getBusyPeriods(calendarEvents.value);
        timeSaved.value = statsHandler.value.getTimeSaved(ttRules.value);

        // Now that stats are calculated, update charts
        updateCharts();

    } catch (error: any) {
        sendNotify("error", "Error loading stats: " + error.message)
        console.error("Error loading stats:", error);
    }
};

// Update trend based on selected interval and then update charts
function updateCompletionTrend() { // The missing function definition is added here
    completionTrend.value = statsHandler.value.getCompletionTrend(
        todos.value,
        trendInterval.value
    );
    // Call updateCharts after trend data is updated
    if (todos.value.length > 0) { // Only update if data is available
        updateCharts();
    } else {
        // Clear charts if no data
        updateCharts(); // Calling updateCharts with empty data will destroy existing charts
    }
}

function setTrendInterval(interval: 'day' | 'week' | 'month') { // The missing function definition is added here
    trendInterval.value = interval;
    // Recalculate trend data for the new interval
    completionTrend.value = statsHandler.value.getCompletionTrend(
        todos.value,
        trendInterval.value
    );
    // Call updateCharts after trend data is updated
    if (todos.value.length > 0) { // Only update if data is available
        updateCharts();
    } else {
        // Clear charts if no data
        updateCharts(); // Calling updateCharts with empty data will destroy existing charts
    }
}


const applyCustomPeriod = () => {
    if (customStartDate.value && customEndDate.value) {
        selectedPeriod.value = 'custom';
        const startDate = new Date(customStartDate.value);
        const endDate = new Date(customEndDate.value);
        // Validate dates if necessary (e.g., start before end)
        if (startDate > endDate) {
            sendNotify("warning", "Start date cannot be after end date.");
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
    // Destroy existing charts to prevent memory leaks
    chartInstances.value.forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances.value = []; // Clear the array


    // Create new charts only if data is available
    if (completionByCategory.value.length > 0) createCategoryCompletionChart();
    // Check if karmaPoints.value.byCategory has items with points > 0
    if (karmaPoints.value.byCategory.some(cat => cat.points > 0)) createKarmaChart();
    if (completionTrend.value.labels.length > 0) createCompletionTrendChart();
    if (punctualityRate.value.onTime + punctualityRate.value.late > 0) createPunctualityChart();
    // Check if priorityDistribution.value has items with count > 0
    if (priorityDistribution.value.some(item => item.count > 0)) createPriorityChart();
    if (timeDistribution.value.length > 0) createCalendarCategoryChart();
    // Check if busyPeriods.byDay and busyPeriods.byHour have actual data points before creating charts
    if (busyPeriods.value.byDay.some(d => d.count > 0)) createBusyDaysChart();
    if (busyPeriods.value.byHour.some(h => h.count > 0)) createBusyHoursChart();
    if (timeSaved.value.length > 0) {
        createTimeSavedChart();
        // Check if there's any time saved before creating effectiveness chart
        if (timeSaved.value.some(item => item.savedMinutes > 0)) {
            createRuleEffectivenessChart();
        }
    }

};

// --- Chart Creation Functions ---

const createCategoryCompletionChart = () => {
    if (!categoryCompletionChart.value || completionByCategory.value.length === 0) return;

    const ctx = categoryCompletionChart.value.getContext('2d');
    if (!ctx) return;

    const data = {
        labels: completionByCategory.value.map(stat => stat.category),
        datasets: [{
            label: 'Completion (%)',
            data: completionByCategory.value.map(stat => stat.percentage),
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(255, 99, 132, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(100, 100, 100, 0.7)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(100, 100, 100, 1)',
            ],
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'var(--color)'
                    }
                },
                title: {
                    display: false,
                    text: 'Completion by Category'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
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


const createKarmaChart = () => {
    // Check if karmaPoints.value.byCategory has items with points > 0
    const hasData = karmaPoints.value.byCategory.some(cat => cat.points > 0);
    if (!karmaChart.value || !hasData) return;

    const ctx = karmaChart.value.getContext('2d');
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

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'var(--color)'
                    }
                },
                title: {
                    display: false,
                    text: 'Karma Points by Category'
                },
                tooltip: { // Tooltip is correctly inside plugins
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
    if (!completionTrendChart.value || completionTrend.value.labels.length === 0) return;

    const ctx = completionTrendChart.value.getContext('2d');
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

    const chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'var(--color)'
                    },
                    title: {
                        display: true,
                        text: 'Task Quantity',
                        color: 'var(--color)'
                    }
                },
                x: {
                    ticks: {
                        color: 'var(--color)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'var(--color)'
                    }
                },
                title: {
                    display: false,
                    text: 'Task Completion Trend'
                },
                tooltip: { // Tooltip is correctly inside plugins
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
    if (!punctualityChart.value || (punctualityRate.value.onTime === 0 && punctualityRate.value.late === 0)) return;

    const ctx = punctualityChart.value.getContext('2d');
    if (!ctx) return;

    const data = {
        labels: ['On Time', 'Late'],
        datasets: [{
            label: 'Tasks',
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

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'var(--color)'
                    }
                },
                title: {
                    display: false,
                    text: 'Punctuality Rate'
                },
                tooltip: { // Tooltip is correctly inside plugins
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
    // Check if priorityDistribution has data with counts > 0
    const hasData = priorityDistribution.value.some(item => item.count > 0);
    if (!priorityChart.value || !hasData) return;


    const ctx = priorityChart.value.getContext('2d');
    if (!ctx) return;

    const data = {
        labels: priorityDistribution.value.map(item => item.priority), // Use priority enum values as labels
        datasets: [{
            label: 'Number of Tasks',
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

    const chart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'var(--color)'
                    }
                },
                title: {
                    display: false,
                    text: 'Distribution by Priority'
                },
                tooltip: { // Tooltip is correctly inside plugins
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
    if (!calendarCategoryChart.value || timeDistribution.value.length === 0) return;

    const ctx = calendarCategoryChart.value.getContext('2d');
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

    const chart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'var(--color)'
                    }
                },
                title: {
                    display: false,
                    text: 'Time Distribution by Event Category'
                },
                tooltip: { // Tooltip is correctly inside plugins
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
    if (!busyDaysChart.value || !Array.isArray(busyPeriods.value.byDay) || busyPeriods.value.byDay.length === 0) return;

    const ctx = busyDaysChart.value.getContext('2d');
    if (!ctx) return;

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

    const chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'var(--color)' },
                    title: {
                        display: true,
                        text: 'Event Count',
                        color: 'var(--color)'
                    }
                },
                x: {
                    ticks: { color: 'var(--color)' }
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: { // Tooltip is correctly inside plugins
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
    if (!busyHoursChart.value || !Array.isArray(busyPeriods.value.byHour) || busyPeriods.value.byHour.length === 0) return;


    const ctx = busyHoursChart.value.getContext('2d');
    if (!ctx) return;

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

    const chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'var(--color)' },
                    title: {
                        display: true,
                        text: 'Event Count',
                        color: 'var(--color)'
                    }
                },
                x: {
                    ticks: { color: 'var(--color)' }
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: { // Tooltip is correctly inside plugins
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

const createTimeSavedChart = () => {
    if (!timeSavedChart.value || timeSaved.value.length === 0) return;

    const ctx = timeSavedChart.value.getContext('2d');
    if (!ctx) return;

    const data = {
        labels: timeSaved.value.map(item => item.rule),
        datasets: [{
            label: 'Minutes Saved',
            data: timeSaved.value.map(item => item.savedMinutes),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'var(--color)' },
                    title: {
                        display: true,
                        text: 'Minutes',
                        color: 'var(--color)'
                    }
                },
                x: {
                    ticks: { color: 'var(--color)' }
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: { // Tooltip is correctly inside plugins
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw as number;
                            return `${label}: ${value} minutes`;
                        }
                    }
                }
            }
        },
    });

    chartInstances.value.push(chart as Chart);
};


const createRuleEffectivenessChart = () => {
    if (!ruleEffectivenessChart.value || timeSaved.value.length === 0) return;

    const ctx = ruleEffectivenessChart.value.getContext('2d');
    if (!ctx) return;

    const data = {
        labels: timeSaved.value.map(item => item.rule),
        datasets: [{
            label: 'Effectiveness (%)',
            data: timeSaved.value.map(item => item.percentage),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const chart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: 'var(--color)', callback: (value) => value + '%' },
                    title: {
                        display: true,
                        text: 'Effectiveness (%)',
                        color: 'var(--color)'
                    }
                },
                x: {
                    ticks: { color: 'var(--color)' }
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: { // Tooltip is correctly inside plugins
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



onMounted(async () => {
    // Apply theme
    if (isDarkMode.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    }

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

    // Set initial period and load stats
    setPeriod('month');
});

</script>

<style scoped>
/* Use variables defined in style.css */

.main-app {
    display: flex;
    width: 100vw;
    height: 102vh;
    overflow-y: auto;
    overflow: hidden;
    border: 2px solid #1e1e1e;
}

/* Stili per la scrollbar custom */
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #333;
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #15b680d4;
    border-radius: 4px;
}

.custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #15b680d4 #333;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 5%;
    box-sizing: border-box;
    overflow-x: hidden;
    /* Prevent horizontal scrolling */
    font-family: 'Poppins', sans-serif;
    min-height: 100vh;
    padding-bottom: 20px;
    padding-right: 15px;
    /* Add padding to the right to prevent content hiding under scrollbar */
}


.box {
    background-color: var(--background-dark);
    /* Use dark background variable */
    padding: 15px;
    border-radius: 8px;
    color: var(--color);
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
    color: var(--color);
}

.period-selection select,
.trend-interval-selection select {
    padding: 5px;
    border-radius: 5px;
    border: 1px solid var(--button-border);
    background-color: var(--background);
    color: var(--color);
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
    margin-left: 2%;
    width: 97%;
    
    margin-bottom: 2%;
    padding: 20px;
    box-sizing: border-box;
}

.content-area h3.section-title {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1.8em;
    color: var(--button-border);
    border-bottom: 2px solid var(--button-border);
    padding-bottom: 5px;
    width: 100%;
    text-align: center;
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    width: 100%;
}

.chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 15px;
    background-color:rgba(0, 0, 0, 0.5);
    
    color: var(--color);
    border-radius: 1rem;
    box-sizing: border-box;
    min-height: 350px;
    position: relative;

    canvas {
        width: 100% !important;
        height: 100% !important;
    }
}

.chart-container h4 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.2em;
    color: var(--button-border);
    text-align: center;
    width: 100%;
}

.disabled-chart {
    opacity: 0.6;
    text-align: center;
    justify-content: center;
}

.disabled-chart p {
    font-style: italic;
    color: var(--color);
}
</style>