// Invitation email in the language HR chose for the employee. Names no controller: that stays on Privacy and Terms.
import { COMPANY_NAME_MAX_LENGTH, escapeHtml } from "./invite.ts";

const COPY = {
  en: {
    subject: (company: string) => `You're invited to ${company} on BorderDay`,
    fallback: "a company",
    intro: (company: string) => `You have been invited to join ${company} on BorderDay.`,
    notice:
      "If you join, your employer's HR team can see your name, email, border route and, if entered, your working days, contract days, employment percentage, A1 record and pre-2012 France–Belgium status, and per date the day type, half day and overnight-away yes/no, plus your counters. No GPS or device location. Notes are private to you.",
    accept: "Accept invitation",
    privacy: "Privacy notice",
  },
  fr: {
    subject: (company: string) => `Invitation à rejoindre ${company} sur BorderDay`,
    fallback: "une entreprise",
    intro: (company: string) => `Vous êtes invité·e à rejoindre ${company} sur BorderDay.`,
    notice:
      "Si vous rejoignez l'entreprise, les RH de votre employeur peuvent voir votre nom, votre e-mail, votre itinéraire et, s'ils sont indiqués, vos jours de travail et jours contractuels, le taux d'emploi, l'A1 et le statut France–Belgique d'avant 2012 et, par date, le type de jour, la demi-journée et la nuit hors du domicile (oui ou non), ainsi que vos compteurs. Ni GPS ni localisation de l'appareil. Vos notes restent privées.",
    accept: "Accepter l'invitation",
    privacy: "Politique de confidentialité",
  },
  de: {
    subject: (company: string) => `Einladung zu ${company} auf BorderDay`,
    fallback: "einem Unternehmen",
    intro: (company: string) => `Sie wurden eingeladen, ${company} auf BorderDay beizutreten.`,
    notice:
      "Wenn Sie beitreten, kann das HR-Team Ihres Arbeitgebers Ihren Namen, Ihre E-Mail, Ihre Grenzroute und, falls eingetragen, Arbeitstage, vertragliche Arbeitstage, Beschäftigungsgrad, A1 und Status Frankreich–Belgien vor 2012 sowie je Datum die Tagesart, halber Tag und auswärtige Übernachtung ja/nein und Ihre Zähler sehen. Kein GPS und kein Gerätestandort. Ihre Notizen bleiben privat.",
    accept: "Einladung annehmen",
    privacy: "Datenschutzerklärung",
  },
  it: {
    subject: (company: string) => `Invito a unirvi a ${company} su BorderDay`,
    fallback: "un'azienda",
    intro: (company: string) => `Siete stati invitati a unirvi a ${company} su BorderDay.`,
    notice:
      "Se entrate, il team HR del datore di lavoro può vedere nome, e-mail, situazione di frontiera e, se inseriti, giorni lavorativi, giorni contrattuali, percentuale d'impiego, A1 e status Francia–Belgio prima del 2012 e, per ogni data, il tipo di giorno, la mezza giornata e la notte fuori sì/no, oltre ai vostri contatori. Niente GPS né posizione del dispositivo. Le note restano private.",
    accept: "Accetta l'invito",
    privacy: "Informativa privacy",
  },
  nl: {
    subject: (company: string) => `U bent uitgenodigd voor ${company} op BorderDay`,
    fallback: "een bedrijf",
    intro: (company: string) => `U bent uitgenodigd om lid te worden van ${company} op BorderDay.`,
    notice:
      "Als u lid wordt, kan het HR-team van uw werkgever uw naam, e-mail, grensroute en, indien ingevoerd, werkdagen, contractuele dagen, tewerkstellingspercentage, A1 en status Frankrijk–België vóór 2012 zien, en per datum het dagtype, halve dag en overnachting elders ja/nee, plus uw tellers. Geen GPS of apparaatlocatie. Notities blijven privé.",
    accept: "Uitnodiging accepteren",
    privacy: "Privacyverklaring",
  },
};

export type InviteLang = keyof typeof COPY;

/** Anything unknown falls back to English, and is the only value that reaches the URLs. */
export function inviteLang(value: unknown): InviteLang {
  return value === "fr" || value === "de" || value === "it" || value === "nl" ? value : "en";
}

export function joinUrlFor(siteUrl: string, lang: InviteLang, token: string): string {
  // Query form so GitHub Pages can serve a prerendered /join/ shell with HTTP 200.
  return `${siteUrl}/${lang}/join/?t=${encodeURIComponent(token)}`;
}

/**
 * Customers choose the company name, and it appears in the subject and body of mail from our domain.
 * One line, no control or bidi characters, capped: older rows may predate the database limit.
 */
export function inviteCompanyName(name: string | null | undefined): string | null {
  const chars = Array.from((name ?? "").replace(/[\p{Cc}\p{Cf}\u2028\u2029]+/gu, " ").replace(/\s+/g, " ").trim());
  if (chars.length === 0) return null;
  if (chars.length <= COMPANY_NAME_MAX_LENGTH) return chars.join("");
  return `${chars.slice(0, COMPANY_NAME_MAX_LENGTH - 1).join("").trimEnd()}…`;
}

export function buildInviteEmail(opts: { lang: InviteLang; companyName?: string | null; joinUrl: string; siteUrl: string }) {
  const c = COPY[opts.lang];
  const name = inviteCompanyName(opts.companyName);
  const company = name || c.fallback;
  const privacyUrl = `${opts.siteUrl}/${opts.lang}/privacy/`;
  const safe = escapeHtml(company);
  return {
    subject: c.subject(name || "BorderDay"),
    html:
      `<p>${c.intro(`<strong>${safe}</strong>`)}</p>` +
      `<p>${escapeHtml(c.notice)}</p>` +
      `<p><a href="${opts.joinUrl}">${escapeHtml(c.accept)}</a></p>` +
      `<p><a href="${privacyUrl}">${escapeHtml(c.privacy)}</a></p>`,
    text: `${c.intro(company)}\n\n${c.notice}\n\n${c.accept}: ${opts.joinUrl}\n${c.privacy}: ${privacyUrl}\n`,
  };
}
