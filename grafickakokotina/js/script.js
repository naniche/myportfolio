/* ==========================================================================
   Kern — Vizuálna akadémia
   script.js — dáta kurzu, autentifikácia, dashboard a herný engine lekcií
   ========================================================================== */

/* -------------------------------------------------------------------------
   1. DÁTOVÝ MODEL KAPITOL
   ------------------------------------------------------------------------- */

const CHAPTERS = [
  { id: 1, key: "ch-1", title: "Základy vizuálneho jazyka", sub: "Level 1 – 8", range: [1, 8] },
  { id: 2, key: "ch-2", title: "Písmo a typografia", sub: "Level 9 – 17", range: [9, 17] },
  { id: 3, key: "ch-3", title: "Farby a psychológia v dizajne", sub: "Level 18 – 26", range: [18, 26] },
  { id: 4, key: "ch-4", title: "Mriežky, layout a tlač vs. obrazovka", sub: "Level 27 – 36", range: [27, 36] },
  { id: 5, key: "ch-5", title: "Profesionálny branding a UI/UX", sub: "Level 37 – 45", range: [37, 45] },
];

function chapterForLevel(n) {
  return CHAPTERS.find((c) => n >= c.range[0] && n <= c.range[1]);
}

/* -------------------------------------------------------------------------
   2. DÁTOVÝ MODEL LEVELOV (45 levelov)
   Typy: "quiz" | "checkpoint" | "kerning" | "contrast" | "hierarchy" | "grid"
   ------------------------------------------------------------------------- */

