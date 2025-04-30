import { CalendarEvent } from "./calendarEvent";
import { TimeTrackerRule } from "./timeTracker";
import { ToDoAction, ToDoPriority } from "./toDoEngine";
export declare class StatsHandler {
    private static instance;
    private startDate;
    private endDate;
    private constructor();
    static getInstance(startDate?: Date, endDate?: Date): StatsHandler;
    /**
     * Imposta il periodo di analisi per le statistiche
     */
    setPeriod(startDate: Date, endDate: Date): void;
    /**
     * Filtra i dati in base al periodo selezionato
     */
    private filterByPeriod;
    /**
     * Calcola la percentuale di completamento per categoria
     */
    getCompletionByCategory(todos: ToDoAction[], categories: string[]): {
        category: string;
        completed: number;
        total: number;
        percentage: number;
    }[];
    /**
     * Calcola i karma points totali e per categoria
     */
    getKarmaPoints(todos: ToDoAction[], categoryKarmaMap: Record<string, number>): {
        total: number;
        byCategory: {
            category: string;
            points: number;
        }[];
    };
    /**
     * Calcola la distribuzione dei task completati nel tempo
     */
    getCompletionTrend(todos: ToDoAction[], interval?: 'day' | 'week' | 'month'): {
        labels: string[];
        completed: number[];
        added: number[];
    };
    /**
     * Calcola la percentuale di task completati entro la scadenza
     */
    getPunctualityRate(todos: ToDoAction[]): {
        onTime: number;
        late: number;
        percentage: number;
    };
    /**
     * Calcola la distribuzione dei task per priorità
     */
    getPriorityDistribution(todos: ToDoAction[]): {
        priority: ToDoPriority;
        count: number;
        percentage: number;
    }[];
    /**
     * Calcola il tempo medio di completamento delle to do completate nel periodo specificato.
     * Il risultato è in minuti.
     */
    getAverageCompletionTime(todos: ToDoAction[]): number;
    /**
     * Calcola la distribuzione del tempo per categoria di eventi
     */
    getTimeDistributionByCategory(events: CalendarEvent[]): {
        category: string;
        hours: number;
        percentage: number;
    }[];
    /**
     * Identifica i giorni e le ore con maggiore concentrazione di eventi
     */
    getBusyPeriods(events: CalendarEvent[]): {
        byDay: {
            day: string;
            count: number;
        }[];
        byHour: {
            hour: number;
            count: number;
        }[];
    };
    /**
     * Calcola il tempo speso davvero usando le regole di time tracking
     */
    getTimeSpent(rules: TimeTrackerRule[]): {
        rule: string;
        limitMinutes: number;
        remainingMinutes: number;
        timeSpentMinutes: number;
        percentage: number;
    }[];
    /**
     * Ottiene il numero della settimana per una data
     */
    private getWeekNumber;
}
