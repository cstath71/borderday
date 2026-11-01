/** Localized Supabase Auth emails (signup confirm, magic link, recovery, email change, reauth). */
import { inviteLang, type InviteLang } from "./inviteEmail.ts";
import { escapeHtml } from "./invite.ts";

export type AuthEmailAction =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "reauthentication"
  | "email"
  | string;

type Copy = {
  subject: string;
  heading: string;
  body: string;
  cta: string;
  ignore?: string;
  codeHint?: string;
};

const COPY: Record<InviteLang, Record<string, Copy>> = {
  en: {
    signup: {
      subject: "Confirm your BorderDay email",
      heading: "Confirm your email address",
      body: "Follow the link below to confirm this email address and finish signing up for BorderDay.",
      cta: "Confirm email address",
    },
    invite: {
      subject: "You're invited to BorderDay",
      heading: "You've been invited",
      body: "Follow the link below to accept and create your BorderDay account.",
      cta: "Accept invitation",
    },
    magiclink: {
      subject: "Your BorderDay sign-in link",
      heading: "Your sign-in link",
      body: "Follow the link below to sign in. This link expires shortly and can only be used once.",
      cta: "Sign in",
    },
    recovery: {
      subject: "Reset your BorderDay password",
      heading: "Reset your password",
      body: "We received a request to reset your password. Follow the link below to choose a new one.",
      cta: "Reset password",
      ignore: "If you did not request this, you can safely ignore this email.",
    },
    email_change: {
      subject: "Confirm your new BorderDay email",
      heading: "Confirm your new email address",
      body: "Follow the link below to confirm {{new_email}} as your new email address.",
      cta: "Confirm new email address",
      ignore: "If you did not request this change, you can safely ignore this email.",
    },
    reauthentication: {
      subject: "{{token}} is your BorderDay verification code",
      heading: "Your verification code",
      body: "Use the code below to verify your identity. It expires shortly.",
      cta: "",
      codeHint: "Verification code",
    },
    email: {
      subject: "Your BorderDay sign-in code",
      heading: "Your sign-in code",
      body: "Use the code below to sign in. It expires shortly.",
      cta: "",
      codeHint: "Sign-in code",
    },
  },
  fr: {
    signup: {
      subject: "Confirmez votre e-mail BorderDay",
      heading: "Confirmez votre adresse e-mail",
      body: "Suivez le lien ci-dessous pour confirmer cette adresse e-mail et terminer votre inscription à BorderDay.",
      cta: "Confirmer l'adresse e-mail",
    },
    invite: {
      subject: "Invitation à BorderDay",
      heading: "Vous avez été invité",
      body: "Suivez le lien ci-dessous pour accepter et créer votre compte BorderDay.",
      cta: "Accepter l'invitation",
    },
    magiclink: {
      subject: "Votre lien de connexion BorderDay",
      heading: "Votre lien de connexion",
      body: "Suivez le lien ci-dessous pour vous connecter. Ce lien expire bientôt et ne peut être utilisé qu'une seule fois.",
      cta: "Se connecter",
    },
    recovery: {
      subject: "Réinitialisez votre mot de passe BorderDay",
      heading: "Réinitialisez votre mot de passe",
      body: "Nous avons reçu une demande de réinitialisation de votre mot de passe. Suivez le lien ci-dessous pour en choisir un nouveau.",
      cta: "Réinitialiser le mot de passe",
      ignore: "Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail.",
    },
    email_change: {
      subject: "Confirmez votre nouvel e-mail BorderDay",
      heading: "Confirmez votre nouvelle adresse e-mail",
      body: "Suivez le lien ci-dessous pour confirmer {{new_email}} comme nouvelle adresse e-mail.",
      cta: "Confirmer la nouvelle adresse e-mail",
      ignore: "Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet e-mail.",
    },
    reauthentication: {
      subject: "{{token}} est votre code de vérification BorderDay",
      heading: "Votre code de vérification",
      body: "Utilisez le code ci-dessous pour vérifier votre identité. Il expire bientôt.",
      cta: "",
      codeHint: "Code de vérification",
    },
    email: {
      subject: "Votre code de connexion BorderDay",
      heading: "Votre code de connexion",
      body: "Utilisez le code ci-dessous pour vous connecter. Il expire bientôt.",
      cta: "",
      codeHint: "Code de connexion",
    },
  },
  de: {
    signup: {
      subject: "Bestätigen Sie Ihre BorderDay-E-Mail",
      heading: "E-Mail-Adresse bestätigen",
      body: "Folgen Sie dem Link unten, um diese E-Mail-Adresse zu bestätigen und die BorderDay-Registrierung abzuschliessen.",
      cta: "E-Mail-Adresse bestätigen",
    },
    invite: {
      subject: "Einladung zu BorderDay",
      heading: "Sie wurden eingeladen",
      body: "Folgen Sie dem Link unten, um anzunehmen und Ihr BorderDay-Konto zu erstellen.",
      cta: "Einladung annehmen",
    },
    magiclink: {
      subject: "Ihr BorderDay-Anmeldelink",
      heading: "Ihr Anmeldelink",
      body: "Folgen Sie dem Link unten zur Anmeldung. Der Link läuft bald ab und kann nur einmal verwendet werden.",
      cta: "Anmelden",
    },
    recovery: {
      subject: "BorderDay-Passwort zurücksetzen",
      heading: "Passwort zurücksetzen",
      body: "Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Folgen Sie dem Link unten, um ein neues zu wählen.",
      cta: "Passwort zurücksetzen",
      ignore: "Wenn Sie das nicht angefordert haben, können Sie diese E-Mail ignorieren.",
    },
    email_change: {
      subject: "Neue BorderDay-E-Mail bestätigen",
      heading: "Neue E-Mail-Adresse bestätigen",
      body: "Folgen Sie dem Link unten, um {{new_email}} als neue E-Mail-Adresse zu bestätigen.",
      cta: "Neue E-Mail-Adresse bestätigen",
      ignore: "Wenn Sie diese Änderung nicht angefordert haben, können Sie diese E-Mail ignorieren.",
    },
    reauthentication: {
      subject: "{{token}} ist Ihr BorderDay-Bestätigungscode",
      heading: "Ihr Bestätigungscode",
      body: "Verwenden Sie den Code unten zur Identitätsprüfung. Er läuft bald ab.",
      cta: "",
      codeHint: "Bestätigungscode",
    },
    email: {
      subject: "Ihr BorderDay-Anmeldecode",
      heading: "Ihr Anmeldecode",
      body: "Verwenden Sie den Code unten zur Anmeldung. Er läuft bald ab.",
      cta: "",
      codeHint: "Anmeldecode",
    },
  },
  it: {
    signup: {
      subject: "Conferma la tua e-mail BorderDay",
      heading: "Conferma l'indirizzo e-mail",
      body: "Segui il link sotto per confermare questo indirizzo e-mail e completare la registrazione a BorderDay.",
      cta: "Conferma indirizzo e-mail",
    },
    invite: {
      subject: "Invito a BorderDay",
      heading: "Sei stato invitato",
      body: "Segui il link sotto per accettare e creare il tuo account BorderDay.",
      cta: "Accetta l'invito",
    },
    magiclink: {
      subject: "Il tuo link di accesso BorderDay",
      heading: "Il tuo link di accesso",
      body: "Segui il link sotto per accedere. Il link scade a breve e può essere usato una sola volta.",
      cta: "Accedi",
    },
    recovery: {
      subject: "Reimposta la password BorderDay",
      heading: "Reimposta la password",
      body: "Abbiamo ricevuto una richiesta di reimpostazione della password. Segui il link sotto per sceglierne una nuova.",
      cta: "Reimposta password",
      ignore: "Se non hai fatto questa richiesta, puoi ignorare questa e-mail.",
    },
    email_change: {
      subject: "Conferma la nuova e-mail BorderDay",
      heading: "Conferma il nuovo indirizzo e-mail",
      body: "Segui il link sotto per confermare {{new_email}} come nuovo indirizzo e-mail.",
      cta: "Conferma nuovo indirizzo e-mail",
      ignore: "Se non hai richiesto questa modifica, puoi ignorare questa e-mail.",
    },
    reauthentication: {
      subject: "{{token}} è il tuo codice di verifica BorderDay",
      heading: "Il tuo codice di verifica",
      body: "Usa il codice sotto per verificare la tua identità. Scade a breve.",
      cta: "",
      codeHint: "Codice di verifica",
    },
    email: {
      subject: "Il tuo codice di accesso BorderDay",
      heading: "Il tuo codice di accesso",
      body: "Usa il codice sotto per accedere. Scade a breve.",
      cta: "",
      codeHint: "Codice di accesso",
    },
  },
  nl: {
    signup: {
      subject: "Bevestig je BorderDay-e-mail",
      heading: "Bevestig je e-mailadres",
      body: "Volg de link hieronder om dit e-mailadres te bevestigen en je BorderDay-registratie af te ronden.",
      cta: "E-mailadres bevestigen",
    },
    invite: {
      subject: "Uitnodiging voor BorderDay",
      heading: "Je bent uitgenodigd",
      body: "Volg de link hieronder om te accepteren en je BorderDay-account aan te maken.",
      cta: "Uitnodiging accepteren",
    },
    magiclink: {
      subject: "Je BorderDay-aanmeldlink",
      heading: "Je aanmeldlink",
      body: "Volg de link hieronder om in te loggen. Deze link verloopt binnenkort en kan maar één keer worden gebruikt.",
      cta: "Inloggen",
    },
    recovery: {
      subject: "Reset je BorderDay-wachtwoord",
      heading: "Wachtwoord resetten",
      body: "We ontvingen een verzoek om je wachtwoord te resetten. Volg de link hieronder om een nieuw wachtwoord te kiezen.",
      cta: "Wachtwoord resetten",
      ignore: "Als je dit niet hebt gevraagd, kun je deze e-mail negeren.",
    },
    email_change: {
      subject: "Bevestig je nieuwe BorderDay-e-mail",
      heading: "Bevestig je nieuwe e-mailadres",
      body: "Volg de link hieronder om {{new_email}} als nieuw e-mailadres te bevestigen.",
      cta: "Nieuw e-mailadres bevestigen",
      ignore: "Als je deze wijziging niet hebt gevraagd, kun je deze e-mail negeren.",
    },
    reauthentication: {
      subject: "{{token}} is je BorderDay-verificatiecode",
      heading: "Je verificatiecode",
      body: "Gebruik de code hieronder om je identiteit te verifiëren. Deze verloopt binnenkort.",
      cta: "",
      codeHint: "Verificatiecode",
    },
    email: {
      subject: "Je BorderDay-aanmeldcode",
      heading: "Je aanmeldcode",
      body: "Gebruik de code hieronder om in te loggen. Deze verloopt binnenkort.",
      cta: "",
      codeHint: "Aanmeldcode",
    },
  },
};