const LEVELS = [
  // ---------- Kapitola 1: Základy vizuálneho jazyka ----------
  {
    id: 1, title: "Bod", type: "quiz",
    theory: "Bod je najzákladnejším prvkom vizuálneho jazyka. Sám osebe nemá rozmer, no v dizajne slúži ako silný nástroj na upútanie pozornosti a vytvorenie ohniska kompozície.",
    q: "Aká je hlavná funkcia bodu vo vizuálnej kompozícii?",
    options: ["Vytvára pohyb naprieč plochou", "Priťahuje pozornosť a vytvára ohniskový bod", "Definuje farebnú paletu návrhu", "Nahrádza potrebu textu"],
    correct: 1,
    explain: "Bod koncentruje pozornosť diváka na konkrétne miesto a často slúži ako východiskový bod pre zvyšok kompozície.",
  },
  {
    id: 2, title: "Línia a smer", type: "quiz",
    theory: "Línia vzniká spojením dvoch bodov a nesie smer, rytmus aj emóciu. Vodorovné línie pôsobia pokojne, zvislé stabilne a diagonálne dynamicky.",
    q: "Ktorý typ línie pôsobí v dizajne najviac dynamicky a expresívne?",
    options: ["Vodorovná", "Zvislá", "Diagonálna", "Bodkovaná"],
    correct: 2,
    explain: "Diagonálne línie narúšajú stabilitu vodorovnej a zvislej osi, a preto vytvárajú pocit pohybu a napätia.",
  },
  {
    id: 3, title: "Tvar", type: "quiz",
    theory: "Tvary delíme na geometrické (kruh, štvorec, trojuholník) a organické (nepravidelné, prírodné). Každý typ vyvoláva iný pocit — poriadok, alebo prirodzenosť.",
    q: "Aký typ tvarov vo všeobecnosti pôsobí prirodzenejšie a menej formálne?",
    options: ["Geometrické tvary", "Organické, nepravidelné tvary", "Iba priame línie", "Iba dokonalé štvorce"],
    correct: 1,
    explain: "Organické tvary pripomínajú formy z prírody, preto pôsobia uvoľnenejšie a menej strojovo než presné geometrické útvary.",
  },
  {
    id: 4, title: "Základy kompozície", type: "quiz",
    theory: "Kompozícia je spôsob, akým usporiadame vizuálne prvky — body, línie, tvary, farby a text — na ploche tak, aby výsledok pôsobil zámerne a čitateľne.",
    q: "Čo v grafickom dizajne označuje pojem „kompozícia“?",
    options: ["Výber farebnej palety", "Usporiadanie vizuálnych prvkov v rámci plochy", "Typ použitého písma", "Rozlíšenie výsledného obrázka"],
    correct: 1,
    explain: "Kompozícia je architektúra návrhu — určuje, kam oko diváka putuje a v akom poradí vníma informácie.",
  },
  {
    id: 5, title: "Pravidlo tretín", type: "grid",
    theory: "Pravidlo tretín rozdeľuje plochu na deväť rovnakých častí pomocou dvoch vodorovných a dvoch zvislých línií. Umiestnenie hlavného objektu na priesečníky týchto línií pôsobí prirodzenejšie než strohé centrovanie.",
    prompt: "Klikni na miesto v mriežke, kam by ste podľa pravidla tretín mali umiestniť hlavný objekt kompozície.",
    gridSize: 3,
    correctCells: [1, 2, 7, 5],
    explain: "Priesečníky mriežky (nie stred) vytvárajú prirodzenejšie a vizuálne zaujímavejšie umiestnenie hlavného objektu.",
  },
  {
    id: 6, title: "Vizuálna váha", type: "quiz",
    theory: "Vizuálna váha opisuje, ako silno prvok priťahuje pozornosť. Ovplyvňuje ju veľkosť, farba, kontrast aj poloha na ploche.",
    q: "Ktorý prvok má vo všeobecnosti väčšiu vizuálnu váhu?",
    options: ["Menší, tmavší a výraznejší prvok", "Väčší, svetlý a nevýrazný prvok", "Prvok umiestnený mimo kompozície", "Prvok bez akejkoľvek farby"],
    correct: 0,
    explain: "Sýtosť a kontrast dokážu prevážiť aj samotnú veľkosť — malý, tmavý akcent dokáže pútať viac než veľká svetlá plocha.",
  },
  {
    id: 7, title: "Rovnováha", type: "quiz",
    theory: "Rovnováha môže byť symetrická (zrkadlová) alebo asymetrická, kde sa rôzne prvky vyvažujú svojou váhou, nie tvarom.",
    q: "Čo charakterizuje asymetrickú rovnováhu?",
    options: ["Zrkadlové rozloženie prvkov okolo osi", "Rôzne prvky s odlišnou váhou, ktoré sa navzájom vyvažujú", "Úplná absencia akéhokoľvek usporiadania", "Iba jeden centrálny prvok na ploche"],
    correct: 1,
    explain: "Asymetrická rovnováha vzniká, keď napríklad veľký svetlý prvok vyváži malý, no sýty a výrazný prvok na opačnej strane.",
  },
  {
    id: 8, title: "Checkpoint: Základy jazyka", type: "checkpoint",
    theory: "Zhrnutie prvej kapitoly — over si, čo si sa naučil o bode, línii, tvare, kompozícii a rovnováhe.",
    questions: [
      { q: "Čo vytvára v kompozícii diagonálna línia?", options: ["Pohyb a dynamiku", "Absolútny pokoj", "Žiadny efekt", "Iba farbu"], correct: 0 },
      { q: "Čo je asymetrická rovnováha?", options: ["Zrkadlenie okolo osi", "Rôzne prvky vyvažujúce sa váhou", "Úplný chaos", "Jediný prvok na ploche"], correct: 1 },
      { q: "Menší tmavý prvok má oproti väčšiemu svetlému prvku spravidla...", options: ["väčšiu vizuálnu váhu", "menšiu vizuálnu váhu", "vždy rovnakú váhu", "žiadnu váhu"], correct: 0 },
    ],
  },

  // ---------- Kapitola 2: Písmo a typografia ----------
  {
    id: 9, title: "Anatómia písma", type: "quiz",
    theory: "Každé písmeno má svoju anatómiu — x-výšku, hornú dosahovú čiaru (ascender), dolnú dosahovú čiaru (descender) a základnú líniu, na ktorej „stoja“ všetky znaky.",
    q: "Ako sa nazýva časť malého písmena, ktorá klesá pod základnú líniu (napr. v „j“ alebo „p“)?",
    options: ["Dolný ťah (descender)", "Horný ťah (ascender)", "x-výška", "Serif"],
    correct: 0,
    explain: "Descender je tá časť znaku, ktorá pokračuje pod základnú líniu — typicky pri písmenách j, p, q, g, y.",
  },
  {
    id: 10, title: "Serify vs. bezserify", type: "quiz",
    theory: "Serifové písma majú na koncoch ťahov drobné „pätky“, bezserifové (grotesque) sú čisté a geometrické.",
    q: "Kde sa bezserifové (sans-serif) písma tradične najviac používajú?",
    options: ["V tlačených knihách s dlhým súvislým textom", "Na obrazovkách a v digitálnom dizajne", "Iba v logotypoch luxusných značiek", "V typografii sa nepoužívajú vôbec"],
    correct: 1,
    explain: "Čisté tvary bez serifov zostávajú čitateľné aj pri nízkom rozlíšení obrazovky, preto dominujú v UI a webdizajne.",
  },
  {
    id: 11, title: "Kerning I", type: "kerning",
    theory: "Kerning je jemné doladenie medzery medzi konkrétnym párom písmen tak, aby text pôsobil opticky vyrovnane — nie mechanicky rovnomerne.",
    prompt: "Priblíž alebo vzdiaľ písmená slova pomocou posuvníka, kým rozostup nebude pôsobiť vizuálne vyrovnane.",
    word: "AKADÉMIA",
    min: -4, max: 8, step: 0.5, start: 4,
    targetMin: -1, targetMax: 1.5,
    explain: "Príliš voľný kerning rozbíja slovo na jednotlivé znaky, príliš tesný ich zlepí dokopy — cieľom je optická rovnováha.",
  },
  {
    id: 12, title: "Tracking", type: "quiz",
    theory: "Tracking (stopáž) upravuje rozostup medzi všetkými znakmi v texte naraz — narozdiel od kerningu, ktorý cieli na konkrétny pár písmen.",
    q: "Aký je rozdiel medzi trackingom a kerningom?",
    options: ["Sú to úplné synonymá bez rozdielu", "Tracking upravuje rozostup celého textu, kerning rieši konkrétny pár písmen", "Kerning sa týka iba farby textu", "Tracking sa dá použiť iba v tlačenej produkcii"],
    correct: 1,
    explain: "Tracking je globálna úprava (napr. pre nadpis PÍSANÝ VERZÁLKAMI), kerning je lokálna, mikroskopická úprava.",
  },
  {
    id: 13, title: "Riadkovanie", type: "quiz",
    theory: "Riadkovanie (line-height) je vertikálna vzdialenosť medzi riadkami textu. Príliš tesné riadkovanie unavuje oko, príliš voľné rozbíja súvislosť textu.",
    q: "Aké riadkovanie sa všeobecne odporúča pre pohodlne čitateľný text odsekov?",
    options: ["0,8-násobok veľkosti písma", "Približne 1,4- až 1,6-násobok veľkosti písma", "Presne 1-násobok veľkosti písma", "4-násobok veľkosti písma"],
    correct: 1,
    explain: "Hodnota okolo 1,4–1,6 dáva očiam dostatok priestoru na návrat na začiatok ďalšieho riadku bez straty kontextu.",
  },
  {
    id: 14, title: "Párovanie fontov", type: "quiz",
    theory: "Dobré párovanie fontov vytvára kontrast bez konfliktu — najčastejšie kombináciou serifového a bezserifového písma.",
    q: "Ktorá kombinácia fontov je typicky bezpečná a harmonická voľba?",
    options: ["Dve rôzne dekoratívne písma naraz", "Serifový font pre nadpisy a bezserifový pre telo textu (alebo naopak)", "Päť rôznych rezov písma na jednej stránke", "Vždy len jedno predvolené systémové písmo"],
    correct: 1,
    explain: "Kontrast medzi kategóriami písma (serif/sans-serif) vytvára jasnú hierarchiu bez toho, aby písma medzi sebou „súperili“.",
  },
  {
    id: 15, title: "Čitateľnosť", type: "quiz",
    theory: "Legibility (rozoznateľnosť) hovorí o tom, ako ľahko rozoznáme jednotlivé písmená. Readability (čitateľnosť) hovorí o tom, ako pohodlne sa dá čítať dlhší text ako celok.",
    q: "Čo presne označuje pojem „čitateľnosť“ (readability) v typografii?",
    options: ["Ako ľahko rozoznáte tvar jednotlivých písmen", "Ako pohodlne sa dá čítať dlhší text ako celok", "Farbu, akou je text vysadený", "Veľkosť súboru s fontom"],
    correct: 1,
    explain: "Readability zahŕňa riadkovanie, dĺžku riadku, kontrast aj veľkosť písma — teda celkový komfort pri čítaní odseku.",
  },
  {
    id: 16, title: "Kerning II", type: "kerning",
    theory: "Pri veľkých nadpisoch verzálkami (VEĽKÉ PÍSMENÁ) je často potrebné písmená mierne priblížiť, pretože opticky pôsobia voľnejšie než malé písmená.",
    prompt: "Priblíž písmená nadpisu tak, aby verzálky pôsobili opticky kompaktne, no stále čitateľne.",
    word: "WAVE DIZAJN",
    min: -4, max: 8, step: 0.5, start: 5,
    targetMin: -2.5, targetMax: -0.5,
    explain: "Veľké písmená potrebujú spravidla tesnejší kerning než malé, pretože ich hranaté tvary opticky vytvárajú väčšie medzery.",
  },
  {
    id: 17, title: "Checkpoint: Typografia", type: "checkpoint",
    theory: "Zhrnutie druhej kapitoly — anatómia písma, kerning, tracking, riadkovanie a párovanie fontov.",
    questions: [
      { q: "Kerning rieši predovšetkým...", options: ["rozostup konkrétneho páru písmen", "farbu textu", "riadkovanie odseku", "veľkosť celého nadpisu"], correct: 0 },
      { q: "Odporúčané riadkovanie pre odseky je približne...", options: ["1,4- až 1,6-násobok", "presne 1-násobok", "0,5-násobok", "4-násobok"], correct: 0 },
      { q: "Bezserifové písma sa najviac hodia na...", options: ["obrazovky a digitálne rozhrania", "hrubé knižné romány", "vizitky bez výnimky", "vôbec sa nepoužívajú"], correct: 0 },
    ],
  },

  // ---------- Kapitola 3: Farby a psychológia v dizajne ----------
  {
    id: 18, title: "RGB vs. CMYK", type: "quiz",
    theory: "RGB (červená, zelená, modrá) je aditívny model svetla používaný na obrazovkách. CMYK (azúrová, purpurová, žltá, čierna) je subtraktívny model používaný pri tlači na papier.",
    q: "Kde sa používa farebný model CMYK?",
    options: ["Na obrazovkách počítačov a telefónov", "Pri tlači na papier", "Iba vo videohrách", "Výhradne vo webovom dizajne"],
    correct: 1,
    explain: "CMYK vzniká miešaním atramentov na papieri, preto je štandardom pri tlačovej produkcii — letáky, vizitky, obaly.",
  },
  {
    id: 19, title: "Farebný kruh", type: "quiz",
    theory: "Farebný kruh usporadúva farby podľa ich vzájomného vzťahu a je základným nástrojom pre tvorbu harmonických paliet.",
    q: "Ktoré farby sú na farebnom kruhu voči sebe komplementárne (protiľahlé)?",
    options: ["Farby ležiace hneď vedľa seba", "Farby oproti sebe, napríklad modrá a oranžová", "Všetky odtiene tej istej farby", "Iba čierna a biela"],
    correct: 1,
    explain: "Komplementárne farby ležia na opačných stranách kruhu a spolu vytvárajú maximálny farebný kontrast.",
  },
  {
    id: 20, title: "Komplementárne palety", type: "quiz",
    theory: "Komplementárna paleta kombinuje dve protiľahlé farby na kruhu — vzniká živý, energický a veľmi kontrastný výsledok.",
    q: "Aký efekt vo všeobecnosti vytvára komplementárna farebná paleta?",
    options: ["Pokojný a takmer nepostrehnuteľný", "Vysoký kontrast a vizuálne napätie", "Úplnú monotónnosť", "Žiadny viditeľný efekt"],
    correct: 1,
    explain: "Práve pre svoj silný kontrast sa komplementárne palety často používajú pri call-to-action tlačidlách a akcentoch.",
  },
  {
    id: 21, title: "Analogické farby", type: "quiz",
    theory: "Analogická paleta používa tri až štyri farby, ktoré na farebnom kruhu susedia — výsledok pôsobí harmonicky a pokojne.",
    q: "Analogické farby na farebnom kruhu sú tie, ktoré sú...",
    options: ["priamo oproti sebe", "vedľa seba, susediace", "presne v opačných rohoch kruhu", "iba odtiene šedej"],
    correct: 1,
    explain: "Susediace farby (napr. modrá, tyrkysová, zelená) zdieľajú spoločný podtón, preto pôsobia jednotne a bez napätia.",
  },
  {
    id: 22, title: "Teplé a studené farby", type: "quiz",
    theory: "Teplé farby (červená, oranžová, žltá) pôsobia energicky a blízko. Studené farby (modrá, zelená, fialová) pôsobia pokojne a vzdialene.",
    q: "Ktoré farby vo všeobecnosti pôsobia upokojujúco a „vzdialene“?",
    options: ["Červená, oranžová, žltá", "Modrá, zelená, fialová", "Iba čierna", "Iba biela"],
    correct: 1,
    explain: "Studené farby opticky ustupujú do pozadia a v dizajne sa preto často spájajú s pokojom, dôverou a profesionalitou.",
  },
  {
    id: 23, title: "Emócie vo farbách", type: "quiz",
    theory: "Farby vyvolávajú emocionálne asociácie, ktoré sa líšia naprieč kultúrami. V západnej vizuálnej kultúre má takmer každá farba svoj typický emocionálny náboj.",
    q: "Aká emócia sa v západnej vizuálnej kultúre najčastejšie spája s červenou farbou?",
    options: ["Pokoj a dôvera", "Naliehavosť, energia alebo vášeň", "Nudná neutralita", "Chlad a odstup"],
    correct: 1,
    explain: "Červená priťahuje pozornosť a fyziologicky zvyšuje pulz, preto sa spája s naliehavosťou, vášňou aj varovaním.",
  },
  {
    id: 24, title: "WCAG kontrast", type: "contrast",
    theory: "Prístupnosť (WCAG) vyžaduje, aby text mal voči pozadiu dostatočný kontrastný pomer — minimálne 4,5 : 1 pre bežný text, aby ho vedeli prečítať aj ľudia so zníženým zrakom.",
    prompt: "Uprav jas textu posuvníkom tak, aby kontrastný pomer voči pozadiu dosiahol aspoň 4,5 : 1.",
    bg: "#eef1fb",
    startLightness: 78,
    min: 0, max: 100, step: 1,
    targetRatio: 4.5,
    explain: "Dostatočný kontrast nie je len estetika — je to podmienka, aby bol obsah čitateľný pre čo najširšie publikum.",
  },
  {
    id: 25, title: "Farebná dostupnosť", type: "quiz",
    theory: "Približne 1 z 12 mužov má nejakú formu farbosleposti. Preto by farba nikdy nemala byť jediným nosičom dôležitej informácie.",
    q: "Prečo by dizajnéri nemali spoliehať sa iba na farbu na odlíšenie dôležitých informácií (napr. chybových stavov)?",
    options: ["Pretože farba v dizajne nič neznamená", "Pretože časť používateľov má farbosleposť a farbu nemusí rozoznať", "Pretože farby sú príliš drahé na výrobu", "Nie je to problém a farba stačí vždy"],
    correct: 1,
    explain: "Popri farbe je vhodné pridať aj ikonu, text alebo tvar — napríklad chybu označiť nielen červenou, ale aj symbolom výkričníka.",
  },
  {
    id: 26, title: "Checkpoint: Farby", type: "checkpoint",
    theory: "Zhrnutie tretej kapitoly — farebné modely, harmonické palety, emócie a prístupnosť.",
    questions: [
      { q: "CMYK sa používa predovšetkým pri...", options: ["tlači na papier", "zobrazení na obrazovkách", "strihu videa", "nahrávaní zvuku"], correct: 0 },
      { q: "Komplementárne farby sú na farebnom kruhu...", options: ["oproti sebe", "vedľa seba", "úplne rovnaké", "mimo kruhu"], correct: 0 },
      { q: "Prečo sa neodporúča spoliehať iba na farbu?", options: ["kvôli farbosleposti časti používateľov", "farby sú vždy drahé", "nie je na to dôvod", "farby sa časom menia"], correct: 0 },
    ],
  },

  // ---------- Kapitola 4: Mriežky, layout a tlač vs. obrazovka ----------
  {
    id: 27, title: "Zlatý rez", type: "quiz",
    theory: "Zlatý rez je matematický pomer (približne 1 : 1,618), ktorý sa v prírode aj umení opakovane spája s harmonickými proporciami.",
    q: "Aký je približný pomer zlatého rezu?",
    options: ["1 : 1", "1 : 1,618", "1 : 3", "2 : 5"],
    correct: 1,
    explain: "Číslo 1,618 (fí) vzniká z Fibonacciho postupnosti a používa sa na určenie proporcií kompozície, layoutu aj logotypov.",
  },
  {
    id: 28, title: "Modulárne mriežky", type: "grid",
    theory: "Modulárna mriežka delí plochu na stĺpce, ktoré zjednodušujú konzistentné rozmiestnenie prvkov — čím viac stĺpcov, tým flexibilnejší je layout.",
    kind: "choice",
    q: "Ktorý typ mriežky sa vo webdizajne najčastejšie používa pre svoju flexibilitu?",
    choices: [
      { label: "12-stĺpcová mriežka", cols: 12, correct: true },
      { label: "2-stĺpcová mriežka", cols: 2, correct: false },
      { label: "1-stĺpcová mriežka", cols: 1, correct: false },
    ],
    explain: "12 stĺpcov sa dá deliť na 2, 3, 4 aj 6 rovnakých častí, vďaka čomu vyhovuje takmer akémukoľvek rozloženiu obsahu.",
  },
  {
    id: 29, title: "Stĺpcové mriežky", type: "quiz",
    theory: "Stĺpcová mriežka je neviditeľná kostra layoutu — určuje, kam sa zarovnávajú texty, obrázky a bloky obsahu.",
    q: "Prečo dizajnéri používajú stĺpcové (column) mriežky?",
    options: ["Aby text vyzeral rozhádzane a náhodne", "Pre konzistentné zarovnanie a usporiadanie prvkov naprieč stránkou", "Iba pre estetiku, bez akejkoľvek funkcie", "Mriežky sa v modernom dizajne už nepoužívajú"],
    correct: 1,
    explain: "Mriežka vytvára neviditeľný, no citeľný poriadok — vďaka nej pôsobí layout premyslene aj naprieč viacerými stránkami.",
  },
  {
    id: 30, title: "Vizuálna hierarchia", type: "hierarchy",
    theory: "Vizuálna hierarchia určuje poradie, v akom oko vníma prvky na stránke — od najdôležitejšieho po najmenej dôležitý.",
    prompt: "Zoraď prvky od najdôležitejšieho (1) po najmenej dôležitý vo vizuálnej hierarchii bežnej webovej stránky.",
    items: [
      { id: "h1", label: "Hlavný nadpis (H1)" },
      { id: "h2", label: "Podnadpis" },
      { id: "body", label: "Telo textu" },
      { id: "caption", label: "Popisok obrázku" },
    ],
    correctOrder: ["h1", "h2", "body", "caption"],
    explain: "Veľkosť, hrúbka rezu a kontrast písma spolu signalizujú, čo si má čitateľ prečítať ako prvé, druhé a tak ďalej.",
  },
  {
    id: 31, title: "Biely priestor", type: "quiz",
    theory: "Biely (prázdny) priestor nie je „nevyužité“ miesto — je to aktívny dizajnérsky nástroj, ktorý dáva obsahu priestor na dýchanie.",
    q: "Aká je funkcia „bieleho priestoru“ (whitespace) v dizajne?",
    options: ["Je to plytvanie miestom, ktorému sa treba vyhýbať", "Pomáha čitateľnosti, dáva prvkom priestor a vytvára hierarchiu", "Musí byť vždy doslova biela farba", "Nemá v dizajne žiadny účel"],
    correct: 1,
    explain: "Dostatok voľného priestoru okolo dôležitých prvkov ich opticky zvýrazní a zníži celkovú vizuálnu záťaž stránky.",
  },
  {
    id: 32, title: "Zarovnanie", type: "quiz",
    theory: "Zarovnanie prepája súvisiace prvky do jasných, neviditeľných línií a robí layout usporiadaným a profesionálnym.",
    q: "Prečo je konzistentné zarovnanie prvkov v dizajne dôležité?",
    options: ["Vytvára vizuálny poriadok a spája súvisiace prvky", "Nemá žiadny vplyv na to, ako layout vnímame", "Iba spomaľuje prácu dizajnéra", "Týka sa výhradne textu, nie iných prvkov"],
    correct: 0,
    explain: "Keď sú okraje prvkov zarovnané na spoločné neviditeľné línie, oko ich prirodzene vníma ako súvisiacu skupinu.",
  },
  {
    id: 33, title: "Príprava pre tlač", type: "quiz",
    theory: "Tlačová príprava si vyžaduje iné nastavenia než obrazovka — vyšší DPI, farebný priestor CMYK a spadávku okolo okrajov dokumentu.",
    q: "Čo je „spadávka“ (bleed) pri príprave dokumentu na tlač?",
    options: ["Chyba, ktorá vznikla v tlačiarni", "Presah obsahu za okraj formátu, aby po orezaní nevznikli biele okraje", "Konkrétny typ papiera", "Názov pre farebný profil dokumentu"],
    correct: 1,
    explain: "Keďže rezačka nikdy nereže na milimeter presne, spadávka (typicky 3–5 mm) zaisťuje, že farba siaha až po samý okraj.",
  },
  {
    id: 34, title: "Responzívny dizajn", type: "quiz",
    theory: "Responzívny dizajn zaisťuje, že jeden layout funguje plynulo na mobile, tablete aj veľkom monitore.",
    q: "Čo presne znamená „responzívny“ webový dizajn?",
    options: ["Dizajn, ktorý sa prispôsobuje rôznym veľkostiam obrazoviek", "Dizajn určený výhradne pre tlač", "Dizajn s pevnou, nemennou šírkou", "Dizajn bez akýchkoľvek obrázkov"],
    correct: 0,
    explain: "Responzívny layout využíva flexibilné mriežky, relatívne jednotky a breakpointy, aby fungoval na akomkoľvek zariadení.",
  },
  {
    id: 35, title: "Breakpointy", type: "quiz",
    theory: "Breakpoint je definovaná šírka obrazovky, pri ktorej sa layout preusporiada, aby zostal čitateľný a použiteľný.",
    q: "Čo sú „breakpointy“ v responzívnom dizajne?",
    options: ["Chyby v zdrojovom kóde stránky", "Definované šírky obrazovky, pri ktorých sa layout zmení", "Farebné prechody medzi sekciami", "Špeciálne typografické štýly"],
    correct: 1,
    explain: "Typické breakpointy oddeľujú mobilné, tabletové a desktopové zobrazenie a menia počet stĺpcov či veľkosť písma.",
  },
  {
    id: 36, title: "Checkpoint: Layout", type: "checkpoint",
    theory: "Zhrnutie štvrtej kapitoly — zlatý rez, mriežky, hierarchia, tlač a responzívny dizajn.",
    questions: [
      { q: "Pomer zlatého rezu je približne...", options: ["1 : 1,618", "1 : 1", "1 : 3", "2 : 2"], correct: 0 },
      { q: "Spadávka (bleed) v tlači slúži na...", options: ["presah obsahu kvôli orezu", "vytvorenie chyby", "typ papiera", "farebný filter"], correct: 0 },
      { q: "Breakpointy definujú...", options: ["šírky, pri ktorých sa mení layout", "farby stránky", "typy písma", "rýchlosť animácií"], correct: 0 },
    ],
  },

  // ---------- Kapitola 5: Profesionálny branding a UI/UX ----------
  {
    id: 37, title: "Tvorba logotypov", type: "quiz",
    theory: "Dobré logo musí fungovať na vizitke aj na billboarde — preto sa dizajnéri riadia zásadou maximálnej jednoduchosti.",
    q: "Aká je kľúčová vlastnosť dobrého loga?",
    options: ["Čo najviac detailov a farieb naraz", "Jednoduchosť, zapamätateľnosť a škálovateľnosť", "Musí vždy obsahovať fotografiu", "Musí byť čo najväčšie a najkomplexnejšie"],
    correct: 1,
    explain: "Jednoduchý tvar sa dá zmenšiť na ikonu prehliadača aj zväčšiť na fasádu budovy bez straty čitateľnosti.",
  },
  {
    id: 38, title: "Typy log", type: "quiz",
    theory: "Logá delíme na wordmarky (text), brandmarky/symboly (grafický znak), kombinované značky a emblémy.",
    q: "Ako sa nazýva typ loga tvorený výhradne štylizovaným textom názvu značky (napr. Coca-Cola)?",
    options: ["Symbol (brandmark)", "Wordmark (logotyp)", "Maskot", "Emblém"],
    correct: 1,
    explain: "Wordmark stavia na type samotného textu — jeho čitateľnosť a osobitosť sú kľúčové, keďže neobsahuje žiadny grafický symbol.",
  },
  {
    id: 39, title: "Vizuálna identita", type: "quiz",
    theory: "Vizuálna identita je ucelený systém pravidiel, ktorý zaisťuje, že značka vyzerá konzistentne naprieč všetkými materiálmi.",
    q: "Čo všetko typicky zahŕňa „vizuálna identita“ značky?",
    options: ["Iba samotné logo", "Logo, farebnú paletu, typografiu, obrazový štýl a pravidlá ich použitia", "Iba webovú stránku značky", "Iba marketingový slogan"],
    correct: 1,
    explain: "Vizuálna identita je komplexný systém — logo je len jeden z jeho viditeľných prvkov, nie celok.",
  },
  {
    id: 40, title: "Design systémy", type: "quiz",
    theory: "Design systém je knižnica opakovane použiteľných komponentov a pravidiel, ktorá zjednocuje prácu celého tímu.",
    q: "Aký je hlavný účel design systému?",
    options: ["Zjednotiť a zrýchliť tvorbu produktu pomocou konzistentných komponentov", "Úplne nahradiť prácu dizajnérov", "Zbytočne obmedziť kreativitu tímu", "Slúži výhradne na marketingové účely"],
    correct: 0,
    explain: "Vďaka spoločnej knižnici komponentov (tlačidlá, farby, typografia) tím šetrí čas a produkt pôsobí jednotne.",
  },
  {
    id: 41, title: "Základy UX", type: "quiz",
    theory: "UX (user experience) dizajn sa zaoberá tým, ako sa používateľ v produkte cíti a ako ľahko dosiahne svoj cieľ.",
    q: "Na čo sa primárne zameriava UX dizajn?",
    options: ["Iba na vizuálny vzhľad produktu", "Na celkový zážitok a použiteľnosť produktu pre používateľa", "Výhradne na farbu tlačidiel", "Výhradne na kód, ktorý beží na pozadí"],
    correct: 1,
    explain: "UX presahuje vizuál — zahŕňa architektúru informácií, tok úloh a to, ako ľahko používateľ dosiahne svoj cieľ.",
  },
  {
    id: 42, title: "Používateľské testovanie", type: "quiz",
    theory: "Používateľské testovanie overuje dizajnérske rozhodnutia priamo na reálnych ľuďoch — nie iba na predpokladoch tímu.",
    q: "Prečo je používateľské testovanie dôležitou súčasťou UX procesu?",
    options: ["Odhaľuje reálne problémy s použiteľnosťou priamo od používateľov", "Je to iba formalita bez skutočnej hodnoty", "Úplne nahrádza potrebu dizajnu", "Slúži výlučne na marketing produktu"],
    correct: 0,
    explain: "Aj skúsený dizajnér má svoje predpoklady — testovanie s reálnymi používateľmi odhalí problémy, ktoré by inak unikli.",
  },
  {
    id: 43, title: "Wireframing", type: "grid",
    theory: "Wireframe je nízko-detailný náčrt layoutu, ktorý rieši rozmiestnenie obsahu skôr než farby či typografiu.",
    kind: "choice",
    q: "Ktorý wireframe najlepšie zodpovedá typickej štruktúre landing page (hero → benefity → výzva na akciu)?",
    choices: [
      { label: "Hero blok, tri karty benefitov, CTA pás", cols: "landing", correct: true },
      { label: "Náhodné bloky bez akéhokoľvek poradia", cols: "random", correct: false },
      { label: "Jediný veľký odsek textu bez štruktúry", cols: "wall", correct: false },
    ],
    explain: "Jasná postupnosť — najprv pútavý úvod, potom dôkazy hodnoty, napokon jasná výzva na akciu — vedie používateľa krok za krokom.",
  },
  {
    id: 44, title: "Zadanie od klienta", type: "quiz",
    theory: "Reálna prax prináša obmedzenia — rozpočet, technické limity aj požiadavky klienta, ktoré treba vyvážiť s dobrým dizajnom.",
    q: "Klient chce logo, ktoré bude vyzerať dobre všade — na vizitke aj na billboarde. Na čo sa musíte pri návrhu najviac zamerať?",
    options: ["Na čo najväčšie množstvo detailov", "Na škálovateľnosť a jednoduchosť tvaru", "Na najnovšie farebné trendy", "Na dĺžku názvu firmy"],
    correct: 1,
    explain: "Iba jednoduchý, dobre vyvážený tvar zostane čitateľný a rozpoznateľný v akejkoľvek veľkosti aj na akomkoľvek podklade.",
  },
  {
    id: 45, title: "Záverečný test", type: "checkpoint",
    theory: "Posledná previerka pred udelením titulu Vizuálny profesionál — zhrnutie brandingu, UX aj kľúčových princípov celého kurzu.",
    final: true,
    questions: [
      { q: "Wordmark je typ loga tvorený...", options: ["štylizovaným textom názvu značky", "výhradne grafickým symbolom", "fotografiou produktu", "maskotom značky"], correct: 0 },
      { q: "Design systém slúži predovšetkým na...", options: ["konzistentnosť a rýchlejšiu tvorbu produktu", "nahradenie dizajnérov v tíme", "čisto marketingové účely", "nič konkrétne"], correct: 0 },
      { q: "UX dizajn sa zameriava predovšetkým na...", options: ["celkový zážitok a použiteľnosť pre používateľa", "iba výber farieb", "iba zdrojový kód", "iba logo značky"], correct: 0 },
      { q: "Najdôležitejšia vlastnosť dobrého loga je...", options: ["jednoduchosť a škálovateľnosť", "množstvo detailov", "veľkosť súboru", "počet použitých farieb"], correct: 0 },
    ],
  },
];

