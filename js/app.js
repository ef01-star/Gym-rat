/* Gym-rat — Interfaccia
 *
 * Nessun framework: una vista alla volta, renderizzata in #view, con delega
 * degli eventi sul contenitore. Le viste si rigenerano solo quando cambia la
 * struttura (serie aggiunta, esercizio sostituito); durante la digitazione lo
 * stato viene aggiornato senza ridisegnare, così il campo non perde il fuoco.
 */
(function (global) {
  'use strict';

  var D = global.GymData;
  var S = global.GymStore;
  var C = global.GymCharts;

  var view = null;
  var timerHandle = null;

  /* ---------- utilità ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  }

  function fmtDateLong(iso) {
    return new Date(iso).toLocaleDateString('it-IT', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  function fmtClock(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(s).padStart(2, '0');
  }

  function fmtRest(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + "'" + (s ? String(s).padStart(2, '0') + '"' : '');
  }

  function shoulderBadge(ex) {
    if (ex.shoulder === 'caution') return '<span class="badge badge-warn" title="Movimento da tenere d\'occhio per la spalla destra">occhio alla spalla</span>';
    if (ex.shoulder === 'rehab') return '<span class="badge badge-rehab" title="Lavoro specifico per la cuffia dei rotatori">cuffia</span>';
    return '';
  }

  // Unità attualmente in uso: 'kg' oppure 'lb'.
  function unit() { return S.unit(); }

  /* ---------- vista: dashboard ---------- */

  function renderDashboard() {
    var state = S.load();
    var logs = state.logs;
    var next = D.getWorkout(state.active ? state.active.workoutId : S.nextWorkoutId());

    var thisWeek = S.weekKey(new Date().toISOString());
    var weekLogs = logs.filter(function (l) {
      return S.weekKey(l.endedAt || l.startedAt) === thisWeek;
    });
    var weekVolume = weekLogs.reduce(function (a, l) { return a + S.volumeOfLog(l); }, 0);

    var durations = logs.map(S.durationMin).filter(function (d) { return d && d > 0 && d < 240; });
    var avgDuration = durations.length
      ? Math.round(durations.reduce(function (a, b) { return a + b; }, 0) / durations.length)
      : null;

    var weekly = S.weeklyVolume(8).map(function (w) {
      return { label: fmtDate(w.week), value: w.volume };
    });

    var hero = state.active
      ? '<div class="hero hero-active">' +
          '<p class="hero-kicker">Sessione in corso</p>' +
          '<h2>' + esc(next.name) + '</h2>' +
          '<p class="hero-focus">' + esc(next.focus) + '</p>' +
          '<a class="btn btn-primary" href="#/allenamento">Riprendi</a>' +
        '</div>'
      : '<div class="hero">' +
          '<p class="hero-kicker">Tocca a te</p>' +
          '<h2>' + esc(next.name) + '</h2>' +
          '<p class="hero-focus">' + esc(next.focus) + '</p>' +
          '<a class="btn btn-primary" href="#/allenamento">Inizia l\'allenamento</a>' +
        '</div>';

    var recent = logs.slice(-3).reverse().map(function (log) {
      var w = D.getWorkout(log.workoutId);
      var dur = S.durationMin(log);
      return '<li>' +
        '<span class="pill pill-' + esc(log.workoutId) + '">' + esc(log.workoutId) + '</span>' +
        '<span class="recent-main"><strong>' + esc(w ? w.focus : log.workoutId) + '</strong>' +
        '<span class="muted">' + esc(fmtDateLong(log.endedAt || log.startedAt)) + '</span></span>' +
        '<span class="recent-meta">' + C.format(S.volumeOfLog(log)) + ' ' + unit() +
        (dur ? ' · ' + dur + "'" : '') + '</span>' +
        '</li>';
    }).join('');

    return hero +
      '<div class="stat-grid">' +
        stat('Sessioni totali', logs.length) +
        stat('Questa settimana', weekLogs.length + ' / 3') +
        stat('Volume settimanale', C.format(weekVolume) + ' <small>' + unit() + '</small>') +
        stat('Durata media', avgDuration ? avgDuration + " <small>min</small>" : '—') +
      '</div>' +
      '<section class="card">' +
        '<h3>Volume sollevato per settimana</h3>' +
        '<p class="card-sub">Somma di carico × ripetizioni su tutte le serie completate.</p>' +
        C.bars(weekly, { unit: unit(), emptyMessage: 'Completa la prima sessione e qui comparirà il grafico.' }) +
      '</section>' +
      (recent
        ? '<section class="card"><h3>Ultime sessioni</h3><ul class="recent">' + recent + '</ul></section>'
        : '<section class="card empty-state"><h3>Non hai ancora registrato nulla</h3>' +
          '<p>Apri <a href="#/programma">Programma</a> per vedere com\'è strutturata la scheda, oppure parti direttamente con la Sessione A.</p></section>');
  }

  function stat(label, value) {
    return '<div class="stat"><span class="stat-label">' + esc(label) + '</span>' +
      '<span class="stat-value">' + value + '</span></div>';
  }

  /* ---------- vista: allenamento ---------- */

  function renderTraining() {
    var state = S.load();
    if (state.active) return renderLiveSession(state.active);

    var cards = D.workouts.map(function (w) {
      var last = S.lastLogFor(w.id);
      var groups = {};
      w.exercises.forEach(function (e) { groups[e.group] = true; });
      return '<article class="card workout-card">' +
        '<header><span class="pill pill-' + esc(w.id) + '">' + esc(w.id) + '</span>' +
        '<div><h3>' + esc(w.name) + '</h3><p class="card-sub">' + esc(w.focus) + '</p></div></header>' +
        '<p class="muted">' + w.exercises.length + ' esercizi · ' +
        Object.keys(groups).join(', ') + '</p>' +
        '<p class="muted">' + (last ? 'Ultima volta: ' + esc(fmtDateLong(last.endedAt || last.startedAt)) : 'Mai svolta') + '</p>' +
        '<button class="btn btn-primary" data-action="start" data-workout="' + esc(w.id) + '">Inizia ' + esc(w.name) + '</button>' +
        '</article>';
    }).join('');

    return '<h2 class="view-title">Scegli la sessione</h2>' +
      '<p class="view-sub">Il suggerimento è <strong>' + esc(S.nextWorkoutId()) +
      '</strong>: è quella che manca da più tempo.</p>' + cards;
  }

  function renderLiveSession(active) {
    var workout = D.getWorkout(active.workoutId);

    var warmup = '<details class="card warmup"><summary>Riscaldamento <span class="muted">(5-8 minuti, sempre lo stesso)</span></summary><ul>' +
      D.warmup.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') +
      '</ul></details>';

    var u = S.unit();

    var exercises = workout.exercises.map(function (slot) {
      var activeId = S.activeVariant(active, slot.id);
      var ex = D.getExercise(activeId);
      var rows = active.entries[activeId] || [];
      var doneCount = rows.filter(function (r) { return r.done; }).length;
      var prev = S.lastSetsFor(activeId);

      var prevText = prev
        ? 'Ultima volta (' + fmtDate(prev.date) + '): ' + prev.sets.map(function (s) {
            return (s.weight ? s.weight + '×' : '') + s.reps;
          }).join(', ') + (prev.sets.some(function (s) { return s.weight; }) ? ' ' + u : '')
        : 'Prima volta su questo movimento: parti leggero e trova il carico.';

      // Le due varianti sono sempre entrambe visibili, con quella in corso
      // evidenziata: un tasto "Usa Dead bug" non dice se stai facendo il plank
      // o il dead bug, e a fine seduta non te lo ricordi più.
      var variantPicker = D.variantsOf(slot.id).map(function (vid) {
        var v = D.getExercise(vid);
        var on = vid === activeId;
        return '<button class="variant-opt' + (on ? ' is-on' : '') + '" data-action="pick-variant" ' +
          'data-primary="' + esc(slot.id) + '" data-variant="' + esc(vid) + '" ' +
          'aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(v.name) + '</button>';
      }).join('');

      var setRows = rows.map(function (row, i) {
        return '<tr class="set-row' + (row.done ? ' is-done' : '') + '" data-ex="' + esc(activeId) + '" data-set="' + i + '">' +
          '<td class="set-index">' + (i + 1) + '</td>' +
          '<td><input class="set-input" type="number" inputmode="decimal" step="' + (u === 'lb' ? '2.5' : '0.5') + '" min="0" ' +
            'aria-label="Carico serie ' + (i + 1) + ' in ' + u + '" placeholder="' + u + '" ' +
            'data-field="weight" data-ex="' + esc(activeId) + '" data-set="' + i + '" value="' + esc(row.weight) + '"></td>' +
          '<td><input class="set-input" type="number" inputmode="numeric" step="1" min="0" ' +
            'aria-label="Ripetizioni serie ' + (i + 1) + '" placeholder="rip" ' +
            'data-field="reps" data-ex="' + esc(activeId) + '" data-set="' + i + '" value="' + esc(row.reps) + '"></td>' +
          '<td><button class="check" data-action="toggle-set" data-ex="' + esc(activeId) + '" data-set="' + i + '" ' +
            'aria-pressed="' + (row.done ? 'true' : 'false') + '" title="Segna la serie come completata">✓</button></td>' +
          '</tr>';
      }).join('');

      return '<article class="card exercise' + (doneCount === rows.length && rows.length ? ' is-complete' : '') + '" data-ex-card="' + esc(activeId) + '">' +
        '<header class="exercise-head">' +
          '<div>' +
            '<h3>' + esc(ex.name) + '</h3>' +
            '<p class="badges">' +
              '<span class="badge">' + esc(ex.group) + '</span>' +
              '<span class="badge">' + esc(ex.equipment) + '</span>' +
              shoulderBadge(ex) +
            '</p>' +
          '</div>' +
          '<span class="progress-count" data-count="' + esc(activeId) + '">' + doneCount + '/' + rows.length + '</span>' +
        '</header>' +
        '<div class="variant" role="group" aria-label="Quale dei due stai facendo">' + variantPicker + '</div>' +
        '<p class="target">Obiettivo ' + ex.sets + ' × ' + esc(ex.reps) + ' · recupero ' + fmtRest(ex.restSec) + '</p>' +
        '<p class="prev">' + esc(prevText) + '</p>' +
        '<table class="sets"><thead><tr><th>#</th><th>Carico (' + esc(u) + ')</th><th>Rip.</th><th></th></tr></thead>' +
        '<tbody>' + setRows + '</tbody></table>' +
        '<div class="exercise-actions">' +
          '<button class="btn btn-ghost" data-action="add-set" data-ex="' + esc(activeId) + '">+ Serie</button>' +
          (rows.length > 1 ? '<button class="btn btn-ghost" data-action="remove-set" data-ex="' + esc(activeId) + '">− Serie</button>' : '') +
        '</div>' +
        '<details class="note"><summary>Come eseguirlo</summary><p>' + esc(ex.note) + '</p></details>' +
        '</article>';
    }).join('');

    var cooldown = '<details class="card warmup"><summary>Defaticamento <span class="muted">(a fine seduta)</span></summary><ul>' +
      D.cooldown.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') +
      '</ul></details>';

    return '<div class="session-bar">' +
        '<div><span class="pill pill-' + esc(workout.id) + '">' + esc(workout.id) + '</span> ' +
        '<strong>' + esc(workout.focus) + '</strong></div>' +
        '<div class="session-timer" id="elapsed">0:00</div>' +
      '</div>' +
      warmup + exercises + cooldown +
      '<section class="card">' +
        '<h3>Note della sessione</h3>' +
        '<textarea id="session-note" rows="3" placeholder="Come è andata? La spalla destra si è fatta sentire?">' +
        esc(active.note) + '</textarea>' +
      '</section>' +
      '<div class="session-end">' +
        '<button class="btn btn-primary btn-lg" data-action="finish">Termina e salva</button>' +
        '<button class="btn btn-danger-ghost" data-action="discard">Annulla sessione</button>' +
      '</div>';
  }

  /* ---------- vista: storico ---------- */

  /* ---------- correzione di una sessione archiviata ---------- */

  // Le modifiche restano in una copia di lavoro finché non premi Salva, così
  // Annulla riporta davvero la sessione com'era.
  var editDraft = null;

  function startEditing(logId) {
    var log = S.getLog(logId);
    if (!log) return;
    var workout = D.getWorkout(log.workoutId);
    var draft = {
      logId: logId,
      unit: S.logUnit(log),
      note: log.note || '',
      variant: {},
      entries: {}
    };

    workout.exercises.forEach(function (slot) {
      var variants = D.variantsOf(slot.id);
      // La variante svolta si deduce da dove stanno davvero le serie: è più
      // affidabile del campo `variant`, che nelle sessioni vecchie può mancare
      // o essere sbagliato.
      var withData = variants.filter(function (id) { return log.entries[id]; });
      var chosen = withData.length ? withData[0]
        : ((log.variant && log.variant[slot.id]) || slot.id);
      draft.variant[slot.id] = chosen;

      variants.forEach(function (id) {
        if (log.entries[id]) {
          draft.entries[id] = log.entries[id].map(function (s) {
            return { weight: s.weight, reps: s.reps };
          });
        }
      });
      if (!draft.entries[chosen]) draft.entries[chosen] = emptyRows(slot.sets);
    });

    editDraft = draft;
  }

  function emptyRows(n) {
    var rows = [];
    for (var i = 0; i < n; i++) rows.push({ weight: '', reps: '' });
    return rows;
  }

  function saveEditing() {
    var log = S.getLog(editDraft.logId);
    var workout = D.getWorkout(log.workoutId);
    var entries = {};
    var variant = {};

    workout.exercises.forEach(function (slot) {
      var vid = editDraft.variant[slot.id];
      variant[slot.id] = vid;
      var rows = (editDraft.entries[vid] || []).filter(function (r) {
        return r.reps !== '' && r.reps !== null && Number(r.reps) > 0;
      }).map(function (r) {
        return { weight: Number(r.weight) || 0, reps: Number(r.reps) || 0, done: true };
      });
      if (rows.length) entries[vid] = rows;
    });

    if (!Object.keys(entries).length) {
      global.alert('Così la sessione resterebbe senza nessuna serie. Se vuoi toglierla del tutto, usa Elimina sessione.');
      return;
    }

    S.updateLog(editDraft.logId, {
      entries: entries,
      variant: variant,
      note: editDraft.note,
      unit: editDraft.unit
    });
    editDraft = null;
    render();
    global.scrollTo(0, 0);
  }

  function renderLogEditor() {
    var log = S.getLog(editDraft.logId);
    var workout = D.getWorkout(log.workoutId);
    var u = editDraft.unit;

    var slots = workout.exercises.map(function (slot) {
      var activeId = editDraft.variant[slot.id];
      var ex = D.getExercise(activeId);
      var rows = editDraft.entries[activeId] || [];

      var picker = D.variantsOf(slot.id).map(function (vid) {
        var v = D.getExercise(vid);
        var on = vid === activeId;
        return '<button class="variant-opt' + (on ? ' is-on' : '') + '" data-action="edit-variant" ' +
          'data-primary="' + esc(slot.id) + '" data-variant="' + esc(vid) + '" ' +
          'aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(v.name) + '</button>';
      }).join('');

      var setRows = rows.map(function (row, i) {
        return '<tr class="set-row">' +
          '<td class="set-index">' + (i + 1) + '</td>' +
          '<td><input class="set-input edit-input" type="number" inputmode="decimal" ' +
            'step="' + (u === 'lb' ? '2.5' : '0.5') + '" min="0" placeholder="' + u + '" ' +
            'aria-label="Carico serie ' + (i + 1) + '" ' +
            'data-field="weight" data-ex="' + esc(activeId) + '" data-set="' + i + '" value="' + esc(row.weight) + '"></td>' +
          '<td><input class="set-input edit-input" type="number" inputmode="numeric" step="1" min="0" ' +
            'placeholder="rip" aria-label="Ripetizioni serie ' + (i + 1) + '" ' +
            'data-field="reps" data-ex="' + esc(activeId) + '" data-set="' + i + '" value="' + esc(row.reps) + '"></td>' +
          '</tr>';
      }).join('');

      return '<article class="card exercise">' +
        '<header class="exercise-head"><div><h3>' + esc(ex.name) + '</h3>' +
        '<p class="badges"><span class="badge">' + esc(ex.group) + '</span>' +
        '<span class="badge">' + esc(ex.equipment) + '</span></p></div></header>' +
        '<div class="variant" role="group" aria-label="Quale dei due hai fatto">' + picker + '</div>' +
        '<table class="sets"><thead><tr><th>#</th><th>Carico (' + esc(u) + ')</th><th>Rip.</th></tr></thead>' +
        '<tbody>' + setRows + '</tbody></table>' +
        '<div class="exercise-actions">' +
          '<button class="btn btn-ghost" data-action="edit-add-set" data-ex="' + esc(activeId) + '">+ Serie</button>' +
          (rows.length ? '<button class="btn btn-ghost" data-action="edit-remove-set" data-ex="' + esc(activeId) + '">− Serie</button>' : '') +
        '</div>' +
        '<p class="footnote">Le righe lasciate vuote non vengono salvate.</p>' +
        '</article>';
    }).join('');

    return '<h2 class="view-title">Correggi la sessione</h2>' +
      '<p class="view-sub">' + esc(workout.name) + ' · ' +
      esc(fmtDateLong(log.endedAt || log.startedAt)) + '</p>' +

      '<section class="card">' +
        '<h3>Unità di questa sessione</h3>' +
        '<p class="card-sub">Cambiala solo se avevi registrato i carichi nell\'unità sbagliata: ' +
        'i numeri qui sotto restano identici, cambia il modo in cui vengono letti.</p>' +
        '<div class="variant" role="group" aria-label="Unità della sessione">' +
          '<button class="variant-opt' + (u === 'kg' ? ' is-on' : '') + '" data-action="edit-unit" ' +
            'data-unit="kg" aria-pressed="' + (u === 'kg' ? 'true' : 'false') + '">kg</button>' +
          '<button class="variant-opt' + (u === 'lb' ? ' is-on' : '') + '" data-action="edit-unit" ' +
            'data-unit="lb" aria-pressed="' + (u === 'lb' ? 'true' : 'false') + '">lb</button>' +
        '</div>' +
      '</section>' +

      slots +

      '<section class="card">' +
        '<h3>Note della sessione</h3>' +
        '<textarea id="edit-note" rows="4">' + esc(editDraft.note) + '</textarea>' +
      '</section>' +

      '<div class="session-end">' +
        '<button class="btn btn-primary btn-lg" data-action="save-edit">Salva le correzioni</button>' +
        '<button class="btn btn-ghost" data-action="cancel-edit">Annulla</button>' +
      '</div>';
  }

  function renderHistory() {
    if (editDraft) return renderLogEditor();

    var logs = S.load().logs.slice().reverse();
    if (!logs.length) {
      return '<h2 class="view-title">Storico</h2>' +
        '<section class="card empty-state"><h3>Ancora nessuna sessione salvata</h3>' +
        '<p>Ogni allenamento che concludi finisce qui, con carichi e ripetizioni serie per serie.</p></section>';
    }

    var items = logs.map(function (log) {
      var w = D.getWorkout(log.workoutId);
      var dur = S.durationMin(log);
      // Le serie si mostrano come le hai registrate, nell'unità di allora: il
      // totale in cima è invece convertito, per poter confrontare le sedute.
      var logUnit = S.logUnit(log);
      var detail = Object.keys(log.entries).map(function (exId) {
        var ex = D.getExercise(exId);
        var sets = log.entries[exId].map(function (s) {
          return '<span class="set-chip">' + (s.weight ? esc(s.weight) + ' ' + esc(logUnit) + ' × ' : '') + esc(s.reps) + '</span>';
        }).join('');
        return '<li><span class="hist-ex">' + esc(ex ? ex.name : exId) + '</span>' +
          '<span class="hist-sets">' + sets + '</span></li>';
      }).join('');

      return '<details class="card history-item">' +
        '<summary>' +
          '<span class="pill pill-' + esc(log.workoutId) + '">' + esc(log.workoutId) + '</span>' +
          '<span class="hist-main"><strong>' + esc(fmtDateLong(log.endedAt || log.startedAt)) + '</strong>' +
          '<span class="muted">' + C.format(S.volumeOfLog(log)) + ' ' + unit() + ' · ' + S.setsOfLog(log) + ' serie' +
          (dur ? ' · ' + dur + ' min' : '') + '</span></span>' +
        '</summary>' +
        '<ul class="hist-detail">' + detail + '</ul>' +
        (log.note ? '<p class="hist-note">' + esc(log.note) + '</p>' : '') +
        '<div class="exercise-actions">' +
          '<button class="btn btn-ghost" data-action="edit-log" data-log="' + esc(log.id) + '">Correggi</button>' +
          '<button class="btn btn-danger-ghost" data-action="delete-log" data-log="' + esc(log.id) + '">Elimina sessione</button>' +
        '</div>' +
        '</details>';
    }).join('');

    return '<h2 class="view-title">Storico</h2><p class="view-sub">' + logs.length +
      ' sessioni registrate.</p>' + items;
  }

  /* ---------- vista: progressi ---------- */

  var selectedExercise = null;

  function renderProgress() {
    var logs = S.load().logs;
    if (!logs.length) {
      return '<h2 class="view-title">Progressi</h2>' +
        '<section class="card empty-state"><h3>Servono dei dati</h3>' +
        '<p>I grafici compaiono dopo la prima sessione completata. Dalla seconda in poi cominciano a dire qualcosa.</p></section>';
    }

    var tracked = D.allExercises().filter(function (ex) {
      return logs.some(function (l) { return l.entries[ex.id]; });
    });
    if (!selectedExercise || !tracked.some(function (e) { return e.id === selectedExercise; })) {
      selectedExercise = tracked.length ? tracked[0].id : null;
    }

    var exerciseBlock = '';
    if (selectedExercise) {
      var ex = D.getExercise(selectedExercise);
      var points = S.progressFor(selectedExercise);
      var labels = points.map(function (p) { return fmtDate(p.date); });
      var chart = C.line([
        { name: 'Carico serie migliore', color: 'var(--accent)', points: points.map(function (p) { return p.topWeight || null; }) },
        { name: 'Massimale stimato', color: 'var(--accent-2)', points: points.map(function (p) { return p.oneRM ? Math.round(p.oneRM * 10) / 10 : null; }) }
      ], labels, { unit: unit() });

      var best = points.reduce(function (a, p) { return p.topWeight > a ? p.topWeight : a; }, 0);
      var first = points[0], last = points[points.length - 1];
      var delta = points.length > 1 ? last.topWeight - first.topWeight : 0;

      exerciseBlock = '<section class="card">' +
        '<h3>Andamento per esercizio</h3>' +
        '<select id="exercise-select" aria-label="Scegli l\'esercizio">' +
          tracked.map(function (e) {
            return '<option value="' + esc(e.id) + '"' + (e.id === selectedExercise ? ' selected' : '') + '>' +
              esc(e.name) + '</option>';
          }).join('') +
        '</select>' +
        '<p class="card-sub">' + esc(ex.name) + ' · record ' + C.format(best) + ' ' + unit() +
        (points.length > 1
          ? ' · ' + (delta >= 0 ? '+' : '') + C.format(delta) + ' ' + unit() + ' dalla prima volta'
          : '') + '</p>' +
        chart +
        '<p class="footnote">Il massimale stimato usa la formula di Epley e viene calcolato solo sotto le 12 ripetizioni, dove ha ancora senso.</p>' +
        '</section>';
    }

    var weekly = S.weeklyVolume(12).map(function (w) {
      return { label: fmtDate(w.week), value: w.volume };
    });

    var since = new Date();
    since.setDate(since.getDate() - 28);
    var byGroup = {};
    D.groups.forEach(function (g) { byGroup[g] = 0; });
    logs.filter(function (l) { return new Date(l.endedAt || l.startedAt) >= since; })
      .forEach(function (l) {
        var v = S.volumeByGroup(l);
        Object.keys(v).forEach(function (g) { byGroup[g] = (byGroup[g] || 0) + v[g]; });
      });
    var groupItems = D.groups.map(function (g) { return { label: g, value: byGroup[g] || 0 }; });

    return '<h2 class="view-title">Progressi</h2>' + exerciseBlock +
      '<section class="card">' +
        '<h3>Volume per settimana</h3>' +
        '<p class="card-sub">Ultime 12 settimane. Una curva che sale piano è esattamente quello che serve.</p>' +
        C.bars(weekly, { unit: unit() }) +
      '</section>' +
      '<section class="card">' +
        '<h3>Distribuzione per gruppo muscolare</h3>' +
        '<p class="card-sub">Ultime 4 settimane. Utile per accorgersi se un gruppo sta restando indietro.</p>' +
        C.bars(groupItems, { unit: unit(), color: 'var(--accent-2)' }) +
        '<p class="footnote">Gli esercizi a corpo libero (plank, hollow hold) pesano poco in questo grafico: il volume è calcolato sul carico esterno.</p>' +
      '</section>';
  }

  /* ---------- vista: programma ---------- */

  function renderProgram() {
    var workouts = D.workouts.map(function (w) {
      var rows = w.exercises.map(function (ex) {
        return '<tr>' +
          '<td><strong>' + esc(ex.name) + '</strong>' + shoulderBadge(ex) +
          '<span class="prog-note">' + esc(ex.note) + '</span>' +
          '<span class="prog-alt">Oppure: ' + esc(ex.alts.map(function (a) { return a.name; }).join(' · ')) + '</span></td>' +
          '<td class="nowrap">' + ex.sets + ' × ' + esc(ex.reps) + '</td>' +
          '<td class="nowrap">' + fmtRest(ex.restSec) + '</td>' +
          '</tr>';
      }).join('');

      return '<section class="card">' +
        '<header class="prog-head"><span class="pill pill-' + esc(w.id) + '">' + esc(w.id) + '</span>' +
        '<div><h3>' + esc(w.name) + '</h3><p class="card-sub">' + esc(w.focus) + '</p></div></header>' +
        '<div class="table-scroll"><table class="program">' +
        '<thead><tr><th>Esercizio</th><th>Serie</th><th>Rec.</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
        '</section>';
    }).join('');

    return '<h2 class="view-title">Il programma</h2>' +
      '<p class="view-sub">Full body A/B/C, tre sedute a settimana con almeno un giorno di stacco fra una e l\'altra ' +
      '(per esempio lunedì, mercoledì, venerdì). Ogni seduta tocca tutto il corpo: se salti un giorno non perdi un gruppo muscolare.</p>' +

      '<section class="card callout">' +
        '<h3>Spalla destra</h3>' +
        '<p>La scheda è costruita attorno alla cuffia operata. Le spinte partono dai manubri e dai cavi, ' +
        'il lento avanti si fa a presa neutra e senza scendere sotto il mento, le alzate laterali si fermano ' +
        'all\'altezza della spalla, e non compare nulla dietro la nuca. In ogni riscaldamento c\'è lavoro di ' +
        'cuffia, più face pull o extrarotazioni dentro due sedute su tre.</p>' +
        '<p>Il bilanciere resta solo dove serve davvero (squat e hip thrust) e in entrambi i casi c\'è ' +
        'un\'alternativa a un tap di distanza. Gli esercizi segnati <span class="badge badge-warn">occhio alla spalla</span> ' +
        'sono quelli da valutare seduta per seduta.</p>' +
        '<p class="muted">Resta una scheda generalista: se il fisioterapista che ti ha seguito dopo ' +
        'l\'operazione ti ha dato indicazioni diverse, valgono le sue.</p>' +
      '</section>' +

      '<section class="card">' +
        '<h3>Riscaldamento</h3>' +
        '<p class="card-sub">Uguale per tutte e tre le sedute, 5-8 minuti.</p>' +
        '<ul class="plain">' + D.warmup.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' +
      '</section>' +

      workouts +

      '<section class="card">' +
        '<h3>Defaticamento</h3>' +
        '<p class="card-sub">Uguale per tutte e tre le sedute.</p>' +
        '<ul class="plain">' + D.cooldown.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
      '</section>' +

      '<section class="card">' +
        '<h3>Come aumentare i carichi</h3>' +
        '<ul class="plain">' + D.progression.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      '</section>';
  }

  /* ---------- vista: dati ---------- */

  function renderData() {
    var state = S.load();
    var u = S.unit();
    return '<h2 class="view-title">Dati</h2>' +
      '<section class="card">' +
        '<h3>Unità di misura</h3>' +
        '<p>Quella in cui inserisci i carichi durante la seduta. Ogni sessione conserva ' +
        'l\'unità con cui è stata registrata, quindi cambiare qui non falsa lo storico: ' +
        'le sedute vecchie restano come le hai scritte e i totali vengono convertiti.</p>' +
        '<div class="variant" role="group" aria-label="Unità di misura">' +
          '<button class="variant-opt' + (u === 'kg' ? ' is-on' : '') + '" data-action="set-unit" ' +
            'data-unit="kg" aria-pressed="' + (u === 'kg' ? 'true' : 'false') + '">Chilogrammi (kg)</button>' +
          '<button class="variant-opt' + (u === 'lb' ? ' is-on' : '') + '" data-action="set-unit" ' +
            'data-unit="lb" aria-pressed="' + (u === 'lb' ? 'true' : 'false') + '">Libbre (lb)</button>' +
        '</div>' +
        (state.active ? '<p class="footnote">C\'è una sessione in corso: potrai cambiare unità dopo averla chiusa.</p>' : '') +
      '</section>' +
      '<section class="card">' +
        '<h3>Dove finiscono i tuoi allenamenti</h3>' +
        '<p>Tutto è salvato dentro questo browser, su questo dispositivo. Non esiste un server e non serve ' +
        'un account, ma vuol dire anche che svuotare i dati del browser cancella lo storico. ' +
        'Esporta il backup ogni tanto, e usalo per passare i dati dal telefono al computer.</p>' +
        '<p class="muted">' + state.logs.length + ' sessioni salvate.</p>' +
        '<div class="exercise-actions">' +
          '<button class="btn btn-primary" data-action="export">Esporta backup</button>' +
          '<label class="btn btn-ghost">Importa backup<input type="file" id="import-file" accept="application/json,.json" hidden></label>' +
        '</div>' +
      '</section>' +
      '<section class="card">' +
        '<h3>Ricomincia da zero</h3>' +
        '<p>Cancella tutte le sessioni registrate. Il programma resta invariato.</p>' +
        '<button class="btn btn-danger-ghost" data-action="reset">Cancella tutto lo storico</button>' +
      '</section>';
  }

  /* ---------- routing ---------- */

  var ROUTES = {
    '#/': { title: 'Oggi', render: renderDashboard },
    '#/allenamento': { title: 'Allenati', render: renderTraining },
    '#/storico': { title: 'Storico', render: renderHistory },
    '#/progressi': { title: 'Progressi', render: renderProgress },
    '#/programma': { title: 'Programma', render: renderProgram },
    '#/dati': { title: 'Dati', render: renderData }
  };

  function currentRoute() {
    var hash = global.location.hash || '#/';
    return ROUTES[hash] ? hash : '#/';
  }

  function render() {
    var hash = currentRoute();
    view.innerHTML = ROUTES[hash].render();

    Array.prototype.forEach.call(document.querySelectorAll('.nav a'), function (a) {
      var active = a.getAttribute('href') === hash;
      a.classList.toggle('is-active', active);
      if (active) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
    });

    var active = S.load().active;
    document.getElementById('nav-training').classList.toggle('has-dot', !!active);

    setupTimer();
  }

  function setupTimer() {
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
    var el = document.getElementById('elapsed');
    if (!el) return;
    var active = S.load().active;
    if (!active) return;
    var tick = function () {
      var node = document.getElementById('elapsed');
      if (!node) { clearInterval(timerHandle); timerHandle = null; return; }
      node.textContent = fmtClock(Date.now() - new Date(active.startedAt).getTime());
    };
    tick();
    timerHandle = setInterval(tick, 1000);
  }

  /* ---------- eventi ---------- */

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    var state = S.load();

    if (action === 'start') {
      S.startSession(btn.getAttribute('data-workout'));
      render();
      return;
    }

    if (action === 'toggle-set') {
      var exId = btn.getAttribute('data-ex');
      var idx = Number(btn.getAttribute('data-set'));
      var row = state.active.entries[exId][idx];
      row.done = !row.done;

      // Segnare una serie completata senza ripetizioni non ha senso: se il
      // campo è vuoto lo riempiamo col valore basso del range previsto.
      if (row.done && (row.reps === '' || row.reps === null)) {
        var target = D.getExercise(exId);
        var lowest = parseInt(String(target.reps).match(/\d+/), 10);
        if (!isNaN(lowest)) row.reps = lowest;
        var repsInput = view.querySelector('input[data-field="reps"][data-ex="' + exId + '"][data-set="' + idx + '"]');
        if (repsInput) repsInput.value = row.reps;
      }
      S.save();

      btn.setAttribute('aria-pressed', row.done ? 'true' : 'false');
      btn.closest('tr').classList.toggle('is-done', row.done);
      var rows = state.active.entries[exId];
      var done = rows.filter(function (r) { return r.done; }).length;
      var counter = view.querySelector('[data-count="' + exId + '"]');
      if (counter) counter.textContent = done + '/' + rows.length;
      var card = view.querySelector('[data-ex-card="' + exId + '"]');
      if (card) card.classList.toggle('is-complete', done === rows.length);
      return;
    }

    if (action === 'add-set') {
      var addId = btn.getAttribute('data-ex');
      var list = state.active.entries[addId];
      var lastRow = list[list.length - 1];
      list.push({ weight: lastRow ? lastRow.weight : '', reps: lastRow ? lastRow.reps : '', done: false });
      S.save();
      render();
      return;
    }

    if (action === 'remove-set') {
      var remId = btn.getAttribute('data-ex');
      var remList = state.active.entries[remId];
      if (remList.length > 1) remList.pop();
      S.save();
      render();
      return;
    }

    if (action === 'pick-variant') {
      S.swapSlot(btn.getAttribute('data-primary'), btn.getAttribute('data-variant'));
      render();
      return;
    }

    if (action === 'finish') {
      var logged = Object.keys(state.active.entries).some(function (id) {
        return state.active.entries[id].some(function (r) { return r.done; });
      });
      if (!logged) {
        global.alert('Non hai completato nessuna serie. Spunta almeno una serie oppure annulla la sessione.');
        return;
      }
      S.finishSession();
      global.location.hash = '#/storico';
      render();
      return;
    }

    if (action === 'discard') {
      if (global.confirm('Vuoi annullare la sessione in corso? I dati inseriti andranno persi.')) {
        S.discardSession();
        render();
      }
      return;
    }

    if (action === 'edit-log') {
      startEditing(btn.getAttribute('data-log'));
      render();
      global.scrollTo(0, 0);
      return;
    }

    if (action === 'edit-variant') {
      var slotId = btn.getAttribute('data-primary');
      var target = btn.getAttribute('data-variant');
      var previous = editDraft.variant[slotId];
      editDraft.variant[slotId] = target;
      if (!editDraft.entries[target]) {
        // Qui si sta correggendo l'etichetta di un lavoro già svolto: le serie
        // registrate sono quelle giuste, cambia solo a quale movimento vanno
        // attribuite. Si portano dietro, invece di far ridigitare tutto.
        var carried = editDraft.entries[previous];
        editDraft.entries[target] = carried && carried.length
          ? carried.map(function (r) { return { weight: r.weight, reps: r.reps }; })
          : emptyRows(D.getExercise(slotId).sets);
      }
      render();
      return;
    }

    if (action === 'edit-add-set') {
      var addTo = editDraft.entries[btn.getAttribute('data-ex')];
      var lastEdit = addTo[addTo.length - 1];
      addTo.push({
        weight: lastEdit ? lastEdit.weight : '',
        reps: lastEdit ? lastEdit.reps : ''
      });
      render();
      return;
    }

    if (action === 'edit-remove-set') {
      var removeFrom = editDraft.entries[btn.getAttribute('data-ex')];
      if (removeFrom.length) removeFrom.pop();
      render();
      return;
    }

    if (action === 'edit-unit') {
      editDraft.unit = btn.getAttribute('data-unit');
      render();
      return;
    }

    if (action === 'save-edit') {
      saveEditing();
      return;
    }

    if (action === 'cancel-edit') {
      editDraft = null;
      render();
      return;
    }

    if (action === 'delete-log') {
      if (global.confirm('Eliminare questa sessione dallo storico?')) {
        S.deleteLog(btn.getAttribute('data-log'));
        render();
      }
      return;
    }

    if (action === 'set-unit') {
      // A seduta aperta i carichi già inseriti sono nell'unità di partenza:
      // cambiarla a metà strada renderebbe ambigui i numeri sullo schermo.
      if (state.active) {
        global.alert('Chiudi prima la sessione in corso: cambiare unità adesso renderebbe ambigui i carichi già inseriti.');
        return;
      }
      S.setUnit(btn.getAttribute('data-unit'));
      render();
      return;
    }

    if (action === 'export') {
      exportBackup();
      return;
    }

    if (action === 'reset') {
      if (global.confirm('Cancellare tutto lo storico? L\'operazione non si può annullare.')) {
        S.reset();
        render();
      }
      return;
    }
  }

  function onInput(e) {
    var target = e.target;

    // L'editor di una sessione archiviata lavora sulla copia, non su ciò che
    // è già salvato: niente scritture finché non premi Salva.
    if (target.classList.contains('edit-input')) {
      if (!editDraft) return;
      var draftRow = editDraft.entries[target.getAttribute('data-ex')][Number(target.getAttribute('data-set'))];
      draftRow[target.getAttribute('data-field')] = target.value;
      return;
    }

    if (target.id === 'edit-note') {
      if (editDraft) editDraft.note = target.value;
      return;
    }

    if (target.classList.contains('set-input')) {
      var state = S.load();
      if (!state.active) return;
      var row = state.active.entries[target.getAttribute('data-ex')][Number(target.getAttribute('data-set'))];
      row[target.getAttribute('data-field')] = target.value;
      S.save();
      return;
    }

    if (target.id === 'session-note') {
      var s = S.load();
      if (!s.active) return;
      s.active.note = target.value;
      S.save();
      return;
    }
  }

  function onChange(e) {
    if (e.target.id === 'exercise-select') {
      selectedExercise = e.target.value;
      render();
      return;
    }
    if (e.target.id === 'import-file' && e.target.files && e.target.files[0]) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          S.importJSON(String(reader.result));
          global.alert('Backup importato.');
          render();
        } catch (err) {
          global.alert('Importazione fallita: ' + err.message);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  }

  function exportBackup() {
    var blob = new Blob([S.exportJSON()], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'gym-rat-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---------- avvio ---------- */

  function init() {
    view = document.getElementById('view');
    view.addEventListener('click', onClick);
    view.addEventListener('input', onInput);
    view.addEventListener('change', onChange);
    // Cambiare pagina riporta in cima; un ridisegno interno (serie aggiunta,
    // esercizio sostituito) invece deve lasciare la vista dov'è.
    global.addEventListener('hashchange', function () {
      render();
      global.scrollTo(0, 0);
    });
    if (!global.location.hash) global.location.hash = '#/';
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
