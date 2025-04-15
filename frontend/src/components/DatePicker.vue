<template>
  <div class="custom-datepicker">
    <!-- Input gestito da Flatpickr -->
    <input
      ref="dateInput"
      type="text"
      :value="formattedDate"
      placeholder="gg/mm/yyyy hh:mm"
      @input="onInput"
    />
  </div>
</template>

<script>
import { onMounted, watch } from "vue";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/dark.css";

export default {
  name: "CustomDatePicker",
  props: {
    value: {
      type: Date,
      default: null
    },
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fp: null // Istanza di Flatpickr
    };
  },
  computed: {
    formattedDate() {
      if (!this.value) return "";
      return this.formatDate(this.value);
    }
  },
  mounted() {
    // Inizializza Flatpickr sull'input referenziato
    this.fp = flatpickr(this.$refs.dateInput, {
      enableTime: true,
      time_24hr: true,
      dateFormat: "d/m/Y H:i",
      defaultDate: this.value,
      onChange: this.onChange,
      onOpen: this.updateCalendarPosition,  // Aggiungiamo la callback per il posizionamento
    });
    this.updateDarkMode(this.isDarkMode);
  },
  methods: {
    onChange(selectedDates) {
      this.$emit("input", selectedDates[0]);
    },
    formatDate(date) {
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      const hours = ("0" + date.getHours()).slice(-2);
      const minutes = ("0" + date.getMinutes()).slice(-2);
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },
    onInput(event) {
      // Gestione opzionale: Flatpickr si occupa degli aggiornamenti
    },
    updateDarkMode(isDark) {
      if (isDark) {
        document.body.classList.add("dark");
        document.body.classList.remove("light");
      } else {
        document.body.classList.add("light");
        document.body.classList.remove("dark");
      }
      if (this.fp && this.fp.calendarContainer) {
        if (isDark) {
          this.fp.calendarContainer.classList.add("flatpickr-dark");
        } else {
          this.fp.calendarContainer.classList.remove("flatpickr-dark");
        }
      }
    },
    updateCalendarPosition(selectedDates, dateStr, instance) {
      // Calcola la posizione dell'input relativamente al viewport
      const inputRect = instance.input.getBoundingClientRect();
      const calendar = instance.calendarContainer;
      // Assicurati che il calendario sia visibile
      calendar.style.position = "fixed";
      // Calcola l'altezza del calendario (potrebbe non essere immediata, quindi si può usare un valore approssimato oppure ricalcolarlo al successivo repaint)
      const calHeight = calendar.offsetHeight || 300; // 300px come fallback
      // Imposta il calendario sopra l'input con un margine di 10px
      calendar.style.top = `${inputRect.top - calHeight - 10}px`;
      calendar.style.left = `${inputRect.left}px`;
      // Se il contenitore ha una larghezza fissa o vuoi forzarla, puoi impostarla:
      // calendar.style.width = `${inputRect.width}px`;
    }
  },
  watch: {
    value(newVal) {
      if (this.fp && newVal !== null) {
        this.fp.setDate(newVal, false);
      }
    },
    isDarkMode(newVal) {
      this.updateDarkMode(newVal);
    }
  },
  beforeUnmount() {
    if (this.fp) {
      this.fp.destroy();
    }
  }
};
</script>

<style scoped>
.custom-datepicker input {
  border: 1px solid #444;
  padding: 8px 10px;
  font-size: 14px;
  border-radius: 4px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  background-color: #222;
  color: #eee;
}

.custom-datepicker input:focus {
  border-color: #10b981;
  box-shadow: 0px 4px 6px rgba(16, 185, 129, 0.37);
}

/* Personalizza ulteriormente il calendario in modalità dark */
.flatpickr-calendar.flatpickr-dark {
  background: #333;
  color: #eee;
  border-color: #444;
}
</style>
