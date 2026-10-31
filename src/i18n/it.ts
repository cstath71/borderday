import type { Dict } from './en';

const it: Dict = {
  meta: {
    siteName: 'BorderDay',
    tagline: 'Soglie di giorni transfrontalieri per HR e collaboratori — prima delle sorprese.',
    description:
      'BorderDay aiuta HR e collaboratori a registrare telelavoro, giorni in sede e trasferte. Contatori di sicurezza sociale su tutti i nove corridoi; contatori fiscali su quattro: Ginevra e altri cantoni fuori dall’accordo del 1983, Germania→Svizzera, Francia→Lussemburgo e Italia→Svizzera. Strumento di tracciamento — non consulenza fiscale o legale.',
  },
  nav: {
    home: 'Home',
    app: 'App collaboratore',
    pricing: 'Prezzi',
    faq: 'FAQ',
    privacy: 'Privacy',
    disclaimer: 'Avvertenza',
    terms: 'Condizioni',
    openApp: 'Apri l’app',
    joinWaitlist: 'Accedi',
    forIndividuals: 'Per i privati',
    forCompanies: 'Per le aziende',
    hrDashboard: 'Dashboard HR',
    companySignup: 'Crea azienda',
  },
  lang: {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    label: 'Lingua',
  },
  home: {
    heroTitle: 'Un solo strumento per tutti i confini dei vostri team',
    heroBody:
      'Per HR e responsabili finanziari a Ginevra, Basilea, in Ticino, Lussemburgo e Belgio: contatori di giorni per collaboratore, prima di un cambio di affiliazione o del superamento di una soglia fiscale. Contatori di sicurezza sociale su tutti i nove corridoi, contatori fiscali su quattro, e ogni corridoio indica cosa copre. Quattro lingue, fisco e sicurezza sociale seguiti separatamente.',
    ctaPrimary: 'Crea account azienda',
    ctaSecondary: 'Vedi prezzi azienda',
    ctaIndividuals: 'Sono un collaboratore individuale',
    riskTitle: 'Perché le soglie di giorni contano per il datore di lavoro',
    risk1Title: 'Affiliazione alla sicurezza sociale',
    risk1Body:
      'Secondo l’accordo quadro UE/SEE/CH, il telelavoro nello Stato di residenza pari o superiore al 25% del tempo di lavoro vi trasferisce di norma la sicurezza sociale, salvo richiesta di un certificato A1. Dal 50% l’accordo quadro non è più disponibile. BorderDay mostra le tre fasce, separate dal fisco: sotto il 25%, dal 25% a meno del 50% (A1 richiesto) e 50% o più.',
    risk2Title: 'Soglie fiscali di giorni',
    risk2Body:
      'Oggi i contatori fiscali funzionano su quattro corridoi: Ginevra e altri cantoni fuori dall’accordo del 1983 (40% / 10 giorni di missione), Germania→Svizzera (60 giorni di mancato rientro), Francia→Lussemburgo (34 giorni, ridotti per il tempo parziale) e Italia→Svizzera (25% / 45 giorni di mancato rientro). Gli altri cinque dichiarano chiaramente che nessun contatore fiscale è attivo. Non inventiamo mai un numero.',
    risk3Title: 'Team multi-confine',
    risk3Body:
      'Una dashboard aziendale per collaboratori su confini diversi. Filtri per confine o stato. Export CSV per audit. I collaboratori vedono esattamente gli stessi contatori dell’HR.',
    feature1Title: 'Fisco e sicurezza sociale, separati',
    feature1Body:
      'Contatori indipendenti con fonti ufficiali collegate. Avvisi al 75% e al 90% della soglia reale, poi stati «al limite» e «oltre il limite» con la conseguenza spiegata.',
    feature2Title: 'Invito tramite link e-mail',
    feature2Body: 'I collaboratori entrano in azienda, scelgono il pacchetto confine e registrano solo il tipo di giorno — mai la posizione GPS.',
    feature3Title: 'Protezione dei dati fin dalla progettazione',
    feature3Body: 'Orientato a GDPR e alla Legge federale svizzera sulla protezione dei dati (LPD / nLPD): isolamento per azienda, export e cancellazione, consenso chiaro, nota di conservazione. L’HR vede tipi di giorno e conteggi, non la posizione.',
    bordersTitle: 'Corridoi coperti nella versione 1',
    bordersIntro:
      'Ogni corridoio indica cosa conta oggi. Se nessuna regola fiscale può ancora essere conteggiata, lo dice e non mostra alcun numero.',
    howTitle: 'Come le aziende usano BorderDay',
    how1: 'Create un account azienda e invitate i collaboratori con un link e-mail.',
    how2: 'Ogni collaboratore sceglie il pacchetto confine e registra telelavoro / in sede / missione / non lavorato.',
    how3: 'L’HR osserva i contatori fiscali e di sicurezza sociale, filtra per stato ed esporta CSV.',
    waitlistTitle: 'Inizia con un account azienda',
    waitlistBody:
      'Crea un account azienda con e-mail o Google, invita il team e abbonati dalla pagina Prezzi. Un\'azienda DEMO etichettata resta disponibile.',
    waitlistPlaceholder: 'voi@azienda.com',
    waitlistButton: 'Crea account',
    waitlistNote: 'Niente lista d\'attesa — account e checkout sono attivi. Piani azienda: 5 €/dipendente/mese (min. 39 €), prova di 7 giorni.',
    disclaimerShort:
      'BorderDay è uno strumento di tracciamento e promemoria delle classificazioni dei giorni. Non è consulenza fiscale o legale. Verificate sempre con l’autorità competente o un consulente qualificato.',
    demoBanner: 'Gli screenshot e l’azienda precaricata usano dati DEMO chiaramente etichettati — non collaboratori reali.',
    inShort:
      'BorderDay aiuta HR a registrare telelavoro, giorni in sede e missioni per collaboratore: contatori di sicurezza sociale su tutti i nove corridoi in cinque regioni, contatori fiscali su quattro di essi. Piano aziendale: 5 € per collaboratore attivo al mese (minimo 39 €); individuali 4,99 €/mese o 49 €/anno. Prova di 7 giorni con carta richiesta. Strumento di tracciamento — non consulenza fiscale o legale.',
    inShortLabel: 'In breve',
    chipTaxYes: 'Fisco: sì',
    chipTaxNo: 'Fisco: non ancora',
    chipSsYes: 'Sicurezza sociale: sì',
  },
  borders: {
    geneva_fr: 'Ginevra e altri cantoni fuori dall’accordo del 1983 ← Francia',
    basel_fr: 'Basilea e altri cantoni dell’accordo del 1983 ← Francia',
    basel_de: 'Basilea / Svizzera ← Germania',
    luxembourg_fr: 'Lussemburgo ← Francia',
    luxembourg_be: 'Lussemburgo ← Belgio',
    luxembourg_de: 'Lussemburgo ← Germania',
    belgium_fr: 'Belgio ← Francia',
    belgium_nl: 'Belgio ← Paesi Bassi',
    ticino_it: 'Ticino ← Italia',
    geneva_region:
      'Regime della convenzione: Ginevra e tutti i cantoni fuori dall’accordo del 1983, regola sul telelavoro applicabile dal 1° gen. 2026. Se il datore di lavoro è a Berna, Soletta, Basilea Città, Basilea Campagna, Vaud, Vallese, Neuchâtel o Giura, scegliete invece il pacchetto dell’accordo del 1983.',
    basel_region:
      'La regola dei 60 giorni vale per tutta la Svizzera. Il minimo di 5 giorni è la regola che Basilea Città applica al proprio personale.',
    ticino_region: 'Accordo Italia–Svizzera sui lavoratori frontalieri, come modificato per il telelavoro.',
    ch_fr_1983_region:
      'Accordo del 1983: Berna, Soletta, Basilea Città, Basilea Campagna, Vaud, Vallese, Neuchâtel e Giura. Ginevra e gli altri cantoni seguono un altro regime: scegliete l’altro pacchetto Francia–Svizzera.',
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
    teleworkHint_ticino:
      'Giorno di lavoro presso il vostro domicilio in Italia. Il protocollo dice «presso il proprio domicilio»: non è confermato se un giorno in co-working conti, verificate con la vostra autorità.',
    third_countryHint_basel_de:
      'Lavoro fuori da Germania e Svizzera: sempre un giorno di mancato rientro, anche con rientro la sera. Non usatelo per una trasferta di un giorno in Germania o in Svizzera.',
    logHint_luxembourg_fr:
      'Ogni frazione di giornata fuori dal Lussemburgo conta come giornata intera: registrate l’intera giornata come telelavoro o trasferta.',
    overnightAway: 'Notte fuori per lavoro (nessun rientro a casa)',
    overnightAwayHint:
      'Un sì o un no, mai un luogo. Alcune soglie contano questi giorni. In un account aziendale, HR lo vede con il tipo di giorno.',
    overnightAwayShort: 'Notte fuori',
  },
  counters: {
    tax: 'Fiscale',
    social_security: 'Sicurezza sociale',
    ch_fr_tax_telework_40: 'Quota di telelavoro (max 40% del tempo di lavoro annuo)',
    ch_fr_tax_missions_10: 'Missioni temporanee fuori dalla Svizzera (max 10 giorni/anno)',
    ch_fr_tax_note:
      'Regime della convenzione: il telelavoro dalla Francia fino al 40% del tempo di lavoro annuo resta imponibile in Svizzera. Fino a 10 giorni di missione all’anno contano come telelavoro, solo nella misura in cui rientrano nel 40% dopo il telelavoro ordinario. Gli altri giorni di missione sono tassati diversamente. Oltre il 40%, il telelavoro è imponibile in Francia dal primo giorno. Il picchetto conta solo in caso di intervento effettivo. Fonti: accordo AFC del 29 apr. 2026; ge.ch.',
    ch_fr_missions_note:
      'Missioni temporanee in Francia o in uno Stato terzo: fino a 10 giorni all’anno contano nel 40%, solo nella misura in cui rientrano dopo il telelavoro ordinario. Tempo parziale o anno incompleto: i 10 giorni sono ridotti proporzionalmente e arrotondati per eccesso. I giorni oltre questi limiti sono imponibili in Francia, fatta salva la convenzione con lo Stato terzo. Fonti: accordo AFC del 29 apr. 2026; scheda impots.gouv.fr.',
    lu_tax_tolerance_34:
      'Giorni fuori dal Lussemburgo (fino a 34 giorni, tempo pieno su tutto l’anno)',
    lu_tax_tolerance_pending: 'Giorni fuori dal Lussemburgo (tolleranza fiscale)',
    lu_fr_tax_note:
      'Residenti in Francia impiegati in Lussemburgo: fino a 34 giorni per periodo d’imposta fisicamente presenti in Francia e/o in uno Stato terzo per lavoro, senza perdere la tassazione in Lussemburgo per il periodo. Tempo parziale o anno incompleto: i 34 giorni sono ridotti proporzionalmente e arrotondati per difetto. Oltre il limite, la Francia può tassare il tempo effettivamente lavorato in Francia o in uno Stato terzo, dal primo giorno. Ogni frazione di giornata conta come giornata intera, e la formazione conta. Ferie, riposo settimanale, festivi non lavorati, malattia e forza maggiore non contano. Il limite copre tutti i vostri contratti dell’anno e spetta a voi provare i giorni: questo registro da solo può non bastare. Fonte: accordo su impots.gouv.fr (il PDF indica 29 giorni, portati a 34 dall’avenant del 7 nov. 2022).',
    ss_framework_under_50: 'Telelavoro transfrontaliero (accordo quadro: A1 dal 25%, meno del 50%)',
    ss_framework_note:
      'Secondo l’accordo quadro UE/SEE/CH: sotto il 25% del tempo di lavoro in telelavoro nello Stato di residenza, non serve un certificato A1 per il telelavoro. Dal 25% a meno del 50%, diventa di norma competente lo Stato di residenza, salvo se datore di lavoro e dipendente chiedono un A1 che mantiene lo Stato del datore di lavoro. L’A1 vale al massimo 3 anni e può retroagire al massimo di 3 mesi, se i contributi vi sono già stati pagati. Dal 50% l’accordo quadro non è disponibile. Non copre chi svolge abitualmente un’attività diversa dal telelavoro nello Stato di residenza, lavora abitualmente in un altro Stato, è indipendente o ha datori di lavoro in più Stati. Il telelavoro presuppone qui un collegamento informatico. Fonti: FPS belga (depositario); CLEISS.',
    ss_framework_lu_note:
      'CCSS Lussemburgo: telelavoro solo nello Stato di residenza. Sotto il 25%: nessun A1 per il telelavoro. Dal 25% a meno del 50%, entrambi gli Stati firmatari: il datore di lavoro può chiedere un A1 per mantenere la copertura lussemburghese; senza di esso diventa di norma competente lo Stato di residenza. Dal 50% l’accordo quadro non è disponibile. Un’attività abituale diversa dal telelavoro nello Stato di residenza o il lavoro in un altro Stato membro può far uscire il caso dall’accordo quadro. Fonti: CCSS; FPS belga.',
    ch_it_tax_telework_25: 'Telelavoro al domicilio (max 25% dell’attività dipendente)',
    ch_it_tax_nonreturn_45: 'Giorni senza rientro a domicilio per lavoro (max 45/anno)',
    ch_it_tax_note:
      'Secondo il protocollo di modifica dell’accordo Italia–Svizzera (in vigore dal 9 feb. 2026, applicabile dal 1° gen. 2024, anche al regime transitorio): al massimo il 25% dell’attività dipendente in telelavoro presso il domicilio nello Stato di residenza per anno civile, senza modificare lo status né il trattamento fiscale di tale telelavoro. Il protocollo non indica cosa accade oltre il 25%. Fonti: Fedlex RU 2026 104; SFI.',
    ch_it_nonreturn_note:
      'In linea di principio, e salvo diversa decisione delle autorità, fino a 45 giorni per anno civile senza rientro quotidiano al domicilio per lavoro. Ferie e malattia non contano. BorderDay conta solo i giorni che segnate come «notte fuori per lavoro»; una trasferta di un giorno non conta. Fonte: protocollo di modifica, Fedlex.',
    basel_de_employer_commute:
      'Regola del personale di Basilea Città: giorni in sede questo mese (minimo 5, o 1 a settimana)',
    basel_de_employer_note:
      'È la regola che il Canton Basilea Città applica al proprio personale (stato al 1° gen. 2026): home office solo se la persona si reca sul luogo di lavoro almeno 1 giorno a settimana o almeno 5 giorni al mese. Altri datori di lavoro possono applicare regole diverse, e non è una soglia fiscale generale. Fonte: Dipartimento delle finanze di Basilea Città.',
    pending_lu_be_tax:
      'Il governo lussemburghese ha annunciato 34 giorni dal 2022 per i residenti in Belgio. Il testo belga su riduzione a tempo parziale e conteggio non è stato trovato, quindi nessun contatore è attivo. Verificate con la vostra autorità.',
    pending_lu_de_tax:
      'Il governo lussemburghese indica che la tolleranza è passata da 19 a 34 giorni dal 2024 per i residenti in Germania. Il testo tedesco su conteggio e tempo parziale non ha potuto essere confermato, quindi nessun contatore è attivo e la riduzione Francia–Lussemburgo non è applicata. Verificate con la vostra autorità.',
    usedOf: '{used} su {limit}',
    percentUsed: '{used}% su {limit}%',
    usedOfDays: '{used} di {allowed} giorni',
    percentOfAnnual: '{pct}% di {annual} gg/anno (limite {limit}%)',
    status_ok: 'Entro la soglia',
    status_warn: 'Attenzione',
    status_critical: 'Vicino alla soglia',
    status_over: 'Oltre la soglia',
    status_disabled: 'Nessun contatore per ora',
    sourceLink: 'Fonti ufficiali',
    checkedOn: 'Verificato il {date}',
    employer_practice: 'Prassi del datore di lavoro',
    ch_fr_over_40:
      'Oltre il 40%: i giorni di telelavoro sono imponibili in Francia dal primo giorno, non solo l’eccedenza, e i giorni di missione non contano più come telelavoro. Verificate con la vostra autorità fiscale.',
    ch_fr_mission_excess:
      'Dei vostri giorni di missione, {counted} contano nel 40% e {excess} no: questi sono imponibili in Francia, fatta salva una convenzione con uno Stato terzo.',
    ch_fr_1983_label: 'Fisco Francia–Svizzera (accordo del 1983): regime in esame',
    ch_fr_1983_value: 'Regime in esame: verificate con la vostra autorità',
    ch_fr_1983_note:
      'Questi cantoni non seguono la regola di Ginevra. Secondo l’accordo del 1983, i residenti in Francia sono in genere tassati in Francia, che versa alla Svizzera il 4,5% del salario lordo. Le condizioni pubblicate comprendono telelavoro fino al 40% del tempo di lavoro, fino a 10 giorni di missione in quel 40% e al massimo 45 notti all’anno in Svizzera o in uno Stato terzo. Un solo giorno di missione in Francia oltre questi limiti mette fine al regime. BorderDay non sa ancora distinguere le missioni in Francia dalle altre, quindi qui non mostra un contatore fiscale piuttosto che un falso via libera. I cittadini svizzeri del settore pubblico e i residenti settimanali sono trattati diversamente. Verificate con la vostra autorità fiscale cantonale.',
    lu_over_34:
      'Limite superato: la Francia può tassare il tempo effettivamente lavorato in Francia o in uno Stato terzo, dal primo giorno. Verificate con la vostra autorità fiscale.',
    prorate_missing:
      '{limit} giorni valgono solo per il tempo pieno su tutto l’anno — indicate la vostra percentuale d’impiego.',
    prorate_applied:
      'Limite adeguato alla vostra percentuale d’impiego del {pct}%: {limit} giorni.',
    at_limit_note: 'Al limite: ancora ammesso, ma il giorno successivo lo supera.',
    ss_band_under: 'Sotto il {from}%: nessun A1 necessario per il telelavoro.',
    ss_band_approaching:
      'In avvicinamento al {from}%: da lì serve un A1 per restare nello Stato del datore di lavoro.',
    ss_band_a1_required:
      'Dal 25% a meno del 50%: A1 richiesto. Senza, diventa di norma competente lo Stato di residenza. Indicatelo qui appena il datore di lavoro lo ha ottenuto.',
    ss_band_a1_recorded:
      'A1 registrato, valido fino al {until}. BorderDay non verifica il certificato.',
    ss_band_a1_recorded_nodate:
      'A1 registrato, senza data di fine. Un A1 dell’accordo quadro vale al massimo 3 anni: aggiungete la data di fine. BorderDay non verifica il certificato.',
    ss_band_a1_expired: 'L’A1 registrato è scaduto il {until}. Dal 25% ne serve uno nuovo.',
    ss_band_residence:
      '50% o più: l’accordo quadro non è disponibile e si applica di norma lo Stato di residenza. Un accordo individuale può essere possibile: verificate con il vostro istituto di sicurezza sociale.',
    ss_third_country:
      'Giorni di trasferta registrati quest’anno: {days}. Un lavoro ricorrente fuori dallo Stato del datore di lavoro può uscire dall’accordo quadro: verificate con il vostro istituto di sicurezza sociale.',
    ch_it_over:
      'Limite superato. Il protocollo non ne indica la conseguenza: chiedete all’autorità competente.',
    basel_de_nonreturn_60: 'Giorni di mancato rientro per lavoro (fino a 60 all’anno)',
    basel_de_nonreturn_note:
      'Germania–Svizzera: lo status di frontaliere si perde oltre 60 giorni di mancato rientro per lavoro all’anno. Sono contati qui i giorni segnati come «notte fuori per lavoro», più ogni giorno di lavoro fuori da Germania e Svizzera, anche con rientro in giornata. Le trasferte di un giorno in Germania o in Svizzera, la malattia e l’infortunio non contano. Nelle trasferte di più giorni pagate dal datore di lavoro contano anche fine settimana e festivi: registrateli come trasferta. Chi lavora a tempo parziale solo certi giorni ha un limite ridotto proporzionalmente, e più datori di lavoro sono valutati insieme. Non è confermato qui se un giorno di home office possa essere un giorno di mancato rientro: verificate con la vostra autorità. Il datore di lavoro presenta il modulo Gre-3 (31 marzo in Argovia; verificate nel vostro cantone). Fonti: KonsVerCHEV §§ 8–9; scheda del Canton Argovia, stato al 1° gen. 2026.',
    basel_de_over_60:
      'Oltre 60 giorni lo status di frontaliere si perde: l’imposta alla fonte svizzera passa dal 4,5% alla tariffa ordinaria per l’anno. Verificate con la vostra autorità fiscale.',
    floor_week_met: 'Raggiunto con almeno un giorno in sede ogni settimana del mese.',
    floor_below_note:
      'Questo mese si è chiuso con meno di {limit} giorni in sede e senza coprire ogni settimana. Se questa regola vi riguarda, verificate con il datore di lavoro.',
    be_fr_tax_label: 'Fisco Francia→Belgio',
    be_fr_value: 'Nessuna tolleranza in giorni trovata',
    be_nl_tax_label: 'Fisco Paesi Bassi→Belgio',
    be_nl_value: 'Nessuna regola confermata: verificate con la vostra autorità',
    lu_announced_value: '34 giorni annunciati: nessun contatore per ora',
    pending_be_fr_tax:
      'Nessuna tolleranza in giorni trovata. I giorni lavorati dalla Francia sono in genere tassati in Francia, in proporzione, dal primo giorno (risposta del ministro francese del 28 maggio 2024). Chi è diventato frontaliere prima del 1° gen. 2012 mantiene un regime distinto fino al 2033, con un limite di 30 giorni fuori dalla zona di frontiera belga. Una convenzione firmata nel 2021 era ancora in attesa di ratifica a quella data. Qui non è attivo alcun contatore: verificate con la vostra autorità.',
    pending_be_nl_tax:
      'Nessuna tolleranza per il lavoro da casa sulla pagina del fisco olandese, che non tratta questi giorni, e nessun testo primario belga trovato. Qui non è attivo alcun contatore: verificate con un consulente o con la vostra autorità.',
    pace_line:
      'Ritmo attuale: {pct}% dei giorni lavorativi registrati finora ({days}).',
    pace_above:
      'Ritmo attuale: {pct}% dei giorni lavorativi registrati finora ({days}), sopra il {limit}%. Se continua, questa soglia sarà superata.',
    multi_employer_note:
      'Questi contatori coprono solo i giorni registrati qui. Altri impieghi nello stesso anno possono contare.',
    ruleAndConditions: 'Regola e condizioni',
    status_approaching: 'Vicino al limite',
    status_at_limit: 'Al limite',
    status_ss_under: 'Sotto il 25%',
    status_a1_required: 'A1 richiesto',
    status_a1_recorded: 'A1 registrato',
    status_ss_residence: '50% o più: Stato di residenza',
    status_floor_met: 'Minimo raggiunto',
    status_floor_below: 'Sotto il minimo',
    status_floor_progress: 'Mese in corso',
    status_floor_no_data: 'Nessun giorno registrato',
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
      'Serve a convertire i giorni in percentuale. Il valore predefinito è un’ipotesi, salvo 240 su Francia–Svizzera, base semplificata ufficiale a tempo pieno: indicate il vostro valore, più basso a tempo parziale.',
    installHint: 'Aggiungi BorderDay alla schermata Home per un’app con un tocco.',
    emptyMonth: 'Nessun giorno registrato questo mese.',
    weekdays: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
    loading: 'Caricamento…',
    previewBadge: 'ANTEPRIMA',
    previewBody: 'Anteprima gratuita: i giorni restano in questo browser su questo dispositivo e si può registrare solo il mese corrente. Un abbonamento sblocca tutti i mesi e salva il registro nel tuo account.',
    previewCompanyBody: '{company} non ha ancora un abbonamento attivo, quindi stai usando l’anteprima gratuita. I giorni restano in questo browser su questo dispositivo e si può registrare solo il mese corrente.',
    previewCta: 'Vedi i piani',
    previewMonthOnly: 'L’anteprima consente di registrare solo il mese corrente.',
    savedToAccount: 'Salvato nel tuo account.',
    savedToCompany:
      'Salvato nel vostro account {company}. Il team HR vede tipo e data di ogni giorno, se è segnato come notte fuori per lavoro, e i vostri contatori.',
    saveError: 'Salvataggio non riuscito. Riprova.',
    deleteAllAccountConfirm: 'Eliminare tutti i giorni salvati nel tuo account? Azione irreversibile.',
    importLocal: 'Copia {count} giorni da questo dispositivo al tuo account',
    disclaimerBanner:
      'Solo strumento di registrazione — non consulenza fiscale o legale. Verifica le soglie presso l’autorità competente.',
    employmentPercent: 'Percentuale d’impiego quest’anno',
    employmentPercentHint:
      'Tempo parziale e anno incompleto insieme: 80 per l’80% tutto l’anno, 50 per il tempo pieno su sei mesi. Alcuni limiti in giorni si riducono con questo valore. In un account aziendale, HR lo vede.',
    a1InPlace: 'Certificato A1 disponibile (accordo quadro)',
    a1ValidUntil: 'A1 valido fino al',
    a1Hint:
      'Indicato da voi o dal datore di lavoro. BorderDay non verifica il certificato. In un account aziendale, HR lo vede.',
  },
  pricing: {
    title: 'Prezzi',
    subtitle: 'Prima il piano azienda. Abbonamenti via Stripe Managed Payments (venduto tramite Link).',
    individual: 'Individuale (collaboratore)',
    company: 'Azienda / HR',
    monthly: '€4,99 / mese',
    yearly: '€49 / anno',
    yearlyNote: 'Circa due mesi gratis rispetto al mensile.',
    companyPrice: '€5 / collaboratore attivo / mese',
    companyMin: 'Minimo €39 / mese (fino a 7 collaboratori attivi)',
    companyYearly: 'Fatturazione annuale: 2 mesi gratis (minimo €390 / anno)',
    activeEmployeeDef:
      'Collaboratore attivo: membro dell\'azienda che ha accettato l\'invito e non è stato disattivato. La fatturazione usa l\'organico attivo corrente in ciascun periodo (minimo €39 / mese).',
    companyTax: 'IVA esclusa',
    individualTax: 'IVA inclusa',
    includes: 'Include',
    include1: 'Tutti i pacchetti confine del piano',
    include2:
      'Contatori fiscali dove disponibili, contatori di sicurezza sociale su ogni corridoio',
    include3: 'Avvisi all’avvicinarsi delle soglie',
    include4: 'Export e cancellazione dei dati in qualsiasi momento',
    include5: 'Inglese, francese, tedesco, italiano',
    include6: 'PWA installabile',
    companyInclude1: 'Dashboard HR con contatori per collaboratore e filtri',
    companyInclude2: 'Inviti e-mail, ruoli (owner / HR in lettura), export CSV di audit',
    companyInclude3: 'I collaboratori vedono gli stessi contatori dell’HR',
    companyInclude4: 'Protezione dei dati fin dalla progettazione (solo tipi di giorno — nessuna posizione)',
    comingSoon: 'Checkout attivo',
    subscribeMonthly: 'Inizia mensile',
    subscribeYearly: 'Inizia annuale',
    trialNote: 'Prova gratuita di 7 giorni — carta richiesta all\'iscrizione.',
    checkoutSuccess: 'Pagamento impostato — la prova è attiva. Apri l\'account per continuare.',
    checkoutCancel: 'Checkout annullato — nessun addebito. Puoi riprovare in qualsiasi momento.',
    goToAccount: 'Vai all\'account',
    needCompany: 'Crea o apri prima un account azienda, poi abbonati.',
    waitlistCta: 'Inizia account',
    compareNote: 'Prezzi allineati a strumenti comparabili al 31 ott 2026 (Europe/Zurich). Non consulenza fiscale.',
    recommended: 'Consigliato per i datori di lavoro',
  },
  faq: {
    title: 'FAQ',
    q1: 'BorderDay è consulenza fiscale o legale?',
    a1: 'No. È uno strumento personale di registrazione e promemoria. Le soglie provengono da fonti ufficiali pubbliche e possono cambiare. Verifica sempre con il datore di lavoro, un consulente qualificato o l’autorità competente.',
    q2: 'Dove è memorizzato il mio diario dei giorni?',
    a2: 'Senza abbonamento, solo sul tuo dispositivo (IndexedDB nel browser). Con un abbonamento attivo o un account aziendale, nel tuo account BorderDay. In ogni caso puoi esportare JSON o CSV, o eliminare tutto.',
    q3: 'Perché alcuni contatori sono disattivati?',
    a3:
      'Mostriamo un numero solo se il metodo di conteggio è confermato da una fonte ufficiale. Altrimenti la scheda spiega perché nessun contatore è attivo e vi rimanda alla vostra autorità. Non inventa mai una cifra.',
    q4: 'Tracciate la mia posizione?',
    a4: 'No. La versione 1 non ha GPS né localizzazione in background. Registri i giorni tu.',
    q5: 'Quali confini coprite?',
    a5:
      'Nove corridoi in cinque regioni. Contatori di sicurezza sociale su tutti i nove. Contatori fiscali su quattro: Ginevra e altri cantoni fuori dall’accordo del 1983←Francia, Germania→Svizzera, Francia→Lussemburgo e Italia→Svizzera. Nessun contatore fiscale per ora: cantoni dell’accordo del 1983←Francia (Basilea e altri), Belgio→Lussemburgo, Germania→Lussemburgo, Francia→Belgio e Paesi Bassi→Belgio.',
    q6: 'E l’App Store?',
    a6: 'La versione 1 è una progressive web app installabile (schermata Home). Un’app iOS nativa potrà arrivare più avanti.',
    q7: 'Come funzionano i pagamenti?',
    a7: 'Il checkout usa Stripe Managed Payments: Link è il merchant of record e gestisce IVA/GST nel checkout. I piani azienda e individuale includono una prova gratuita di 7 giorni; è richiesta una carta all\'iscrizione. I codici promo sono accettati. Vedi le Condizioni per la disdetta e il diritto di recesso di 14 giorni (consumatori UE).',
    q8: 'Cosa non copre BorderDay?',
    a8:
      'Gli indipendenti, le regole speciali del settore pubblico, chi ha datori di lavoro in più Stati e il lavoro senza collegamento informatico ai sensi dell’accordo quadro. I corridoi non elencati, come Francia→Germania o Paesi Bassi→Germania. I contatori vedono solo i giorni registrati qui: altri impieghi dell’anno non sono inclusi. I contatori fiscali non esistono su ogni corridoio. L’export CSV è un documento di lavoro, non una dichiarazione ufficiale come il tasso annuo di telelavoro richiesto da alcuni cantoni. In caso di dubbio, verificate con la vostra autorità.',
  },
  privacy: {
    title: 'Privacy',
    updated: 'Ultimo aggiornamento: 31 ott 2026 (Europe/Zurich)',
    controllerTitle: 'Titolare del trattamento',
    controllerBody:
      'Il titolare del trattamento (GDPR) e il titolare del trattamento ai sensi della Legge federale svizzera sulla protezione dei dati (LPD / nLPD) per gli account azienda BorderDay e i relativi trattamenti è PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Svizzera (IDE/UID CHE-312.418.158). Contatto: hello@borderday.com · Privacy: privacy@borderday.com.',
    s1Title: 'Cosa raccogliamo',
    s1Body:
      'Registro individuale (dispositivo): pacchetto frontiera, tipo di ogni giorno (telelavoro, in sede, paese terzo, non lavorativo), segno di notte fuori per lavoro, note facoltative, giorni lavorativi contrattuali all’anno, percentuale d’impiego e A1 se inseriti. Account aziendali (se usati): nome azienda, e-mail/nomi dei membri, ruoli, pacchetto frontiera, tipi e date dei giorni, segni di notte fuori, percentuale d’impiego e A1 se inseriti, registrazioni del consenso. Progettato per il GDPR e la legge federale svizzera sulla protezione dei dati (LPD / nLPD).',
    s2Title: 'Cosa non raccogliamo',
    s2Body:
      'Niente GPS, niente localizzazione continua, niente geolocalizzazione IP come luogo di lavoro. L’HR vede tipi di giorno, segni di notte fuori, percentuale d’impiego e A1 se inseriti, e conteggi — gli stessi contatori del collaboratore. Niente tracker pubblicitari. Niente vendita di dati personali.',
    s3Title: 'Email account',
    s3Body:
      'Le email account (iscrizione, magic link, inviti) servono solo ad auth e inviti aziendali. Cancellazione: privacy@borderday.com.',
    s4Title: 'I vostri diritti (collaboratori e HR)',
    s4Body:
      'I collaboratori possono esportare e cancellare il diario e vedono esattamente ciò che vede l’HR. Revoca del consenso e cancellazione: privacy@borderday.com.',
    s5Title: 'Responsabili del trattamento e residenza',
    s5Body:
      'Produzione su Supabase (UE, eu-central-1). Responsabili del trattamento: Resend (e-mail transazionali, inclusi inviti e auth), Stripe / Link (pagamenti Managed Payments). Auth: email e Google.',
    s6Title: 'Conservazione dei dati',
    s6Body:
      'Conservazione predefinita dei diari azienda: 24 mesi, salvo diversa impostazione (1–120) o obbligo di legge più lungo. Poi cancellazione o anonimizzazione. I dati DEMO sono etichettati e resettabili.',
    s7Title: 'Trasparenza collaboratore / HR',
    s7Body:
      'Nessun punteggio nascosto per l’HR. La logica dei contatori (giorni usati, ammessi, stato) è identica per collaboratore e dashboard HR.',
    contact: 'Contatto privacy: privacy@borderday.com · hello@borderday.com',
  },
  individuals: {
    title: 'BorderDay per i privati',
    heroTitle: 'Registra i tuoi giorni di confine sul dispositivo',
    heroBody:
      'Dipendenti e chi si registra da sé possono inserire telelavoro, giorni in sede, trasferte e giorni non lavorati: contatori di sicurezza sociale su ogni corridoio, contatori fiscali dove la regola è oggi conteggiabile. Se il datore di lavoro usa BorderDay, entrate con il link di invito per condividere gli stessi contatori con HR.',
    ctaApp: 'Apri l’app collaboratore',
    ctaPricing: 'Prezzo individuale',
    ctaCompanies: 'Il mio datore ha bisogno del piano azienda',
    point1: 'Diario local-first con export e cancellazione',
    point2: 'Stessi pacchetti confine e contatori con fonti prudenti',
    point3: 'Adesione azienda opzionale — vedete ciò che vede l’HR',
  },
  company: {
    signupTitle: 'Crea un account azienda',
    signupSubtitle: 'Accedi con email o Google, poi crea l\'azienda. Abbonati dalla pagina Prezzi quando sei pronto.',
    companyName: 'Nome azienda',
    yourName: 'Il tuo nome',
    workEmail: 'E-mail di lavoro',
    createButton: 'Crea azienda',
    created: 'Azienda creata. Sei owner.',
    openDashboard: 'Apri dashboard HR',
    inviteTitle: 'Invita collaboratori',
    inviteSubtitle: 'Genera un link di invito. Inviamo l\'e-mail di invito quando possibile; puoi sempre copiare e condividere il link.',
    inviteEmail: 'E-mail del collaboratore',
    inviteRole: 'Ruolo',
    roleOwner: 'Owner',
    roleHr: 'HR (sola lettura)',
    roleEmployee: 'Collaboratore',
    sendInvite: 'Crea link di invito',
    inviteLinkLabel: 'Link di invito (copia)',
    inviteCreated: 'Invito creato. Condividi il link con il collaboratore.',
    pendingInvites: 'Inviti in sospeso',
    dashboardTitle: 'Dashboard HR',
    dashboardSubtitle:
      'Contatori fiscali e di sicurezza sociale per collaboratore. Tipi di giorno, segni di notte fuori e conteggi — mai la posizione.',
    filterBorder: 'Filtra per confine',
    filterStatus: 'Filtra per stato',
    filterAll: 'Tutti',
    exportCsv: 'Esporta CSV (audit)',
    employees: 'Collaboratori',
    noEmployees: 'Nessun collaboratore. Crea un link di invito.',
    viewHistory: 'Cronologia giorni',
    historyTitle: 'Cronologia giorni del collaboratore',
    historySubtitle:
      'Solo tipo di giorno, data e segno di notte fuori. Nessun dato di posizione viene memorizzato.',
    backDashboard: 'Torna alla dashboard',
    joinTitle: 'Unisciti alla tua azienda',
    joinSubtitle: 'Accetta l’invito, il consenso di visibilità e scegli il pacchetto confine.',
    joinButton: 'Unisciti all’azienda',
    joinSuccess: 'Sei entrato in azienda. Apri l’app collaboratore per registrare i giorni.',
    pickBorder: 'Il tuo pacchetto confine',
    consentTitle: 'Consenso — cosa può vedere l’HR',
    consentBody:
      'Entrando, accettate che il titolare e i lettori HR del datore di lavoro possano vedere: nome, e-mail, pacchetto frontiera scelto, giorni lavorativi contrattuali, percentuale d’impiego e A1 se inseriti, tipo e data di ogni giorno registrato, se è segnato come notte fuori per lavoro, e gli stessi contatori fiscali e di sicurezza sociale che vedete voi. Possono anche inserire la vostra percentuale d’impiego e il vostro A1. Non vedono GPS né tracce di posizione — BorderDay non raccoglie la posizione. Potete esportare o cancellare il registro. Conservazione predefinita: 24 mesi (impostazione aziendale). Strumento di tracciamento, non consulenza fiscale o legale.',
    consentAccept: 'Ho letto e accetto questo avviso',
    consentRequired: 'Accetta l’avviso di consenso per continuare.',
    demoDataBadge: 'DATI DEMO',
    demoBanner: 'Questa azienda è etichettata DEMO. Cifre di esempio per l’anteprima — non collaboratori reali.',
    loadDemo: 'Carica azienda DEMO',
    loading: 'Caricamento…',
    loadError: 'Impossibile caricare questa pagina. Riprova.',
    accessDenied: 'Serve un accesso HR o Owner a questa azienda.',
    noCompany: 'Non fai ancora parte di un’azienda.',
    chooseCompany: 'Scegli un’azienda.',
    billingInactive: 'Questa azienda non ha un abbonamento attivo. I collaboratori possono unirsi, ma potranno registrare i giorni solo dopo la sottoscrizione.',
    billingCta: 'Vedi i piani',
    inviteEmailed: 'Invito creato e inviato via e-mail. Puoi anche condividere il link.',
    inviteInvalid: 'Invito non trovato o scaduto.',
    joinEmailMismatch: 'Questo invito è stato inviato a {invited}, ma hai effettuato l’accesso come {current}. Esci e accedi con l’indirizzo invitato.',
    joinEmailUnconfirmed: 'Conferma il tuo indirizzo e-mail, poi riapri questo invito.',
    viewMyHistory: 'Vedi ciò che vede l’HR',
    countersHeading: 'Contatori',
    status: 'Stato',
    usedAllowed: 'Usati / ammessi',
    kindTax: 'Fiscale',
    kindSs: 'Sicurezza sociale',
    colDate: 'Data',
    colDayType: 'Tipo di giorno',
    emptyCounters: 'Il collaboratore non ha ancora scelto un pacchetto confine.',
    profileTitle: 'Percentuale d’impiego e A1',
    saveProfile: 'Salva',
    profileSaved: 'Salvato.',
  },

  terms: {
    title: 'Condizioni di servizio',
    updated: 'Ultimo aggiornamento: 31 ott. 2026 (Europe/Zurich)',
    providerTitle: 'Fornitore e parte contraente',
    providerBody:
      'Il servizio BorderDay è fornito da PrimeLogic Advisory Sàrl, Cours des Bastions 13, 1205 Genève, Svizzera (IDE/UID CHE-312.418.158), che è la parte contraente per il servizio. Contatto: hello@borderday.com. Il checkout usa Stripe Managed Payments: gli acquisti risultano venduti tramite Link, e Link è il merchant of record (seller of record) per il pagamento, la riscossione delle imposte e i rimborsi a livello di ordine ove Managed Payments si applica.',
    s1Title: 'Servizio',
    s1Body:
      'BorderDay è uno strumento di tracciamento e promemoria delle classificazioni giornaliere per datori di lavoro e collaboratori su determinati corridoi transfrontalieri. Non è consulenza fiscale o legale, né un sostituto del datore di lavoro, di un consulente qualificato o di un’autorità competente. Vedi l’Avvertenza.',
    s2Title: 'Account e uso aziendale',
    s2Body:
      'Devi fornire dati di account corretti. I titolari aziendali invitano i collaboratori; questi scelgono un pacchetto confine e registrano solo il tipo di giorno (nessuna posizione). L’HR vede gli stessi contatori del collaboratore. Sei responsabile dell’accuratezza dei giorni registrati e del trattamento lecito dei dati dei dipendenti ai sensi del GDPR e, se applicabile, della LPD svizzera.',
    s3Title: 'Abbonamenti, prova e disdetta',
    s3Body:
      'I piani a pagamento sono abbonamenti. Azienda e individuale includono una prova gratuita di 7 giorni; è richiesta una carta di pagamento all’iscrizione. Senza un metodo di pagamento valido al termine della prova, l’abbonamento viene disdetto. Puoi disdire tramite gli strumenti ordine Link o il portale clienti Stripe. La disdetta interrompe i rinnovi futuri; gli importi già riscosati per un periodo avviato non sono proratati, salvo obblighi di legge o politica di rimborso di Link.',
    s4Title: 'Prezzi, IVA e merchant of record',
    s4Body:
      'Azienda: €5 per collaboratore attivo al mese, minimo €39 / mese (o equivalente annuale con 2 mesi gratis), IVA esclusa. Individuale: €4,99 / mese o €49 / anno, IVA inclusa. Il checkout usa Stripe Managed Payments: gli acquisti risultano venduti tramite Link, e Link è il merchant of record per la riscossione e il versamento dell’IVA ove Managed Payments si applica. I prezzi visualizzati possono essere convertiti in valuta locale al checkout.',
    s5Title: 'Diritto di recesso dei consumatori UE (14 giorni)',
    s5Body:
      'Se acquisti un piano individuale come consumatore nell’UE/SEE, la direttiva 2011/83/UE ti riconosce un diritto di recesso di 14 giorni dalla conclusione del contratto, senza motivazione. Per esercitarlo, contatta il supporto Link per l’ordine (venduto tramite Link) e/o privacy@borderday.com con l’e-mail dell’account e il riferimento. Per i servizi digitali, l’inizio dell’esecuzione durante il periodo di recesso dopo consenso espresso preventivo e riconoscimento della perdita del diritto una volta iniziata l’esecuzione può limitare o estinguere tale diritto (art. 16) — il checkout e le condizioni Sold through Link di Link descrivono la gestione per il tuo ordine. Gli acquisti aziendali non sono contratti a distanza con i consumatori.',
    s6Title: 'Rimborsi e supporto pagamenti',
    s6Body:
      'Pagamento, ricevuta, fattura fiscale e richieste di rimborso a livello di ordine Managed Payments sono gestiti da Link secondo le condizioni Sold through Link / Purchase di Stripe. Domande sul prodotto (funzionamento, accesso, export): hello@borderday.com o privacy@borderday.com.',
    s7Title: 'Modifiche',
    s7Body:
      'Possiamo aggiornare queste Condizioni. La data «Ultimo aggiornamento» cambia di conseguenza. L’uso continuato dopo un aggiornamento vale come accettazione, salvo processo diverso imposto dal diritto dei consumatori.',
    contact: 'Contatto: hello@borderday.com · Privacy: privacy@borderday.com',
  },
  disclaimer: {
    title: 'Avvertenza',
    body:
      'BorderDay è uno strumento personale di registrazione e promemoria. Non è consulenza fiscale, non è consulenza legale e non sostituisce il datore di lavoro, un consulente fiscale qualificato o l’istituzione di sicurezza sociale competente. Le soglie mostrate provengono da fonti ufficiali pubbliche e possono cambiare; verifica sempre presso l’autorità che si applica alla tua situazione. Sei responsabile dell’accuratezza dei giorni che registri.',
  },
  footer: {
    tagline: 'Tracciamento dei giorni per team e collaboratori transfrontalieri.',
    rights: '© {year} BorderDay',
  },
  auth: {
    signInTitle: 'Accedi',
    signInSubtitle: 'Email (password o magic link) o Google.',
    signUpTitle: 'Crea il tuo account',
    signUpSubtitle: 'Email di lavoro e password, oppure continua con Google.',
    email: 'Email',
    password: 'Password',
    displayName: 'Il tuo nome',
    signIn: 'Accedi',
    signUp: 'Registrati',
    createAccount: 'Crea account',
    magicLink: 'Magic link',
    sendMagic: 'Inviami un link di accesso',
    magicSent: "Controlla l'email per il link di accesso.",
    continueGoogle: 'Continua con Google',
    googleHint: 'OAuth Google sicuro — non vediamo mai la password Google.',
    googleNotReady: "Google non è ancora attivo. Usa l'email per ora.",
    checkEmail: "Controlla l'email per confermare (se richiesto), poi continua.",
    noAccount: 'Non hai un account?',
    hasAccount: 'Hai già un account?',
    notConfigured: 'Auth non configurata in questa build.',
    completing: 'Completamento accesso…',
    callbackFailed: "Impossibile completare l'accesso. Riprova.",
    paymentsUnavailable: 'Impossibile avviare il checkout — riprova o contatta il supporto.',
    signOut: 'Esci',
  },
  waitlist: {
    thanks: 'Account creato — continua alla registrazione azienda.',
    invalid: 'Inserisci un indirizzo e-mail valido.',
    localOnly:
      'Usa Registrati / Accedi. Il checkout è disponibile nella pagina Prezzi.',
  },
};

export default it;
