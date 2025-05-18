import React, { useState } from "react";
import { getContract } from "../utils/contract";
import { useWallet } from "../context/WalletContext";
import NoWallet from "../components/NoWallet";
import { useFormik } from "formik";
import * as Yup from "yup";

const AddAsset = () => {
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const uploadToIPFS = async (values) => {
    const imageData = new FormData();
    imageData.append("file", values.image);
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
      name: values.name,
      description: values.description,
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

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      valuation: "",
      image: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      description: Yup.string().required("Description is required"),
      valuation: Yup.number()
        .required("Valuation is required")
        .positive("Must be a positive number"),
      image: Yup.mixed().required("Image is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setMessage("");

      try {
        const tokenURI = await uploadToIPFS(values);
        const contract = await getContract();
        const tx = await contract.mintAsset(
          tokenURI,
          parseInt(values.valuation)
        );
        await tx.wait();

        setMessage("Token minted successfully!");
        resetForm();
      } catch (err) {
        console.error(err);
        setMessage("Mint failed!");
      }

      setLoading(false);
    },
  });

  return (
    <div className="max-w-xl mx-auto mt-[40px] px-6 bg-white">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-700">
        Mint New Real World Asset
      </h2>
      {!account ? (
        <NoWallet />
      ) : (
        <form
          onSubmit={formik.handleSubmit}
          className="space-y-4 shadow-md rounded-xl p-4 bg-white"
        >
          <div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full p-3 border rounded outline-none transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="description"
              placeholder="Description"
              className="w-full p-3 border rounded outline-none transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.description}
              </p>
            )}
          </div>
          <div>
            <input
              type="number"
              name="valuation"
              placeholder="Valuation (ETH)"
              className="w-full p-3 border rounded outline-none transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.valuation}
            />
            {formik.touched.valuation && formik.errors.valuation && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.valuation}
              </p>
            )}
          </div>
          <div>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full p-3 border rounded outline-none transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-100 hover:file:bg-gray-200"
              onChange={(e) =>
                formik.setFieldValue("image", e.currentTarget.files[0])
              }
              onBlur={formik.handleBlur}
            />
            {formik.touched.image && formik.errors.image && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.image}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded font-semibold hover:bg-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Minting..." : "Mint Asset"}
          </button>
        </form>
      )}
      {message && <p className="mt-4 text-center text-green-500">{message}</p>}
    </div>
  );
};

export default AddAsset;
