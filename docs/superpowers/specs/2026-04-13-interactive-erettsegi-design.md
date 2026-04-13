# Magyar Erettsegi Gyakorlo — Interaktiv Funkciok

**Datum:** 2026-04-13
**Statusz:** Jovahagyva

## Osszefoglalas

A jelenlegi statikus erettsegi gyakorlo oldalt bovitjuk negy fo funkcioval:
1. Interaktiv feladatmegoldas (1:1 az eredeti erettsegi feladatsorokkal)
2. Visszaszamlalo idomero
3. LocalStorage-alapu pontszamkovetes
4. Kereses es szures (ev, idoszak, feladattipus, szabad szoveges)

## Architektura

**Megkozelites:** Modularis vanilla JS, ES modules, JSON adatfajlok. Nincs framework, nincs build tool.

### Fajlstruktura

```
magyar-erettsegi/
├── index.html
├── style.css
├── js/
│   ├── app.js          # belepesi pont, inicializalas
│   ├── router.js       # navigacio, szekciok kezelese
│   ├── quiz-engine.js  # feladatok renderelese, valaszkezeles
│   ├── timer.js        # visszaszamlalo
│   ├── scoring.js      # pontozas + LocalStorage mentes/olvasas
│   ├── search.js       # kereses es szures
│   └── data-loader.js  # JSON fajlok betoltese
├── data/
│   ├── 2022-maj.json
│   ├── 2022-okt.json
│   ├── 2023-maj.json
│   ├── 2023-okt.json
│   ├── 2024-maj.json
│   ├── 2024-okt.json
│   └── 2025-maj.json
```

## Adatmodell

### JSON feladatsor felépitese

Minden JSON fajl egy vizsgaidoszakot tartalmaz harom szekcioval.

```json
{
  "id": "2024-maj",
  "year": 2024,
  "session": "Majus",
  "date": "2024. majus 6.",
  "sections": {
    "szovegertes": {
      "timeLimit": 60,
      "maxPoints": 40,
      "sourceText": "A szovegertesi szoveg teljes tartalma...",
      "tasks": [...]
    },
    "muveleti": {
      "timeLimit": 40,
      "maxPoints": 20,
      "tasks": [...]
    },
    "szovegalkotas": {
      "timeLimit": 90,
      "maxPoints": 40,
      "tasks": [...]
    }
  }
}
```

### Feladattipusok

| Tipus | Leiras | UI elem |
|-------|--------|---------|
| `multiple-choice` | Feleletvalasztos (A/B/C/D) | Radiogombok |
| `fill-in` | Szoveg beirasa | Szovegmezo, case-insensitive, tobb elfogadhato valasz |
| `matching` | Parositas | Legordulo menuk (bal: fogalom, jobb: valaszto) |
| `table-fill` | Tablazat kitoltese | Tablazat kitoltheto cellakkal |
| `short-answer` | Rovid szoveges valasz | Szovegmezo + "Mutasd a mintavalaszt" gomb |
| `true-false` | Igaz/hamis | Ket gomb |
| `ordering` | Sorba rendezes | Szamozott lista, fel/le gombokkal |
| `essay` | Szovegalkotas | Textarea + szoszamlalo + rubrika onertekeleshez |

### Feladat objektumok

**multiple-choice:**
```json
{
  "id": "1a",
  "type": "multiple-choice",
  "question": "Mi a szoveg mufaja?",
  "options": ["publicisztika", "essze", "novella", "tanulmany"],
  "correct": 0,
  "points": 2
}
```

**fill-in:**
```json
{
  "id": "1b",
  "type": "fill-in",
  "question": "Egeszitsd ki a mondatot a szoveg alapjan: ___",
  "correct": ["elfogadhato valasz 1", "elfogadhato valasz 2"],
  "points": 2
}
```

**matching:**
```json
{
  "id": "2",
  "type": "matching",
  "question": "Parositsd a fogalmakat a definiciokkal!",
  "pairs": [
    {"left": "metafora", "right": "rejtett hasonlat"},
    {"left": "allegoria", "right": "kiterjesztett jelkep"}
  ],
  "points": 4
}
```

