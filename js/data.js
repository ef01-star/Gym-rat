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
    '1-2 serie di avvicinamento sul primo esercizio, carico leggero'
  ];

  var WORKOUTS = [
    {
      id: 'A',
      name: 'Sessione A',
      focus: 'Spinta orizzontale & quadricipiti',
      exercises: [
        {
          id: 'goblet-squat',
          name: 'Goblet squat con manubrio',
          group: 'gambe',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 120,
          shoulder: 'safe',
          alt: 'Leg press',
          note: 'Scendi finché riesci a tenere la schiena neutra. Il manubrio appoggiato al petto, non sospeso sulle braccia.'
        },
        {
          id: 'panca-manubri',
          name: 'Panca piana con manubri',
          group: 'petto',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alt: 'Chest press a macchina',
          note: 'Gomiti a circa 45° dal busto, mai a 90°. Non scendere sotto il piano della panca: fermati quando il braccio è parallelo al pavimento.'
        },
        {
          id: 'lat-neutra',
          name: 'Lat machine presa neutra',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'safe',
          alt: 'Trazioni assistite presa neutra',
          note: 'Presa stretta neutra: è la più tollerata dalla spalla. Tira verso lo sterno, mai dietro la nuca.'
        },
        {
          id: 'affondi',
          name: 'Affondi in camminata con manubri',
          group: 'gambe',
          equipment: 'manubri',
          sets: 2, reps: '10 per gamba', restSec: 120,
          shoulder: 'safe',
          alt: 'Split squat bulgaro',
          note: 'Manubri lungo i fianchi, braccia passive. Se lo spazio manca, affondi sul posto.'
        },
        {
          id: 'rematore-manubrio',
          name: 'Rematore con manubrio singolo',
          group: 'schiena',
          equipment: 'manubri',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'safe',
          alt: 'Pulley basso presa neutra',
          note: 'Appoggio su panca. Registra il carico del singolo manubrio.'
        },
        {
          id: 'alzate-laterali',
          name: 'Alzate laterali con manubri',
          group: 'spalle',
          equipment: 'manubri',
          sets: 3, reps: '12-15', restSec: 90,
          shoulder: 'caution',
          alt: 'Alzate laterali ai cavi',
          note: "Fermati intorno agli 80-90°, non oltre la linea delle spalle. Se il destro protesta, tieni un carico più basso a destra: non forzare la simmetria."
        },
        {
          id: 'extrarotazioni',
          name: 'Extrarotazioni ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 3, reps: '15', restSec: 60,
          shoulder: 'rehab',
          alt: 'Extrarotazioni con elastico',
          note: 'Gomito bloccato al fianco, movimento lento. Carico volutamente basso: qui si cerca controllo, non forza.'
        },
        {
          id: 'plank',
          name: 'Plank',
          group: 'core',
          equipment: 'corpo libero',
          sets: 3, reps: '45 secondi', restSec: 60,
          shoulder: 'safe',
          alt: 'Dead bug',
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
          alt: 'Stacco rumeno con bilanciere',
          note: 'Manubri vicini alle gambe, ginocchia morbide. Scendi finché senti i femorali, non più in basso.'
        },
        {
          id: 'pulley-neutro',
          name: 'Pulley basso presa neutra',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'safe',
          alt: 'Rematore con appoggio al petto',
          note: 'Busto fermo, tira con le scapole prima che con le braccia.'
        },
        {
          id: 'chest-press-cavi',
          name: 'Chest press ai cavi o a macchina',
          group: 'petto',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'caution',
          alt: 'Panca piana con manubri',
          note: "Traiettoria guidata: è la spinta più sicura per la spalla. Regola il sedile in modo che le mani partano all'altezza dello sterno."
        },
        {
          id: 'leg-curl',
          name: 'Leg curl',
          group: 'gambe',
          equipment: 'macchine',
          sets: 3, reps: '12', restSec: 90,
          shoulder: 'safe',
          alt: 'Nordic curl assistito',
          note: 'Fase negativa lenta, 3 secondi.'
        },
        {
          id: 'lat-supina',
          name: 'Lat machine presa supina',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '8-10', restSec: 120,
          shoulder: 'safe',
          alt: 'Trazioni assistite presa supina',
          note: "Presa alla larghezza delle spalle, tira verso la parte alta dell'addome."
        },
        {
          id: 'face-pull',
          name: 'Face pull ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 3, reps: '15', restSec: 60,
          shoulder: 'rehab',
          alt: 'Face pull con elastico',
          note: "Cavo all'altezza degli occhi, gomiti alti, chiudi in extrarotazione. Uno dei movimenti migliori per una spalla operata."
        },
        {
          id: 'curl-manubri',
          name: 'Curl con manubri',
          group: 'braccia',
          equipment: 'manubri',
          sets: 3, reps: '10-12', restSec: 90,
          shoulder: 'safe',
          alt: 'Curl ai cavi',
          note: 'Registra il carico del singolo manubrio.'
        },
        {
          id: 'calf',
          name: 'Calf raise',
          group: 'gambe',
          equipment: 'macchine',
          sets: 3, reps: '15', restSec: 60,
          shoulder: 'safe',
          alt: 'Calf raise in piedi con manubrio',
          note: 'Pausa di 1 secondo in alto e in basso.'
        },
        {
          id: 'pallof',
          name: 'Pallof press',
          group: 'core',
          equipment: 'cavi',
          sets: 3, reps: '12 per lato', restSec: 60,
          shoulder: 'safe',
          alt: 'Plank laterale',
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
          alt: 'Hack squat',
          note: 'Tenere il bilanciere in appoggio richiede extrarotazione. Se la spalla destra tira, allarga la presa, prova un appoggio più basso, oppure passa direttamente a hack squat o leg press.'
        },
        {
          id: 'panca-inclinata-manubri',
          name: 'Panca inclinata 30° con manubri',
          group: 'petto',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alt: 'Chest press inclinata a macchina',
          note: 'Inclinazione bassa: 30° bastano. Più si alza lo schienale, più lavoro finisce sulla spalla.'
        },
        {
          id: 'rematore-appoggio',
          name: 'Rematore con appoggio al petto',
          group: 'schiena',
          equipment: 'macchine',
          sets: 3, reps: '8-10', restSec: 120,
          shoulder: 'safe',
          alt: 'Rematore con manubrio singolo',
          note: "L'appoggio toglie il lavoro alla zona lombare e stabilizza la spalla."
        },
        {
          id: 'lento-manubri-neutro',
          name: 'Lento avanti con manubri, presa neutra',
          group: 'spalle',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alt: 'Panca inclinata 45° con manubri',
          note: "Seduto con schienale, presa a martello (palmi che si guardano): riduce il conflitto subacromiale. Non scendere sotto l'altezza del mento. Se compare dolore, sostituisci con panca inclinata a 45-60°."
        },
        {
          id: 'hip-thrust',
          name: 'Hip thrust',
          group: 'gambe',
          equipment: 'bilanciere',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'safe',
          alt: 'Glute bridge con manubrio',
          note: 'Pausa di 1 secondo in chiusura, mento verso il petto.'
        },
        {
          id: 'pushdown',
          name: 'Pushdown ai cavi',
          group: 'braccia',
          equipment: 'cavi',
          sets: 3, reps: '12', restSec: 90,
          shoulder: 'safe',
          alt: 'French press con manubri',
          note: 'Gomiti fermi al fianco.'
        },
        {
          id: 'curl-martello',
          name: 'Curl a martello',
          group: 'braccia',
          equipment: 'manubri',
          sets: 3, reps: '12', restSec: 90,
          shoulder: 'safe',
          alt: 'Curl a martello ai cavi con corda',
          note: 'Registra il carico del singolo manubrio.'
        },
        {
          id: 'alzate-cavo',
          name: 'Alzate laterali ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 2, reps: '15', restSec: 60,
          shoulder: 'caution',
          alt: 'Alzate laterali con manubri',
          note: 'Il cavo tiene la tensione costante e permette carichi molto bassi: più gentile del manubrio sul destro.'
        },
        {
          id: 'hollow',
          name: 'Hollow hold',
          group: 'core',
          equipment: 'corpo libero',
          sets: 3, reps: '30 secondi', restSec: 60,
          shoulder: 'safe',
          alt: 'Dead bug',
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

  global.GymData = {
    warmup: WARMUP,
    workouts: WORKOUTS,
    groups: GROUPS,
    progression: PROGRESSION,
    getWorkout: function (id) {
      for (var i = 0; i < WORKOUTS.length; i++) {
        if (WORKOUTS[i].id === id) return WORKOUTS[i];
      }
      return null;
    },
    getExercise: function (id) {
      for (var i = 0; i < WORKOUTS.length; i++) {
        var ex = WORKOUTS[i].exercises;
        for (var j = 0; j < ex.length; j++) {
          if (ex[j].id === id) return ex[j];
        }
      }
      return null;
    },
    allExercises: function () {
      var out = [];
      var seen = {};
      for (var i = 0; i < WORKOUTS.length; i++) {
        for (var j = 0; j < WORKOUTS[i].exercises.length; j++) {
          var e = WORKOUTS[i].exercises[j];
          if (!seen[e.id]) { seen[e.id] = true; out.push(e); }
        }
      }
      return out;
    }
  };
})(window);
