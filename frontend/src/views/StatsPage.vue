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

            <div class="content-area invisible-scrollbar">

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
                </div>

                <h3 class="section-title">Calendar Events Statistics</h3>
                <div class="charts-grid-2">
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
                </div>

                <h3 class="section-title">Time Tracker Rules Statistics</h3>
                <div class="charts-grid-3">
                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Time Saved per Rule</h4>
                        <canvas ref="timeSavedChart"></canvas>
                    </div>

                    <div class="chart-container box elevated rounded-2xl">
                        <h4>Rule Effectiveness</h4>
                        <canvas ref="ruleEffectivenessChart"></canvas>
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
import { Chart, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, CategoryScale, PieController, DoughnutController, BarController, LineController } from 'chart.js';
import { parseISO } from 'date-fns'; // Assuming date-fns is used for date parsing
import ChartDataLabels from 'chartjs-plugin-datalabels';


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
        timeDistribution.value = statsHandler.value.getTimeDistributionByCategory(calendarEvents.value);
        console.log("timeDistribution.value", timeDistribution.value)
        busyPeriods.value = statsHandler.value.getBusyPeriods(calendarEvents.value);
        console.log("busyPeriods.value", busyPeriods.value)
        timeSaved.value = statsHandler.value.getTimeSaved(ttRules.value);
        console.log("timeSaved.value", timeSaved.value)

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
        // Use parseISO from date-fns to correctly parse the date strings
        const startDate = parseISO(customStartDate.value);
        const endDate = parseISO(customEndDate.value);
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
    // Destroy existing charts to prevent memory leaks
    chartInstances.value.forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances.value = []; // Clear the array

    // Create new charts only if the canvas ref exists AND there is data
    // Added stricter checks for data presence before attempting to create charts
    if (categoryCompletionChart.value && completionByCategory.value.length > 0) createCategoryCompletionChart();
    if (karmaChart.value && karmaPoints.value.byCategory.some(cat => cat.points > 0)) createKarmaChart();
    if (completionTrendChart.value && completionTrend.value.labels.length > 0) createCompletionTrendChart();
    if (punctualityChart.value && (punctualityRate.value.onTime > 0 || punctualityRate.value.late > 0)) createPunctualityChart(); // Check if at least one count is > 0
    if (priorityChart.value && priorityDistribution.value.some(item => item.count > 0)) createPriorityChart();
    if (calendarCategoryChart.value && timeDistribution.value.length > 0) createCalendarCategoryChart();
    // Check if busyPeriods.byDay and busyPeriods.byHour have actual data points before creating charts
    if (busyDaysChart.value && busyPeriods.value.byDay.some(d => d.count > 0)) createBusyDaysChart();
    if (busyHoursChart.value && busyPeriods.value.byHour.some(h => h.count > 0)) createBusyHoursChart();
    if (timeSavedChart.value && timeSaved.value.length > 0) {
        createTimeSavedChart();
        // Check if there's any time saved before creating effectiveness chart
        if (ruleEffectivenessChart.value && timeSaved.value.some(item => item.savedMinutes > 0)) {
            createRuleEffectivenessChart();
        }
    }
};

// --- Chart Creation Functions ---

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
                        text: 'Task Quantity',
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
                    text: 'Task Completion Trend'
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

const createTimeSavedChart = () => {
    // Already checked for ref and data availability in updateCharts
    const ctx = timeSavedChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


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
    // Already checked for ref and data availability in updateCharts
    const ctx = ruleEffectivenessChart.value!.getContext('2d'); // Use non-null assertion
    if (!ctx) return; // Explicit check for context


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
                        text: 'Effectiveness (%)',
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


.box {
    background-color: var(--background-dark);
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
    margin-left: 2%;
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
.charts-grid-2{
    min-height: 400px;
}
.charts-grid-3{
    min-height: 100%;
}



.chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 15px;
    background-color: #212121;
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
</style>