export function authEmailLang(meta: unknown, redirectTo?: string | null): InviteLang {
  if (meta && typeof meta === "object") {
    const lang = (meta as Record<string, unknown>).lang ?? (meta as Record<string, unknown>).i18n;
    const fromMeta = inviteLang(lang);
    if (lang === "fr" || lang === "de" || lang === "it" || lang === "nl" || lang === "en") return fromMeta;
  }
  const m = String(redirectTo ?? "").match(/\/(en|fr|de|it|nl)(\/|$|\?)/);
  return inviteLang(m?.[1]);
}

export function confirmationUrl(opts: {
  projectUrl: string;
  tokenHash: string;
  type: string;
  redirectTo?: string | null;
}): string {
  const params = new URLSearchParams({
    token: opts.tokenHash,
    type: opts.type === "email" ? "email" : opts.type,
    redirect_to: opts.redirectTo || opts.projectUrl,
  });
  return `${opts.projectUrl.replace(/\/$/, "")}/auth/v1/verify?${params.toString()}`;
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? "");
}

export function buildAuthEmail(opts: {
  lang: InviteLang | string;
  action: AuthEmailAction;
  confirmationUrl?: string;
  token?: string;
  newEmail?: string;
}): { subject: string; html: string; text: string } {
  const lang = inviteLang(opts.lang);
  const action = opts.action === "email" ? "email" : opts.action;
  const pack = COPY[lang][action] ?? COPY.en[action] ?? COPY.en.signup;
  const vars = {
    token: opts.token ?? "",
    new_email: opts.newEmail ?? "",
  };
  const subject = fill(pack.subject, vars);
  const body = fill(pack.body, vars);
  const useCode = action === "reauthentication" || action === "email" || !opts.confirmationUrl;
  const htmlParts = [
    `<h2>${escapeHtml(pack.heading)}</h2>`,
    `<p>${escapeHtml(body)}</p>`,
  ];
  const textParts = [pack.heading, "", body];
  if (useCode && opts.token) {
    htmlParts.push(`<p><strong>${escapeHtml(pack.codeHint || "Code")}: ${escapeHtml(opts.token)}</strong></p>`);
    textParts.push("", `${pack.codeHint || "Code"}: ${opts.token}`);
  } else if (opts.confirmationUrl && pack.cta) {
    htmlParts.push(`<p><a href="${opts.confirmationUrl}">${escapeHtml(pack.cta)}</a></p>`);
    textParts.push("", `${pack.cta}: ${opts.confirmationUrl}`);
  }
  if (pack.ignore) {
    htmlParts.push(`<p>${escapeHtml(pack.ignore)}</p>`);
    textParts.push("", pack.ignore);
  }
  return { subject, html: htmlParts.join(""), text: textParts.join("\n") };
}

