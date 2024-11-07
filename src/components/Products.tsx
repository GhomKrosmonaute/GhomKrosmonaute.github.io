import { t } from "@/i18n"
import tarifs from "../data/tarifs.json"

export const Products = () => {
  return t(
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
    </>,
    <>
      <h2 className="text-2xl text-center md:text-left">
        Services{" "}
        <span className="md:hidden" title="As a product">
          AAP
        </span>
        <span className="hidden md:inline">as a product</span>
      </h2>

      <table>
        <thead>
          <tr className="*:text-left">
            <th>Price</th>
            <th>Product</th>
            <th className="hidden md:table-cell">Description</th>
          </tr>
        </thead>
        <tbody>
          {tarifs.products.map((product) => (
            <tr key={product.name}>
              <td>
                <code>{product.price}€</code>
              </td>
              <td>{product.name}</td>
              <td className="hidden md:table-cell">{product.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>,
  )
}
