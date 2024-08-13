import tarifs from "../data/tarifs.json";

export const Products = () => {
  return (
    <>
      <h2>Prestations en tant que produit</h2>

      <table>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Prix</th>
            <th style={{ textAlign: "left" }}>Produit</th>
            <th style={{ textAlign: "left" }} className="md">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {tarifs.products.map((produit) => (
            <tr key={produit.name}>
              <td>
                <code>{produit.price}€</code>
              </td>
              <td>{produit.name}</td>
              <td className="md">{produit.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