/** Build Go-template HTML for dashboard Auth templates (uses .Data.lang). */
export function goTemplateForAction(action: AuthEmailAction): string {
  const langs: InviteLang[] = ["en", "fr", "de", "it", "nl"];
  const chunks: string[] = [];
  for (let i = 0; i < langs.length; i++) {
    const lang = langs[i];
    const pack = COPY[lang][action] ?? COPY.en.signup;
    const cond = i === 0 ? `{{ if eq .Data.lang "${lang}" }}` : `{{ else if eq .Data.lang "${lang}" }}`;
    const body = pack.body.replace(/\{\{new_email\}\}/g, "{{ .NewEmail }}").replace(/\{\{token\}\}/g, "{{ .Token }}");
    let block = `${cond}\n<h2>${pack.heading}</h2>\n<p>${body}</p>\n`;
    if (action === "reauthentication" || action === "email") {
      block += `<p><strong>${pack.codeHint || "Code"}: {{ .Token }}</strong></p>\n`;
    } else {
      block += `<p><a href="{{ .ConfirmationURL }}">${pack.cta}</a></p>\n`;
    }
    if (pack.ignore) block += `<p>${pack.ignore}</p>\n`;
    chunks.push(block);
  }
  // Fallback English when lang missing
  const en = COPY.en[action] ?? COPY.en.signup;
  const enBody = en.body.replace(/\{\{new_email\}\}/g, "{{ .NewEmail }}").replace(/\{\{token\}\}/g, "{{ .Token }}");
  let fallback = `{{ else }}\n<h2>${en.heading}</h2>\n<p>${enBody}</p>\n`;
  if (action === "reauthentication" || action === "email") {
    fallback += `<p><strong>${en.codeHint || "Code"}: {{ .Token }}</strong></p>\n`;
  } else {
    fallback += `<p><a href="{{ .ConfirmationURL }}">${en.cta}</a></p>\n`;
  }
  if (en.ignore) fallback += `<p>${en.ignore}</p>\n`;
  fallback += "{{ end }}";
  chunks.push(fallback);
  return chunks.join("");
}

export function goSubjectForAction(action: AuthEmailAction): string {
  // Subjects: prefer English with note — dashboard subjects don't branch well; hook handles locale subjects.
  // Still provide a Go-template subject that branches when .Data.lang is set.
  const langs: InviteLang[] = ["fr", "de", "it", "nl", "en"];
  const parts: string[] = [];
  for (let i = 0; i < langs.length; i++) {
    const lang = langs[i];
    const pack = COPY[lang][action] ?? COPY.en.signup;
    const subj = pack.subject.replace(/\{\{token\}\}/g, "{{ .Token }}").replace(/\{\{new_email\}\}/g, "{{ .NewEmail }}");
    if (i === 0) parts.push(`{{ if eq .Data.lang "${lang}" }}${subj}`);
    else if (lang === "en") parts.push(`{{ else }}${subj}{{ end }}`);
    else parts.push(`{{ else if eq .Data.lang "${lang}" }}${subj}`);
  }
  return parts.join("");
}
