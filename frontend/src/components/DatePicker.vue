<template>
    <div class="custom-datepicker">
      <!-- L'input gestito da Flatpickr -->
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
  // Importa Flatpickr e il relativo CSS
  import flatpickr from "flatpickr";
  import "flatpickr/dist/flatpickr.css";
  
  export default {
    name: "CustomDatePicker",
    props: {
      // il prop "value" tiene in input la data corrente (tipo Date), oppure può essere null
      value: {
        type: Date,
        default: null
      }
    },
    data() {
      return {
        fp: null // istanza di Flatpickr
      };
    },
    computed: {
      // Computed property per formattare la data nel formato "gg/mm/yyyy hh:mm"
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
        dateFormat: "d/m/Y H:i", // Imposta il formato desiderato
        defaultDate: this.value,
        onChange: this.onChange
      });
    },
    methods: {
      /**
       * Callback chiamato da Flatpickr quando la data viene cambiata.
       * Emette l'evento input con il nuovo valore (oggetto Date).
       */
      onChange(selectedDates) {
        this.$emit("input", selectedDates[0]);
      },
      /**
       * Funzione per formattare un oggetto Date in formato "gg/mm/yyyy hh:mm".
       */
      formatDate(date) {
        const day = ("0" + date.getDate()).slice(-2);
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      },
      // Facoltativo: gestisce l'input manuale se necessario
      onInput(event) {
        // In questo esempio, Flatpickr gestisce la modifica,
        // per cui non è obbligatorio intervenire manualmente.
      }
    },
    watch: {
      /**
       * Se il valore passato dal parent cambia, aggiorna il selettore.
       */
      value(newVal) {
        if (this.fp && newVal !== null) {
          this.fp.setDate(newVal, false);
        }
      }
    },
    beforeDestroy() {
      // Distruggi l'istanza per pulire le risorse
      if (this.fp) {
        this.fp.destroy();
      }
    }
  };
  </script>
  
  <style scoped>
  .custom-datepicker input {
    /* Esempio di stile customizzato */
    border: 1px solid #ccc;
    padding: 8px 10px;
    font-size: 14px;
    border-radius: 4px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }
  
  .custom-datepicker input:focus {
    border-color: #66afe9;
    box-shadow: 0 0 8px rgba(102, 175, 233, 0.6);
  }
  </style>
  