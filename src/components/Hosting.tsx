import { t } from "@/i18n"
import tarifs from "../data/tarifs.json"

export const Hosting = () => {
  return t(
    <>
      <h2 className="text-2xl text-center md:text-left">Hébergement</h2>

      <p className="hidden md:block">
        J'héberge vos projets si vous ne savez pas comment le faire vous-même.{" "}
        <br />
        Cela me permet de pouvoir intervenir rapidement en cas de modification
        ou de panne. <br />
        Les tarifs sont mensuels.
      </p>

      <table>
        <thead>
          <tr className="*:text-left">
            <th>Prix</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {tarifs.hosting.map((hosting) => (
            <tr key={hosting.description}>
              <td className="whitespace-nowrap">
                <code>{hosting.price}€</code>/mois
              </td>
              <td>{hosting.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>,
    <>
      <h2 className="text-2xl text-center md:text-left">Hosting</h2>

      <p className="hidden md:block">
        I host your projects if you don't know how to do it yourself. <br />
        This allows me to intervene quickly in case of modification or failure.{" "}
        <br />
        The rates are monthly.
      </p>

      <table>
        <thead>
          <tr className="*:text-left">
            <th>Price</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {tarifs.hosting.map((hosting) => (
            <tr key={hosting.description}>
              <td className="whitespace-nowrap">
                <code>{hosting.price}€</code>/month
              </td>
              <td>{hosting.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>,
  )
}
