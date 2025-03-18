import { registerSW } from 'virtual:pwa-register'

export function registerServiceWorker() {
    const updateSW = registerSW({
        onNeedRefresh() {
            // Mostra un messaggio quando è disponibile un aggiornamento
            if (confirm('Nuova versione disponibile. Vuoi aggiornare?')) {
                updateSW()
            }
        },
        onOfflineReady() {
            // Notifica l'utente che l'app è pronta per l'uso offline
            console.log('App pronta per l\'utilizzo offline')
        }
    })
}