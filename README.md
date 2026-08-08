# Gym-rat

Dashboard per la gestione degli allenamenti in palestra: una scheda full body
A/B/C su tre sedute settimanali, il registro delle serie da compilare mentre ti
alleni e i grafici per vedere se i carichi stanno salendo.

Nessun framework, nessuna dipendenza, nessun passaggio di build: sono file
statici che si aprono e basta.

## Come si usa

Apri `index.html` nel browser. Funziona anche facendo doppio clic sul file, ma
per usarla dal telefono conviene pubblicarla:

- **GitHub Pages** — nelle impostazioni del repository, sezione *Pages*, scegli
  il branch e la cartella radice. Dopo un minuto la dashboard è raggiungibile da
  qualsiasi dispositivo.
- **In locale** — `python3 -m http.server` dentro la cartella del progetto, poi
  apri `http://localhost:8000` dal computer o dal telefono sulla stessa rete.

Dal telefono, "Aggiungi a schermata Home" la fa comportare come un'app.

## Le cinque sezioni

| Sezione | A cosa serve |
| --- | --- |
| **Oggi** | Quale sessione tocca, sessioni della settimana, volume, durata media |
| **Allenati** | La sessione dal vivo: serie, carichi, ripetizioni, cronometro |
| **Storico** | Ogni allenamento concluso, serie per serie |
| **Progressi** | Andamento dei carichi per esercizio, volume per settimana e per gruppo muscolare |
| **Programma** | La scheda completa con note di esecuzione e alternative |

Durante la sessione ogni esercizio arriva già precompilato con i carichi
dell'ultima volta: se ripeti gli stessi numeri devi solo spuntare la serie.
Puoi aggiungere o togliere serie al volo e sostituire un esercizio con la sua
alternativa con un tocco. Se chiudi il browser a metà allenamento, la sessione
resta aperta e la ritrovi dov'eri.

## Il programma

Full body A/B/C, tre sedute a settimana con almeno un giorno di stacco fra una e
l'altra (per esempio lunedì, mercoledì, venerdì). Ogni seduta tocca tutto il
corpo, quindi saltare un giorno non significa perdere un gruppo muscolare.

- **A** — spinta orizzontale e quadricipiti
- **B** — catena posteriore e tirata
- **C** — gambe bilaterale e spinta verticale

La selezione degli esercizi tiene conto di una spalla destra operata alla cuffia
dei rotatori e al sottospinato: le spinte partono da manubri e cavi, il lento
avanti si esegue a presa neutra e senza scendere sotto il mento, le alzate
laterali si fermano all'altezza della spalla e non compare nulla dietro la nuca.
Il bilanciere resta solo su squat e hip thrust, entrambi con un'alternativa
pronta. In ogni riscaldamento c'è lavoro di cuffia, più face pull o
extrarotazioni dentro due sedute su tre.

Gli esercizi da valutare seduta per seduta sono marcati *occhio alla spalla*
nella scheda. Resta comunque una scheda generalista: eventuali indicazioni del
fisioterapista che ha seguito il post-operatorio vengono prima.

La progressione è a doppia progressione: stesso carico finché non chiudi tutte
le serie al limite alto del range, poi +2,5-5% e si riparte dal limite basso.

## I dati

Tutto è salvato in `localStorage`, sul dispositivo che stai usando. Non c'è un
server e non serve un account, ma vuol dire anche che:

- svuotare i dati del browser cancella lo storico;
- telefono e computer hanno archivi separati.

Dalla sezione **Dati** si esporta un backup JSON e lo si reimporta altrove: è
anche il modo per allineare telefono e computer.

## Struttura

```
index.html          markup e navigazione
assets/styles.css   stile, temi chiaro e scuro, layout responsive
js/data.js          il programma: sedute, esercizi, note, alternative
js/store.js         localStorage, statistiche, export e import
js/charts.js        grafici SVG generati a mano, senza librerie
js/app.js           viste, routing e gestione della sessione dal vivo
```

Per cambiare la scheda basta modificare `js/data.js`: aggiungere un esercizio
significa aggiungere un oggetto all'array della sessione, con `id` univoco,
serie, ripetizioni, recupero e alternativa. Il resto dell'app si adegua da solo,
grafici compresi.