const TOTAL_LEVELS = LEVELS.length;
const XP_PER_QUIZ = 15;
const XP_PER_CHECKPOINT = 30;
const START_HEARTS = 5;

/* -------------------------------------------------------------------------
   3. STAV POUŽÍVATEĽA (localStorage)
   ------------------------------------------------------------------------- */

const STORAGE_KEY = "kern_state_v1";

function defaultState() {
  return {
    user: null, // { name, email }
    xp: 0,
    streak: 1,
    hearts: START_HEARTS,
    lastVisit: todayStr(),
    completed: [], // level ids
  };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch (e) {
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateStreakOnVisit(state) {
  const today = todayStr();
  if (state.lastVisit === today) return state;
  const last = new Date(state.lastVisit);
  const now = new Date(today);
  const diffDays = Math.round((now - last) / 86400000);
  if (diffDays === 1) {
    state.streak += 1;
  } else if (diffDays > 1) {
    state.streak = 1;
  }
  state.lastVisit = today;
  saveState(state);
  return state;
}

function requireAuth() {
  const state = loadState();
  if (!state.user) {
    window.location.href = "auth.html";
    return null;
  }
  return state;
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("") || "K";
}

/* -------------------------------------------------------------------------
   4. AUTENTIFIKÁCIA (auth.html)
   ------------------------------------------------------------------------- */

function initAuthPage() {
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = { prihlasit: document.getElementById("panel-prihlasit"), registrovat: document.getElementById("panel-registrovat") };
  const title = document.getElementById("auth-title");
  const sub = document.getElementById("auth-sub");

  const copy = {
    prihlasit: { title: "Vitaj späť", sub: "Prihlás sa a pokračuj vo svojej vizuálnej ceste." },
    registrovat: { title: "Vytvor si účet", sub: "Začni od úplných základov až po profesionálnu úroveň." },
  };

  function setTab(name) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    Object.entries(panels).forEach(([key, el]) => (el.style.display = key === name ? "block" : "none"));
    title.textContent = copy[name].title;
    sub.textContent = copy[name].sub;
    history.replaceState(null, "", `#${name}`);
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => setTab(tab.dataset.tab)));

  const initialTab = window.location.hash === "#registrovat" ? "registrovat" : "prihlasit";
  setTab(initialTab);

  // --- Registrácia ---
  const regForm = document.getElementById("form-registrovat");
  regForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const alertBox = document.getElementById("reg-alert");

    let valid = true;
    valid = validateField("reg-name", name.length >= 2) && valid;
    valid = validateField("reg-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && valid;
    valid = validateField("reg-password", password.length >= 6) && valid;

    if (!valid) {
      alertBox.textContent = "Skontroluj prosím zvýraznené polia.";
      alertBox.classList.add("show");
      return;
    }
    alertBox.classList.remove("show");

    const state = defaultState();
    state.user = { name, email };
    saveState(state);
    window.location.href = "dashboard.html";
  });

  // --- Prihlásenie ---
  const loginForm = document.getElementById("form-prihlasit");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const alertBox = document.getElementById("login-alert");

    let valid = true;
    valid = validateField("login-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && valid;
    valid = validateField("login-password", password.length >= 6) && valid;

    if (!valid) {
      alertBox.textContent = "Zadaj platný e-mail a heslo (min. 6 znakov).";
      alertBox.classList.add("show");
      return;
    }
    alertBox.classList.remove("show");

    // Simulácia prihlásenia — v tomto demo-prostredí obnovíme/reštartujeme existujúcu reláciu
    let state = loadState();
    if (!state.user) {
      state = defaultState();
      state.user = { name: email.split("@")[0], email };
    } else {
      state.user.email = email;
    }
    saveState(state);
    window.location.href = "dashboard.html";
  });

  function validateField(id, ok) {
    const field = document.getElementById(id).closest(".field");
    field.classList.toggle("invalid", !ok);
    return ok;
  }
}

