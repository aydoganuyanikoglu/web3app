import React, { useState } from "react";
import { getContract } from "../utils/contract";
import { useWallet } from "../context/WalletContext";
import NoWallet from "../components/NoWallet";

const AddAsset = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    valuation: "",
    image: null,
  });
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const uploadToIPFS = async () => {
    const imageData = new FormData();
    imageData.append("file", form.image);
    const pinata_jwt = process.env.REACT_APP_PINATA_JWT;
    const imgRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinata_jwt}`,
        },
        body: imageData,
      }
    );

    const imgJson = await imgRes.json();
    const imageUrl = `ipfs://${imgJson.IpfsHash}`;

    const metadata = {
      name: form.name,
      description: form.description,
      image: imageUrl,
    };

    const metaRes = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinata_jwt}`,
        },
        body: JSON.stringify(metadata),
      }
    );

    const metaJson = await metaRes.json();
    return `ipfs://${metaJson.IpfsHash}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const tokenURI = await uploadToIPFS();
      const contract = await getContract();
      const valuation = parseInt(form.valuation);

      const tx = await contract.mintAsset(tokenURI, valuation);
      await tx.wait();

      setMessage("Token minted successfully!");
      setForm({ name: "", description: "", valuation: "", image: null });
    } catch (err) {
      console.error(err);
      setMessage("Mint failed!");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-700">
        MINT NEW REAL ESTATE ASSET
      </h2>
      {!account ? (
        <NoWallet />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 shadow-md rounded-xl p-2"
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.name}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.description}
            required
          />
          <input
            type="number"
            name="valuation"
            placeholder="Valuation (ETH)"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.valuation}
            required
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded border-[1px] border-black hover:bg-white hover:text-black"
            disabled={loading}
          >
            {loading ? "Minting..." : "Mint Asset"}
          </button>
        </form>
      )}
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default AddAsset;
