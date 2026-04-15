# Érettségi Gyakorló — Középszint

Magyar nyelv és irodalom + történelem **középszintű érettségi** gyakorló
webalkalmazás. 2022–2025 közötti hivatalos feladatsorokkal, azonnali
ellenőrzéssel és hiba-követéssel.

## Funkciók

- **14 feladatsor** (7 magyar + 7 történelem, 2022. május – 2025. május)
- **Feladattípus szerinti gyakorlás** — magyar: szövegértés, nyelvi-irodalmi
  műveletek, szövegalkotás; történelem: rövid feladatok, szöveges/esszé
- **8+ feladattípus támogatása:** fill-in, multiple-choice, ordering,
  matching, table-fill, true-false, short-answer, essay (rubrikával)
- **Időzítő** — vizsga-szimulációhoz, pause/resume, figyelmeztetés az
  utolsó percekben
- **Eredmények mentése** LocalStorage-ba (feladatsoronként, szekcióként)
- **Hibáim nézet** — az eltévesztett feladatok automatikusan listázódnak,
  egy gombbal újrapróbálhatók, helyes válasz esetén archiválódnak
- **Sötét mód**
- **Mobil-reszponzív** — telefonon is kényelmesen használható (táblázatok
  kártya-nézetté alakulnak, érintés-barát gombméret)
- **Dinamikus keresés** — feladatsor és szekció kereshető

## Futtatás helyben

A projekt egy **statikus** HTML + JavaScript oldal, nem igényel build
lépést.

```bash
# A repó gyökeréből:
python3 -m http.server 8000
# majd nyisd meg: http://localhost:8000/
```

Bármely egyszerű HTTP szerver elég (pl. `npx serve`, VS Code Live Server).

## Tesztelés és linting

```bash
# Az összes feladatsor JSON validálása
python3 scripts/lint-exams.py
```

A linter ellenőrzi a JSON szintaxist, a kötelező mezőket, a feladattípusok
helyes használatát, és hogy a magyar hónap-nevek ékezettel vannak-e írva.

## Fájlstruktúra

```
data/                    Feladatsorok (14 db JSON)
  2022-maj.json ...      Magyar feladatsorok
  tort-2022-maj.json ... Történelem feladatsorok
images/                  PDF-ből kivágott képek (csak tort-2024-maj)
js/
  app.js                 Belépési pont, render logika
  quiz-engine.js         Quiz motor, feladattípus renderek
  scoring.js             Válasz-ellenőrzés, pontozás
  mistakes.js            Hiba-követés (Hibáim)
  timer.js               Időzítő
  search.js              Kereső
  data-loader.js         JSON betöltés
  router.js              SPA-szerű navigáció
scripts/
  lint-exams.py          JSON validátor
style.css                Stíluslap (desktop + mobile)
index.html               Egyoldalas applikáció
```

## Adatforrás

A feladatsorok és javítási útmutatók forrása a magyar **Oktatási Hivatal**
hivatalos archívuma:
<https://www.oktatas.hu/kozneveles/erettsegi/feladatsorok>

Az érettségi PDF-ek szöveges tartalma ebből az archívumból származik.
A feladatsorok struktúrált JSON-ba átvitele Claude LLM segítségével
készült; ez nem garantál 100%-os hibátlanságot — hibát találva kérlek
küldd el Instagramon.

## Technológia

- Vanilla JavaScript (ES modules)
- Sima HTML + CSS, nincs build step
- LocalStorage az állapot-mentéshez
- Magyar nyelvű UI

## Készítette

**[@wrn.benji](https://instagram.com/wrn.benji)**

## Licenc

A webes alkalmazás forrásait szabadon felhasználhatod tanulásra. A
feladatsorok szerzői jogi szempontból az Oktatási Hivatalt illetik —
tartsd be a forrás feltételeit.
