import type { Dict } from './en';

const it: Dict = {
  meta: {
    siteName: 'BorderDay',
    tagline: 'Tieni sotto controllo i giorni di lavoro oltre confine — prima delle soglie.',
    description:
      'BorderDay ti aiuta a registrare telelavoro, giorni in sede e trasferte rispetto alle soglie ufficiali fiscali e di sicurezza sociale per i confini europei. Strumento personale di registrazione — non consulenza fiscale.',
  },
  nav: {
    home: 'Home',
    app: 'App',
    pricing: 'Prezzi',
    faq: 'FAQ',
    privacy: 'Privacy',
    disclaimer: 'Avvertenza',
    openApp: 'Apri l’app',
    joinWaitlist: 'Iscriviti alla lista d’attesa',
  },
  lang: {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    label: 'Lingua',
  },
  home: {
    heroTitle: 'Sai a che punto sei rispetto alle soglie di giorni',
    heroBody:
      'Registra ogni giorno lavorativo come telelavoro a casa, in sede, trasferta, o giorno non lavorato. BorderDay li conta rispetto alle regole ufficiali fiscali e di sicurezza sociale del tuo confine — e ti avvisa prima di avvicinarti alle soglie.',
    ctaPrimary: 'Inizia (gratis sul tuo dispositivo)',
    ctaSecondary: 'Vedi i prezzi',
    feature1Title: 'Quattro tipi di giorno',
    feature1Body:
      'Telelavoro a casa, in sede sul luogo di lavoro, paese terzo / trasferta, e giorni non lavorati — ciascuno contato come richiedono le regole del tuo confine.',
    feature2Title: 'Fisco e sicurezza sociale, separati',
    feature2Body:
      'Le soglie sono sistemi indipendenti. BorderDay tiene un contatore per ciascuna, con la soglia ufficiale e un link alla fonte.',
    feature3Title: 'Privacy local-first',
    feature3Body:
      'Il diario dei giorni resta sul tuo dispositivo. Esporta o elimina in qualsiasi momento. Nessun tracciamento continuo della posizione.',
    bordersTitle: 'Confini coperti nella versione 1',
    bordersIntro:
      'Le regole provengono da fonti ufficiali pubbliche. I contatori ancora in conferma mostrano «regola in corso di conferma» e restano disattivati.',
    howTitle: 'Come funziona',
    how1: 'Scegli il tuo confine (paese di residenza → paese del luogo di lavoro).',
    how2: 'Registra ogni giorno con pochi tocchi.',
    how3: 'Segui i contatori fiscali e di sicurezza sociale. Avvisi al 75%, 90% e 100%.',
    waitlistTitle: 'Pagamenti in arrivo',
    waitlistBody:
      'Il checkout non è ancora attivo. Lascia la tua e-mail e ti avviseremo all’apertura degli abbonamenti individuali e aziendali. Nel frattempo puoi usare il diario dei giorni gratis sul tuo dispositivo.',
    waitlistPlaceholder: 'tu@esempio.com',
    waitlistButton: 'Avvisami',
    waitlistNote: 'Conservato solo se invii il modulo. Niente spam.',
    disclaimerShort:
      'BorderDay è uno strumento personale di registrazione e promemoria. Non è consulenza fiscale né legale.',
  },
  borders: {
    geneva_fr: 'Ginevra / Romandia ← Francia',
    basel_fr: 'Basilea ← Francia',
    basel_de: 'Basilea ← Germania',
    luxembourg_fr: 'Lussemburgo ← Francia',
    luxembourg_be: 'Lussemburgo ← Belgio',
    luxembourg_de: 'Lussemburgo ← Germania',
    belgium_fr: 'Belgio ← Francia',
    belgium_nl: 'Belgio ← Paesi Bassi',
    ticino_it: 'Ticino ← Italia',
    geneva_region: 'Cantoni coperti dall’avenant fiscale franco-svizzero sul telelavoro (dal 1° gen. 2026).',
    basel_region: 'Nord-ovest della Svizzera / area di Basilea.',
    ticino_region: 'Accordo Italia–Svizzera sui lavoratori frontalieri, come modificato per il telelavoro.',
  },
  dayTypes: {
    telework: 'Telelavoro a casa',
    onsite: 'In sede sul luogo di lavoro',
    third_country: 'Paese terzo / trasferta',
    non_working: 'Giorno non lavorato',
    teleworkHint: 'Giorno di lavoro svolto nel paese di residenza (domicilio o coworking locale).',
    onsiteHint: 'Giorno di lavoro presso la sede del datore di lavoro nel paese del luogo di lavoro.',
    third_countryHint: 'Trasferta, formazione, visita cliente o missione temporanea fuori dal paese del luogo di lavoro.',
    non_workingHint: 'Ferie, festivo non lavorato, malattia o giorno di riposo.',
  },
  counters: {
    tax: 'Fiscale',
    social_security: 'Sicurezza sociale',
    ch_fr_tax_telework_40: 'Quota di telelavoro (max 40% del tempo di lavoro annuo)',
    ch_fr_tax_missions_10: 'Missioni temporanee fuori dalla Svizzera (max 10 giorni/anno)',
    ch_fr_tax_note:
      'Secondo l’accordo amichevole franco-svizzero, il telelavoro dalla Francia fino al 40% del tempo di lavoro annuo può restare imponibile in Svizzera. Le missioni temporanee (fino a 10 giorni/anno, pro rata) rientrano in tale espressione. Fonte: ge.ch / AFC (ESTV).',
    ch_fr_missions_note:
      'Fino a 10 giorni all’anno di missioni temporanee in Francia o in un paese terzo possono essere trattati nell’espressione del telelavoro, fermo restando il tetto del 40%. Anno parziale / part-time: tetto prorata, arrotondato per eccesso. Fonte: accordo amichevole ESTV.',
    lu_tax_tolerance_34: 'Giorni fuori dal Lussemburgo (soglia di tolleranza: 34 giorni)',
    lu_tax_tolerance_pending: 'Giorni fuori dal Lussemburgo (tolleranza fiscale)',
    lu_fr_tax_note:
      'Per i residenti in Francia impiegati in Lussemburgo: 34 giorni per periodo d’imposta fisicamente presenti in Francia e/o in uno Stato terzo per esercitare l’impiego, senza perdere l’imposizione lussemburghese per l’intero periodo. Qualsiasi frazione di giorno conta come giorno intero. Ferie, riposo settimanale, festivi (quando non c’è obbligo di lavorare), malattia e forza maggiore sono esclusi. Fonte: accordo amichevole impots.gouv.fr.',
    ss_framework_under_50: 'Telelavoro transfrontaliero (accordo quadro: sotto il 50%)',
    ss_framework_note:
      'Secondo l’accordo quadro UE/SEE/CH sul telelavoro transfrontaliero, il telelavoro abituale nello Stato di residenza sotto il 50% del tempo di lavoro totale può mantenere la sicurezza sociale dello Stato del datore di lavoro se entrambi gli Stati hanno firmato e viene richiesto un documento portatile A1. Fonte: SPF Sicurezza sociale belga (depositario); CLEISS.',
    ss_framework_lu_note:
      'CCSS Lussemburgo: telelavoro esclusivamente nello Stato di residenza, tra il 25% e sotto il 50% del tempo di lavoro totale, entrambi gli Stati hanno firmato → il datore può richiedere un A1 affinché la copertura lussemburghese continui. Un’attività abituale non di telelavoro nello Stato di residenza o lavoro in un altro Stato membro può uscire dal quadro. Fonte: CCSS.',
    ch_it_tax_telework_25: 'Telelavoro al domicilio (max 25% dell’attività dipendente)',
    ch_it_tax_nonreturn_45: 'Giorni senza rientro giornaliero a casa (max 45 giorni/anno)',
    ch_it_tax_note:
      'Secondo il protocollo modificativo dell’accordo Italia–Svizzera, un lavoratore frontaliere può svolgere al massimo il 25 per cento dell’attività dipendente in modalità di telelavoro al domicilio nello Stato di residenza in un anno civile senza modificare lo status né il trattamento fiscale di tale telelavoro. Fonte: Fedlex RU 2026 104; DFI (SIF).',
    ch_it_nonreturn_note:
      'In linea di principio, fino a 45 giorni in un anno civile senza rientro giornaliero a casa per motivi professionali (ferie e giorni di malattia non conteggiati in tali 45). Fonte: protocollo modificativo Fedlex.',
    basel_de_tax_pending: 'Regole fiscali sui giorni Germania–Svizzera',
    basel_de_employer_commute: 'Prassi datore (Basilea Città): giorni in sede questo mese (soglia ≈ 5)',
    basel_de_employer_note:
      'Indicazioni HR di Basilea Città (stato 1° gen. 2026): home office solo se il dipendente si reca sul luogo di lavoro svizzero almeno 1 giorno a settimana o almeno 5 giorni al mese. Prassi del datore, non un contatore fiscale federale pubblicato. Fonte: Dipartimento delle finanze del Cantone Basilea Città.',
    be_tax_pending: 'Regole fiscali sui giorni per i corridoi belgi',
    ruleBeingConfirmed: 'Regola in corso di conferma',
    pending_bmf:
      'Le regole esatte Germania–Svizzera (giorni / non-rientro) per questo corridoio sono in corso di conferma rispetto ai testi di consultazione BMF. Questo contatore resta disattivato.',
    pending_lu_be_tax:
      'La soglia di tolleranza lussemburghese per i residenti belgi è spesso descritta come 34 giorni, ma le pagine primarie ACD / SPF Finances non sono state confermate per questa versione. Contatore disattivato.',
    pending_lu_de_tax:
      'La soglia di tolleranza lussemburghese per i residenti tedeschi (inclusa un’eventuale regola dei 30 minuti) è in corso di conferma rispetto alle pagine ACD / BMF. Contatore disattivato.',
    pending_be_tax:
      'Nessuna soglia di tolleranza pubblica semplice per FR→BE o NL→BE è stata verificata su SPF Finances per questa versione. Contatore fiscale disattivato; resta disponibile il contatore dell’accordo quadro di sicurezza sociale.',
    usedOf: '{used} su {limit}',
    percentUsed: '{used}% su {limit}%',
    usedOfDays: '{used} di {allowed} giorni',
    percentOfAnnual: '{pct}% di {annual} gg/anno (limite {limit}%)',
    status_ok: 'Entro la soglia',
    status_warn: 'Soglia in avvicinamento',
    status_critical: 'Vicino alla soglia',
    status_over: 'Oltre la soglia',
    status_disabled: 'Non ancora disponibile',
    sourceLink: 'Fonte ufficiale',
    checkedOn: 'Verificato il {date}',
  },
  app: {
    title: 'Il tuo diario dei giorni',
    pickBorder: 'Il tuo confine',
    pickBorderHint: 'Residenza → luogo di lavoro',
    today: 'Oggi',
    logDay: 'Registra questo giorno',
    changeDay: 'Modifica',
    calendar: 'Calendario',
    counters: 'I tuoi contatori',
    noBorder: 'Scegli un pacchetto di confine per vedere i contatori.',
    exportJson: 'Esporta JSON',
    exportCsv: 'Esporta CSV',
    deleteAll: 'Elimina tutti i giorni',
    deleteAllConfirm: 'Eliminare tutti i giorni su questo dispositivo? Azione irreversibile.',
    deleted: 'Tutti i giorni eliminati.',
    annualWorkingDays: 'Giorni lavorativi contrattuali / anno',
    annualWorkingDaysHint:
      'Usato per convertire i conteggi in percentuale. Il valore predefinito dipende dal tuo pacchetto di confine.',
    installHint: 'Aggiungi BorderDay alla schermata Home per un’app con un tocco.',
    emptyMonth: 'Nessun giorno registrato questo mese.',
    weekdays: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
    disclaimerBanner:
      'Solo strumento di registrazione — non consulenza fiscale o legale. Verifica le soglie presso l’autorità competente.',
  },
  pricing: {
    title: 'Prezzi',
    subtitle: 'Solo abbonamenti. Il checkout non è ancora attivo — iscriviti alla lista d’attesa.',
    individual: 'Privato',
    company: 'Azienda / HR',
    monthly: '4,99 € / mese',
    yearly: '49 € / anno',
    yearlyNote: 'Circa due mesi gratis rispetto al mensile.',
    companyPrice: '5 € / dipendente attivo / mese',
    companyMin: 'Minimo 39 € / mese',
    companyYearly: 'Fatturazione annuale: 2 mesi gratis',
    includes: 'Incluso',
    include1: 'Tutti i pacchetti di confine del tuo piano',
    include2: 'Contatori fiscali e di sicurezza sociale separati',
    include3: 'Avvisi all’avvicinarsi delle soglie',
    include4: 'Esporta ed elimina i tuoi dati in qualsiasi momento',
    include5: 'Inglese, francese, tedesco, italiano',
    include6: 'PWA installabile',
    companyInclude1: 'Dashboard multi-dipendente (con il checkout)',
    companyInclude2: 'Pacchetti condivisi ed export',
    comingSoon: 'In arrivo',
    waitlistCta: 'Iscriviti alla lista d’attesa',
    compareNote: 'Prezzi allineati a strumenti comparabili verificati il 31 ott. 2026 (Europe/Zurich).',
  },
  faq: {
    title: 'FAQ',
    q1: 'BorderDay è consulenza fiscale o legale?',
    a1: 'No. È uno strumento personale di registrazione e promemoria. Le soglie provengono da fonti ufficiali pubbliche e possono cambiare. Verifica sempre con il datore di lavoro, un consulente qualificato o l’autorità competente.',
    q2: 'Dove è memorizzato il mio diario dei giorni?',
    a2: 'Sul tuo dispositivo (IndexedDB nel browser). Puoi esportare JSON o CSV, o eliminare tutto. La sincronizzazione cloud opzionale non è in questa versione.',
    q3: 'Perché alcuni contatori sono disattivati?',
    a3: 'Mostriamo un numero solo quando è confermato su una pagina ufficiale. Altrimenti il contatore indica «regola in corso di conferma» e non inventa un valore.',
    q4: 'Tracciate la mia posizione?',
    a4: 'No. La versione 1 non ha GPS né localizzazione in background. Registri i giorni tu.',
    q5: 'Quali confini coprite?',
    a5: 'Ginevra/Romandia–Francia, Basilea–Francia/Germania, Lussemburgo con Francia/Belgio/Germania, Belgio a partire dai pendolari dalla Francia e dai Paesi Bassi, e Ticino–Italia.',
    q6: 'E l’App Store?',
    a6: 'La versione 1 è una progressive web app installabile (schermata Home). Un’app iOS nativa potrà arrivare più avanti.',
    q7: 'Come funzionano i pagamenti?',
    a7: 'Il checkout non è ancora attivo. Previsto: Stripe Managed Payments (merchant of record, IVA). Iscriviti alla lista d’attesa per l’avviso di apertura.',
  },
  privacy: {
    title: 'Privacy',
    updated: 'Ultimo aggiornamento: 31 ott. 2026 (Europe/Zurich)',
    s1Title: 'Cosa raccogliamo in questa versione',
    s1Body:
      'Il diario memorizza sul tuo dispositivo: il pacchetto di confine scelto, il tipo di ogni giorno (telelavoro, in sede, paese terzo, non lavorato), note opzionali e impostazioni opzionali come i giorni lavorativi contrattuali all’anno. Questi dati non lasciano il dispositivo salvo esportazione.',
    s2Title: 'Cosa non facciamo',
    s2Body:
      'Niente GPS continuo. Niente tracker pubblicitari. Niente vendita di dati personali. Per il diario locale non serve un account.',
    s3Title: 'E-mail della lista d’attesa',
    s3Body:
      'Se invii un’e-mail tramite il modulo della lista d’attesa, serve solo ad avvisarti all’apertura degli abbonamenti. Puoi chiedere la rimozione in qualsiasi momento.',
    s4Title: 'I tuoi diritti',
    s4Body:
      'Esporta o elimina il diario locale in qualsiasi momento dall’app. Per le e-mail della lista d’attesa, contattaci per cancellare il tuo indirizzo.',
    s5Title: 'Responsabili del trattamento (futuro)',
    s5Body:
      'Quando account e checkout saranno attivi, i responsabili (hosting, e-mail, pagamenti) saranno elencati qui con i loro ruoli. Preferenza per la residenza dei dati nell’UE, se disponibile.',
    contact: 'Contatto privacy: privacy@borderday.com',
  },
  disclaimer: {
    title: 'Avvertenza',
    body:
      'BorderDay è uno strumento personale di registrazione e promemoria. Non è consulenza fiscale, non è consulenza legale e non sostituisce il datore di lavoro, un consulente fiscale qualificato o l’istituzione di sicurezza sociale competente. Le soglie mostrate provengono da fonti ufficiali pubbliche e possono cambiare; verifica sempre presso l’autorità che si applica alla tua situazione. Sei responsabile dell’accuratezza dei giorni che registri.',
  },
  footer: {
    tagline: 'Registrazione personale dei giorni per il lavoro transfrontaliero.',
    rights: '© {year} BorderDay',
  },
  waitlist: {
    thanks: 'Grazie — ti scriveremo all’apertura del checkout.',
    invalid: 'Inserisci un indirizzo e-mail valido.',
    localOnly:
      'In questa anteprima l’indirizzo resta solo sul tuo dispositivo per mostrare la conferma. L’archiviazione reale della lista d’attesa sarà collegata quando l’invio e-mail sarà approvato.',
  },
};

export default it;