/* -------------------------------------------------------------------------
   5. DASHBOARD (dashboard.html)
   ------------------------------------------------------------------------- */

function initDashboard() {
  let state = requireAuth();
  if (!state) return;
  state = updateStreakOnVisit(state);

  renderTopbar(state);
  renderPath(state);
}

function renderTopbar(state) {
  document.getElementById("stat-streak").textContent = state.streak;
  document.getElementById("stat-xp").textContent = state.xp;
  document.getElementById("stat-hearts").textContent = Math.max(0, state.hearts);
  const chip = document.getElementById("user-chip-name");
  if (chip) chip.textContent = state.user.name.split(" ")[0];
  const avatar = document.getElementById("user-avatar");
  if (avatar) avatar.textContent = initials(state.user.name);

  const doneCount = state.completed.length;
  const pct = Math.round((doneCount / TOTAL_LEVELS) * 100);
  const ring = document.getElementById("progress-ring-fg");
  if (ring) {
    const circumference = 2 * Math.PI * 26;
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference - (pct / 100) * circumference}`;
  }
  const ringLabel = document.getElementById("progress-ring-label");
  if (ringLabel) ringLabel.textContent = `${pct}%`;
  const doneOf = document.getElementById("dash-progress-text");
  if (doneOf) doneOf.textContent = `${doneCount} / ${TOTAL_LEVELS} levelov dokončených`;
}

function levelStatus(state, level, index) {
  if (state.completed.includes(level.id)) return "done";
  const prev = LEVELS[index - 1];
  if (!prev || state.completed.includes(prev.id)) return "unlocked";
  return "locked";
}

function renderPath(state) {
  const container = document.getElementById("path-container");
  if (!container) return;
  container.innerHTML = "";

  let currentAssigned = false;
  const positions = [0, 1, 2, 3, 4, 5]; // meandering pattern classes pos-0..pos-5

  CHAPTERS.forEach((chapter) => {
    const banner = document.createElement("div");
    banner.className = "chapter-banner";
    banner.style.background = `linear-gradient(135deg, var(--${chapter.key}), color-mix(in srgb, var(--${chapter.key}) 70%, black))`;
    banner.innerHTML = `
      <div class="cb-num">${chapter.id}</div>
      <div class="cb-text">
        <div class="cb-title">${chapter.title}</div>
        <div class="cb-sub">${chapter.sub}</div>
      </div>`;
    container.appendChild(banner);

    const track = document.createElement("div");
    track.className = "path-track";
    let posCursor = 0;

    LEVELS.filter((l) => l.id >= chapter.range[0] && l.id <= chapter.range[1]).forEach((level) => {
      const idx = LEVELS.findIndex((l) => l.id === level.id);
      const status = levelStatus(state, level, idx);

      const row = document.createElement("div");
      row.className = "node-row";
      const wrap = document.createElement("div");
      wrap.className = `node-wrap pos-${positions[posCursor % positions.length]} ${status === "locked" ? "locked" : ""}`;
      posCursor += 1;

      const btn = document.createElement("button");
      const isCheckpoint = level.type === "checkpoint";
      btn.className = `level-node ${status === "locked" ? "locked" : ""} ${status === "done" ? "done" : ""} ${isCheckpoint ? "checkpoint" : ""}`;
      btn.style.background = status === "locked" ? "" : status === "done" ? "" : `linear-gradient(150deg, var(--${chapter.key}), color-mix(in srgb, var(--${chapter.key}) 65%, black))`;
      btn.disabled = status === "locked";
      btn.setAttribute("aria-label", `Level ${level.id}: ${level.title}`);

      if (status === "locked") {
        btn.innerHTML = `<span class="lock-icon">🔒</span>`;
      } else if (status === "done") {
        btn.innerHTML = "";
      } else {
        btn.innerHTML = isCheckpoint ? "★" : `<span class="num">${level.id}</span>`;
      }

      if (status === "unlocked" && !currentAssigned) {
        const badge = document.createElement("div");
        badge.className = "node-current-badge";
        badge.textContent = "ĎALEJ";
        wrap.appendChild(badge);
        currentAssigned = true;
      }

      btn.addEventListener("click", () => {
        if (status === "locked") return;
        window.location.href = `modules.html?level=${level.id}`;
      });

      const caption = document.createElement("div");
      caption.className = "node-caption";
      caption.textContent = level.title;

      wrap.appendChild(btn);
      wrap.appendChild(caption);
      row.appendChild(wrap);
      track.appendChild(row);
    });

    container.appendChild(track);
  });
}

function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = "index.html";
}

/* -------------------------------------------------------------------------
   6. LEKCIE / MODULES ENGINE (modules.html)
   ------------------------------------------------------------------------- */

let lessonState = null; // { state, level, answered, correctSoFar }

function initLessonPage() {
  const state = requireAuth();
  if (!state) return;

  const params = new URLSearchParams(window.location.search);
  const levelId = parseInt(params.get("level"), 10);
  const level = LEVELS.find((l) => l.id === levelId);

  if (!level) {
    window.location.href = "dashboard.html";
    return;
  }

  const idx = LEVELS.findIndex((l) => l.id === levelId);
  const status = levelStatus(state, level, idx);
  if (status === "locked") {
    window.location.href = "dashboard.html";
    return;
  }

  if (state.hearts <= 0) {
    renderOutOfHearts();
    return;
  }

  lessonState = { state, level, checkpointIndex: 0, checkpointCorrect: 0 };

  updateLessonTopbar();
  renderLessonBody();

  document.getElementById("close-lesson").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
}

function updateLessonTopbar() {
  const { level } = lessonState;
  const idx = LEVELS.findIndex((l) => l.id === level.id);
  const pct = Math.round(((idx) / TOTAL_LEVELS) * 100);
  document.getElementById("lesson-progress-fill").style.width = `${pct}%`;
  const heartsEl = document.getElementById("lesson-hearts");
  heartsEl.innerHTML = Array.from({ length: START_HEARTS })
    .map((_, i) => `<span>${i < lessonState.state.hearts ? "❤️" : "🖤"}</span>`)
    .join("");
}

function loseHeart() {
  lessonState.state.hearts = Math.max(0, lessonState.state.hearts - 1);
  saveState(lessonState.state);
  updateLessonTopbar();
  if (lessonState.state.hearts <= 0) {
    setTimeout(renderOutOfHearts, 900);
  }
}

function renderOutOfHearts() {
  const root = document.getElementById("lesson-root");
  root.innerHTML = `
    <div class="glass lesson-card">
      <div class="out-of-hearts">
        <div class="oh-icon">💔</div>
        <h2>Došli ti srdiečka</h2>
        <p>Neveš hlavu — srdiečka sa obnovia. Vráť sa na dashboard a skús to znova neskôr, alebo si zopakuj predchádzajúci level.</p>
        <div class="lesson-footer" style="justify-content:center; margin-top:24px;">
          <a class="btn btn-primary" href="dashboard.html">Späť na dashboard</a>
        </div>
      </div>
    </div>`;
}

function markLevelComplete(xpGain) {
  const { state, level } = lessonState;
  if (!state.completed.includes(level.id)) {
    state.completed.push(level.id);
    state.xp += xpGain;
  }
  saveState(state);
}

function renderComplete(xpGain) {
  const root = document.getElementById("lesson-root");
  const { level } = lessonState;
  root.innerHTML = `
    <div class="glass lesson-card">
      <div class="complete-screen">
        <div class="complete-badge">🏆</div>
        <h2>Level ${level.id} dokončený!</h2>
        <p>${level.title}${level.type === "checkpoint" ? " — previerka úspešne zvládnutá." : ""}</p>
        <div class="complete-stats">
          <div class="complete-stat"><span class="cs-num">+${xpGain}</span><span class="cs-label">XP</span></div>
          <div class="complete-stat"><span class="cs-num">${lessonState.state.streak}</span><span class="cs-label">Séria dní</span></div>
        </div>
        <div class="lesson-footer" style="justify-content:center;">
          <a class="btn btn-primary btn-lg" href="dashboard.html">Pokračovať na mapu</a>
        </div>
      </div>
    </div>`;
}

function renderLessonBody() {
  const { level } = lessonState;
  const root = document.getElementById("lesson-root");
  const chapter = chapterForLevel(level.id);

  const header = `
    <div class="lesson-kicker">${chapter.title} · Level ${level.id}</div>
    <h2>${level.title}</h2>
    <p class="lesson-theory">${level.theory}</p>`;

  if (level.type === "quiz") renderQuiz(root, header);
  else if (level.type === "checkpoint") renderCheckpoint(root, header);
  else if (level.type === "kerning") renderKerning(root, header);
  else if (level.type === "contrast") renderContrast(root, header);
  else if (level.type === "hierarchy") renderHierarchy(root, header);
  else if (level.type === "grid") renderGridChoice(root, header);
}

/* ---- Typ: quiz (jedna otázka, 4 možnosti) ---- */
function renderQuiz(root, header) {
  const { level } = lessonState;
  const letters = ["A", "B", "C", "D"];
  root.innerHTML = `
    <div class="glass lesson-card">
      ${header}
      <p style="font-weight:700;color:var(--ink);margin-bottom:14px;">${level.q}</p>
      <div class="quiz-options" id="quiz-options">
        ${level.options
          .map(
            (opt, i) => `<button class="quiz-option" data-idx="${i}">
              <span class="opt-letter">${letters[i]}</span><span>${opt}</span>
            </button>`
          )
          .join("")}
      </div>
      <div class="feedback-box" id="feedback"></div>
      <div class="lesson-footer">
        <button class="btn btn-primary" id="continue-btn" disabled>Pokračovať</button>
      </div>
    </div>`;

  const buttons = root.querySelectorAll(".quiz-option");
  const feedback = document.getElementById("feedback");
  const continueBtn = document.getElementById("continue-btn");
  let answered = false;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const idx = parseInt(btn.dataset.idx, 10);
      const isCorrect = idx === level.correct;
      buttons.forEach((b) => (b.disabled = true));
      btn.classList.add(isCorrect ? "correct" : "incorrect");
      if (!isCorrect) buttons[level.correct].classList.add("correct");

      feedback.classList.add("show", isCorrect ? "ok" : "bad");
      feedback.innerHTML = `<div>${isCorrect ? "Správne! 🎉" : "Nie celkom."}</div><div class="fb-explain">${level.explain}</div>`;

      if (!isCorrect) loseHeart();
      continueBtn.disabled = false;
      continueBtn.addEventListener(
        "click",
        () => {
          markLevelComplete(XP_PER_QUIZ);
          renderComplete(XP_PER_QUIZ);
        },
        { once: true }
      );
    });
  });
}

/* ---- Typ: checkpoint (viac otázok za sebou) ---- */
function renderCheckpoint(root, header) {
  const { level } = lessonState;
  renderCheckpointQuestion(root, header, 0, 0);
}

function renderCheckpointQuestion(root, header, qIndex, correctSoFar) {
  const { level } = lessonState;
  const total = level.questions.length;
  const q = level.questions[qIndex];
  const letters = ["A", "B", "C", "D"];

  root.innerHTML = `
    <div class="glass lesson-card">
      ${header}
      <div class="checkpoint-meta">Otázka ${qIndex + 1} / ${total}</div>
      <p style="font-weight:700;color:var(--ink);margin:6px 0 14px;">${q.q}</p>
      <div class="quiz-options" id="quiz-options">
        ${q.options
          .map(
            (opt, i) => `<button class="quiz-option" data-idx="${i}">
              <span class="opt-letter">${letters[i]}</span><span>${opt}</span>
            </button>`
          )
          .join("")}
      </div>
      <div class="feedback-box" id="feedback"></div>
      <div class="lesson-footer">
        <button class="btn btn-primary" id="continue-btn" disabled>${qIndex + 1 === total ? "Dokončiť" : "Ďalšia otázka"}</button>
      </div>
    </div>`;

  const buttons = root.querySelectorAll(".quiz-option");
  const feedback = document.getElementById("feedback");
  const continueBtn = document.getElementById("continue-btn");
  let answered = false;
  let gotItRight = false;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const idx = parseInt(btn.dataset.idx, 10);
      gotItRight = idx === q.correct;
      buttons.forEach((b) => (b.disabled = true));
      btn.classList.add(gotItRight ? "correct" : "incorrect");
      if (!gotItRight) buttons[q.correct].classList.add("correct");
      feedback.classList.add("show", gotItRight ? "ok" : "bad");
      feedback.textContent = gotItRight ? "Správne! 🎉" : "Nie celkom — správna odpoveď je zvýraznená.";
      if (!gotItRight) loseHeart();
      continueBtn.disabled = false;
    });
  });

  continueBtn.addEventListener("click", () => {
    const newCorrect = correctSoFar + (gotItRight ? 1 : 0);
    if (qIndex + 1 < total) {
      renderCheckpointQuestion(root, header, qIndex + 1, newCorrect);
    } else {
      markLevelComplete(XP_PER_CHECKPOINT);
      renderComplete(XP_PER_CHECKPOINT);
    }
  });
}

/* ---- Typ: kerning (posuvník úpravy rozostupu písmen) ---- */
function renderKerning(root, header) {
  const { level } = lessonState;
  root.innerHTML = `
    <div class="glass lesson-card">
      ${header}
      <p style="font-weight:700;color:var(--ink);margin-bottom:6px;">${level.prompt}</p>
      <div class="kerning-stage">
        <div class="kerning-word" id="kerning-word" style="letter-spacing:${level.start}px;">${level.word}</div>
      </div>
      <div class="slider-row">
        <input type="range" id="kerning-slider" min="${level.min}" max="${level.max}" step="${level.step}" value="${level.start}" aria-label="Rozostup písmen">
        <span class="slider-value" id="kerning-value">${level.start}px</span>
      </div>
      <div class="puzzle-target">Cieľ: nájdi rozostup, ktorý pôsobí vizuálne vyvážene a klikni na „Skontrolovať“.</div>
      <div class="feedback-box" id="feedback"></div>
      <div class="check-btn-row">
        <button class="btn btn-secondary" id="check-btn">Skontrolovať</button>
      </div>
      <div class="lesson-footer">
        <button class="btn btn-primary" id="continue-btn" disabled>Pokračovať</button>
      </div>
    </div>`;

  const word = document.getElementById("kerning-word");
  const slider = document.getElementById("kerning-slider");
  const valueLabel = document.getElementById("kerning-value");
  const feedback = document.getElementById("feedback");
  const continueBtn = document.getElementById("continue-btn");
  const checkBtn = document.getElementById("check-btn");

  slider.addEventListener("input", () => {
    word.style.letterSpacing = `${slider.value}px`;
    valueLabel.textContent = `${slider.value}px`;
  });

  checkBtn.addEventListener("click", () => {
    const val = parseFloat(slider.value);
    const ok = val >= level.targetMin && val <= level.targetMax;
    feedback.classList.add("show", ok ? "ok" : "bad");
    feedback.innerHTML = `<div>${ok ? "Presne tak! Rozostup pôsobí vyvážene. 🎉" : "Ešte to nesedí — skús posuvník doladiť."}</div><div class="fb-explain">${level.explain}</div>`;
    if (ok) {
      continueBtn.disabled = false;
    } else {
      loseHeart();
    }
    continueBtn.addEventListener(
      "click",
      () => {
        markLevelComplete(XP_PER_QUIZ);
        renderComplete(XP_PER_QUIZ);
      },
      { once: true }
    );
  });
}

/* ---- Typ: contrast (WCAG kontrastný pomer) ---- */
function relLuminance(hex) {
  const rgb = hex
    .replace("#", "")
    .match(/.{2}/g)
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(hex1, hex2) {
  const l1 = relLuminance(hex1);
  const l2 = relLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function lightnessToHex(lightness) {
  const v = Math.round((lightness / 100) * 255);
  const hex = v.toString(16).padStart(2, "0");
  return `#${hex}${hex}${hex}`;
}

