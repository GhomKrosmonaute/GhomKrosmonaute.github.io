import tarifs from "../data/tarifs.json"

export const Hosting = () => {
  return (
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
    </>
  )
}