**table-fill:**
```json
{
  "id": "3",
  "type": "table-fill",
  "question": "Toltsd ki a tablazatot!",
  "headers": ["Szerzo", "Mu", "Korszak"],
  "rows": [
    {"given": {"Szerzo": "Arany Janos"}, "answer": {"Mu": "Toldi", "Korszak": "romantika"}}
  ],
  "points": 4
}
```

**short-answer:**
```json
{
  "id": "4",
  "type": "short-answer",
  "question": "Fogalmazd meg egy mondatban a szoveg fo gondolatat!",
  "sampleAnswer": "A mintavalasz szovege...",
  "points": 3
}
```

**true-false:**
```json
{
  "id": "5",
  "type": "true-false",
  "question": "A szoveg szerzoje ellenzi a digitalizaciot.",
  "correct": false,
  "points": 1
}
```

**ordering:**
```json
{
  "id": "6",
  "type": "ordering",
  "question": "Rakd idobeli sorrendbe az esemenyeket!",
  "items": ["masodik", "elso", "harmadik"],
  "correctOrder": [1, 0, 2],
  "points": 3
}
```

**essay:**
```json
{
  "id": "erveles",
  "type": "essay",
  "prompt": "Fejtsd ki velemenyedet a kovetkezo kerdesben...",
  "minWords": 250,
  "maxWords": 350,
  "sampleAnswer": "Mintamegoldas szovege...",
  "rubric": [
    {
      "criterion": "Tartalom, szerkezet",
      "maxPoints": 15,
      "levels": ["0-5: gyenge", "6-10: kozepes", "11-15: jo"]
    },
    {
      "criterion": "Nyelvhelyesseg",
      "maxPoints": 10,
      "levels": ["0-3: gyenge", "4-7: kozepes", "8-10: jo"]
    }
  ]
}
```

## Quiz Engine

### Feladat megoldasi folyamat

1. Felhasznalo valaszt feladatsort (pl. "2024 Majus — Szovegertes")
2. Megjelenik a forrasszoveg + az elso feladat osztott nezetben
3. Felhasznalo megoldja, valaszthat:
   - "Ellenorzes" gomb: azonnali visszajelzes (zold/piros + helyes valasz)
   - "Kovetkezo" gomb: tovabblep ellenorzes nelkul, vegen osszesites
4. Utolso feladat utan: Osszesito oldal (pontszam, helyes/helytelen feladatok attekintese)

### UI elrendezes — Osztott nezet

**Desktop (768px felett):**
- Bal oldal: forrasszoveg (gorgeheto, fix szelesseg ~45%)
- Jobb oldal: aktualis feladat (~55%)
- Felul: fejlec (feladatsor neve + idozito) + feladatszam sav (1, 2, 3...)
- Alul: navigacios gombok (Elozo / Kovetkezo / Ellenorzes / Befejezes)

**Mobil (768px alatt):**
- Egymás alatti elrendezes
- Forrasszoveg osszecsukhato panel
- Feladat alatta teljes szelessegben

### Feladatszam sav

- Feluletszamozott gombok: zold = megoldva, kek = aktualis, szurke = meg nem latogatott
- Szabadon ugralhat feladatok kozott kattintassal

### Ellenorzesi modok

A felhasznalo a feladatsor indítasakor valasztja ki:
- **Feladatonkenti ellenorzes:** minden feladatnal megjelenik az "Ellenorzes" gomb
- **Vegen osszesites:** csak "Kovetkezo" gomb, a vegen kap teljes osszesitest

## Idomero

### Mukodes

- Feladatsor inditasakor elindul a visszaszamlalo
- Idokorlatok: szovegertes 60 perc, muveleti 40 perc, szovegalkotas 90 perc
- Jobb felso sarokban, mindig lathato (sticky)
- Formatum: `45:23` (perc:masodperc)

### Szinvaltozas

