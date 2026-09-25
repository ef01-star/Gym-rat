/* Gym-rat — Grafici
 *
 * SVG generato a mano: nessuna libreria, nessuna richiesta di rete, funziona
 * anche aprendo il file in locale. I colori arrivano dalle variabili CSS,
 * quindi i grafici seguono il tema chiaro/scuro senza codice aggiuntivo.
 */
(function (global) {
  'use strict';

  var W = 640, H = 260;
  var PAD = { top: 18, right: 18, bottom: 34, left: 46 };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function fmt(n) {
    if (n >= 10000) return Math.round(n / 1000) + 'k';
    if (n >= 1000) {
      var k = n / 1000;
      return (k % 1 === 0 ? String(k) : k.toFixed(1).replace('.', ',')) + 'k';
    }
    if (n % 1 === 0) return String(n);
    return n.toFixed(1).replace('.', ',');
  }

  // Massimo dell'asse scelto in modo che diviso 4 dia una tacca "tonda":
  // meglio 0/5/10/15/20 che 0/6,3/12,5/18,8/25. La scala è fitta apposta,
  // altrimenti un fondo scala troppo generoso schiaccia le barre in basso.
  function niceMax(v) {
    if (v <= 0) return 10;
    var LADDER = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    var raw = v / 4;
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step = LADDER[LADDER.length - 1];
    for (var i = 0; i < LADDER.length; i++) {
      if (norm <= LADDER[i]) { step = LADDER[i]; break; }
    }
    return step * mag * 4;
  }

  function empty(message) {
    return '<p class="chart-empty">' + esc(message) + '</p>';
  }

  function frame(inner) {
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" ' +
      'preserveAspectRatio="xMidYMid meet" role="img">' + inner + '</svg>';
  }

  /* mode: 'point' -> etichette allineate ai punti della spezzata
   *       'band'  -> etichette centrate sulla colonna dell'istogramma */
  function axes(max, xLabels, mode) {
    var plotW = W - PAD.left - PAD.right;
    var plotH = H - PAD.top - PAD.bottom;
    var out = '';

    for (var i = 0; i <= 4; i++) {
      var y = PAD.top + plotH * (i / 4);
      var value = max * (1 - i / 4);
      out += '<line class="grid" x1="' + PAD.left + '" y1="' + y.toFixed(1) +
        '" x2="' + (W - PAD.right) + '" y2="' + y.toFixed(1) + '"/>';
      out += '<text class="tick" x="' + (PAD.left - 8) + '" y="' + (y + 4).toFixed(1) +
        '" text-anchor="end">' + esc(fmt(value)) + '</text>';
    }

    // Con molti punti si stampa un'etichetta ogni n per non impastare l'asse.
    // Il conteggio parte da destra: il dato più recente è sempre etichettato e
    // non finisce mai appiccicato al precedente.
    var stepLabel = Math.ceil(xLabels.length / 7) || 1;
    var last = xLabels.length - 1;

    xLabels.forEach(function (label, idx) {
      if ((last - idx) % stepLabel !== 0) return;
      var x;
      if (mode === 'band') {
        x = PAD.left + (plotW / xLabels.length) * (idx + 0.5);
      } else if (xLabels.length === 1) {
        x = PAD.left + plotW / 2;
      } else {
        x = PAD.left + plotW * (idx / (xLabels.length - 1));
      }
      out += '<text class="tick" x="' + x.toFixed(1) + '" y="' + (H - PAD.bottom + 20) +
        '" text-anchor="middle">' + esc(label) + '</text>';
    });

    return out;
  }

  /* series: [{ name, color, points: [number|null] }], xLabels: [string] */
  function line(series, xLabels, opts) {
    opts = opts || {};
    var flat = [];
    series.forEach(function (s) {
      s.points.forEach(function (p) { if (p !== null && !isNaN(p)) flat.push(p); });
    });
    if (!flat.length) return empty(opts.emptyMessage || 'Nessun dato ancora.');

    var max = niceMax(Math.max.apply(null, flat) * 1.05);
    var plotW = W - PAD.left - PAD.right;
    var plotH = H - PAD.top - PAD.bottom;
    var n = xLabels.length;

    function px(i) { return n === 1 ? PAD.left + plotW / 2 : PAD.left + plotW * (i / (n - 1)); }
    function py(v) { return PAD.top + plotH * (1 - v / max); }

    var body = axes(max, xLabels);

    series.forEach(function (s) {
      var d = '';
      var dots = '';
      var started = false;
      s.points.forEach(function (v, i) {
        if (v === null || isNaN(v)) return;
        var x = px(i).toFixed(1), y = py(v).toFixed(1);
        d += (started ? ' L' : 'M') + x + ' ' + y;
        started = true;
        dots += '<circle class="dot" cx="' + x + '" cy="' + y + '" r="3.5" style="fill:' + s.color + '"><title>' +
          esc(xLabels[i] + ' · ' + fmt(v) + (opts.unit ? ' ' + opts.unit : '')) + '</title></circle>';
      });
      if (d) {
        body += '<path class="serie" d="' + d + '" fill="none" style="stroke:' + s.color +
          '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' + dots;
      }
    });

    var legend = '';
    if (series.length > 1) {
      legend = '<div class="legend">' + series.map(function (s) {
        return '<span class="legend-item"><i style="background:' + s.color + '"></i>' + esc(s.name) + '</span>';
      }).join('') + '</div>';
    }

    return frame(body) + legend;
  }

  /* items: [{ label, value }] */
  function bars(items, opts) {
    opts = opts || {};
    var values = items.map(function (i) { return i.value; });
    if (!values.length || Math.max.apply(null, values) <= 0) {
      return empty(opts.emptyMessage || 'Nessun dato ancora.');
    }

    var max = niceMax(Math.max.apply(null, values) * 1.05);
    var plotW = W - PAD.left - PAD.right;
    var plotH = H - PAD.top - PAD.bottom;
    var slot = plotW / items.length;
    var barW = Math.min(slot * 0.62, 54);

    var body = axes(max, items.map(function (i) { return i.label; }), 'band');

    items.forEach(function (item, idx) {
      var h = item.value <= 0 ? 0 : plotH * (item.value / max);
      var x = PAD.left + slot * idx + (slot - barW) / 2;
      var y = PAD.top + plotH - h;
      body += '<rect class="bar" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
        '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) +
        '" rx="4" style="fill:' + (opts.color || 'var(--accent)') + '"><title>' +
        esc(item.label + ' · ' + fmt(item.value) + (opts.unit ? ' ' + opts.unit : '')) +
        '</title></rect>';
    });

    return frame(body);
  }

  global.GymCharts = { line: line, bars: bars, format: fmt };
})(window);
