import { CalendarEvent } from "./calendarEvent";
import { TimeTrackerRule } from "./timeTracker";
import { ToDoAction, ToDoPriority } from "./toDoEngine";

export class StatsHandler {
    private static instance: StatsHandler
    private startDate: Date;
    private endDate: Date;

    private constructor(startDate?: Date, endDate?: Date) {
        // Default: ultimo mese
        this.endDate = endDate || new Date();
        this.startDate = startDate || new Date(this.endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    public static getInstance(startDate?: Date, endDate?: Date): StatsHandler {
        if (!StatsHandler.instance) {
            StatsHandler.instance = new StatsHandler(startDate, endDate);
        }
        return StatsHandler.instance;
    }

    /**
     * Imposta il periodo di analisi per le statistiche
     */
    setPeriod(startDate: Date, endDate: Date): void {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    /**
     * Filtra i dati in base al periodo selezionato
     */
    private filterByPeriod<T extends { dateWithTime?: Date; eventDate?: Date }>(
        items: T[]
    ): T[] {
        return items.filter(item => {
            const itemDate = item.dateWithTime || item.eventDate;
            return itemDate && itemDate >= this.startDate && itemDate <= this.endDate;
        });
    }

    // TO-DO STATISTICS

    /**
     * Calcola la percentuale di completamento per categoria
     */
    getCompletionByCategory(todos: ToDoAction[], categories: string[]): { category: string; completed: number; total: number; percentage: number }[] {
        const result: Record<string, { completed: number; total: number }> = {};
        for (let c of categories) {
            result[c] = { completed: 0, total: 0 };
        }

        // Filtra per il periodo selezionato
        const filteredTodos = this.filterByPeriod(todos);

        // Calcola totali per categoria
        filteredTodos.forEach(todo => {
            if (!result[todo.category]) {
                result[todo.category] = { completed: 0, total: 0 };
            }

            result[todo.category].total++;
            if (todo.completed) {
                result[todo.category].completed++;
            }
        });

        // Converte in array e calcola percentuali
        return Object.entries(result).map(([category, stats]) => ({
            category,
            completed: stats.completed,
            total: stats.total,
            percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
        }));
    }

    /**
     * Calcola i karma points totali e per categoria
     */
    getKarmaPoints(todos: ToDoAction[], categoryKarmaMap: Record<string, number>): {
        total: number;
        byCategory: { category: string; points: number }[]
    } {
        // Filtra per il periodo selezionato
        const filteredTodos = this.filterByPeriod(todos);

        // Solo i completati contribuiscono ai karma points
        const completedTodos = filteredTodos.filter(todo => todo.completed);

        const categoryPoints: Record<string, number> = {};
        let totalPoints = 0;

        completedTodos.forEach(todo => {
            const points = categoryKarmaMap[todo.category] || 0;

            if (!categoryPoints[todo.category]) {
                categoryPoints[todo.category] = 0;
            }

            categoryPoints[todo.category] += points;
            totalPoints += points;
        });

        return {
            total: totalPoints,
            byCategory: Object.entries(categoryPoints).map(([category, points]) => ({
                category,
                points
            }))
        };
    }

    /**
     * Calcola la distribuzione dei task completati nel tempo
     */
    getCompletionTrend(todos: ToDoAction[], interval: 'day' | 'week' | 'month' = 'day'): {
        labels: string[];
        completed: number[];
        added: number[];
    } {
        // Filtra per il periodo selezionato
        const filteredTodos = this.filterByPeriod(todos);

        // Prepara l'array di date per l'intervallo scelto
        const dateLabels: Date[] = [];
        const currentDate = new Date(this.startDate);

        while (currentDate <= this.endDate) {
            dateLabels.push(new Date(currentDate));

            // Incrementa in base all'intervallo
            switch (interval) {
                case 'day':
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                case 'week':
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case 'month':
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
            }
        }

        // Formatta le etichette
        const labels = dateLabels.map(date => {
            switch (interval) {
                case 'day':
                    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                case 'week':
                    return `S${this.getWeekNumber(date)}`;
                case 'month':
                    return `${date.getMonth() + 1}/${date.getFullYear()}`;
            }
        });

        // Conta i task completati e aggiunti per ogni intervallo
        const completed = new Array(dateLabels.length).fill(0);
        const added = new Array(dateLabels.length).fill(0);

        filteredTodos.forEach(todo => {
            const todoDate = todo.dateWithTime;
            console.log("to do date in for each get completion trend: ", todoDate)

            // Trova l'indice dell'intervallo corrispondente
            let index = -1;
            for (let i = 0; i < dateLabels.length - 1; i++) {
                if (todoDate >= dateLabels[i] && todoDate < dateLabels[i + 1]) {
                    index = i;
                    break;
                }
            }

            // Se è l'ultimo intervallo
            if (index === -1 && todoDate >= dateLabels[dateLabels.length - 1]) {
                index = dateLabels.length - 1;
            }

            if (index !== -1) {
                added[index]++;
                if (todo.completed) {
                    completed[index]++;
                }
            }
        });

        return { labels, completed, added };
    }

    /**
     * Calcola la percentuale di task completati entro la scadenza
     */
    getPunctualityRate(todos: ToDoAction[]): {
        onTime: number;
        late: number;
        percentage: number;
    } {
        // Filtra per il periodo e solo i completati
        const filteredTodos = this.filterByPeriod(todos).filter(todo => todo.completed);

        let onTime = 0;
        let late = 0;

        filteredTodos.forEach(todo => {
            // Confronta data di completamento e scadenza
            // Nota: qui assumiamo che dateWithTime indichi quando è stato completato
            // Questo potrebbe richiedere una proprietà separata "completedDate"
            if (todo.dateWithTime <= todo.expiration) {
                onTime++;
            } else {
                late++;
            }
        });

        const total = onTime + late;

        return {
            onTime,
            late,
            percentage: total > 0 ? (onTime / total) * 100 : 0
        };
    }

    /**
     * Calcola la distribuzione dei task per priorità
     */
    getPriorityDistribution(todos: ToDoAction[]): {
        priority: ToDoPriority;
        count: number;
        percentage: number;
    }[] {
        // Filtra per il periodo
        const filteredTodos = this.filterByPeriod(todos);
        const total = filteredTodos.length;

        // Raggruppa per priorità
        const priorityCount: Record<ToDoPriority, number> = {} as Record<ToDoPriority, number>;

        filteredTodos.forEach(todo => {
            if (!priorityCount[todo.priority]) {
                priorityCount[todo.priority] = 0;
            }
            priorityCount[todo.priority]++;
        });

        return Object.entries(priorityCount).map(([priority, count]) => ({
            priority: priority as unknown as ToDoPriority,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0
        }));
    }

    /**
     * Calcola il tempo medio di completamento delle to do completate nel periodo specificato.
     * Il risultato è in minuti.
     */
    getAverageCompletionTime(todos: ToDoAction[]): number {
        console.log("todos in getAverageCompletionTime:\n", todos)

        // 1 & 2. Filtra i task completati in base alla loro completionDate e al periodo impostato
        const completedTodosInPeriod = todos.filter(todo =>
            todo.completed &&
            todo.completionDate && // Assicura che completionDate esista
            todo.completionDate >= this.startDate &&
            todo.completionDate <= this.endDate
        );

        console.log("completedTodosInPeriod in getAverageCompletionTime:\n", completedTodosInPeriod)

        // 3. Calcola la somma dei tempi di completamento
        let totalCompletionTimeMs = 0;
        completedTodosInPeriod.forEach(todo => {
            // Assicurati che sia dateWithTime che completionDate esistano prima di calcolare la differenza
            if (todo.dateWithTime && todo.completionDate) {
                // Tempo di completamento = completionDate - dateWithTime (in ms)
                totalCompletionTimeMs += todo.completionDate.getTime() - todo.dateWithTime.getTime();
            }
        });

        // 4. Calcola il numero di task completati nel periodo
        const numberOfCompletedTodos = completedTodosInPeriod.length;

        // 5. Calcola il tempo medio
        if (numberOfCompletedTodos === 0) {
            return 0; // Nessun task completato nel periodo
        }

        // Tempo medio in millisecondi
        const averageCompletionTimeMs = totalCompletionTimeMs / numberOfCompletedTodos;

        // Converte il tempo medio in minuti
        const averageCompletionTimeMinutes = averageCompletionTimeMs / (1000 * 60);

        // Puoi scegliere di arrotondare o formattare a seconda della precisione desiderata
        return parseFloat(averageCompletionTimeMinutes.toFixed(2)); // Arrotonda a 2 cifre decimali
    }

    // CALENDAR EVENTS STATISTICS

    /**
     * Calcola la distribuzione del tempo per categoria di eventi
     */
    getTimeDistributionByCategory(events: CalendarEvent[]): {
        category: string;
        hours: number;
        percentage: number;
    }[] {
        console.log("events in getTimeDistributionByCategory:\n", events);

        // Filtra per il periodo
        const filteredEvents = this.filterByPeriod(events);
        console.log("filtered events in getTimeDistributionByCategory:\n", filteredEvents);

        // Somma ore per categoria
        const categoryHours: Record<string, number> = {};
        let totalHours = 0;

        filteredEvents.forEach(event => {
            if (!categoryHours[event.category]) {
                categoryHours[event.category] = 0;
            }

            categoryHours[event.category] += event.durationInH;
            totalHours += event.durationInH;
        });

        return Object.entries(categoryHours).map(([category, hours]) => ({
            category,
            hours,
            percentage: totalHours > 0 ? (hours / totalHours) * 100 : 0
        }));
    }

    /**
     * Identifica i giorni e le ore con maggiore concentrazione di eventi
     */
    getBusyPeriods(events: CalendarEvent[]): {
        byDay: { day: string; count: number }[];
        byHour: { hour: number; count: number }[];
    } {
        // Filtra per il periodo
        const filteredEvents = this.filterByPeriod(events);

        // Conta per giorno della settimana
        const dayCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        // Conta per ora del giorno
        const hourCount: Record<number, number> = {};
        for (let i = 0; i < 24; i++) {
            hourCount[i] = 0;
        }

        filteredEvents.forEach(event => {
            const date = event.eventDate;
            const day = date.getDay();
            const hour = date.getHours();

            dayCount[day]++;
            hourCount[hour]++;
        });

        // Converti i conteggi in array ordinati
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const byDay = Object.entries(dayCount).map(([day, count]) => ({
            day: dayNames[parseInt(day)],
            count
        }));

        const byHour = Object.entries(hourCount).map(([hour, count]) => ({
            hour: parseInt(hour),
            count
        }));

        return { byDay, byHour };
    }

    // TIME TRACKER STATISTICS

    /**
     * Calcola il tempo speso davvero usando le regole di time tracking
     */
    getTimeSpent(rules: TimeTrackerRule[]): {
        rule: string;
        limitMinutes: number;
        remainingMinutes: number;
        timeSpentMinutes: number;
        percentage: number;
    }[] {
        return rules.map(rule => {
            const timeSpent = rule.minutesDailyLimit <= rule.minutesDailyLimit ? rule.minutesDailyLimit - rule.remainingTimeMin : rule.minutesDailyLimit;
            const percentage = (timeSpent / rule.minutesDailyLimit) * 100;

            return {
                rule: rule.site_or_app_name,
                limitMinutes: rule.minutesDailyLimit,
                remainingMinutes: rule.remainingTimeMin,
                timeSpentMinutes:timeSpent,
                percentage : Number(percentage.toFixed(2))
            };
        });
    }

    // UTILITY METHODS

    /**
     * Ottiene il numero della settimana per una data
     */
    private getWeekNumber(date: Date): number {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
}