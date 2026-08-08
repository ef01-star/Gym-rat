/* Gym-rat — Programma di allenamento
 *
 * Full body A/B/C, 3 sedute a settimana, 60-90 minuti.
 * Selezione esercizi orientata alla spalla destra operata (cuffia dei rotatori
 * + sottospinato): priorità a manubri e cavi, presa neutra sulle spinte
 * verticali, nessuna trazione dietro la nuca, lavoro di cuffia in ogni
 * riscaldamento.
 *
 * shoulder: 'safe'    -> nessuna attenzione particolare
 *           'caution' -> tenere d'occhio la spalla destra, vedi note
 *           'rehab'   -> esercizio specifico per la cuffia, carico basso
 */
(function (global) {
  'use strict';

  var WARMUP = [
    'Cardio facile 5 minuti (bike, vogatore o tapis roulant)',
    'Mobilità toracica: cat-camel 8 + rotazioni toraciche 8 per lato',
    'Band pull-apart 2 × 15',
    'Extrarotazioni con elastico 2 × 15 per lato (spalla destra senza fretta)',
    '1-2 serie di avvicinamento sul primo esercizio con carico, carico leggero'
  ];

  var COOLDOWN = [
    'Tapis roulant: 10-15 minuti di camminata a ritmo tranquillo',
    'Allungamento leggero di pettorali e dorsali, senza forzare la spalla destra'
  ];

  var WORKOUTS = [
    {
      id: 'A',
      name: 'Sessione A',
      focus: 'Spinta orizzontale & quadricipiti',
      exercises: [
        {
          id: 'extrarotazioni',
          name: 'Extrarotazioni ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 2, reps: '15 per lato', restSec: 45,
          shoulder: 'rehab',
          alt: { id: 'extrarotazioni-elastico', name: 'Extrarotazioni con elastico', equipment: 'corpo libero', shoulder: 'rehab' },
          note: 'Apre la seduta: serve ad attivare la cuffia prima di caricare, non è un esercizio di forza. Gomito bloccato al fianco, movimento lento, carico basso (intorno ai 5 kg per lato).'
        },
        {
          id: 'goblet-squat',
          name: 'Goblet squat con manubrio',
          group: 'gambe',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 120,
          shoulder: 'safe',
          alt: { id: 'leg-press', name: 'Leg press', equipment: 'macchine' },
          note: 'Scendi finché riesci a tenere la schiena neutra. Il manubrio appoggiato al petto, non sospeso sulle braccia.'
        },
        {
          id: 'panca-manubri',
          name: 'Panca piana con manubri',
          group: 'petto',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alt: { id: 'chest-press-macchina', name: 'Chest press a macchina', equipment: 'macchine' },
          note: 'Gomiti a circa 45° dal busto, mai a 90°. Non scendere sotto il piano della panca: fermati quando il braccio è parallelo al pavimento.'
        },
        {
          id: 'affondi',
          name: 'Affondi in camminata con manubri',
          group: 'gambe',
          equipment: 'manubri',
          sets: 2, reps: '10 per gamba', restSec: 120,
          shoulder: 'safe',
          alt: { id: 'split-squat-bulgaro', name: 'Split squat bulgaro', equipment: 'manubri' },
          note: 'Manubri lungo i fianchi, braccia passive. Se lo spazio manca, affondi sul posto.'
        },
        {
          id: 'lat-neutra',
          name: 'Lat machine presa neutra',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'caution',
          alt: { id: 'trazioni-assistite-neutra', name: 'Trazioni assistite presa neutra', equipment: 'macchine' },
          note: 'Presa stretta neutra: è la più tollerata dalla spalla. Tira verso lo sterno, mai dietro la nuca. Tieni il carico conservativo: se in fondo alla trazione senti la spalla invece del dorsale, sei troppo pesante. Meglio 10-12 ripetizioni pulite che un carico che ti fa strappare.'
        },
        {
          id: 'rematore-manubrio',
          name: 'Rematore con manubrio singolo',
          group: 'schiena',
          equipment: 'manubri',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'safe',
          alt: { id: 'pulley-neutro', name: 'Pulley basso presa neutra' },
          note: 'Appoggio su panca. Registra il carico del singolo manubrio.'
        },
        {
          id: 'alzate-laterali',
          name: 'Alzate laterali con manubri',
          group: 'spalle',
          equipment: 'manubri',
          sets: 3, reps: '12-15', restSec: 90,
          shoulder: 'caution',
          alt: { id: 'alzate-cavo', name: 'Alzate laterali ai cavi' },
          note: "Fermati intorno agli 80-90°, non oltre la linea delle spalle. Se il destro protesta, tieni un carico più basso a destra: non forzare la simmetria."
        },
        {
          id: 'plank',
          name: 'Plank',
          group: 'core',
          equipment: 'corpo libero',
          sets: 3, reps: '45 secondi', restSec: 60,
          shoulder: 'safe',
          alt: { id: 'dead-bug', name: 'Dead bug', equipment: 'corpo libero' },
          note: 'Registra i secondi nel campo ripetizioni e lascia il carico a 0.'
        }
      ]
    },
    {
      id: 'B',
      name: 'Sessione B',
      focus: 'Catena posteriore & tirata',
      exercises: [
        {
          id: 'stacco-rumeno',
          name: 'Stacco rumeno con manubri',
          group: 'gambe',
          equipment: 'manubri',
          sets: 3, reps: '8-10', restSec: 150,
          shoulder: 'safe',
          alt: { id: 'stacco-rumeno-bilanciere', name: 'Stacco rumeno con bilanciere', equipment: 'bilanciere' },
          note: 'Manubri vicini alle gambe, ginocchia morbide. Scendi finché senti i femorali, non più in basso.'
        },
        {
          id: 'pulley-neutro',
          name: 'Pulley basso presa neutra',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'safe',
          alt: { id: 'rematore-appoggio', name: 'Rematore con appoggio al petto' },
          note: 'Busto fermo, tira con le scapole prima che con le braccia.'
        },
        {
          id: 'chest-press-cavi',
          name: 'Chest press ai cavi o a macchina',
          group: 'petto',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'caution',
          alt: { id: 'panca-manubri', name: 'Panca piana con manubri' },
          note: "Traiettoria guidata: è la spinta più sicura per la spalla. Regola il sedile in modo che le mani partano all'altezza dello sterno."
        },
        {
          id: 'leg-curl',
          name: 'Leg curl',
          group: 'gambe',
          equipment: 'macchine',
          sets: 3, reps: '12', restSec: 90,
          shoulder: 'safe',
          alt: { id: 'nordic-curl', name: 'Nordic curl assistito', equipment: 'corpo libero' },
          note: 'Fase negativa lenta, 3 secondi.'
        },
        {
          id: 'lat-supina',
          name: 'Lat machine presa supina',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '8-10', restSec: 120,
          shoulder: 'safe',
          alt: { id: 'trazioni-assistite-supina', name: 'Trazioni assistite presa supina', equipment: 'macchine' },
          note: "Presa alla larghezza delle spalle, tira verso la parte alta dell'addome."
        },
        {
          id: 'face-pull',
          name: 'Face pull ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 3, reps: '15', restSec: 60,
          shoulder: 'rehab',
          alt: { id: 'face-pull-elastico', name: 'Face pull con elastico', equipment: 'corpo libero', shoulder: 'rehab' },
          note: "Cavo all'altezza degli occhi, gomiti alti, chiudi in extrarotazione. Uno dei movimenti migliori per una spalla operata."
        },
        {
          id: 'curl-manubri',
          name: 'Curl con manubri',
          group: 'braccia',
          equipment: 'manubri',
          sets: 3, reps: '10-12', restSec: 90,
          shoulder: 'safe',
          alt: { id: 'curl-cavi', name: 'Curl ai cavi', equipment: 'cavi' },
          note: 'Registra il carico del singolo manubrio.'
        },
        {
          id: 'calf',
          name: 'Calf raise',
          group: 'gambe',
          equipment: 'macchine',
          sets: 3, reps: '15', restSec: 60,
          shoulder: 'safe',
          alt: { id: 'calf-manubrio', name: 'Calf raise in piedi con manubrio', equipment: 'manubri' },
          note: 'Pausa di 1 secondo in alto e in basso.'
        },
        {
          id: 'pallof',
          name: 'Pallof press',
          group: 'core',
          equipment: 'cavi',
          sets: 3, reps: '12 per lato', restSec: 60,
          shoulder: 'safe',
          alt: { id: 'plank-laterale', name: 'Plank laterale', equipment: 'corpo libero' },
          note: 'Antirotazione: il busto non deve girare.'
        }
      ]
    },
    {
      id: 'C',
      name: 'Sessione C',
      focus: 'Gambe bilaterale & spinta verticale',
      exercises: [
        {
          id: 'squat',
          name: 'Squat con bilanciere',
          group: 'gambe',
          equipment: 'bilanciere',
          sets: 3, reps: '6-10', restSec: 180,
          shoulder: 'caution',
          alt: { id: 'hack-squat', name: 'Hack squat', equipment: 'macchine' },
          note: 'Tenere il bilanciere in appoggio richiede extrarotazione. Se la spalla destra tira, allarga la presa, prova un appoggio più basso, oppure passa direttamente a hack squat o leg press.'
        },
        {
          id: 'panca-inclinata-manubri',
          name: 'Panca inclinata 30° con manubri',
          group: 'petto',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alt: { id: 'chest-press-inclinata', name: 'Chest press inclinata a macchina', equipment: 'macchine' },
          note: 'Inclinazione bassa: 30° bastano. Più si alza lo schienale, più lavoro finisce sulla spalla.'
        },
        {
          id: 'rematore-appoggio',
          name: 'Rematore con appoggio al petto',
          group: 'schiena',
          equipment: 'macchine',
          sets: 3, reps: '8-10', restSec: 120,
          shoulder: 'safe',
          alt: { id: 'rematore-manubrio', name: 'Rematore con manubrio singolo' },
          note: "L'appoggio toglie il lavoro alla zona lombare e stabilizza la spalla."
        },
        {
          id: 'lento-manubri-neutro',
          name: 'Lento avanti con manubri, presa neutra',
          group: 'spalle',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alt: { id: 'panca-inclinata-45', name: 'Panca inclinata 45° con manubri', equipment: 'manubri', shoulder: 'caution' },
          note: "Seduto con schienale, presa a martello (palmi che si guardano): riduce il conflitto subacromiale. Non scendere sotto l'altezza del mento. Se compare dolore, sostituisci con panca inclinata a 45-60°."
        },
        {
          id: 'hip-thrust',
          name: 'Hip thrust',
          group: 'gambe',
          equipment: 'bilanciere',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'safe',
          alt: { id: 'glute-bridge', name: 'Glute bridge con manubrio', equipment: 'manubri' },
          note: 'Pausa di 1 secondo in chiusura, mento verso il petto.'
        },
        {
          id: 'pushdown',
          name: 'Pushdown ai cavi',
          group: 'braccia',
          equipment: 'cavi',
          sets: 3, reps: '12', restSec: 90,
          shoulder: 'safe',
          alt: { id: 'french-press', name: 'French press con manubri', equipment: 'manubri' },
          note: 'Gomiti fermi al fianco.'
        },
        {
          id: 'curl-martello',
          name: 'Curl a martello',
          group: 'braccia',
          equipment: 'manubri',
          sets: 3, reps: '12', restSec: 90,
          shoulder: 'safe',
          alt: { id: 'curl-martello-cavi', name: 'Curl a martello ai cavi con corda', equipment: 'cavi' },
          note: 'Registra il carico del singolo manubrio.'
        },
        {
          id: 'alzate-cavo',
          name: 'Alzate laterali ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 2, reps: '15', restSec: 60,
          shoulder: 'caution',
          alt: { id: 'alzate-laterali', name: 'Alzate laterali con manubri' },
          note: 'Il cavo tiene la tensione costante e permette carichi molto bassi: più gentile del manubrio sul destro.'
        },
        {
          id: 'hollow',
          name: 'Hollow hold',
          group: 'core',
          equipment: 'corpo libero',
          sets: 3, reps: '30 secondi', restSec: 60,
          shoulder: 'safe',
          alt: { id: 'dead-bug', name: 'Dead bug', equipment: 'corpo libero' },
          note: 'Registra i secondi nel campo ripetizioni e lascia il carico a 0.'
        }
      ]
    }
  ];

  var GROUPS = ['gambe', 'petto', 'schiena', 'spalle', 'braccia', 'core'];

  var PROGRESSION = [
    'Doppia progressione: resta sullo stesso carico finché non chiudi tutte le serie al limite alto del range di ripetizioni.',
    'Quando ci riesci, aumenta del 2,5-5% (il salto più piccolo disponibile) e riparti dal limite basso del range.',
    'Chiudi ogni serie con 1-2 ripetizioni ancora in canna. In fase di ripresa non serve arrivare a cedimento.',
    'Prime due settimane: 2 serie invece di 3 e carichi volutamente conservativi, servono a ritrovare i movimenti.',
    "Sugli esercizi marcati «occhio alla spalla», se il fastidio supera 3 su 10 fermati e passa all'alternativa indicata."
  ];

  /* Indice di tutti i movimenti registrabili.
   *
   * Un'alternativa è un esercizio a tutti gli effetti, con un id proprio: fare
   * leg press al posto del goblet squat deve produrre uno storico separato, non
   * carichi da leg press attribuiti al goblet squat.
   *
   * Quando l'id di un'alternativa coincide con un esercizio già presente nella
   * scheda (il pulley è alternativa del rematore in A ed esercizio principale
   * in B) vince la definizione principale: è lo stesso movimento, quindi è
   * giusto che le due storie confluiscano. */
  var INDEX = {};

  WORKOUTS.forEach(function (w) {
    w.exercises.forEach(function (ex) { INDEX[ex.id] = ex; });
  });

  WORKOUTS.forEach(function (w) {
    w.exercises.forEach(function (ex) {
      var alt = ex.alt;
      if (INDEX[alt.id]) return;
      INDEX[alt.id] = {
        id: alt.id,
        name: alt.name,
        group: ex.group,
        equipment: alt.equipment || ex.equipment,
        sets: ex.sets,
        reps: ex.reps,
        restSec: ex.restSec,
        shoulder: alt.shoulder || 'safe',
        note: alt.note || ex.note,
        isAlt: true,
        parentId: ex.id
      };
    });
  });

  global.GymData = {
    warmup: WARMUP,
    cooldown: COOLDOWN,
    workouts: WORKOUTS,
    groups: GROUPS,
    progression: PROGRESSION,
    getWorkout: function (id) {
      for (var i = 0; i < WORKOUTS.length; i++) {
        if (WORKOUTS[i].id === id) return WORKOUTS[i];
      }
      return null;
    },
    // Risolve sia gli esercizi della scheda sia le alternative.
    getExercise: function (id) {
      return INDEX[id] || null;
    },
    // I due movimenti che si alternano nello stesso slot della scheda.
    variantsOf: function (primaryId) {
      var ex = INDEX[primaryId];
      if (!ex || !ex.alt) return [primaryId];
      return [primaryId, ex.alt.id];
    },
    // Dato l'id in uso, l'altro dei due.
    otherVariant: function (primaryId, currentId) {
      var v = this.variantsOf(primaryId);
      return currentId === v[0] ? (v[1] || v[0]) : v[0];
    },
    allExercises: function () {
      return Object.keys(INDEX).map(function (id) { return INDEX[id]; });
    }
  };
})(window);
