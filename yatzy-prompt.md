# Yahtzee (Yatzy) — aplikacja webowa, prompt dla Claude Code

Zbuduj aplikację webową do gry w Yahtzee (Yatzy) — czysty frontend, bez backendu, bez bazy danych.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Static export (`output: 'export'` w `next.config.js`)
- Stan gry w `localStorage` (przetrwa odświeżenie/zamknięcie karty)
- Mobile-first, responsywne, duże elementy dotykowe

## Struktura projektu

```
app/
  layout.tsx
  page.tsx              // ekran startowy: liczba graczy, tryb rzutu, start gry
  game/page.tsx          // właściwa rozgrywka
  settings/page.tsx       // ustawienia punktacji
  globals.css
components/
  Dice.tsx               // pojedyncza kość (tryb wirtualny — klik = hold/unhold)
  DiceTray.tsx            // 5 kości + przycisk "rzuć" + licznik rzutów
  DiceScrollPicker.tsx     // kość jako scrollowany/swipe'owany picker 1-6 (tryb fizyczny)
  ManualDiceInput.tsx      // 5x DiceScrollPicker + przycisk zatwierdzenia
  ScoreCard.tsx            // tabela kategorii z aktualnymi możliwymi punktami
  ScoreRow.tsx             // pojedynczy wiersz kategorii (nazwa, punkty, klik = wybierz)
  PlayerTabs.tsx           // wskazanie, czyja jest tura (przy 2-4 graczach)
  GameControls.tsx         // "Zakończ grę", licznik tury/rundy
  GameOverModal.tsx        // tabela końcowa wyników + wyróżnienie zwycięzcy
  SetupForm.tsx            // formularz startowy (liczba graczy 1-4, nazwy, tryb rzutu)
lib/
  types.ts
  scoring.ts               // czyste funkcje liczące punkty dla każdej kategorii
  scoringSettings.ts        // domyślne + edytowalne wartości punktacji
  storage.ts                // helpery do localStorage (zapis/odczyt/czyszczenie stanu gry)
hooks/
  useYahtzeeGame.ts          // useReducer z całą logiką gry (wielu graczy, tury, rzuty, wybór kategorii)
```

## Zasady gry

- Od 1 do 4 graczy, gra typu "pass and play" na jednym urządzeniu — każdy gracz wykonuje swoją turę, potem przekazuje telefon dalej.
- Każda tura: do 3 rzutów, gracz decyduje które kości zatrzymać między rzutami.
- Po ustaleniu finalnych kości (po max 3 rzutach) gracz wybiera JEDNĄ kategorię do zapisania punktów. Wybrana kategoria nie może być użyta ponownie.
- Gra kończy się gdy każdy gracz wypełni wszystkie 13 kategorii.

### Kategorie i domyślna punktacja (edytowalna w ustawieniach)
**Górna sekcja**: jedynki, dwójki, trójki, czwórki, piątki, szóstki (suma danej wartości oczek). Bonus 35 pkt jeśli suma górnej sekcji ≥ 63 (próg edytowalny).
**Dolna sekcja**: trójka (suma wszystkich kości), czwórka (suma wszystkich kości), full house (25), mały strit (30), duży strit (40), yahtzee (50), szansa (suma wszystkich kości).

Wszystkie te wartości liczbowe (próg bonusu, wartość bonusu, punkty za full house/strity/yahtzee) muszą być trzymane w jednym miejscu (`scoringSettings.ts`) i edytowalne na ekranie ustawień, zapisywane w `localStorage`.

## Dwa tryby wprowadzania wyniku rzutu

### Tryb A — wirtualny (strona losuje)
- 5 kości jako klikalne elementy (np. duże kwadraty z oczkami/SVG).
- Klik na kość = zaznacz/odznacz jako "trzymaną" (hold).
- Przycisk "Rzuć" losuje nowe wartości dla kości, które NIE są zatrzymane. Max 3 rzuty na turę.
- Prosta zmiana wartości przy rzucie — bez animacji rzucania kością, tylko update liczby.

### Tryb B — fizyczny (gracz rzuca prawdziwymi kośćmi)
- Gracz rzuca realnymi kośćmi 3 razy poza aplikacją i wpisuje TYLKO finalny wynik (po 3. rzucie) — appka nie śledzi pojedynczych rzutów w tym trybie.
- Wprowadzanie wartości: 5 osobnych "scroll pickerów" (jeden na kość) — nie dropdown, nie input tekstowy, nie klawiatura. Użytkownik przewija/swipe'uje pionowo lub poziomo palcem po każdej kości, żeby ustawić wartość 1-6 (jak kółko/carousel wyboru). Ma być szybkie, jednoruchowe, wygodne kciukiem na telefonie.
- Po ustawieniu wszystkich 5 wartości — przycisk "Zatwierdź wynik".

Tryb wybierany raz na starcie gry (dotyczy całej rozgrywki, nie zmienia się w trakcie).

## Po ustaleniu finalnych kości (oba tryby)
Wyświetl `ScoreCard` z listą wszystkich 13 kategorii, przy każdej pokazana ile punktów gracz dostałby wybierając tę kategorię z aktualnymi kośćmi (0 jeśli kombinacja nie pasuje, ale nadal klikalne — można "spalić" kategorię). Kliknięcie kategorii = zapisanie wyniku, przejście do kolejnego gracza/tury.

## Zakończenie gry
- Automatycznie po wypełnieniu 13 kategorii przez wszystkich graczy → `GameOverModal` z tabelą: każdy gracz, rozbicie na kategorie, suma górna+bonus, suma dolna, suma total. Zwycięzca wyróżniony wizualnie (np. korona, kolor, animacja konfetti opcjonalnie).
- Przycisk **"Zakończ grę"** dostępny w trakcie rozgrywki — z potwierdzeniem (modal "na pewno?"), czyści stan gry z `localStorage` i wraca do ekranu startowego.

## Trwałość stanu
- Cały stan aktywnej gry (gracze, tura, wyniki, tryb rzutu, aktualne kości) zapisywany w `localStorage` po każdej zmianie.
- Przy wejściu na `/game` — jeśli jest zapisany stan gry, wznów ją zamiast zaczynać od nowa.
- Ustawienia punktacji zapisywane osobno w `localStorage`, niezależnie od stanu gry (przetrwają nawet "Zakończ grę").

## Wymagania jakościowe
- Logika liczenia punktów (`scoring.ts`) jako czyste funkcje przyjmujące tablicę wartości kości (+ ewentualnie ustawienia punktacji) i zwracające liczbę — bez zależności od React, łatwe do testowania.
- Cała logika gry (tury, rzuty, wybór kategorii, przełączanie graczy) w jednym `useReducer` w `useYahtzeeGame.ts` — komponenty mają być "głupie" (prezentacyjne + wywołują akcje).
- Mobile-first: duże przyciski/kości pod dotyk, brak poziomego scrolla, czytelna tabela wyników nawet na małym ekranie (np. scrollowana pozioma tabela lub karty per gracz na mobile).
