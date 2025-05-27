import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import React, { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import { useWallet } from "../context/WalletContext";
import { toast } from "react-toastify";

const AdminPanel = () => {
  const { account, isAdmin } = useWallet();
  const [assetRequests, setAssetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const ipfsGateway = "https://peach-official-lemming-719.mypinata.cloud/ipfs/";

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const contract = await getContract();
      const requests = [];

      const nextId = await contract.nextAssetRequestId();

      for (let i = 0; i < nextId; i++) {
        const asset = await contract.getAssetRequest(i);
        if (!asset.approved) {
          const metaRes = await fetch(
            asset.tokenURI.replace("ipfs://", ipfsGateway)
          );
          const metadata = await metaRes.json();

          requests.push({
            id: i,
            requester: asset.requester,
            valuation: asset.valuation.toString(),
            tokenURI: asset.tokenURI,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image?.replace("ipfs://", ipfsGateway),
            document: metadata.document?.replace("ipfs://", ipfsGateway),
          });
        }
      }

      setAssetRequests(requests);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      toast.error("Error loading asset requests.");
    }

    setLoading(false);
  };

  const handleApprove = async (id) => {
    const contract = await getContract();

    try {
      const tx = await contract.approveAndMint(id);
      await tx.wait();
      toast.success("Asset approved and NFT minted.");
      fetchRequests();
    } catch (err) {
      console.error("Approval failed:", err);
      toast.error("Approval failed.");
    }
  };

  useEffect(() => {
    if (isAdmin) fetchRequests();
  }, [isAdmin]);

  if (!isAdmin) {
    return <p className="text-center text-red-500 mt-10">Access denied.</p>;
  }

  return (
    <div className="px-[150px] max-mdp:px-[20px]">
      <div className="pt-[40px] w-full flex justify-center gap-1">
        <AdminPanelSettingsIcon className="!text-5xl text-orange-500 -mt-1" />
        <h2 className="ml-1 text-3xl font-bold mb-6 text-center text-gray-700">
          Requests for Minting Asset
        </h2>
      </div>
      <div className="w-full mt-5">
        {loading ? (
          <p className="text-center">Loading asset requests...</p>
        ) : assetRequests.length === 0 ? (
          <p className="text-center text-gray-500">
            No pending asset requests.
          </p>
        ) : (
          <div className="grid grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2 gap-6 mb-6">
            {assetRequests.map((asset) => (
              <div
                key={asset.id}
                className="w-full p-4 border rounded-lg shadow-md bg-white space-y-1"
              >
                <img
                  src={asset.image}
                  alt={asset.name}
                  className="w-full h-48 object-cover rounded"
                />
                <h2 className="text-xl font-semibold">{asset.name}</h2>
                <p className="text-gray-700">{asset.description}</p>
                <p className="text-sm text-gray-500">
                  <strong>Requester:</strong>
                  <br /> <span className="text-[11px]">{asset.requester}</span>
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Valuation:</strong> {asset.valuation} ETH
                </p>
                <a
                  href={asset.document}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-sm font-medium text-orange-500"
                >
                  View Document
                </a>
                <button
                  onClick={() => handleApprove(asset.id)}
                  className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                  Approve & Mint
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