- Zold: tobb mint 25% van hatra
- Sarga: 25% vagy kevesebb van hatra
- Piros: 5 perc vagy kevesebb
- Villogo piros: 1 perc vagy kevesebb

### Figyelmeztetesek

- 10 perc van hatra: sarga felugro ertesites
- 5 perc van hatra: piros felugro ertesites
- Lejart: "Az ido lejart!" uzenet, de folytathato (az osszesitoben jelzi a tullepest)

### Szunet

- "Szunet" gomb megallitja az idot
- Szunet alatt a feladatok eltunnek (ne lehessen csalni)
- "Folytatas" gomb ujrainditja

## Pontszamkovetes

### LocalStorage adatstruktura

```json
{
  "results": [
    {
      "examId": "2024-maj",
      "section": "szovegertes",
      "date": "2026-04-13T14:30:00",
      "score": 34,
      "maxScore": 40,
      "percentage": 85,
      "timeUsed": 2847,
      "timeLimit": 3600,
      "overTime": false,
      "answers": {
        "1a": {"given": 0, "correct": true, "points": 2},
        "1b": {"given": "valasz", "correct": false, "points": 0}
      }
    }
  ]
}
```

### Eredmenyeim szekció (uj navigacios elem)

- Tablazat az osszes korabbi kittoltesrol: datum, feladatsor, szekcio, pontszam, ido
- Feladatsoronkent: legjobb eredmeny kiemelve
- Szekcionkent osszesites: atlagos szovegertes/muveleti/szovegalkotas pontszam
- Korabbi kitoltes reszletei ujra megtekinthetok (melyik feladatnal mit valaszolt)
- "Eredmenyek torlese" gomb

### Fooldal dinamikus statisztikak

- Ha van korabbi eredmeny: "Kitoltott feladatsorok: 3/7", "Atlagos pontszam: 78%", stb.
- Ha nincs eredmeny: az eredeti statikus szamok jelennek meg (7 feladatsor, 3 feladattipus, 150 pont)

## Kereses es szures

### Elhelyezes

Minden szekcio (szovegertes, muveleti, szovegalkotas, teljes feladatsorok) tetején szurosav.

### Szurok

- **Ev:** gombok (2022, 2023, 2024, 2025) — tobbet is ki lehet valasztani
- **Idoszak:** Majus / Oktober gombok — tobbet is ki lehet valasztani
- **Feladattipus** (csak "Teljes feladatsorok" nezetben): szovegertes / muveleti / szovegalkotas

### Szabad szoveges kereses

- Keresomezo a szurok mellett
- Keres a feladatok szovegeben, kerdeseiben, forrasszovegben
- Talalatok kiemelese (highlight) a listaban
- Minimum 3 karakter utan indul
- Pelda: "metafora" → megmutatja az osszes feladatsort ahol metafora elofordul

### Viselkedes

- Azonnal szur (nem kell "Kereses" gombot nyomni)
- "Osszes torlese" gomb a szurok visszaallitasara
- Szurok kombinalhatok (pl. 2024 + Majus + "allegoria")
- Ha nincs talalat: "Nincs talalat a megadott szurokkel" uzenet

## Szovegalkotas interaktiv megoldas

### Erveles es muertelmezo elemzes

- Textarea szovegszerkeszto
- Elo szoszamlalo (min/max jelzessel: 250-350 szo ervelesnel, 300-400 muertelmezonel)
- Befejezés utan: mintamegoldas megjelenítese osszehasonlitasra
- Onertékelesi rubrika: a felhasznalo kitolti a pontozasi szempontok szerint (legordulo ertekek)
- Az onertekeles eredmenye beleszamit a pontszamba

## Technikai megjegyzesek

- Minden modul ES module (`export`/`import`)
- `index.html`-ben `<script type="module" src="js/app.js">`
- JSON adatok `fetch()`-csel toltodnek be
- Nincs szerver-oldali komponens, minden kliens-oldalon fut
- LocalStorage kulcs: `magyar-erettsegi-results`
- Bovitheto: ujabb feladatsorok hozzaadasa csak uj JSON fajl letrehozasat igényli
