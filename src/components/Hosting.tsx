import tarifs from "../data/tarifs.json";

export const Hosting = () => {
  return (
    <>
      <h2>Hébergement</h2>

      <p className="md">
        J'héberge vos projets si vous ne savez pas comment le faire vous-même.{" "}
        <br />
        Cela me permet de pouvoir intervenir rapidement en cas de modification
        ou de panne. <br />
        Les tarifs sont mensuels.
      </p>

      <table>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Prix</th>
            <th style={{ textAlign: "left" }}>Description</th>
          </tr>
        </thead>
        <tbody>
          {tarifs.hosting.map((hosting) => (
            <tr key={hosting.description}>
              <td style={{ whiteSpace: "nowrap" }}>
                <code>{hosting.price}€</code>/mois
              </td>
              <td>{hosting.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
