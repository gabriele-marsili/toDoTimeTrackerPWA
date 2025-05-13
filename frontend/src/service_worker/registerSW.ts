import { registerSW } from 'virtual:pwa-register'

export function registerServiceWorker() {
    const updateSW = registerSW({
        onNeedRefresh() {
            if (confirm('Nuova versione disponibile. Vuoi aggiornare?')) {
                updateSW()
            }
        },
        onOfflineReady() {
            console.log('App pronta per l\'utilizzo offline')
        }
    })
}