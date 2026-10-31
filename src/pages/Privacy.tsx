import Seo from '../components/Seo';
import { useLang } from '../components/Layout';
import { getDict } from '../i18n';

const COLUMNS = ['purpose', 'data', 'basis', 'recipients', 'transfer', 'retention'] as const;

export default function Privacy() {
  const lang = useLang();
  const d = getDict(lang);
  const p = d.privacy;

  // OPEN C2: no EU representative (GDPR Art. 27) is named here because none has been appointed yet.
  // Add the name to controllerBody once the owner appoints one; never invent it.
  // TODO H3: s6Body and the retention column say "no automatic purge yet". Change them when a purge job exists.
  return (
    <>
      <Seo lang={lang} title={`${p.title} — BorderDay`} description={p.intro} path="privacy" />
      <section className="section">
        <div className="container prose">
          <h1>{p.title}</h1>
          <p>{p.updated}</p>
          <p>{p.intro}</p>
          <h2>{p.controllerTitle}</h2>
          <p>{p.controllerBody}</p>
          <h2>{p.rolesTitle}</h2>
          <p>{p.rolesBody}</p>
          <h2>{p.s1Title}</h2>
          <p>{p.s1Body}</p>
          <h2>{p.s2Title}</h2>
          <p>{p.s2Body}</p>
          <h2 id="purposes">{p.tableTitle}</h2>
          <p>{p.tableIntro}</p>
          <div className="table-scroll" role="region" aria-labelledby="purposes" tabIndex={0}>
            <table className="legal-table">
              <thead>
                <tr>
                  {COLUMNS.map((c) => (
                    <th key={c} scope="col">
                      {p.tableCols[c]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.tableRows.map((row) => (
                  <tr key={row.purpose}>
                    {COLUMNS.map((c) =>
                      c === 'purpose' ? (
                        <th key={c} scope="row">
                          {row[c]}
                        </th>
                      ) : (
                        <td key={c}>{row[c]}</td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2>{p.s5Title}</h2>
          <ul>
            {p.recipients.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <h2>{p.transfersTitle}</h2>
          <p>{p.transfersBody}</p>
          <h2>{p.s6Title}</h2>
          <p>{p.s6Body}</p>
          <h2>{p.s4Title}</h2>
          <p>{p.rightsIntro}</p>
          <ul>
            {p.rights.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p>{p.rightsHow}</p>
          <p>{p.complaintBody}</p>
          <p>{p.requiredBody}</p>
          <h2>{p.storageTitle}</h2>
          <p>{p.storageBody}</p>
          <h2>{p.s7Title}</h2>
          <p>{p.s7Body}</p>
          <p>{p.contact}</p>
        </div>
      </section>
    </>
  );
}
