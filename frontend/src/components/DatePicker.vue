<template>
  <div class="custom-datepicker">
    <input ref="dateInput" type="text" :value="formattedDate" placeholder="gg/mm/yyyy hh:mm" @input="onInput" />
  </div>
</template>

<script>
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/dark.css";

export default {
  name: "CustomDatePicker",
  props: {
    modelValue: {
      type: Date,
      default: null
    },
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      fp: null // Istanza di Flatpickr
    };
  },
  computed: {
    formattedDate() {
      console.log("value in date picker : ", this.modelValue);
      if (!this.modelValue) return "";
      return this.formatDate(this.modelValue);
    }
  },
  mounted() {
    // Inizializza Flatpickr sull'input referenziato
    this.fp = flatpickr(this.$refs.dateInput, {
      enableTime: true,
      time_24hr: true,
      dateFormat: "d/m/Y H:i",
      defaultDate: this.modelValue,
      onChange: this.onChange,
      onOpen: this.updateCalendarPosition,  // Aggiungiamo la callback per il posizionamento
    });
    this.updateDarkMode(this.isDarkMode);
  },
  methods: {
    onChange(selectedDates) {
      this.$emit("update:modelValue", selectedDates[0]);
    },
    formatDate(date) {
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const yyyy = date.getFullYear()
      const hh = String(date.getHours()).padStart(2, '0')
      const min = String(date.getMinutes()).padStart(2, '0')
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`
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
    modelValue(newVal) {
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
  background-color: #ffffff00;
  color: var(--color);
}

.custom-datepicker input:focus {
  border-color: #10b981;
  box-shadow: 0px 4px 6px rgba(16, 185, 129, 0.37);
}

/* Personalizza ulteriormente il calendario in modalità dark */
.flatpickr-calendar.flatpickr-dark {
  background: #333;
  color: var(--color);
  border-color: #444;
}
</style>
