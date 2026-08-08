/* Gym-rat — Persistenza e statistiche
 *
 * Tutto vive in localStorage, sul dispositivo. Nessun server, nessun account.
 * Da "Dati" si esporta e si reimporta un JSON: è l'unico backup che esiste,
 * conviene farlo ogni tanto.
 */
(function (global) {
  'use strict';

  var KEY = 'gymrat.v1';

  var EMPTY = {
    version: 1,
    settings: { unit: 'kg' },
    active: null,
    logs: []
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

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
    if (typeof state.active === 'undefined') state.active = null;
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

  // Ultima prestazione registrata per un esercizio, in qualunque sessione.
  function lastSetsFor(exerciseId) {
    var logs = load().logs;
    for (var i = logs.length - 1; i >= 0; i--) {
      var sets = logs[i].entries[exerciseId];
      if (sets && sets.length) {
        var done = sets.filter(function (s) { return s.done; });
        if (done.length) return { date: logs[i].endedAt || logs[i].startedAt, sets: done };
      }
    }
    return null;
  }

  function startSession(workoutId) {
    var s = load();
    var workout = global.GymData.getWorkout(workoutId);
    var entries = {};
    workout.exercises.forEach(function (ex) {
      var prev = lastSetsFor(ex.id);
      var rows = [];
      for (var i = 0; i < ex.sets; i++) {
        var p = prev && prev.sets[i] ? prev.sets[i] : (prev ? prev.sets[prev.sets.length - 1] : null);
        rows.push({ weight: p ? p.weight : '', reps: p ? p.reps : '', done: false });
      }
      entries[ex.id] = rows;
    });
    s.active = {
      workoutId: workoutId,
      startedAt: new Date().toISOString(),
      entries: entries,
      swaps: {},
      note: ''
    };
    save();
    return s.active;
  }

  function discardSession() {
    load().active = null;
    save();
  }

  function finishSession() {
    var s = load();
    if (!s.active) return null;
    var entries = {};
    Object.keys(s.active.entries).forEach(function (exId) {
      var done = s.active.entries[exId].filter(function (r) {
        return r.done && r.reps !== '' && r.reps !== null;
      }).map(function (r) {
        return { weight: Number(r.weight) || 0, reps: Number(r.reps) || 0 };
      });
      if (done.length) entries[exId] = done.map(function (r) {
        return { weight: r.weight, reps: r.reps, done: true };
      });
    });

    var log = {
      id: 'log-' + Date.now(),
      workoutId: s.active.workoutId,
      startedAt: s.active.startedAt,
      endedAt: new Date().toISOString(),
      entries: entries,
      swaps: s.active.swaps || {},
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

  /* ---------- statistiche ---------- */

  function volumeOfLog(log) {
    var total = 0;
    Object.keys(log.entries).forEach(function (exId) {
      log.entries[exId].forEach(function (set) {
        total += (Number(set.weight) || 0) * (Number(set.reps) || 0);
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

  function volumeByGroup(log) {
    var out = {};
    Object.keys(log.entries).forEach(function (exId) {
      var ex = global.GymData.getExercise(exId);
      if (!ex) return;
      var v = 0;
      log.entries[exId].forEach(function (s) {
        v += (Number(s.weight) || 0) * (Number(s.reps) || 0);
      });
      out[ex.group] = (out[ex.group] || 0) + v;
    });
    return out;
  }

  // Serie di punti per un esercizio: carico della serie migliore e 1RM stimato.
  function progressFor(exerciseId) {
    return load().logs.filter(function (log) {
      return log.entries[exerciseId] && log.entries[exerciseId].length;
    }).map(function (log) {
      var sets = log.entries[exerciseId];
      var topWeight = 0, best1RM = 0, volume = 0, topReps = 0;
      sets.forEach(function (s) {
        var w = Number(s.weight) || 0, r = Number(s.reps) || 0;
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
    var order = ['A', 'B', 'C'];
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
    state = {
      version: 1,
      settings: parsed.settings || { unit: 'kg' },
      active: parsed.active || null,
      logs: parsed.logs
    };
    save();
    return state;
  }

  function reset() {
    state = clone(EMPTY);
    save();
  }

  global.GymStore = {
    load: load,
    save: save,
    lastLogFor: lastLogFor,
    lastSetsFor: lastSetsFor,
    startSession: startSession,
    discardSession: discardSession,
    finishSession: finishSession,
    deleteLog: deleteLog,
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
