import React, { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import AssetCard from "../components/AssetCard";
import { toast } from "react-toastify";
import { parseEther } from "ethers";
import NoWallet from "../components/NoWallet";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import { useWallet } from "../context/WalletContext";

const MyAssets = () => {
  const [assets, setAssets] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAccount = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        return accounts[0];
      } else {
        toast.warn("Please connect your wallet to view your assets.");
        setLoading(false);
        return null;
      }
    }
  };

  const fetchMyAssets = async () => {
    try {
      const user = await fetchAccount();
      if (!user) return;

      const contract = await getContract();
      const assetsFromContract = await contract.getAssetsByOwner(user);

      const enrichedAssets = await Promise.all(
        assetsFromContract.map(async (a) => {
          const response = await fetch(
            a.tokenURI.replace(
              "ipfs://",
              "https://peach-official-lemming-719.mypinata.cloud/ipfs/"
            )
          );
          const metadata = await response.json();

          return {
            tokenId: a.tokenId?.toString(),
            owner: a.owner,
            tokenURI: a.tokenURI,
            valuation: a.valuation?.toString(),
            price: a.price?.toString(),
            forSale: a.forSale,
            image: metadata.image,
            name: metadata.name,
            description: metadata.description,
          };
        })
      );

      setAssets(enrichedAssets);
    } catch (err) {
      console.error("Error fetching my assets:", err);
      toast.warn("Connect to your wallet to use app!");
    }

    setLoading(false);
  };

  const handleList = async (tokenId, price) => {
    try {
      const contract = await getContract();

      if (!contract || typeof contract.listForSale !== "function") {
        toast.error("Contract function not available.");
        return;
      }

      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        toast.error("Please enter a valid price.");
        return;
      }

      const tx = await contract.listForSale(
        tokenId,
        parseEther(numericPrice.toString())
      );
      await tx.wait();

      toast.success("Asset listed for sale.");
      fetchMyAssets();
    } catch (err) {
      console.error("List error:", err);
      toast.error("Failed to list asset for sale.");
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, [account]);

  return (
    <div className="p-6">
      <div className="pt-[40px] flex w-full justify-center gap-1">
        <WebAssetIcon className="!text-5xl text-orange-500 -mt-1" />
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
          My Assets
        </h2>
      </div>
      {loading ? (
        <p className="text-center">Loading your assets...</p>
      ) : !account ? (
        <NoWallet />
      ) : assets.length === 0 ? (
        <p className="text-center">You don't own any assets yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {assets.map((asset, index) => (
            <AssetCard
              key={index}
              asset={asset}
              isOwned={true}
              onList={handleList}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssets;
