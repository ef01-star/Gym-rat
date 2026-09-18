/* Gym-rat — Programma di allenamento
 *
 * Upper / Lower / Upper, 3 sedute a settimana, circa un'ora l'una.
 * Obiettivo ricomposizione: densità alta, recuperi corti sui complementari,
 * coppie in superserie, ripetizioni prevalentemente fra 8 e 15.
 *
 * La spalla destra operata (cuffia dei rotatori + sottospinato) non dà più
 * fastidio da agosto, quindi il bilanciere torna sulle spinte orizzontali e le
 * alzate laterali arrivano all'altezza della spalla. Restano il lavoro di
 * cuffia in apertura di ogni seduta alta, la presa neutra o guidata sul
 * verticale, e niente dietro la nuca.
 *
 * shoulder: 'safe'    -> nessuna attenzione particolare
 *           'caution' -> tenere d'occhio la spalla destra, vedi note
 *           'rehab'   -> lavoro specifico per la cuffia, carico basso
 *
 * alts: gli altri attrezzi con cui si può svolgere lo stesso slot. Ognuno ha
 * un id proprio e quindi uno storico separato. Dove l'id coincide con un
 * esercizio già in scheda le due storie confluiscono, perché è davvero lo
 * stesso movimento.
 *
 * supersetWith: l'altro slot con cui si alterna senza recupero in mezzo.
 */