function renderContrast(root, header) {
  const { level } = lessonState;
  root.innerHTML = `
    <div class="glass lesson-card">
      ${header}
      <p style="font-weight:700;color:var(--ink);margin-bottom:6px;">${level.prompt}</p>
      <div class="contrast-stage">
        <div class="contrast-preview" id="contrast-preview" style="background:${level.bg};">Aa Vzorový text</div>
      </div>
      <div class="slider-row">
        <input type="range" id="contrast-slider" min="${level.min}" max="${level.max}" step="${level.step}" value="${level.startLightness}" aria-label="Jas textu">
        <span class="slider-value" id="contrast-value"></span>
      </div>
      <div class="contrast-ratio-readout" id="contrast-ratio"></div>
      <div class="puzzle-target">Cieľ: kontrastný pomer aspoň ${level.targetRatio} : 1 (WCAG AA).</div>
      <div class="feedback-box" id="feedback"></div>
      <div class="check-btn-row">
        <button class="btn btn-secondary" id="check-btn">Skontrolovať</button>
      </div>
      <div class="lesson-footer">
        <button class="btn btn-primary" id="continue-btn" disabled>Pokračovať</button>
      </div>
    </div>`;

  const preview = document.getElementById("contrast-preview");
  const slider = document.getElementById("contrast-slider");
  const valueLabel = document.getElementById("contrast-value");
  const ratioReadout = document.getElementById("contrast-ratio");
  const feedback = document.getElementById("feedback");
  const continueBtn = document.getElementById("continue-btn");
  const checkBtn = document.getElementById("check-btn");

  function refresh() {
    const lightness = parseFloat(slider.value);
    const textHex = lightnessToHex(lightness);
    preview.style.color = textHex;
    valueLabel.textContent = `${Math.round(lightness)}%`;
    const ratio = contrastRatio(textHex, level.bg);
    const pass = ratio >= level.targetRatio;
    ratioReadout.innerHTML = `Pomer: <span class="${pass ? "pass" : "fail"}">${ratio.toFixed(2)} : 1</span>`;
    return pass;
  }
  refresh();
  slider.addEventListener("input", refresh);

  checkBtn.addEventListener("click", () => {
    const ok = refresh();
    feedback.classList.add("show", ok ? "ok" : "bad");
    feedback.innerHTML = `<div>${ok ? "Kontrast vyhovuje štandardu WCAG AA! 🎉" : "Kontrast je ešte nedostatočný."}</div><div class="fb-explain">${level.explain}</div>`;
    if (ok) {
      continueBtn.disabled = false;
    } else {
      loseHeart();
    }
    continueBtn.addEventListener(
      "click",
      () => {
        markLevelComplete(XP_PER_QUIZ);
        renderComplete(XP_PER_QUIZ);
      },
      { once: true }
    );
  });
}

