/* Gym-rat — Programma di allenamento
 *
 * Full body A/B/C, 3 sedute a settimana, circa un'ora l'una.
 * Selezione esercizi orientata alla spalla destra operata (cuffia dei rotatori
 * + sottospinato): priorità a manubri e cavi, presa neutra sulle spinte
 * verticali, nessuna trazione dietro la nuca, lavoro di cuffia in apertura.
 *
 * shoulder: 'safe'    -> nessuna attenzione particolare
 *           'caution' -> tenere d'occhio la spalla destra, vedi note
 *           'rehab'   -> lavoro specifico per la cuffia, carico basso
 *
 * alts: gli altri attrezzi con cui si può svolgere lo stesso slot. Ognuno ha
 * un id proprio e quindi uno storico separato: la shoulder press a macchina e
 * il lento con manubri non sono lo stesso esercizio e i loro carichi non si
 * confrontano. Dove l'id coincide con un esercizio già in scheda le due storie
 * confluiscono, perché è davvero lo stesso movimento.
 */
(function (global) {
  'use strict';

  var WARMUP = [
    'Cardio facile 5 minuti (bike, vogatore o tapis roulant)',
    'Mobilità toracica: cat-camel 8 + rotazioni toraciche 8 per lato',
    'Band pull-apart 2 × 15',
    'Serie di avvicinamento sul primo esercizio pesante: 2 in genere, 3-4 sullo squat'
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
          alts: [
            { id: 'extrarotazioni-elastico', name: 'Extrarotazioni con elastico', equipment: 'corpo libero', shoulder: 'rehab' }
          ],
          note: 'Apre la seduta: attiva la cuffia prima di caricare, non è un esercizio di forza. Gomito bloccato al fianco, movimento lento, carico basso.'
        },
        {
          id: 'intrarotazioni',
          name: 'Intrarotazioni ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 2, reps: '15 per lato', restSec: 45,
          shoulder: 'rehab',
          alts: [
            { id: 'intrarotazioni-elastico', name: 'Intrarotazioni con elastico', equipment: 'corpo libero', shoulder: 'rehab' }
          ],
          note: 'Cavo all\'altezza del fianco, gomito bloccato al fianco, porti l\'avambraccio verso l\'ombelico. È la rotazione interna: completa il lavoro delle extrarotazioni, non lo sostituisce. Anche qui carico basso e movimento controllato.'
        },
        {
          id: 'goblet-squat',
          name: 'Goblet squat con manubrio',
          group: 'gambe',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 120,
          shoulder: 'safe',
          alts: [
            { id: 'leg-press', name: 'Leg press', equipment: 'macchine' },
            { id: 'hack-squat', name: 'Hack squat', equipment: 'macchine' }
          ],
          note: 'Scendi finché riesci a tenere la schiena neutra. Il manubrio appoggiato al petto, non sospeso sulle braccia.'
        },
        {
          id: 'panca-manubri',
          name: 'Panca piana con manubri',
          group: 'petto',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alts: [
            { id: 'chest-press-macchina', name: 'Chest press a macchina', equipment: 'macchine' }
          ],
          note: 'Gomiti a circa 45° dal busto, mai a 90°. Non scendere sotto il piano della panca: fermati quando il braccio è parallelo al pavimento. Carico per singolo manubrio.'
        },
        {
          id: 'affondi',
          name: 'Affondi in camminata con manubri',
          group: 'gambe',
          equipment: 'manubri',
          sets: 2, reps: '10 per gamba', restSec: 105,
          shoulder: 'safe',
          alts: [
            { id: 'split-squat-bulgaro', name: 'Split squat bulgaro', equipment: 'manubri' }
          ],
          note: 'Manubri lungo i fianchi, braccia passive. Se lo spazio manca, affondi sul posto.'
        },
        {
          id: 'lat-neutra',
          name: 'Lat machine presa neutra',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'caution',
          alts: [
            { id: 'trazioni-assistite-neutra', name: 'Trazioni assistite presa neutra', equipment: 'macchine' }
          ],
          note: 'Presa stretta neutra: è la più tollerata dalla spalla. Tira verso lo sterno, mai dietro la nuca. Se la terza serie cala sempre, il carico di partenza è troppo alto: parti più basso e chiudile tutte e tre.'
        },
        {
          id: 'rematore-manubrio',
          name: 'Rematore con manubrio singolo',
          group: 'schiena',
          equipment: 'manubri',
          sets: 3, reps: '10-12', restSec: 105,
          shoulder: 'safe',
          alts: [
            { id: 'pulley-neutro', name: 'Pulley basso presa neutra' },
            { id: 'rematore-appoggio', name: 'Rematore a macchina con appoggio al petto' }
          ],
          note: 'Appoggio su panca. Carico del singolo manubrio.'
        },
        {
          id: 'alzate-laterali',
          name: 'Alzate laterali con manubri',
          group: 'spalle',
          equipment: 'manubri',
          sets: 3, reps: '12-15', restSec: 75,
          shoulder: 'caution',
          alts: [
            { id: 'alzate-cavo', name: 'Alzate laterali ai cavi' }
          ],
          note: 'Fermati intorno agli 80-90°, non oltre la linea delle spalle. Se il destro protesta, tieni un carico più basso a destra: non forzare la simmetria. Prima di aggiungere peso arriva a 15 ripetizioni su tutte le serie.'
        },
        {
          id: 'plank',
          name: 'Plank',
          group: 'core',
          equipment: 'corpo libero',
          sets: 2, reps: '45 secondi', restSec: 45,
          shoulder: 'safe',
          alts: [
            { id: 'dead-bug', name: 'Dead bug', equipment: 'corpo libero' },
            { id: 'plank-laterale', name: 'Plank laterale', equipment: 'corpo libero' }
          ],
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
          id: 'face-pull',
          name: 'Face pull ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 2, reps: '15', restSec: 45,
          shoulder: 'rehab',
          alts: [
            { id: 'face-pull-elastico', name: 'Face pull con elastico', equipment: 'corpo libero', shoulder: 'rehab' }
          ],
          note: 'In apertura, come le extrarotazioni in A: messo in fondo non lo facevi mai. Cavo all\'altezza degli occhi, gomiti alti, chiudi in extrarotazione. Due serie leggere, è lavoro di cuffia.'
        },
        {
          id: 'stacco-rumeno',
          name: 'Stacco rumeno con manubri',
          group: 'gambe',
          equipment: 'manubri',
          sets: 3, reps: '8-10', restSec: 150,
          shoulder: 'safe',
          alts: [
            { id: 'stacco-rumeno-bilanciere', name: 'Stacco rumeno con bilanciere', equipment: 'bilanciere' }
          ],
          note: 'Manubri vicini alle gambe, ginocchia morbide. Scendi finché senti i femorali, non più in basso.'
        },
        {
          id: 'pulley-neutro',
          name: 'Pulley basso presa neutra',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'safe',
          alts: [
            { id: 'rematore-appoggio', name: 'Rematore a macchina con appoggio al petto' },
            { id: 'rematore-tbar', name: 'Rematore a T-bar', equipment: 'bilanciere' },
            { id: 'rematore-manubrio', name: 'Rematore con manubrio singolo' }
          ],
          note: 'Busto fermo, tira con le scapole prima che con le braccia.'
        },
        {
          id: 'chest-press-cavi',
          name: 'Chest press ai cavi o a macchina',
          group: 'petto',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'caution',
          alts: [
            { id: 'panca-manubri', name: 'Panca piana con manubri' },
            { id: 'chest-press-macchina', name: 'Chest press a macchina' }
          ],
          note: 'Traiettoria guidata: è la spinta più sicura per la spalla. Regola il sedile in modo che le mani partano all\'altezza dello sterno. Chiudi con 1-2 ripetizioni in canna, non cercare il cedimento.'
        },
        {
          id: 'lat-supina',
          name: 'Lat machine presa supina',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '8-10', restSec: 120,
          shoulder: 'safe',
          alts: [
            { id: 'trazioni-assistite-supina', name: 'Trazioni assistite presa supina', equipment: 'macchine' },
            { id: 'lat-neutra', name: 'Lat machine presa neutra' }
          ],
          note: 'Presa alla larghezza delle spalle, tira verso la parte alta dell\'addome.'
        },
        {
          id: 'leg-curl',
          name: 'Leg curl',
          group: 'gambe',
          equipment: 'macchine',
          sets: 2, reps: '12', restSec: 75,
          shoulder: 'safe',
          alts: [
            { id: 'nordic-curl', name: 'Nordic curl assistito', equipment: 'corpo libero' }
          ],
          note: 'Due serie bastano: i femorali hanno già lavorato sullo stacco rumeno. Fase negativa lenta, 3 secondi.'
        },
        {
          id: 'curl-manubri',
          name: 'Curl con manubri',
          group: 'braccia',
          equipment: 'manubri',
          sets: 2, reps: '10-12', restSec: 60,
          shoulder: 'safe',
          alts: [
            { id: 'curl-cavi', name: 'Curl ai cavi', equipment: 'cavi' }
          ],
          note: 'Carico del singolo manubrio. Se vuoi guadagnare tempo, alternalo col calf senza recuperare in mezzo.'
        },
        {
          id: 'calf',
          name: 'Calf raise da seduto a macchina',
          group: 'gambe',
          equipment: 'macchine',
          sets: 2, reps: '15', restSec: 45,
          shoulder: 'safe',
          alts: [
            { id: 'calf-rack', name: 'Calf raise al rack con bilanciere', equipment: 'bilanciere', shoulder: 'caution' },
            { id: 'calf-manubrio', name: 'Calf raise in piedi con manubrio', equipment: 'manubri' }
          ],
          note: 'Da seduto, ginocchia piegate: lavora soprattutto il soleo. Pausa di 1 secondo in alto e in basso.'
        },
        {
          id: 'pallof',
          name: 'Pallof press',
          group: 'core',
          equipment: 'cavi',
          sets: 2, reps: '12 per lato', restSec: 45,
          shoulder: 'safe',
          alts: [
            { id: 'plank-laterale', name: 'Plank laterale', equipment: 'corpo libero' }
          ],
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
          alts: [
            { id: 'hack-squat', name: 'Hack squat', equipment: 'macchine' },
            { id: 'leg-press', name: 'Leg press', equipment: 'macchine' }
          ],
          note: 'Mettici 3-4 serie di avvicinamento a carico ridotto: sono riscaldamento, non vanno registrate. Tenere il bilanciere in appoggio richiede extrarotazione: se la spalla destra tira, allarga la presa o passa a hack squat.'
        },
        {
          id: 'panca-inclinata-manubri',
          name: 'Panca inclinata 30° con manubri',
          group: 'petto',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alts: [
            { id: 'chest-press-inclinata', name: 'Chest press inclinata a macchina', equipment: 'macchine' }
          ],
          note: 'Inclinazione bassa: 30° bastano, più si alza lo schienale più lavoro finisce sulla spalla. Carico per singolo manubrio.'
        },
        {
          id: 'rematore-appoggio',
          name: 'Rematore a macchina con appoggio al petto',
          group: 'schiena',
          equipment: 'macchine',
          sets: 3, reps: '8-10', restSec: 120,
          shoulder: 'safe',
          alts: [
            { id: 'rematore-tbar', name: 'Rematore a T-bar', equipment: 'bilanciere' },
            { id: 'rematore-manubrio', name: 'Rematore con manubrio singolo' }
          ],
          note: 'Quella a bracci indipendenti, con l\'appoggio al petto. L\'appoggio toglie il lavoro alla zona lombare e stabilizza la spalla.'
        },
        {
          id: 'lento-manubri-neutro',
          name: 'Lento avanti con manubri, presa neutra',
          group: 'spalle',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alts: [
            { id: 'shoulder-press-macchina', name: 'Shoulder press a macchina', equipment: 'macchine' },
            { id: 'panca-inclinata-45', name: 'Panca inclinata 45° con manubri', equipment: 'manubri', shoulder: 'caution' }
          ],
          note: 'Seduto con schienale, presa a martello (palmi che si guardano): riduce il conflitto subacromiale. Non scendere sotto l\'altezza del mento. Carico per singolo manubrio.'
        },
        {
          id: 'hip-thrust',
          name: 'Hip thrust',
          group: 'gambe',
          equipment: 'bilanciere',
          sets: 2, reps: '10-12', restSec: 105,
          shoulder: 'safe',
          alts: [
            { id: 'glute-bridge', name: 'Glute bridge con manubrio', equipment: 'manubri' }
          ],
          note: 'Pausa di 1 secondo in chiusura, mento verso il petto.'
        },
        {
          id: 'pushdown',
          name: 'Pushdown ai cavi',
          group: 'braccia',
          equipment: 'cavi',
          sets: 2, reps: '12', restSec: 60,
          shoulder: 'safe',
          alts: [
            { id: 'french-press', name: 'French press con manubri', equipment: 'manubri' }
          ],
          note: 'Gomiti fermi al fianco.'
        },
        {
          id: 'curl-martello',
          name: 'Curl a martello',
          group: 'braccia',
          equipment: 'manubri',
          sets: 2, reps: '12', restSec: 60,
          shoulder: 'safe',
          alts: [
            { id: 'curl-martello-cavi', name: 'Curl a martello ai cavi con corda', equipment: 'cavi' }
          ],
          note: 'Carico del singolo manubrio.'
        },
        {
          id: 'alzate-cavo',
          name: 'Alzate laterali ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 2, reps: '15', restSec: 45,
          shoulder: 'caution',
          alts: [
            { id: 'alzate-laterali', name: 'Alzate laterali con manubri' }
          ],
          note: 'Il cavo tiene la tensione costante e permette carichi molto bassi: più gentile del manubrio sul destro.'
        },
        {
          id: 'hollow',
          name: 'Hollow hold',
          group: 'core',
          equipment: 'corpo libero',
          sets: 2, reps: '30 secondi', restSec: 45,
          shoulder: 'safe',
          alts: [
            { id: 'dead-bug', name: 'Dead bug', equipment: 'corpo libero' }
          ],
          note: 'Registra i secondi nel campo ripetizioni e lascia il carico a 0.'
        }
      ]
    }
  ];

  var GROUPS = ['gambe', 'petto', 'schiena', 'spalle', 'braccia', 'core'];

  var PROGRESSION = [
    'Doppia progressione: resta sullo stesso carico finché non chiudi tutte le serie al limite alto del range di ripetizioni.',
    'Il limite alto vale per tutte le serie, non solo per la prima. Se la terza cala sempre, sei partito troppo pesante.',
    'Quando ci riesci, aumenta del 2,5-5% (il salto più piccolo disponibile) e riparti dal limite basso del range.',
    'Chiudi ogni serie con 1-2 ripetizioni ancora in canna. In fase di ripresa non serve arrivare a cedimento.',
    'Attrezzi diversi hanno storici diversi: scegli quello giusto dal selettore invece di registrare tutto sotto lo stesso nome, altrimenti i grafici diventano inutilizzabili.',
    'Sugli esercizi marcati «occhio alla spalla», se il fastidio supera 3 su 10 fermati e passa a un\'alternativa.'
  ];

  /* Indice di tutti i movimenti registrabili: esercizi della scheda più le
   * alternative che non compaiono già come principali altrove. */
  var INDEX = {};

  WORKOUTS.forEach(function (w) {
    w.exercises.forEach(function (ex) { INDEX[ex.id] = ex; });
  });

  WORKOUTS.forEach(function (w) {
    w.exercises.forEach(function (ex) {
      ex.alts.forEach(function (alt) {
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
          alts: [],
          isAlt: true,
          parentId: ex.id
        };
      });
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
    // Tutti i movimenti che possono occupare uno slot, principale in testa.
    variantsOf: function (primaryId) {
      var ex = INDEX[primaryId];
      if (!ex) return [primaryId];
      return [primaryId].concat((ex.alts || []).map(function (a) { return a.id; }));
    },
    // Prossimo della lista, a giro: serve solo quando non si indica un bersaglio.
    otherVariant: function (primaryId, currentId) {
      var v = this.variantsOf(primaryId);
      var i = v.indexOf(currentId);
      return v[(i + 1) % v.length];
    },
    allExercises: function () {
      return Object.keys(INDEX).map(function (id) { return INDEX[id]; });
    }
  };
})(window);
