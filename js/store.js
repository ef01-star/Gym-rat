/* Gym-rat — Persistenza e statistiche
 *
 * Tutto vive in localStorage, sul dispositivo. Nessun server, nessun account.
 * Da "Dati" si esporta e si reimporta un JSON: è l'unico backup che esiste,
 * conviene farlo ogni tanto.
 */
(function (global) {
  'use strict';

  var KEY = 'gymrat.v1';

  var VERSION = 4;

  var EMPTY = {
    version: VERSION,
    settings: { unit: 'kg', preferredVariant: {} },
    active: null,
    logs: []
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* Versione 1 -> 2.
   *
   * Nella versione 1 sostituire un esercizio con la sua alternativa cambiava
   * solo l'etichetta: le serie restavano archiviate sotto l'id dell'esercizio
   * principale, con un flag `swaps` a lato. I carichi della leg press finivano
   * quindi nello storico del goblet squat. Qui le serie vengono riassegnate
   * all'id dell'alternativa, che ora è un esercizio a sé.
   *
   * Le sedute in cui l'alternativa è stata fatta senza premere il tasto di
   * sostituzione non lasciano traccia del cambio e restano dove sono: non c'è
   * modo di indovinarle. */
  function migrateSession(session) {
    if (!session || !session.swaps) return session;
    var variant = session.variant || {};
    Object.keys(session.swaps).forEach(function (primaryId) {
      if (!session.swaps[primaryId]) return;
      var ex = global.GymData.getExercise(primaryId);
      if (!ex || !ex.alts || !ex.alts.length) return;
      var altId = ex.alts[0].id;
      variant[primaryId] = altId;
      if (session.entries[primaryId] && !session.entries[altId]) {
        session.entries[altId] = session.entries[primaryId];
        delete session.entries[primaryId];
      }
    });
    session.variant = variant;
    delete session.swaps;
    return session;
  }

  /* Versione 2 -> 3.
   *
   * Una serie con 0 ripetizioni non è una serie: veniva usata per dire
   * "questo esercizio l'ho saltato", ma finiva archiviata come completata,
   * gonfiando il conteggio delle serie e facendo comparire nei progressi
   * esercizi mai svolti. Qui viene tolta, e con lei gli esercizi che non
   * conservano nemmeno una serie valida. */
  function dropEmptySets(session) {
    if (!session || !session.entries) return session;
    Object.keys(session.entries).forEach(function (exId) {
      var kept = session.entries[exId].filter(function (set) {
        return Number(set.reps) > 0;
      });
      if (kept.length) {
        session.entries[exId] = kept;
      } else {
        delete session.entries[exId];
      }
    });
    return session;
  }

  /* Versione 3 -> 4.
   *
   * Lo storico teneva solo l'id della scheda, e il nome veniva riletto dal
   * programma corrente: cambiando scheda, le sedute vecchie si ritrovavano
   * etichettate con quella nuova. Ora ogni seduta archivia il nome e il focus
   * che aveva al momento in cui è stata svolta. */
  function stampWorkout(log) {
    if (log.workoutName) return log;
    var w = global.GymData.getWorkout(log.workoutId);
    if (w) {
      log.workoutName = w.name;
      log.workoutFocus = w.focus;
    }
    return log;
  }

  function migrate(s) {
    if (s.version === VERSION) return s;
    if (!s.version || s.version < 2) {
      s.logs.forEach(migrateSession);
      migrateSession(s.active);
    }
    if (s.version < 3) {
      s.logs.forEach(dropEmptySets);
    }
    if (s.version < 4) {
      s.logs.forEach(stampWorkout);
    }
    if (!s.settings.preferredVariant) s.settings.preferredVariant = {};
    s.version = VERSION;
    return s;
  }

  var state = null;

  function load() {
    if (state) return state;
    try {
      var raw = global.localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : clone(EMPTY);
    } catch (e) {
      state = clone(EMPTY);
    }
    if (!state.logs) state.logs = [];
    if (!state.settings) state.settings = { unit: 'kg' };
    if (!state.settings.preferredVariant) state.settings.preferredVariant = {};
    if (typeof state.active === 'undefined') state.active = null;
    migrate(state);
    return state;
  }

  function save() {
    try {
      global.localStorage.setItem(KEY, JSON.stringify(load()));
      return true;
    } catch (e) {
      global.alert('Non riesco a salvare i dati sul dispositivo. Se sei in navigazione privata i dati non vengono conservati.');
      return false;
    }
  }

  /* ---------- sessione attiva ---------- */

  function lastLogFor(workoutId) {
    var logs = load().logs;
    for (var i = logs.length - 1; i >= 0; i--) {
      if (logs[i].workoutId === workoutId) return logs[i];
    }
    return null;
  }

  /* ---------- unità di misura ---------- */

  var KG_TO_LB = 2.2046226218;

  function unit() { return load().settings.unit || 'kg'; }

  function convert(value, from, to) {
    var v = Number(value);
    if (!v || from === to) return v || 0;
    return from === 'kg' ? v * KG_TO_LB : v / KG_TO_LB;
  }

  // Arrotonda al più piccolo incremento realistico: mezzo chilo, oppure due
  // libbre e mezzo, che è il salto tipico dei dischi e dei manubri americani.
  function roundLoad(value, toUnit) {
    var step = toUnit === 'lb' ? 2.5 : 0.5;
    return Math.round(Number(value) / step) * step;
  }

  function logUnit(log) { return log.unit || 'kg'; }

  /* ---------- storico per esercizio ---------- */

  // Ultima prestazione registrata per un esercizio, in qualunque sessione,
  // convertita nell'unità attualmente in uso.
  function lastSetsFor(exerciseId, targetUnit) {
    var to = targetUnit || unit();
    var logs = load().logs;
    for (var i = logs.length - 1; i >= 0; i--) {
      var sets = logs[i].entries[exerciseId];
      if (sets && sets.length) {
        var from = logUnit(logs[i]);
        var done = sets.filter(function (s) { return s.done; }).map(function (s) {
          // L'arrotondamento serve solo quando si converte davvero fra unità:
          // applicarlo a parità di unità storpiava i carichi scritti a mano
          // (88 lb proposti come 87,5, uno stack da 44 come 45).
          var w = Number(s.weight) || 0;
          if (w && from !== to) w = roundLoad(convert(w, from, to), to);
          return { weight: w, reps: s.reps };
        });
        if (done.length) {
          return { date: logs[i].endedAt || logs[i].startedAt, sets: done, unit: to };
        }
      }
    }
    return null;
  }

  // Righe precompilate con quanto fatto l'ultima volta su quello stesso
  // movimento: se ripeti gli stessi numeri basta spuntare la serie.
  function blankRows(exerciseId) {
    var ex = global.GymData.getExercise(exerciseId);
    var prev = lastSetsFor(exerciseId);
    var rows = [];
    for (var i = 0; i < ex.sets; i++) {
      var p = prev && prev.sets[i] ? prev.sets[i] : (prev ? prev.sets[prev.sets.length - 1] : null);
      rows.push({ weight: p ? p.weight : '', reps: p ? p.reps : '', done: false });
    }
    return rows;
  }

  function startSession(workoutId) {
    var s = load();
    var workout = global.GymData.getWorkout(workoutId);
    var entries = {};
    var variant = {};

    workout.exercises.forEach(function (ex) {
      // Se l'ultima volta hai fatto l'alternativa, la seduta riparte da quella.
      var preferred = s.settings.preferredVariant[ex.id];
      var variants = global.GymData.variantsOf(ex.id);
      var activeId = variants.indexOf(preferred) > -1 ? preferred : ex.id;
      variant[ex.id] = activeId;
      entries[activeId] = blankRows(activeId);
    });

    s.active = {
      workoutId: workoutId,
      startedAt: new Date().toISOString(),
      unit: s.settings.unit || 'kg',
      variant: variant,
      entries: entries,
      note: ''
    };
    save();
    return s.active;
  }

  // Passa a un'altra variante dello slot. Le righe già compilate di quella che
  // lasci restano in memoria, così tornare indietro non perde nulla.
  function swapSlot(primaryId, targetId) {
    var s = load();
    if (!s.active) return null;
    var current = s.active.variant[primaryId] || primaryId;
    var next = targetId || global.GymData.otherVariant(primaryId, current);
    if (next === current) return current;
    s.active.variant[primaryId] = next;
    if (!s.active.entries[next]) s.active.entries[next] = blankRows(next);
    save();
    return next;
  }

  function activeVariant(session, primaryId) {
    return (session.variant && session.variant[primaryId]) || primaryId;
  }

  function discardSession() {
    load().active = null;
    save();
  }

  function finishSession() {
    var s = load();
    if (!s.active) return null;
    var workout = global.GymData.getWorkout(s.active.workoutId);
    var entries = {};
    var variant = {};

    // Si salva soltanto la variante effettivamente svolta in ogni slot: le
    // righe dell'altra, se ne hai compilate prima di cambiare idea, restano
    // fuori dallo storico.
    workout.exercises.forEach(function (ex) {
      var activeId = activeVariant(s.active, ex.id);
      variant[ex.id] = activeId;
      var rows = s.active.entries[activeId] || [];
      // Una serie spuntata ma con 0 ripetizioni significa "saltato": non va
      // archiviata come lavoro svolto.
      var done = rows.filter(function (r) {
        return r.done && Number(r.reps) > 0;
      }).map(function (r) {
        return { weight: Number(r.weight) || 0, reps: Number(r.reps) || 0, done: true };
      });
      if (done.length) {
        entries[activeId] = done;
        // La prossima seduta ripartirà da questa variante.
        s.settings.preferredVariant[ex.id] = activeId;
      }
    });

    var log = {
      id: 'log-' + Date.now(),
      workoutId: s.active.workoutId,
      workoutName: workout.name,
      workoutFocus: workout.focus,
      startedAt: s.active.startedAt,
      endedAt: new Date().toISOString(),
      unit: s.active.unit || s.settings.unit || 'kg',
      entries: entries,
      variant: variant,
      note: s.active.note || ''
    };
    s.logs.push(log);
    s.active = null;
    save();
    return log;
  }

  function deleteLog(id) {
    var s = load();
    s.logs = s.logs.filter(function (l) { return l.id !== id; });
    save();
  }

  function getLog(id) {
    var logs = load().logs;
    for (var i = 0; i < logs.length; i++) {
      if (logs[i].id === id) return logs[i];
    }
    return null;
  }

  // Riscrive una sessione già archiviata: serve quando ci si accorge dopo di
  // aver sbagliato un carico, o di aver svolto l'altra variante dello slot.
  function updateLog(id, patch) {
    var log = getLog(id);
    if (!log) return null;
    Object.keys(patch).forEach(function (k) { log[k] = patch[k]; });
    save();
    return log;
  }

  /* ---------- statistiche ---------- */

  // Il volume è sempre espresso nell'unità attualmente in uso, anche per le
  // sedute registrate quando ne era attiva un'altra: altrimenti sommare chili
  // e libbre darebbe un numero senza significato.
  function volumeOfLog(log, targetUnit) {
    var to = targetUnit || unit();
    var from = logUnit(log);
    var total = 0;
    Object.keys(log.entries).forEach(function (exId) {
      log.entries[exId].forEach(function (set) {
        total += convert(set.weight, from, to) * (Number(set.reps) || 0);
      });
    });
    return total;
  }

  function setsOfLog(log) {
    var n = 0;
    Object.keys(log.entries).forEach(function (exId) { n += log.entries[exId].length; });
    return n;
  }

  function durationMin(log) {
    if (!log.endedAt) return null;
    return Math.round((new Date(log.endedAt) - new Date(log.startedAt)) / 60000);
  }

  // Epley. Sopra le 12 ripetizioni la stima perde senso, quindi la tagliamo.
  function estimate1RM(weight, reps) {
    if (!weight || !reps || reps > 12) return null;
    return weight * (1 + reps / 30);
  }

  function volumeByGroup(log, targetUnit) {
    var to = targetUnit || unit();
    var from = logUnit(log);
    var out = {};
    Object.keys(log.entries).forEach(function (exId) {
      var ex = global.GymData.getExercise(exId);
      if (!ex) return;
      var v = 0;
      log.entries[exId].forEach(function (s) {
        v += convert(s.weight, from, to) * (Number(s.reps) || 0);
      });
      out[ex.group] = (out[ex.group] || 0) + v;
    });
    return out;
  }

  // Serie di punti per un esercizio: carico della serie migliore e 1RM stimato.
  function progressFor(exerciseId, targetUnit) {
    var to = targetUnit || unit();
    return load().logs.filter(function (log) {
      return log.entries[exerciseId] && log.entries[exerciseId].length;
    }).map(function (log) {
      var sets = log.entries[exerciseId];
      var from = logUnit(log);
      var topWeight = 0, best1RM = 0, volume = 0, topReps = 0;
      sets.forEach(function (s) {
        var w = convert(s.weight, from, to), r = Number(s.reps) || 0;
        volume += w * r;
        if (w > topWeight) { topWeight = w; topReps = r; }
        var e = estimate1RM(w, r);
        if (e && e > best1RM) best1RM = e;
      });
      return {
        date: log.endedAt || log.startedAt,
        topWeight: topWeight,
        topReps: topReps,
        oneRM: best1RM || null,
        volume: volume
      };
    });
  }

  // Data locale in formato YYYY-MM-DD. Non si usa toISOString perché
  // convertirebbe in UTC e a est di Greenwich sposterebbe la chiave al giorno
  // prima, facendo iniziare le settimane di domenica.
  function localDay(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function parseDay(key) {
    var p = key.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  // Lunedì della settimana a cui appartiene la data.
  function weekKey(dateStr) {
    var d = new Date(dateStr);
    var day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return localDay(d);
  }

  function weeklyVolume(weeks) {
    var logs = load().logs;
    var buckets = {};
    logs.forEach(function (log) {
      var k = weekKey(log.endedAt || log.startedAt);
      buckets[k] = (buckets[k] || 0) + volumeOfLog(log);
    });

    var out = [];
    var cursor = parseDay(weekKey(new Date().toISOString()));
    for (var i = weeks - 1; i >= 0; i--) {
      var d = new Date(cursor);
      d.setDate(d.getDate() - i * 7);
      var k = localDay(d);
      out.push({ week: k, volume: buckets[k] || 0 });
    }
    return out;
  }

  // Quale sessione tocca: quella meno recente fra A, B e C.
  function nextWorkoutId() {
    var order = global.GymData.workouts.map(function (w) { return w.id; });
    var lastSeen = {};
    load().logs.forEach(function (log, i) { lastSeen[log.workoutId] = i; });
    var best = null, bestIdx = Infinity;
    order.forEach(function (id) {
      var idx = typeof lastSeen[id] === 'number' ? lastSeen[id] : -1;
      if (idx < bestIdx) { bestIdx = idx; best = id; }
    });
    return best || 'A';
  }

  function exportJSON() {
    return JSON.stringify(load(), null, 2);
  }

  function importJSON(text) {
    var parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.logs)) {
      throw new Error('Il file non sembra un backup di Gym-rat.');
    }
    var settings = parsed.settings || {};
    state = {
      version: parsed.version || 1,
      settings: {
        unit: settings.unit === 'lb' ? 'lb' : 'kg',
        preferredVariant: settings.preferredVariant || {}
      },
      active: parsed.active || null,
      logs: parsed.logs
    };
    // Un backup vecchio va portato al formato corrente prima di essere usato.
    migrate(state);
    save();
    return state;
  }

  function reset() {
    state = clone(EMPTY);
    save();
  }

  function setUnit(u) {
    var s = load();
    s.settings.unit = (u === 'lb') ? 'lb' : 'kg';
    save();
    return s.settings.unit;
  }

  global.GymStore = {
    load: load,
    save: save,
    unit: unit,
    setUnit: setUnit,
    convert: convert,
    roundLoad: roundLoad,
    logUnit: logUnit,
    lastLogFor: lastLogFor,
    lastSetsFor: lastSetsFor,
    startSession: startSession,
    swapSlot: swapSlot,
    activeVariant: activeVariant,
    discardSession: discardSession,
    finishSession: finishSession,
    deleteLog: deleteLog,
    getLog: getLog,
    updateLog: updateLog,
    volumeOfLog: volumeOfLog,
    setsOfLog: setsOfLog,
    durationMin: durationMin,
    estimate1RM: estimate1RM,
    volumeByGroup: volumeByGroup,
    progressFor: progressFor,
    weeklyVolume: weeklyVolume,
    weekKey: weekKey,
    nextWorkoutId: nextWorkoutId,
    exportJSON: exportJSON,
    importJSON: importJSON,
    reset: reset
  };
})(window);
