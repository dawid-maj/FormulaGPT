# Kwalifikacje — Specyfikacja funkcjonalna v1.1 (tylko sterowanie gracza)

## 0) Cel
Jedna, krótka sesja kwalifikacyjna (Single-Q) dla 10 kierowców, w której gracz decyduje **kiedy wypuścić kierowców** oraz **na jakim trybie ataku przejadą szybkie kółko**. Rdzeń rozgrywki to **timing** pod **ewolucję toru** z ryzykiem błędu i uwzględnieniem **ruchu na torze (traffic penalty)** — bez micromanagementu tempa poza samym szybkim kółkiem.

---

## 1) Zakres v1 (co implementujemy teraz)
- **Sterowanie tylko przez żywego gracza** (brak zarządzania przez AI — dojdzie w v2).
- **Jedno Q** (bez Q1/Q2/Q3).
- **Opony:** wyłącznie softy, **3 komplety / kierowcę**; status kompletu: *nowy* / *używany*.
- **Tryby ataku (tylko dla szybkiego kółka):** `Aggressive`, `Super Aggressive`, `Mega Aggressive`.
- **Ryzyko błędu** powiązane z trybem (tylko na szybkim kółku).
- **Ewolucja toru** rośnie w czasie i wraz z przejazdami.
- **Traffic penalty**: już istniejąca logika spowalniania w ogonie — wykorzystywana w Q bez zmian.
- **Brak micromanagementu tempa na okrążeniach OUT/IN** (opis w sekcji 3).

---

## 2) Przepływ sesji (wysoki poziom)
1. **Start sesji** (licznik czasu do zera).
2. Gracz dla każdego kierowcy może zaplanować **Próbę kwalifikacyjną**:
   - wybór kompletu opon: *Nowe* / *Używane* (z listy posiadanych 3 kompletów),
   - wybór trybu ataku dla szybkiego kółka: `Aggressive` / `Super` / `Mega`,
   - komenda **„Wyślij na tor”** (od razu) lub „Czekaj” (gracz ręcznie wyśle później).
3. Po wysłaniu kierowca automatycznie realizuje sekwencję: **OUT → PUSH → IN → PIT**.
4. Wynik **PUSH** zapisuje czas okrążenia (o ile nie unieważniony), aktualizuje najlepszy czas kierowcy i tabelę wyników.
5. Sesja kończy się z upływem czasu; dokończenie trwającego **PUSH** dozwolone (jeśli przekroczona linia start/meta przed 0:00).

---

## 3) Model okrążenia kwalifikacyjnego
Każda **Próba** składa się z trzech faz. **Tryb ataku i zużycie „wybrane przez gracza” dotyczą wyłącznie fazy PUSH.**

### 3.1 OUT Lap (okrążenie wyjazdowe)
- **Tempo:** z góry ustalone „outlap” (niezależne od wyboru trybu ataku).
- **Zużycie opon:** minimalne (parametryzowalne),
- **Ryzyko błędu:** brak (0%) — okrążenie nie może zostać zepsute przez tryb.
- **Traffic penalty:** działa normalnie (może opóźnić dojazd do linii start/meta, wpływając na timing).
- **UI:** badge/status `OUT`. Gracz **nie** zmienia tempa na OUT.

### 3.2 PUSH Lap (szybkie kółko)
- **Tempo:** używa wybranego trybu ataku `Aggressive/Super/Mega`.
- **Ewolucja toru:** w pełni stosowana do delta‑gripu i/lub mnożnika tempa.
- **Ryzyko błędu:** aktywne, rosnące z agresją; błąd = **okrążenie unieważnione** (czas = brak), przejście do IN.
- **Zużycie opon:** zgodnie z istniejącą logiką wyścigową dla danego trybu; tylko na PUSH.
- **Traffic penalty:** działa normalnie (za kim jedziesz, sektorowe spotkania z ruchem itd.).
- **UI:** badge/status `PUSH`. Gracz **nie** zmienia trybu w trakcie — wybór jest zablokowany po starcie PUSH.

### 3.3 IN Lap (okrążenie zjazdowe)
- **Tempo:** z góry ustalone „inlap” (niezależne od trybu).
- **Zużycie opon:** minimalne (parametryzowalne).
- **Ryzyko błędu:** brak.
- **Traffic penalty:** działa normalnie.
- **UI:** badge/status `IN`. Po IN kierowca automatycznie wraca do PIT.

> **Konsekwencja:** Gracz wybiera tryb raz na **PUSH**, a OUT/IN są automatyczne i „tanie” — brak konieczności przeklikiwania, co redukuje micromanagement.

---

## 4) Ewolucja toru (track evolution)
- **Źródła wzrostu**: upływ czasu sesji + liczba „przejechanych” sektorów przez samochody na torze.
- **Wpływ**: dodatni modyfikator przyczepności/tempa stosowany tylko na **PUSH**.
- **Krzywa**: parametryzowalna (np. logarytmiczna lub sigmoidalna) z limitem maksymalnym.
- **UI**: prosty wskaźnik „Grip %”/„Track rubbering” + mini‑prognoza (np. 5 min do szczytu).

---

