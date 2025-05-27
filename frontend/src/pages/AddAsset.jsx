import React, { useState } from "react";
import { getContract } from "../utils/contract";
import { useWallet } from "../context/WalletContext";
import NoWallet from "../components/NoWallet";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import GeneratingTokensIcon from "@mui/icons-material/GeneratingTokens";

const AddAsset = () => {
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const uploadToIPFS = async (values) => {
    const pinata_jwt = process.env.REACT_APP_PINATA_JWT;

    const imageForm = new FormData();
    imageForm.append("file", values.image);
    const imgRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${pinata_jwt}` },
        body: imageForm,
      }
    );
    const imgJson = await imgRes.json();
    const imageUrl = `ipfs://${imgJson.IpfsHash}`;

    const docForm = new FormData();
    docForm.append("file", values.document);
    const docRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${pinata_jwt}` },
        body: docForm,
      }
    );
    const docJson = await docRes.json();
    const documentUrl = `ipfs://${docJson.IpfsHash}`;

    const metadata = {
      name: values.name,
      description: values.description,
      image: imageUrl,
      document: documentUrl,
      valuation: values.valuation,
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
      document: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      description: Yup.string().required("Description is required"),
      valuation: Yup.number().required("Valuation is required").positive(),
      image: Yup.mixed().required("Image is required"),
      document: Yup.mixed().required("Document is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setMessage("");

      try {
        const metadataURI = await uploadToIPFS(values);
        const contract = await getContract();
        const tx = await contract.mintAsset(
          metadataURI,
          parseInt(values.valuation)
        );
        await tx.wait();
        toast.success("Asset submitted for review!");
        setMessage("Asset submitted successfully. Awaiting admin approval.");
        resetForm();
      } catch (err) {
        console.error(err);
        toast.error("Submission failed.");
        setMessage("Submission failed!");
      }

      setLoading(false);
    },
  });

  return (
    <div className="max-w-xl mt-[40px] mx-auto px-6 bg-white">
      <div className="w-full flex justify-center gap-1">
        <GeneratingTokensIcon className="!text-5xl text-orange-500 -mt-1" />
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-700">
          Submit Real World Asset
        </h2>
      </div>

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
            <label className="font-medium">Image for Asset</label>
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

          <div>
            <label className="font-medium">Document</label>
            <input
              type="file"
              name="document"
              accept=".pdf"
              className="w-full p-3 border rounded outline-none transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-gray-100 hover:file:bg-gray-200"
              onChange={(e) =>
                formik.setFieldValue("document", e.currentTarget.files[0])
              }
              onBlur={formik.handleBlur}
            />
            {formik.touched.document && formik.errors.document && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.document}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded font-semibold border-[1px] border-black hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Asset"}
          </button>
        </form>
      )}

      {message && <p className="mt-4 text-center text-green-500">{message}</p>}
    </div>
  );
};

export default AddAsset;
