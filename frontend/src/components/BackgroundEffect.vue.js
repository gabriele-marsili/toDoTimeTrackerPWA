export default (await import('vue')).defineComponent({
    name: 'BackgroundEffect',
    data() {
        return {
            particles: [],
            maxParticles: 42, // Numero massimo di particelle
            maxConnectionDistance: 150, // Distanza massima per connettere le particelle
            connectionDuration: 300, // Tempo di durata della connessione tra particelle
            connectionDelay: 5, // Ritardo tra creazione delle connessioni (in millisecondi)
            lastConnectionTime: 100, // Tempo dell'ultima connessione
        };
    },
    methods: {
        generateParticles() {
            this.particles = [];
            for (let i = 0; i < this.maxParticles; i++) {
                const size = Math.random() * 4 + 2; // Particelle più piccole (tra 2 e 6px)
                const xPos = Math.random() * window.innerWidth; // Posizione X casuale
                const yPos = Math.random() * window.innerHeight; // Posizione Y casuale
                const opacity = Math.random() * 0.4 + 0.3; // Opacità ridotta
                const greenShade = Math.random() * 0.5 + 0.5; // Colore verde variabile
                const particleColor = `rgba(16, 185, 129, ${greenShade})`;
                // Aggiungi particella
                this.particles.push({
                    x: xPos,
                    y: yPos,
                    size: size,
                    color: particleColor,
                    opacity: opacity,
                    direction: Math.random() * 360, // Direzione di movimento (in gradi)
                    speed: Math.random() * 1.2, // Velocità di movimento (tra 0.3 e 1.5)
                    connections: [], // Connessioni per ogni particella
                });
            }
        },
        drawConnections() {
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            canvas.width = window.innerWidth; // Imposta larghezza
            canvas.height = window.innerHeight; // Imposta altezza
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Pulisce il canvas
            // Disegno delle connessioni tra particelle (con ritardo)
            const currentTime = Date.now();
            if (currentTime - this.lastConnectionTime > this.connectionDelay) {
                for (let i = 0; i < this.particles.length; i++) {
                    for (let j = i + 1; j < this.particles.length; j++) {
                        const dx = this.particles[i].x - this.particles[j].x;
                        const dy = this.particles[i].y - this.particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < this.maxConnectionDistance) {
                            // Se le particelle sono abbastanza vicine, connettile
                            if (!this.particles[i].connections.includes(j)) {
                                this.particles[i].connections.push(j);
                                this.particles[j].connections.push(i);
                            }
                            ctx.beginPath();
                            ctx.moveTo(this.particles[i].x, this.particles[i].y);
                            ctx.lineTo(this.particles[j].x, this.particles[j].y);
                            ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
                            ctx.lineWidth = 1.5;
                            ctx.stroke();
                        }
                    }
                }
                // Aggiorna il tempo dell'ultima connessione
                this.lastConnectionTime = currentTime;
            }
            // Disegno delle particelle
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        },
        moveParticles() {
            // Spostamento delle particelle
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.x += Math.cos((p.direction * Math.PI) / 180) * p.speed;
                p.y += Math.sin((p.direction * Math.PI) / 180) * p.speed;
                // Rendi ciclico il movimento delle particelle
                if (p.x < 0)
                    p.x = window.innerWidth;
                if (p.x > window.innerWidth)
                    p.x = 0;
                if (p.y < 0)
                    p.y = window.innerHeight;
                if (p.y > window.innerHeight)
                    p.y = 0;
            }
        },
    },
    mounted() {
        this.generateParticles();
        // Aggiorna le connessioni, spostamento e disegno delle particelle
        const updateParticles = () => {
            this.moveParticles();
            this.drawConnections();
            requestAnimationFrame(updateParticles);
        };
        updateParticles(); // Avvia l'animazione
        // Gestione delle dimensioni dinamiche per il canvas
        window.addEventListener('resize', () => {
            this.$refs.canvas.width = window.innerWidth;
            this.$refs.canvas.height = window.innerHeight;
        });
    },
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("relative w-full h-full overflow-hidden") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
        ref: ("canvas"),
        ...{ class: ("absolute inset-0 pointer-events-none") },
    });
    // @ts-ignore navigation for `const canvas = ref()`
    /** @type { typeof __VLS_ctx.canvas } */ ;
    var __VLS_0 = {};
    ['relative', 'w-full', 'h-full', 'overflow-hidden', 'absolute', 'inset-0', 'pointer-events-none',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'canvas': __VLS_nativeElements['canvas'],
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
let __VLS_self;
