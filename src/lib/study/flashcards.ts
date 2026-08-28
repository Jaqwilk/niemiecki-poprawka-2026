import type { LessonNumber } from './types';

export type VocabularyFlashcard = {
  id: string;
  lesson: LessonNumber;
  category: string;
  german: string;
  polish: string;
  example?: string;
};

const rawDecks: Record<LessonNumber, string> = {
  13: `
Miejsca w mieście::der Park, die Parks::park::Im Park kann man einen Spaziergang machen.
Miejsca w mieście::der Zoo, die Zoos::zoo::Der Zoo gefällt den Touristen.
Miejsca w mieście::der Tierpark, die Tierparks::park zwierząt::Im Tierpark gibt es viele Tiere.
Miejsca w mieście::der Spielplatz, die Spielplätze::plac zabaw::Neben dem Park gibt es einen Spielplatz.
Miejsca w mieście::der Markt, die Märkte::rynek / targ::Auf dem Markt gibt es einen Brunnen.
Miejsca w mieście::der Brunnen, die Brunnen::fontanna / studnia::Der Brunnen ist vor dem Rathaus.
Miejsca w mieście::das Rathaus, die Rathäuser::ratusz::Das Rathaus finde ich schön.
Miejsca w mieście::die Kirche, die Kirchen::kościół::Die Kirche gehört zur Altstadt.
Miejsca w mieście::das Schloss, die Schlösser::zamek / pałac::Wir besuchen am Vormittag das Schloss.
Miejsca w mieście::das Museum, die Museen::muzeum::Das Museum gefällt mir besonders gut.
Miejsca w mieście::der See, die Seen::jezioro::Am See kann man ein Boot mieten.
Miejsca w mieście::die Altstadt, die Altstädte::stare miasto::In der Altstadt gibt es viele Cafés.
Miejsca w mieście::der Hafen, die Häfen::port::Der Hafen ist ein guter Tipp.
Miejsca w mieście::das Geschäft, die Geschäfte / der Laden, die Läden::sklep::In der Straße gibt es viele Läden.
Miejsca w mieście::das Café, die Cafés / die Bar, die Bars::kawiarnia / bar::Leider gibt es hier kein Café.
Miejsca w mieście::das Schwimmbad, die Schwimmbäder::basen::Am Nachmittag gehen wir ins Schwimmbad.
Wycieczka i czas wolny::der Tagesausflug, die Tagesausflüge::jednodniowa wycieczka
Wycieczka i czas wolny::am Vormittag / am Nachmittag::przed południem / po południu
Wycieczka i czas wolny::frühstücken::jeść śniadanie
Wycieczka i czas wolny::einen Spaziergang machen::iść na spacer
Wycieczka i czas wolny::ein Picknick machen::zrobić piknik
Wycieczka i czas wolny::angeln::łowić ryby
Wycieczka i czas wolny::ein Boot mieten::wynająć łódź
Wycieczka i czas wolny::ein Museum / Schloss besuchen::odwiedzić muzeum / zamek
Wycieczka i czas wolny::das Straßenfest, die Straßenfeste::festyn uliczny
Wycieczka i czas wolny::das Lieblingsviertel, die Lieblingsviertel::ulubiona dzielnica
Słowa do rozpoznawania::die Leute::ludzie
Słowa do rozpoznawania::die Mauer::mur
Słowa do rozpoznawania::der Tourist::turysta
Słowa do rozpoznawania::der Blogger::bloger
Słowa do rozpoznawania::der Freizeitpark::park rozrywki
Słowa do rozpoznawania::das Märchenbuch::książka z baśniami
Słowa do rozpoznawania::die Kunst::sztuka
Słowa do rozpoznawania::die Kultur::kultura
Słowa do rozpoznawania::das Festival::festiwal
Słowa do rozpoznawania::der Pelikan::pelikan
Słowa do rozpoznawania::die Natur::natura
Słowa do rozpoznawania::der Garten::ogród
Słowa do rozpoznawania::die Wohnung::mieszkanie
Słowa do rozpoznawania::das Zimmer::pokój
Słowa do rozpoznawania::der Mietpreis::cena najmu
Ocena i reakcje::cool::super / fajny
Ocena i reakcje::verrückt::szalony
Ocena i reakcje::toll::świetny
Ocena i reakcje::schön::ładny
Ocena i reakcje::interessant::interesujący
Ocena i reakcje::teuer::drogi
Ocena i reakcje::anders::inny
Ocena i reakcje::besonders gut::szczególnie dobrze
Ocena i reakcje::nicht so::niezbyt
Ocena i reakcje::gar nicht::wcale nie
Ocena i reakcje::leider::niestety
`,
  14: `
Ruch i orientacja::geradeaus gehen::iść prosto
Ruch i orientacja::nach links / rechts abbiegen::skręcić w lewo / w prawo
Ruch i orientacja::über die Straße gehen::przejść przez ulicę
Ruch i orientacja::weiter geradeaus gehen::iść dalej prosto
Ruch i orientacja::bis zum Platz gehen::iść aż do placu
Ruch i orientacja::an der Ampel abbiegen::skręcić przy światłach
Ruch i orientacja::die erste / zweite / dritte Straße::pierwsza / druga / trzecia ulica
Ruch i orientacja::die Kreuzung, die Kreuzungen::skrzyżowanie
Ruch i orientacja::die Ecke, die Ecken::róg
Ruch i orientacja::die Ampel, die Ampeln::sygnalizacja świetlna
Ruch i orientacja::der Platz, die Plätze::plac
Ruch i orientacja::der Meter, die Meter::metr
Ruch i orientacja::weit / nicht weit::daleko / niedaleko
Miejsca::das Kaufhaus, die Kaufhäuser::dom towarowy
Miejsca::die Apotheke, die Apotheken::apteka
Miejsca::die Post::poczta
Miejsca::die Bank, die Banken::bank
Miejsca::das Krankenhaus, die Krankenhäuser::szpital
Miejsca::die Polizei::policja
Miejsca::das Rathaus, die Rathäuser::ratusz
Miejsca::das Zentrum, die Zentren::centrum
Miejsca::die Schule, die Schulen::szkoła
Miejsca::der Kindergarten, die Kindergärten::przedszkole
Miejsca::die Brücke, die Brücken::most
Miejsca::die Kirche, die Kirchen::kościół
Miejsca::der Blumenladen, die Blumenläden::kwiaciarnia
Miejsca::das Café, die Cafés::kawiarnia
Miejsca::die Stadtmitte, die Stadtmitten::centrum miasta
Miejsca::die Straße, die Straßen::ulica
Położenie — rzeczy i osoby::die Katze::kot
Położenie — rzeczy i osoby::der Baum::drzewo
Położenie — rzeczy i osoby::der Stuhl::krzesło
Położenie — rzeczy i osoby::das Haus::dom
Położenie — rzeczy i osoby::der Tisch::stół
Położenie — rzeczy i osoby::die Frau::kobieta
Położenie — rzeczy i osoby::die Blumen::kwiaty
Położenie — rzeczy i osoby::das Smartphone::smartfon
Położenie — rzeczy i osoby::das Auto::samochód
Położenie — rzeczy i osoby::der Schlüssel::klucz
Położenie — rzeczy i osoby::die Zeitung::gazeta
Położenie — rzeczy i osoby::das Fahrrad::rower
`,
  15: `
Pomieszczenia::das Zimmer, die Zimmer::pokój
Pomieszczenia::die Wohnung, die Wohnungen::mieszkanie
Pomieszczenia::die WG, die WGs / die Wohngemeinschaft, die Wohngemeinschaften::mieszkanie współdzielone
Pomieszczenia::die Küche, die Küchen::kuchnia
Pomieszczenia::das Bad, die Bäder::łazienka
Pomieszczenia::der Flur, die Flure::korytarz
Pomieszczenia::der Balkon, die Balkone::balkon
Pomieszczenia::der Garten, die Gärten::ogród
Pomieszczenia::der Keller, die Keller::piwnica
Pomieszczenia::das Erdgeschoss, die Erdgeschosse (EG)::parter
Pomieszczenia::das Dachgeschoss, die Dachgeschosse::poddasze / ostatnia kondygnacja
Pomieszczenia::das Apartment, die Apartments::apartament / kawalerka
Meble i dom::das Sofa, die Sofas::kanapa
Meble i dom::der Sessel, die Sessel::fotel
Meble i dom::die Lampe, die Lampen::lampa
Meble i dom::der Schrank, die Schränke::szafa
Meble i dom::der Schreibtisch, die Schreibtische::biurko
Meble i dom::der Teppich, die Teppiche::dywan
Meble i dom::das Bett, die Betten::łóżko
Meble i dom::der Stuhl, die Stühle::krzesło
Meble i dom::das Fenster, die Fenster::okno
Meble i dom::die Tür, die Türen::drzwi
Meble i dom::die Treppe, die Treppen::schody
Meble i dom::das Bild, die Bilder::obraz
Meble i dom::der Rucksack, die Rucksäcke::plecak
Meble i dom::die Sonnenbrille, die Sonnenbrillen::okulary przeciwsłoneczne
Ogłoszenie::die Miete, die Mieten::czynsz
Ogłoszenie::die Nebenkosten (NK)::opłaty dodatkowe
Ogłoszenie::der Quadratmeter, die Quadratmeter (m²)::metr kwadratowy
Ogłoszenie::inklusive (inkl.)::wliczone
Ogłoszenie::von privat (v. priv.)::od osoby prywatnej
Ogłoszenie::möbliert::umeblowane
Ogłoszenie::günstig / teuer::korzystne cenowo / drogie
Ogłoszenie::mieten / vermieten::wynajmować / wynajmować komuś
Ogłoszenie::umziehen::przeprowadzać się
Ogłoszenie::bezahlen::płacić
Ogłoszenie::die Mietpreisbremse, die Mietpreisbremsen::ograniczenie wzrostu czynszów
Gdzie w domu::oben / unten::na górze / na dole::Oben wohnt eine Familie.
Gdzie w domu::vorn / hinten::z przodu / z tyłu::Hinten haben wir einen Garten.
Gdzie w domu::vorne links / rechts::z przodu po lewej / prawej::Finns Zimmer ist vorne links.
Gdzie w domu::hinten links / rechts::z tyłu po lewej / prawej::Die Küche ist hinten rechts.
Ocenianie::schön::ładny
Ocenianie::hässlich::brzydki
Ocenianie::ordentlich::uporządkowany
Ocenianie::unordentlich::nieuporządkowany
Ocenianie::gemütlich::przytulny
Ocenianie::modern::nowoczesny
Ocenianie::langweilig::nudny
Ocenianie::praktisch::praktyczny
Ocenianie::günstig::korzystny cenowo
Ocenianie::teuer / zu teuer::drogi / za drogi
Ocenianie::zu groß::za duży
Ocenianie::zu klein::za mały
Ocenianie::nicht schlecht::całkiem nieźle
Ocenianie::überhaupt nicht schön::zupełnie nieładny
Ocenianie::ganz neu::całkiem nowy
Słowa dodatkowe::der Wald, die Wälder::las
Słowa dodatkowe::der Baum, die Bäume::drzewo
Słowa dodatkowe::der Traum, die Träume::marzenie
Słowa dodatkowe::die Tasse, die Tassen::filiżanka
Słowa dodatkowe::laut::głośny
Słowa dodatkowe::mit dabei::wliczone / dostępne
Słowa dodatkowe::das Semester::semestr
Słowa dodatkowe::übermorgen::pojutrze
Słowa dodatkowe::aufräumen::sprzątać
`,
  16: `
Problemy i reakcje::ein Problem haben::mieć problem::Wir haben hier ein Problem.
Problemy i reakcje::kaputt sein::być zepsutym::Mein Handy ist kaputt.
Problemy i reakcje::nicht funktionieren::nie działać::Der Aufzug funktioniert nicht.
Problemy i reakcje::im Aufzug feststecken::utknąć w windzie::Zwei Personen stecken im Aufzug fest.
Problemy i reakcje::kein Netz / keinen Empfang haben::nie mieć zasięgu::Ich habe kein Netz.
Problemy i reakcje::Angst haben::bać się::Er hat Angst vor engen Räumen.
Problemy i reakcje::nervös sein::być zdenerwowanym::Vor dem Gespräch bin ich nervös.
Problemy i reakcje::reparieren::naprawiać::Können Sie die Maschine reparieren?
Problemy i reakcje::der Notdienst, die Notdienste::pogotowie techniczne::Ich rufe den Notdienst an.
Problemy i reakcje::der Reparaturtermin, die Reparaturtermine::termin naprawy::Wir machen einen Termin aus.
Urządzenia i dom::die Waschmaschine, die Waschmaschinen::pralka::Die Waschmaschine ist sehr laut.
Urządzenia i dom::die Heizung, die Heizungen::ogrzewanie::Die Heizung funktioniert nicht.
Urządzenia i dom::der Kühlschrank, die Kühlschränke::lodówka::Der Kühlschrank ist kaputt.
Urządzenia i dom::der Fernseher, die Fernseher::telewizor::Der Fernseher funktioniert nicht.
Urządzenia i dom::die Lampe, die Lampen / das Licht, die Lichter::lampa / światło::Das Licht geht nicht.
Urządzenia i dom::die Steckdose, die Steckdosen::gniazdko::Die Steckdose ist kaputt.
Urządzenia i dom::der Aufzug, die Aufzüge::winda::Der Aufzug funktioniert nicht.
Urządzenia i dom::die Dusche, die Duschen::prysznic::Die Dusche ist kaputt.
Urządzenia i dom::das Telefon, die Telefone::telefon::Das Telefon funktioniert nicht.
Urządzenia i dom::die Tür, die Türen::drzwi::Die Tür geht nicht auf.
Usługi i sytuacje awaryjne::die Dienstleistung, die Dienstleistungen::usługa::Diese Dienstleistung kostet 40 Euro.
Usługi i sytuacje awaryjne::in der Not::w potrzebie / w sytuacji awaryjnej::In der Not rufe ich den Notdienst an.
Usługi i sytuacje awaryjne::der Ausgang, die Ausgänge::wyjście::Wo ist der Ausgang?
Usługi i sytuacje awaryjne::der Notausgang, die Notausgänge::wyjście awaryjne::Der Notausgang ist links.
Usługi i sytuacje awaryjne::die Bremse, die Bremsen::hamulec::Die Bremse funktioniert nicht.
Usługi i sytuacje awaryjne::die Notbremse, die Notbremsen::hamulec awaryjny::Ziehen Sie nur in der Not die Notbremse.
Usługi i sytuacje awaryjne::der Notruf, die Notrufe::numer / telefon alarmowy::Der Notruf in Europa ist 112.
Usługi i sytuacje awaryjne::der Notarzt, die Notärzte::lekarz pogotowia::Der Notarzt kommt sofort.
Usługi i sytuacje awaryjne::Leute kennenlernen::poznawać ludzi::Im Kurs kann man neue Leute kennenlernen.
Usługi i sytuacje awaryjne::Der Notdienst antwortet nicht.::Pogotowie techniczne nie odpowiada.::Ich rufe noch einmal an.
Ważne czasowniki::schaffen::dać radę / zdążyć; tworzyć::Ich schaffe das.
Słowa dodatkowe::der Handwerker::fachowiec
Słowa dodatkowe::der Arzt::lekarz
Słowa dodatkowe::die Adresse::adres
Słowa dodatkowe::die Maschine::maszyna / urządzenie
Słowa dodatkowe::das Handtuch::ręcznik
Słowa dodatkowe::der Monat::miesiąc
Słowa dodatkowe::das Vorstellungsgespräch::rozmowa kwalifikacyjna
Słowa dodatkowe::das Praktikum::praktyka / staż
Słowa dodatkowe::der Kurs::kurs
Słowa dodatkowe::das Training::trening
Słowa dodatkowe::die Pause::przerwa
`,
  17: `
Zawody i nauka::der Polizist, die Polizisten::policjant
Zawody i nauka::der Arzt, die Ärzte / die Ärztin, die Ärztinnen::lekarz / lekarka
Zawody i nauka::der Tierarzt, die Tierärzte::weterynarz
Zawody i nauka::der Tierfotograf, die Tierfotografen::fotograf zwierząt
Zawody i nauka::der Lehrer, die Lehrer / die Lehrerin, die Lehrerinnen::nauczyciel / nauczycielka
Zawody i nauka::der Architekt, die Architekten / die Architektin, die Architektinnen::architekt / architektka
Zawody i nauka::der Schauspieler, die Schauspieler::aktor
Zawody i nauka::der Politiker, die Politiker::polityk
Zawody i nauka::der Krankenpfleger, die Krankenpfleger::pielęgniarz
Zawody i nauka::der Traumberuf, die Traumberufe::wymarzony zawód
Zawody i nauka::der Schulabschluss, die Schulabschlüsse::ukończenie szkoły
Zawody i nauka::das Medizinstudium, die Medizinstudien::studia medyczne
Zawody i nauka::der Studienplatz, die Studienplätze::miejsce na studiach
Zawody i nauka::die Ausbildung, die Ausbildungen::kształcenie zawodowe
Zawody i nauka::das Praktikum, die Praktika::praktyka / staż
Praca i kariera::studieren::studiować
Praca i kariera::im Büro / Krankenhaus arbeiten::pracować w biurze / szpitalu
Praca i kariera::Menschen helfen::pomagać ludziom
Praca i kariera::selbstständig sein::pracować na własny rachunek
Praca i kariera::eine Firma / ein Start-up gründen::założyć firmę / start-up
Praca i kariera::eine Firma besitzen::posiadać firmę::Meine Tante besitzt eine Firma.
Praca i kariera::Mir gehört eine Firma.::Należy do mnie firma / jestem właścicielem firmy
Praca i kariera::eine Halbtagsstelle haben::mieć pracę na pół etatu
Praca i kariera::Geld verdienen::zarabiać pieniądze
Praca i kariera::super Noten haben::mieć bardzo dobre oceny
Praca i kariera::einen Job suchen::szukać pracy
Plany i podróże::viele Pläne haben::mieć wiele planów
Plany i podróże::eine große Reise machen::odbyć dużą podróż
Plany i podróże::mit dem Rucksack durch Europa reisen::podróżować z plecakiem po Europie
Plany i podróże::im Ausland leben::mieszkać za granicą
Plany i podróże::Fremdsprachen lernen::uczyć się języków obcych
Plany i podróże::den Führerschein machen::zrobić prawo jazdy
Plany i podróże::mit dem Motorrad durch Europa fahren::jechać motocyklem po Europie
Plany i podróże::um die Welt segeln::żeglować dookoła świata
Plany i podróże::ein Instrument lernen::nauczyć się grać na instrumencie
Plany i podróże::auf einen Berg steigen::wejść na górę
Plany i podróże::heiraten / eine Familie haben::pobrać się / mieć rodzinę
Pewność planu::auf jeden Fall::na pewno
Pewność planu::unbedingt::koniecznie
Pewność planu::lieber::raczej / chętniej
Pewność planu::vielleicht::być może
Pewność planu::hoffentlich::mam nadzieję
Pewność planu::auf keinen Fall::w żadnym razie
Słowa dodatkowe::international::międzynarodowy
Słowa dodatkowe::die Influencerin::influencerka
Słowa dodatkowe::das Start-up::start-up
Słowa dodatkowe::das Crowdfunding::finansowanie społecznościowe
Słowa dodatkowe::der Lifestyle::styl życia
Słowa dodatkowe::das Marketing::marketing
Słowa dodatkowe::vegan::wegański
Słowa dodatkowe::die Fitnessuhr::zegarek fitness
Słowa dodatkowe::der E-Reader::czytnik e-booków
Słowa dodatkowe::die E-Books::e-booki
Słowa dodatkowe::die Kreditkarte::karta kredytowa
Słowa dodatkowe::die Kollegin::koleżanka z pracy
Słowa dodatkowe::die Eltern::rodzice
Słowa dodatkowe::die Sonnenbrille::okulary przeciwsłoneczne
`,
  18: `
Ciało::der Kopf, die Köpfe::głowa
Ciało::das Auge, die Augen::oko
Ciało::das Ohr, die Ohren::ucho
Ciało::die Nase, die Nasen::nos
Ciało::der Mund, die Münder::usta
Ciało::der Hals, die Hälse::gardło / szyja
Ciało::der Rücken, die Rücken::plecy
Ciało::die Brust, die Brüste::klatka piersiowa
Ciało::der Bauch, die Bäuche::brzuch
Ciało::der Arm, die Arme::ręka / ramię
Ciało::die Hand, die Hände::dłoń
Ciało::der Finger, die Finger::palec
Ciało::das Bein, die Beine::noga
Ciało::das Knie, die Knie::kolano
Ciało::der Fuß, die Füße::stopa
Objawy::die Kopfschmerzen::ból głowy
Objawy::die Halsschmerzen::ból gardła
Objawy::die Bauchschmerzen::ból brzucha
Objawy::die Rückenschmerzen::ból pleców
Objawy::der Husten::kaszel
Objawy::der Schnupfen::katar
Objawy::das Fieber::gorączka
Objawy::die Erkältung, die Erkältungen::przeziębienie
Objawy::das Herzproblem, die Herzprobleme::problem z sercem
Objawy::das Atemproblem, die Atemprobleme::problem z oddychaniem
Objawy::die Atemstörung, die Atemstörungen::zaburzenie oddychania
Objawy::die Schlafstörung, die Schlafstörungen::zaburzenie snu
Objawy::die Müdigkeit::zmęczenie
Objawy::das Übergewicht::nadwaga
Objawy::müde / krank / gesund::zmęczony / chory / zdrowy
Objawy::wehtun::boleć
Rady i leczenie::der Ratschlag, die Ratschläge::rada
Rady i leczenie::die Ruhe::odpoczynek / spokój
Rady i leczenie::der Hustensaft, die Hustensäfte::syrop na kaszel
Rady i leczenie::das Medikament, die Medikamente::lek
Rady i leczenie::die Salbe, die Salben::maść
Rady i leczenie::die Tablette, die Tabletten::tabletka
Rady i leczenie::die Hühnersuppe, die Hühnersuppen::rosół
Rady i leczenie::der Ingwertee, die Ingwertees::herbata imbirowa
Rady i leczenie::genug trinken / schlafen::wystarczająco pić / spać
Rady i leczenie::im Bett bleiben::zostać w łóżku
Rady i leczenie::spazieren gehen::iść na spacer
Rady i leczenie::zum Arzt gehen::iść do lekarza
Sport i nawyki::Sport treiben / Sport machen::uprawiać sport
Sport i nawyki::Übungen / Yoga machen::wykonywać ćwiczenia / jogę
Sport i nawyki::die Treppe benutzen::korzystać ze schodów
Sport i nawyki::mit dem Roller fahren::jechać hulajnogą
Sport i nawyki::im Stehen telefonieren::rozmawiać przez telefon na stojąco
Sport i nawyki::lange / viel sitzen::długo / dużo siedzieć
Sport i nawyki::genug Bewegung haben::mieć wystarczająco dużo ruchu
Sport i nawyki::einen Spaziergang machen::iść na spacer
Sport i nawyki::Gymnastik machen / turnen::ćwiczyć gimnastykę
Sport i nawyki::Stress vermeiden::unikać stresu
Sport i nawyki::nicht rauchen::nie palić
Sport i nawyki::keinen Alkohol trinken::nie pić alkoholu
Sport i nawyki::keine Drogen nehmen::nie brać narkotyków
Sport i nawyki::koffeinhaltige Getränke::napoje zawierające kofeinę
Sport i nawyki::die Süßigkeit, die Süßigkeiten::słodycz / słodycze
Słowa dodatkowe::schlimm::poważny / zły
Słowa dodatkowe::üblich::zwyczajny / przyjęty
Słowa dodatkowe::ziemlich komisch::dość dziwne
Słowa dodatkowe::die Bitte::prośba
Słowa dodatkowe::Frisbee spielen::grać we frisbee
Słowa dodatkowe::Milch mit Honig::mleko z miodem
Słowa dodatkowe::viel Obst essen::jeść dużo owoców
Słowa dodatkowe::zu Hause::w domu
`,
};

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLocaleLowerCase('de-DE')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
}

function parseDeck(lesson: LessonNumber, source: string): VocabularyFlashcard[] {
  const seen = new Map<string, number>();
  return source
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [category, german, polish, example] = line.split('::').map((part) => part.trim());
      if (!category || !german || !polish) throw new Error(`Nieprawidłowa fiszka Lektion ${lesson}: ${line}`);
      const baseId = `l${lesson}-${slugify(german)}`;
      const occurrence = (seen.get(baseId) ?? 0) + 1;
      seen.set(baseId, occurrence);
      return {
        id: occurrence === 1 ? baseId : `${baseId}-${occurrence}`,
        lesson,
        category,
        german,
        polish,
        ...(example ? { example } : {}),
      };
    });
}

export const vocabularyFlashcards = ([13, 14, 15, 16, 17, 18] as const).flatMap((lesson) =>
  parseDeck(lesson, rawDecks[lesson]),
);

export const flashcardCountsByLesson = Object.fromEntries(
  ([13, 14, 15, 16, 17, 18] as const).map((lesson) => [
    lesson,
    vocabularyFlashcards.filter((card) => card.lesson === lesson).length,
  ]),
) as Record<LessonNumber, number>;

