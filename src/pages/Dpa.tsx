import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';

export default function Dpa() {
  const lang = useLang();
  const d = getDict(lang);
  const p = d.dpa;

  return (
    <>
      <Seo lang={lang} title={`${p.title} — BorderDay`} description={p.intro} path="dpa" />
      <section className="section">
        <div className="container prose">
          <h1>{p.title}</h1>
          <p className="meta">{p.updated}</p>
          <p>{p.intro}</p>
          <h2>{p.partiesTitle}</h2>
          <p>{p.partiesBody}</p>
          <h2>{p.rolesTitle}</h2>
          <p>{p.rolesBody}</p>
          <h2>{p.subjectTitle}</h2>
          <p>{p.subjectBody}</p>
          <h2>{p.durationTitle}</h2>
          <p>{p.durationBody}</p>
          <h2>{p.instructionsTitle}</h2>
          <p>{p.instructionsBody}</p>
          <h2>{p.securityTitle}</h2>
          <p>{p.securityBody}</p>
          <h2>{p.subTitle}</h2>
          <p>{p.subIntro}</p>
          <ul>
            {p.subprocessors.map((row) => (
              <li key={row}>{row}</li>
            ))}
          </ul>
          <p>{p.subChangeBody}</p>
          <h2>{p.transfersTitle}</h2>
          <p>{p.transfersBody}</p>
          <h2>{p.assistanceTitle}</h2>
          <p>{p.assistanceBody}</p>
          <h2>{p.breachTitle}</h2>
          <p>{p.breachBody}</p>
          <h2>{p.deletionTitle}</h2>
          <p>{p.deletionBody}</p>
          <h2>{p.auditTitle}</h2>
          <p>{p.auditBody}</p>
          <h2>{p.liabilityTitle}</h2>
          <p>{p.liabilityBody}</p>
          <h2>{p.lawTitle}</h2>
          <p>{p.lawBody}</p>
          <h2>{p.contactTitle}</h2>
          <p>{p.contactBody}</p>
          <p className="meta">{p.disclaimer}</p>
        </div>
      </section>
    </>
  );
}