(function (global) {
  'use strict';

  var WARMUP = [
    'Cardio facile 5 minuti (bike, vogatore o tapis roulant)',
    'Mobilità toracica: cat-camel 8 + rotazioni toraciche 8 per lato',
    'Band pull-apart 2 × 15',
    'Nella seduta bassa aggiungi mobilità d\'anca: affondo in appoggio 8 per lato',
    'Serie di avvicinamento sul primo esercizio pesante: 2 in genere, 3-4 sullo squat'
  ];

  var COOLDOWN = [
    'Tapis roulant: 10-15 minuti di camminata a ritmo tranquillo',
    'Allungamento leggero di pettorali e dorsali, senza forzare la spalla destra',
    'Chin tuck 10 ripetizioni ed estensione toracica su foam roller 8: servono più del resto contro le fitte fra le scapole'
  ];

  var WORKOUTS = [
    {
      id: 'U1',
      name: 'Alta — spinta',
      focus: 'Parte alta, enfasi spinta',
      exercises: [
        {
          id: 'extrarotazioni',
          name: 'Extrarotazioni ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 2, reps: '15 per lato', restSec: 45,
          shoulder: 'rehab',
          supersetWith: 'y-raise',
          alts: [
            { id: 'extrarotazioni-elastico', name: 'Extrarotazioni con elastico', equipment: 'corpo libero', shoulder: 'rehab' }
          ],
          note: 'Apre la seduta: attiva la cuffia prima di caricare, non è un esercizio di forza. Gomito bloccato al fianco, movimento lento, carico basso.'
        },
        {
          id: 'y-raise',
          name: 'Y raise prono su panca inclinata',
          group: 'schiena',
          equipment: 'manubri',
          sets: 2, reps: '12', restSec: 45,
          shoulder: 'rehab',
          supersetWith: 'extrarotazioni',
          alts: [
            { id: 'scapular-pull', name: 'Scapular pull-down alla lat machine', equipment: 'cavi' },
            { id: 'wall-slide', name: 'Wall slide al muro', equipment: 'corpo libero' }
          ],
          note: 'Pancia in giù su panca inclinata a 30°, braccia distese a formare una Y, pollici in alto. Attiva i trapezi bassi, che nel lavoro al computer restano spenti mentre gli alti si irrigidiscono. Carico ridicolo, 5-10 lb: qui conta sentire le scapole scendere e avvicinarsi, non alzare peso.'
        },
        {
          id: 'panca-bilanciere',
          name: 'Panca piana con bilanciere',
          group: 'petto',
          equipment: 'bilanciere',
          sets: 3, reps: '8-10', restSec: 150,
          shoulder: 'caution',
          alts: [
            { id: 'panca-manubri', name: 'Panca piana con manubri', note: 'Carico del singolo manubrio. Più esigente per la spalla in stabilizzazione, ma con escursione libera.' },
            { id: 'chest-press-macchina', name: 'Chest press a macchina', equipment: 'macchine' }
          ],
          note: 'Il bilanciere torna sulla spinta orizzontale ora che la spalla regge. Presa poco più larga delle spalle, gomiti a 45° dal busto, discesa controllata fino a sfiorare il petto senza rimbalzare. Partenza indicativa 135 lb: è circa quanto muovevi con i due manubri da 60. Se la spalla si fa sentire, torna ai manubri senza pensarci.'
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
            { id: 'rematore-bilanciere', name: 'Rematore con bilanciere', equipment: 'bilanciere' }
          ],
          note: 'Con l\'appoggio al petto invece che con il bilanciere libero: tenere il busto flesso sotto carico è proprio ciò che affatica la zona fra le scapole, ed è l\'ultima cosa che ti serve con il lavoro al computer. Tira con le scapole, chiudi e tieni un istante. Sei a 200 × 10 su tutte e tre le serie: puoi salire.'
        },
        {
          id: 'lat-neutra',
          name: 'Lat machine presa neutra',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 90,
          shoulder: 'safe',
          alts: [
            { id: 'trazioni-assistite-neutra', name: 'Trazioni assistite presa neutra', equipment: 'macchine' },
            { id: 'lat-supina', name: 'Lat machine presa supina' }
          ],
          note: 'Presa stretta neutra, tira verso lo sterno, mai dietro la nuca. Sei fermo a 122,5 da tre sedute: se chiudi tutte e tre le serie a 12, sali allo scatto successivo.'
        },
        {
          id: 'shoulder-press-macchina',
          name: 'Shoulder press a macchina',
          group: 'spalle',
          equipment: 'macchine',
          sets: 3, reps: '10-12', restSec: 90,
          shoulder: 'caution',
          alts: [
            { id: 'lento-manubri-neutro', name: 'Lento avanti con manubri, presa neutra', equipment: 'manubri', shoulder: 'caution', note: 'Seduto con schienale, presa a martello. Carico del singolo manubrio: i tuoi 40 lb qui non si confrontano con i 140 della macchina.' },
            { id: 'panca-inclinata-45', name: 'Panca inclinata 45° con manubri', equipment: 'manubri', shoulder: 'caution' }
          ],
          note: 'Traiettoria guidata e schienale: la spinta verticale più gentile per la spalla. Non scendere sotto l\'altezza del mento.'
        },
        {
          id: 'alzate-laterali',
          name: 'Alzate laterali con manubri',
          group: 'spalle',
          equipment: 'manubri',
          sets: 3, reps: '12-15', restSec: 60,
          shoulder: 'caution',
          supersetWith: 'intrarotazioni',
          alts: [
            { id: 'alzate-cavo', name: 'Alzate laterali ai cavi' }
          ],
          note: 'Ora che la spalla regge puoi salire fino all\'altezza della spalla, non oltre. Sei fermo a 30 lb × 12 da tre sedute: arriva a 15 ripetizioni su tutte le serie prima di aggiungere peso.'
        },
        {
          id: 'intrarotazioni',
          name: 'Intrarotazioni ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 3, reps: '12 per lato', restSec: 60,
          shoulder: 'rehab',
          supersetWith: 'alzate-laterali',
          alts: [
            { id: 'intrarotazioni-elastico', name: 'Intrarotazioni con elastico', equipment: 'corpo libero', shoulder: 'rehab' }
          ],
          note: 'Cavo all\'altezza del fianco, gomito bloccato al fianco, avambraccio verso l\'ombelico. Completa il lavoro delle extrarotazioni. In superserie con le alzate: alterni le due senza recupero in mezzo.'
        },
        {
          id: 'curl-manubri',
          name: 'Curl con manubri',
          group: 'braccia',
          equipment: 'manubri',
          sets: 2, reps: '10-12', restSec: 60,
          shoulder: 'safe',
          supersetWith: 'pushdown',
          alts: [
            { id: 'curl-cavi', name: 'Curl ai cavi', equipment: 'cavi' }
          ],
          note: 'Carico del singolo manubrio. In superserie con il pushdown.'
        },
        {
          id: 'pushdown',
          name: 'Pushdown ai cavi',
          group: 'braccia',
          equipment: 'cavi',
          sets: 2, reps: '10-12', restSec: 60,
          shoulder: 'safe',
          supersetWith: 'curl-manubri',
          alts: [
            { id: 'french-press', name: 'French press con manubri', equipment: 'manubri' }
          ],
          note: 'Gomiti fermi al fianco. In superserie con il curl: bicipite e tricipite non si disturbano, quindi il recupero serve solo fra una coppia e l\'altra.'
        },
      ]
    },
    {
      id: 'L',
      name: 'Bassa',
      focus: 'Parte bassa e catena posteriore',
      exercises: [
        {
          id: 'squat',
          name: 'Squat con bilanciere',
          group: 'gambe',
          equipment: 'bilanciere',
          sets: 3, reps: '6-8', restSec: 180,
          shoulder: 'caution',
          alts: [
            { id: 'hack-squat', name: 'Hack squat', equipment: 'macchine' }
          ],
          note: 'Mettici 3-4 serie di avvicinamento a carico ridotto: sono riscaldamento e non vanno registrate. Sei a 215 × 6: quando chiudi 8 ripetizioni su tutte e tre le serie, sali di 10 lb. Il bilanciere va appoggiato sulla mensola dei trapezi, non alto sul collo, e con una presa un po\' più larga: se dopo lo squat senti le fitte fra le scapole, passa all\'hack squat per qualche settimana.'
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
          note: 'Manubri vicini alle gambe, ginocchia morbide. Scendi finché senti i femorali, non più in basso. Con i manubri sei a 90 lb l\'uno: a questo punto il bilanciere è più comodo da gestire.'
        },
        {
          id: 'leg-press',
          name: 'Leg press',
          group: 'gambe',
          equipment: 'macchine',
          sets: 3, reps: '10-12', restSec: 90,
          shoulder: 'safe',
          alts: [
            { id: 'goblet-squat', name: 'Goblet squat con manubrio', equipment: 'manubri' }
          ],
          note: 'Dopo squat e stacco serve volume, non un altro massimale: resta sulle 10-12 ripetizioni con un paio in canna.'
        },
        {
          id: 'leg-curl',
          name: 'Leg curl',
          group: 'gambe',
          equipment: 'macchine',
          sets: 3, reps: '10-12', restSec: 75,
          shoulder: 'safe',
          alts: [
            { id: 'nordic-curl', name: 'Nordic curl assistito', equipment: 'corpo libero' }
          ],
          note: 'Fase negativa lenta, 3 secondi. In questa scheda è l\'unico lavoro isolato per i femorali: non saltarlo come facevi prima.'
        },
        {
          id: 'hip-thrust',
          name: 'Hip thrust',
          group: 'gambe',
          equipment: 'bilanciere',
          sets: 3, reps: '10-12', restSec: 60,
          shoulder: 'safe',
          supersetWith: 'calf',
          alts: [
            { id: 'glute-bridge', name: 'Glute bridge con manubrio', equipment: 'manubri' }
          ],
          note: 'Pausa di 1 secondo in chiusura, mento verso il petto. In superserie con il calf.'
        },
        {
          id: 'calf',
          name: 'Calf raise da seduto a macchina',
          group: 'gambe',
          equipment: 'macchine',
          sets: 3, reps: '15', restSec: 60,
          shoulder: 'safe',
          supersetWith: 'hip-thrust',
          alts: [
            { id: 'calf-rack', name: 'Calf raise al rack con bilanciere', equipment: 'bilanciere', shoulder: 'caution' },
            { id: 'calf-manubrio', name: 'Calf raise in piedi con manubrio', equipment: 'manubri' }
          ],
          note: 'Da seduto, ginocchia piegate: lavora soprattutto il soleo. Pausa di 1 secondo in alto e in basso.'
        },
        {
          id: 'plank',
          name: 'Plank',
          group: 'core',
          equipment: 'corpo libero',
          sets: 2, reps: '45 secondi', restSec: 45,
          shoulder: 'safe',
          alts: [
            { id: 'pallof', name: 'Pallof press', equipment: 'cavi', note: 'Antirotazione ai cavi: il busto non deve girare. Carico registrato per lato.' },
            { id: 'dead-bug', name: 'Dead bug', equipment: 'corpo libero' }
          ],
          note: 'Registra i secondi nel campo ripetizioni e lascia il carico a 0.'
        }
      ]
    },
    {
      id: 'U2',
      name: 'Alta — tirata',
      focus: 'Parte alta, enfasi tirata',
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
          note: 'In apertura, come le extrarotazioni nella seduta di spinta. Cavo all\'altezza degli occhi, gomiti alti, chiudi in extrarotazione.'
        },
        {
          id: 'pulley-neutro',
          name: 'Pulley basso presa neutra',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 120,
          shoulder: 'safe',
          alts: [
            { id: 'rematore-appoggio', name: 'Rematore a macchina con appoggio al petto' }
          ],
          note: 'Busto fermo, tira con le scapole prima che con le braccia. Hai chiuso 132 × 12 su due serie su tre: sei pronto a salire.'
        },
        {
          id: 'panca-inclinata-manubri',
          name: 'Panca inclinata 30° con manubri',
          group: 'petto',
          equipment: 'manubri',
          sets: 3, reps: '8-12', restSec: 150,
          shoulder: 'caution',
          alts: [
            { id: 'chest-press-inclinata', name: 'Chest press inclinata a macchina', equipment: 'macchine' },
            { id: 'chest-press-inclinata-cavi', name: 'Chest press inclinata ai cavi dal basso', equipment: 'cavi' }
          ],
          note: 'Inclinazione bassa, 30° bastano. Carico per singolo manubrio. Ai cavi dal basso i numeri sono più bassi e più graduabili della macchina: sono tre storici distinti, scegli quello giusto dal selettore.'
        },
        {
          id: 'lat-supina',
          name: 'Lat machine presa supina',
          group: 'schiena',
          equipment: 'cavi',
          sets: 3, reps: '8-10', restSec: 120,
          shoulder: 'safe',
          alts: [
            { id: 'trazioni-assistite-supina', name: 'Trazioni assistite presa supina', equipment: 'macchine' }
          ],
          note: 'Presa alla larghezza delle spalle, tira verso la parte alta dell\'addome. I 121 del 16 settembre sono il nuovo punto di partenza affidabile.'
        },
        {
          id: 'chest-press-cavi',
          name: 'Chest press ai cavi',
          group: 'petto',
          equipment: 'cavi',
          sets: 3, reps: '10-12', restSec: 90,
          shoulder: 'caution',
          alts: [
            { id: 'panca-manubri', name: 'Panca piana con manubri', equipment: 'manubri' },
            { id: 'chest-press-macchina', name: 'Chest press a macchina', equipment: 'macchine' }
          ],
          note: 'Registra il carico del singolo stack, non la somma dei due. Regola il sedile in modo che le mani partano all\'altezza dello sterno.'
        },
        {
          id: 'rematore-manubrio',
          name: 'Rematore con manubrio singolo',
          group: 'schiena',
          equipment: 'manubri',
          sets: 3, reps: '10-12', restSec: 60,
          shoulder: 'safe',
          supersetWith: 'curl-martello',
          alts: [
            { id: 'rematore-tbar', name: 'Rematore a T-bar', equipment: 'bilanciere' }
          ],
          note: 'Appoggio su panca, carico del singolo manubrio. In superserie con il curl a martello.'
        },
        {
          id: 'curl-martello',
          name: 'Curl a martello',
          group: 'braccia',
          equipment: 'manubri',
          sets: 3, reps: '10-12', restSec: 60,
          shoulder: 'safe',
          supersetWith: 'rematore-manubrio',
          alts: [
            { id: 'curl-martello-cavi', name: 'Curl a martello ai cavi con corda', equipment: 'cavi' }
          ],
          note: 'Carico del singolo manubrio. In superserie con il rematore.'
        },
        {
          id: 'french-press',
          name: 'French press con manubri',
          group: 'braccia',
          equipment: 'manubri',
          sets: 2, reps: '12', restSec: 45,
          shoulder: 'caution',
          supersetWith: 'alzate-cavo',
          alts: [
            { id: 'pushdown', name: 'Pushdown ai cavi', equipment: 'cavi' }
          ],
          note: 'Gomiti stretti e fermi, la spalla resta ferma: se sentitiri sull\'articolazione invece che sul tricipite, passa al pushdown. In superserie con le alzate ai cavi.'
        },
        {
          id: 'alzate-cavo',
          name: 'Alzate laterali ai cavi',
          group: 'spalle',
          equipment: 'cavi',
          sets: 2, reps: '15', restSec: 45,
          shoulder: 'caution',
          supersetWith: 'french-press',
          alts: [
            { id: 'alzate-laterali', name: 'Alzate laterali con manubri' }
          ],
          note: 'Il cavo tiene la tensione costante e permette carichi molto bassi. In superserie con il french press.'
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

  /* Schede non più attive. Servono solo a dare un nome alle sedute già
   * archiviate, che altrimenti verrebbero rietichettate con la scheda nuova. */
  var ARCHIVE = {
    A: { id: 'A', name: 'Sessione A', focus: 'Spinta orizzontale & quadricipiti', exercises: [] },
    B: { id: 'B', name: 'Sessione B', focus: 'Catena posteriore & tirata', exercises: [] },
    C: { id: 'C', name: 'Sessione C', focus: 'Gambe bilaterale & spinta verticale', exercises: [] }
  };

  var GROUPS = ['gambe', 'petto', 'schiena', 'spalle', 'braccia', 'core'];

  var PROGRESSION = [
    'Doppia progressione: resta sullo stesso carico finché non chiudi tutte le serie al limite alto del range di ripetizioni.',
    'Il limite alto vale per tutte le serie, non solo per la prima. Se la terza cala sempre, sei partito troppo pesante.',
    'Quando ci riesci, aumenta del 2,5-5% e riparti dal limite basso del range.',
    'Chiudi ogni serie con 1-2 ripetizioni ancora in canna. La serie tirata a cedimento seguita da una in scarico ti allunga la seduta e non aggiunge niente: se vuoi usarla, tienila per l\'ultima serie dell\'ultimo esercizio.',
    'Nelle coppie in superserie non recuperi fra i due esercizi, solo alla fine della coppia: è lì che sta la densità che serve alla ricomposizione.',
    'Attrezzi diversi hanno storici diversi: scegli quello giusto dal selettore invece di registrare tutto sotto lo stesso nome.',
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

  /* Movimenti usciti dalla scheda ma presenti nello storico: vanno comunque
   * risolti, altrimenti i progressi mostrerebbero un id al posto del nome. */
  var RETIRED = [
    { id: 'affondi', name: 'Affondi in camminata con manubri', group: 'gambe', equipment: 'manubri' },
    { id: 'split-squat-bulgaro', name: 'Split squat bulgaro', group: 'gambe', equipment: 'manubri' }
  ];

  RETIRED.forEach(function (ex) {
    if (INDEX[ex.id]) return;
    INDEX[ex.id] = {
      id: ex.id, name: ex.name, group: ex.group, equipment: ex.equipment,
      sets: 3, reps: '10', restSec: 90, shoulder: 'safe',
      note: 'Non fa più parte della scheda attuale.', alts: [], isRetired: true
    };
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
      return ARCHIVE[id] || null;
    },
    getExercise: function (id) {
      return INDEX[id] || null;
    },
    variantsOf: function (primaryId) {
      var ex = INDEX[primaryId];
      if (!ex) return [primaryId];
      return [primaryId].concat((ex.alts || []).map(function (a) { return a.id; }));
    },
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