## 5) Tryby ataku (tylko PUSH)
- `Aggressive` — niski bonus tempa, niskie ryzyko błędu.
- `Super Aggressive` — większy bonus i średnie ryzyko.
- `Mega Aggressive` — najwyższy bonus, **istotne ryzyko unieważnienia okrążenia**.
- **Błąd** na PUSH powoduje: brak czasu dla tej próby, natychmiastową zmianę fazy na **IN** (zużycie opon za PUSH już naliczone).

---

## 6) Opony (soft, 3 komplety / kierowcę)
- **Stan kompletu**: Nowy/Używany + skumulowane zużycie.
- **Zużycie**:
  - OUT/IN: stałe, niskie, parametryzowalne (np. symboliczny ubytek),
  - PUSH: zgodnie z istniejącym modelem wyścigowym i wybranym trybem ataku.
- **Ponowne użycie**: komplety można mieszać między próbami (gracz widzi % pozostałego „życia”).

---

## 7) Interfejs gracza (minimalny, bez micromanagementu)
**Panel kierowcy:**
- Lista kompletów opon (Nowe/Używane + %),
- Selector trybu ataku (dotyczy następnego PUSH),
- Przycisk **„Wyślij na tor”**,
- Status: `Pit` / `OUT` / `PUSH` / `IN` / `Pit` + zegar sektora/lapu,
- Najlepszy czas kierowcy i delta do **P1**.

**Mapa/tor:**
- Pozycje aut (dla oceny ruchu),
- Wskaźnik ewolucji toru.

**Tabela czasów:**
- Najlepszy czas/kierowca, sektorówki (opcjonalnie), flaga „Invalid” dla nieudanych PUSH.

**Ułatwienia timingu (opcjonalne, v1 jeśli prosto):**
- Lekki **heatmap traffic** po sektorach (zielono/żółto/czerwono) na najbliższe ~30–60s.

---

## 8) Logika gry — maszyna stanów (per kierowca)
`Pit → OutLap → PushLap → InLap → Pit`
- Dozwolone akcje gracza tylko w `Pit` (wybór opon, trybu; wysłanie). Zmiana trybu po starcie **PushLap** — **niedozwolona**.
- **Traffic penalty** aktywne we wszystkich stanach na torze; **ryzyko błędu** tylko w `PushLap`.

---

## 9) Edge cases
- **Koniec czasu:** jeśli kierowca przekroczył linię S/M przed 0:00 i jest w `PushLap`, kończy okrążenie; `OutLap` rozpoczęte po 0:00 — anulowane.
- **Błąd/Off‑track na PUSH:** okrążenie unieważnione, natychmiast `InLap`.
- **Korek przy wylocie z boksu:** stosujemy istniejące reguły bezpiecznego wypuszczania (brak kolizji; ewentualne opóźnienie wyjazdu).
- **Brak kompletów opon:** kierowca nie może podjąć kolejnej próby.

---

## 10) Telemetria i eventy do analityki
- Start/koniec sesji; liczba prób na kierowcę; rozkład wyboru trybów; procent unieważnień na tryb; wpływ ewolucji toru (delta do tempa) vs. minuty sesji; heatmapa traffic → skuteczność okrążeń.

---

## 11) Parametry do balansu (konfigurowalne, bez twardych wartości w kodzie)
- Zużycie opon na OUT/IN (małe stałe), mnożniki zużycia dla trybów na PUSH,
- Krzywa i maksimum **Track Evolution**, tempo jej wzrostu (czas vs. przejazdy),
- Prawdopodobieństwa błędu na PUSH dla `Aggressive/Super/Mega`,
- Wpływ traffic penalty (już istniejący — ekspozycja parametru w Q),
- Limit czasu sesji (default),
- Zasada dokończenia PUSH po 0:00 — włącz/wyłącz.

---

## 12) Kryteria akceptacji (testy funkcjonalne)
1. **Tryb ataku działa wyłącznie na PUSH**: OUT/IN ignorują wybór trybu (czas i zużycie nie zmienia się po zmianie trybu podczas OUT/IN).
2. **OUT/IN mają minimalne zużycie i 0% ryzyka błędu**; PUSH ma pełne zużycie i aktywne ryzyko.
3. **Po wysłaniu** kierowca automatycznie realizuje sekwencję OUT→PUSH→IN bez dodatkowych kliknięć.
4. **Ewolucja toru** zwiększa się w czasie/przejazdach i poprawia tempo tylko na PUSH.
5. **Traffic penalty** działa jak w wyścigu; jego efekt może popsuć czas PUSH.
6. **Błąd na PUSH** unieważnia okrążenie i kierowca przechodzi do IN.
7. **Brak sterowania przez AI w v1**: tylko decyzje gracza.
8. Wyniki sortują się po najlepszym czasie; remis rozstrzygany sektorami (jeśli zaimplementowane) lub kolejnością uzyskania czasu.

---

## 13) Out of scope (przyszłe v2+)
- Zarządzanie kwalifikacjami przez AI,
- Głębsze planowanie kolejki wyjazdów (auto‑release w oknach traffic),
- Warunki pogodowe/temperatura toru, przygotowanie opon (temp window),
- Setup samochodu, ERS/DRS granularnie, profile zakrętów.

