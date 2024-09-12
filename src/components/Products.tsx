import tarifs from "../data/tarifs.json"

export const Products = () => {
  return (
    <>
      <h2 className="text-2xl text-center md:text-left">
        Prestations{" "}
        <span className="md:hidden" title="En tant que produit">
          AAP
        </span>
        <span className="hidden md:inline">en tant que produit</span>
      </h2>

      <table>
        <thead>
          <tr className="*:text-left">
            <th>Prix</th>
            <th>Produit</th>
            <th className="hidden md:table-cell">Description</th>
          </tr>
        </thead>
        <tbody>
          {tarifs.products.map((produit) => (
            <tr key={produit.name}>
              <td>
                <code>{produit.price}€</code>
              </td>
              <td>{produit.name}</td>
              <td className="hidden md:table-cell">{produit.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
