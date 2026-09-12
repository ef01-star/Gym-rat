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
| **Storico** | Ogni allenamento concluso, serie per serie, correggibile a posteriori |
| **Progressi** | Andamento dei carichi per esercizio, volume per settimana e per gruppo muscolare |
| **Programma** | La scheda completa con note di esecuzione e alternative |

Durante la sessione ogni esercizio arriva già precompilato con i carichi
dell'ultima volta: se ripeti gli stessi numeri devi solo spuntare la serie.
Puoi aggiungere o togliere serie al volo. Se chiudi il browser a metà
allenamento, la sessione resta aperta e la ritrovi dov'eri.

Ogni slot della scheda elenca gli attrezzi con cui puoi svolgerlo, tutti
visibili insieme con quello in corso evidenziato: si vede a colpo d'occhio se
stai facendo il goblet squat, la leg press o l'hack squat. Ogni attrezzo ha uno
storico separato — la shoulder press a macchina non finisce nei progressi del
lento con manubri, e i loro carichi non sono confrontabili — e la seduta
successiva riparte da quello che hai usato l'ultima volta.

Una serie spuntata con 0 ripetizioni vale "saltato" e non viene archiviata.

Una sessione già archiviata si corregge da **Storico → Correggi**: carichi,
ripetizioni, note, unità di misura e quale delle due varianti hai davvero
svolto. Cambiando variante le serie si spostano sul movimento giusto senza
doverle ridigitare, e finché non premi Salva lo storico resta com'era.

## Il programma

Full body A/B/C, tre sedute a settimana con almeno un giorno di stacco fra una e
l'altra (per esempio lunedì, mercoledì, venerdì). Ogni seduta tocca tutto il
corpo, quindi saltare un giorno non significa perdere un gruppo muscolare.

- **A** — spinta orizzontale e quadricipiti
- **B** — catena posteriore e tirata
- **C** — gambe bilaterale e spinta verticale

Le tre sedute hanno lo stesso peso: 22-23 serie l'una, circa un'ora. Il lavoro
di cuffia sta in apertura, dove viene fatto davvero, e non in fondo.

Ogni seduta si apre con lo stesso riscaldamento e si chiude con 10-15 minuti di
camminata sul tapis roulant.

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

Sempre da **Dati** si sceglie l'unità di misura, chili o libbre. Ogni sessione
conserva l'unità con cui è stata registrata, quindi cambiarla non riscrive il
passato: lo storico mostra i carichi come li hai inseriti, mentre volumi,
grafici e carichi precompilati vengono convertiti nell'unità in uso.

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
