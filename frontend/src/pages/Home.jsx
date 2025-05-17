import React, { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import AssetCard from "../components/AssetCard";
import { toast } from "react-toastify";
import NoWallet from "../components/NoWallet";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useWallet } from "../context/WalletContext";
import { formatEther } from "ethers";

const Home = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();

  const fetchAssets = async () => {
    try {
      const contract = await getContract();
      const assetsFromContract = await contract.getAllAssetsForSale();

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
            price: formatEther(a.price || "0"),
            forSale: a.forSale,
            image: metadata.image,
            name: metadata.name,
            description: metadata.description,
          };
        })
      );

      setAssets(enrichedAssets);
    } catch (err) {
      console.error("Error fetching assets:", err);
      toast.warn("Connect to your wallet to use the app!");
    }
    setLoading(false);
  };

  const handleBuy = async (tokenId, price) => {
    try {
      const contract = await getContract();
      const tx = await contract.buyAsset(tokenId, {
        value: price.toString(),
      });
      await tx.wait();
      toast.success("Asset purchased successfully!");
      fetchAssets();
    } catch (err) {
      console.error("Buy error:", err);
      toast.error("Purchase failed");
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [account]);

  return (
    <div className="p-6">
      <div className="pt-[40px] w-full flex justify-center gap-1">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
          Assets for Sale
        </h2>
        <ShoppingCartIcon className="!text-5xl text-green-500 -mt-1" />
      </div>
      {loading ? (
        <p className="text-center">Loading assets...</p>
      ) : account === null ? (
        <NoWallet />
      ) : assets.length === 0 ? (
        <p className="text-center">No assets are currently for sale.</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {assets.map((asset, index) => (
              <AssetCard
                key={index}
                asset={asset}
                onBuy={handleBuy}
                account={account}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