/* ---- Typ: hierarchy (zoradenie prvkov pomocou tlačidiel hore/dole) ---- */
function renderHierarchy(root, header) {
  const { level } = lessonState;
  let order = shuffle([...level.items]);
  // zaisti, aby úvodné poradie nebolo náhodou hneď správne
  if (JSON.stringify(order.map((i) => i.id)) === JSON.stringify(level.correctOrder)) {
    order.reverse();
  }

  function draw() {
    const list = document.getElementById("hierarchy-list");
    list.innerHTML = order
      .map(
        (item, i) => `
      <div class="hierarchy-item" data-id="${item.id}">
        <span class="hi-rank num">${i + 1}</span>
        <span class="hi-label">${item.label}</span>
        <span class="hi-controls">
          <button type="button" data-dir="up" data-i="${i}" aria-label="Posunúť vyššie">↑</button>
          <button type="button" data-dir="down" data-i="${i}" aria-label="Posunúť nižšie">↓</button>
        </span>
      </div>`
      )
      .join("");

    list.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.i, 10);
        const dir = btn.dataset.dir;
        const j = dir === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= order.length) return;
        [order[i], order[j]] = [order[j], order[i]];
        draw();
      });
    });
  }

  root.innerHTML = `
    <div class="glass lesson-card">
      ${header}
      <p style="font-weight:700;color:var(--ink);margin-bottom:14px;">${level.prompt}</p>
      <div class="hierarchy-list" id="hierarchy-list"></div>
      <div class="feedback-box" id="feedback"></div>
      <div class="check-btn-row">
        <button class="btn btn-secondary" id="check-btn">Skontrolovať poradie</button>
      </div>
      <div class="lesson-footer">
        <button class="btn btn-primary" id="continue-btn" disabled>Pokračovať</button>
      </div>
    </div>`;
  draw();

  const feedback = document.getElementById("feedback");
  const continueBtn = document.getElementById("continue-btn");
  document.getElementById("check-btn").addEventListener("click", () => {
    const currentOrder = order.map((i) => i.id);
    const ok = JSON.stringify(currentOrder) === JSON.stringify(level.correctOrder);
    document.querySelectorAll(".hierarchy-item").forEach((el, i) => {
      el.classList.remove("correct", "incorrect");
      el.classList.add(order[i].id === level.correctOrder[i] ? "correct" : "incorrect");
    });
    feedback.classList.add("show", ok ? "ok" : "bad");
    feedback.innerHTML = `<div>${ok ? "Presné poradie! 🎉" : "Ešte to nesedí — skús prvky preusporiadať."}</div><div class="fb-explain">${level.explain}</div>`;
    if (ok) {
      continueBtn.disabled = false;
    } else {
      loseHeart();
    }
    continueBtn.addEventListener(
      "click",
      () => {
        markLevelComplete(XP_PER_QUIZ);
        renderComplete(XP_PER_QUIZ);
      },
      { once: true }
    );
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---- Typ: grid (vizuálna voľba mriežky / rozloženia, alebo klik na priesečník) ---- */
function renderGridChoice(root, header) {
  const { level } = lessonState;

  if (level.kind === "choice") {
    root.innerHTML = `
      <div class="glass lesson-card">
        ${header}
        <p style="font-weight:700;color:var(--ink);margin-bottom:6px;">${level.q}</p>
        <div class="grid-choice-list" id="grid-choice-list">
          ${level.choices
            .map(
              (c, i) => `
            <button class="grid-choice" data-idx="${i}">
              <div class="mockup">${renderMockup(c.cols)}</div>
              <div class="gc-label">${c.label}</div>
            </button>`
            )
            .join("")}
        </div>
        <div class="feedback-box" id="feedback"></div>
        <div class="lesson-footer">
          <button class="btn btn-primary" id="continue-btn" disabled>Pokračovať</button>
        </div>
      </div>`;

    const buttons = root.querySelectorAll(".grid-choice");
    const feedback = document.getElementById("feedback");
    const continueBtn = document.getElementById("continue-btn");
    let answered = false;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const idx = parseInt(btn.dataset.idx, 10);
        const isCorrect = level.choices[idx].correct;
        buttons.forEach((b) => (b.disabled = true));
        btn.classList.add(isCorrect ? "correct" : "incorrect");
        if (!isCorrect) {
          const correctIdx = level.choices.findIndex((c) => c.correct);
          buttons[correctIdx].classList.add("correct");
        }
        feedback.classList.add("show", isCorrect ? "ok" : "bad");
        feedback.innerHTML = `<div>${isCorrect ? "Správna voľba! 🎉" : "Nie celkom."}</div><div class="fb-explain">${level.explain}</div>`;
        if (!isCorrect) loseHeart();
        continueBtn.disabled = false;
        continueBtn.addEventListener(
          "click",
          () => {
            markLevelComplete(XP_PER_QUIZ);
            renderComplete(XP_PER_QUIZ);
          },
          { once: true }
        );
      });
    });
    return;
  }

  // kind: "cell" (pravidlo tretín) — klik na mriežku
  const size = level.gridSize;
  root.innerHTML = `
    <div class="glass lesson-card">
      ${header}
      <p style="font-weight:700;color:var(--ink);margin-bottom:14px;">${level.prompt}</p>
      <div class="kerning-stage" style="padding:20px;">
        <div id="rule-grid" style="display:grid;grid-template-columns:repeat(${size},1fr);gap:6px;aspect-ratio:1;max-width:320px;margin:0 auto;"></div>
      </div>
      <div class="feedback-box" id="feedback"></div>
      <div class="lesson-footer">
        <button class="btn btn-primary" id="continue-btn" disabled>Pokračovať</button>
      </div>
    </div>`;

  const grid = document.getElementById("rule-grid");
  const feedback = document.getElementById("feedback");
  const continueBtn = document.getElementById("continue-btn");
  let answered = false;

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("button");
    cell.style.cssText = "border:2px solid var(--line-strong);border-radius:10px;background:#fff;cursor:pointer;";
    cell.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const isCorrect = level.correctCells.includes(i);
      Array.from(grid.children).forEach((c, idx) => {
        c.disabled = true;
        if (level.correctCells.includes(idx)) c.style.background = "#e9faf1";
        if (idx === i && !isCorrect) c.style.background = "#fdeeee";
      });
      feedback.classList.add("show", isCorrect ? "ok" : "bad");
      feedback.innerHTML = `<div>${isCorrect ? "Presne — priesečník mriežky! 🎉" : "Skús priesečník mriežkových línií."}</div><div class="fb-explain">${level.explain}</div>`;
      if (!isCorrect) loseHeart();
      continueBtn.disabled = false;
      continueBtn.addEventListener(
        "click",
        () => {
          markLevelComplete(XP_PER_QUIZ);
          renderComplete(XP_PER_QUIZ);
        },
        { once: true }
      );
    });
    grid.appendChild(cell);
  }
}

function renderMockup(cols) {
  if (cols === "landing") {
    return `<span style="flex:0 0 100%;"></span>`;
  }
  if (cols === "random" || cols === "wall") {
    return `<span></span>`;
  }
  return Array.from({ length: Math.min(cols, 12) })
    .map(() => "<span></span>")
    .join("");
}
