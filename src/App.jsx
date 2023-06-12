import React, { useState, useEffect } from "react";
import Web3 from "web3";
import "./App.css";
import ItemListingABI from "./contractABI.json";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [itemListing, setItemListing] = useState(null);
  const [products, setProducts] = useState([]);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        setWeb3(web3);

        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);

        const networkId = await web3.eth.net.getId();
        const networkData = ItemListingABI.networks[networkId];
        if (networkData) {
          const itemListing = new web3.eth.Contract(
            ItemListingABI.abi,
            networkData.address
          );
          setItemListing(itemListing);

          const productCount = await itemListing.methods.productCount().call();

          const products = [];
          for (let i = 1; i <= productCount; i++) {
            const product = await itemListing.methods.products(i).call();
            products.push(product);
          }

          setProducts(products);
        } else {
          window.alert("ItemListing contract not deployed to detected network");
        }
      }
    };

    loadBlockchainData();
  }, []);

  const listProduct = async () => {
    if (itemListing && price && description) {
      await itemListing.methods
        .listProduct(price, description)
        .send({ from: accounts[0] });
      setPrice("");
      setDescription("");
    }
  };

  const buyProduct = async (itemId, price) => {
    if (itemListing) {
      await itemListing.methods
        .buyProduct(itemId)
        .send({ from: accounts[0], value: price });
    }
  };

  return (
    <div className="App">
      <h1>Kupi-Prodaj</h1>
      <h2>Dodaj proizvod na prodaju</h2>
      <input
        type="number"
        placeholder="Cena"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Proizvod"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={listProduct}>Dodaj</button>
      <table>
        <thead>
          <tr>
            <th>Proizvod</th>
            <th>Cena</th>
            <th>Prodavac</th>
            <th>Akcija</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td>{product.description}</td>
              <td>{product.price}</td>
              <td>{product.seller}</td>
              <td>
                {!product.sold && (
                  <button
                    onClick={() => buyProduct(product.itemId, product.price)}
                  >
                    Kupi
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
