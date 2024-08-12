import tarifs from "./data/tarifs.json" assert { type: "json" }

const productTable = document.getElementById("products") as HTMLTableElement
const hostingTable = document.getElementById("hosting") as HTMLTableElement

productTable.innerHTML = `
<tr>
  <th style="text-align: left;">Prix</th>
  <th style="text-align: left;">Produit</th>
  <th style="text-align: left;">Description</th>
</tr>`

for (const product of tarifs.products) {
  productTable.innerHTML += `
  <tr>
    <td><code>${product.price}€</code></td>
    <td>${product.name}</td>
    <td>${product.description}</td>
  </tr>`
}

hostingTable.innerHTML = `
<tr>
  <th style="text-align: left;">Prix</th>
  <th style="text-align: left;">Description</th>
</tr>
`

for (const hosting of tarifs.hosting) {
  hostingTable.innerHTML += `
  <tr>
    <td><code>${hosting.price}€</code>/mois</td>
    <td>${hosting.description}</td>
  </tr>`
}