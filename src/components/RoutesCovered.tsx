import { hasSocialSecurityCounter, hasTaxCounter, listBorderPacks } from '../borders/packs';
import { getDict } from '../i18n';
import { ROUTES_COVERED_PROSE } from '../seo/routesCovered.mjs';
import { useLang } from './Layout';

/** Plain route list mirroring llms.txt, plus the product’s own route names. */
export default function RoutesCovered() {
  const lang = useLang();
  const d = getDict(lang);
  const packs = listBorderPacks();

  return (
    <section className="section" aria-labelledby="routes-covered">
      <div className="container">
        <h2 id="routes-covered">{d.home.routesCoveredTitle}</h2>
        <p>{ROUTES_COVERED_PROSE}</p>
        <table>
          <thead>
            <tr>
              <th scope="col">{d.home.routesRoute}</th>
              <th scope="col">{d.home.routesTax}</th>
              <th scope="col">{d.home.routesSs}</th>
            </tr>
          </thead>
          <tbody>
            {packs.map((p) => (
              <tr key={p.id}>
                <td>{(d.borders as Record<string, string>)[p.nameKey]}</td>
                <td>{hasTaxCounter(p) ? d.home.chipTaxYes : d.home[p.noTaxChipKey ?? 'chipTaxNo']}</td>
                <td>{hasSocialSecurityCounter(p) ? d.home.chipSsYes : d.home.chipTaxNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
