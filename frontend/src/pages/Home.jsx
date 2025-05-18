import React, { useEffect } from "react";
import { getContract } from "../utils/contract";
import AssetCard from "../components/AssetCard";
import { toast } from "react-toastify";
import NoWallet from "../components/NoWallet";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useWallet } from "../context/WalletContext";
import { parseEther } from "ethers";
import { EmptySaleList, TokensSkeleton } from "../components/Skeletons";

const Home = () => {
  const { account, saledAssets, fetchSaledAssets, loading } = useWallet();

  const handleBuy = async (tokenId, price) => {
    try {
      const contract = await getContract();

      const tx = await contract.buyAsset(tokenId, {
        value: parseEther(price.toString()),
      });

      await tx.wait();
      toast.success("Asset purchased successfully!");
      fetchSaledAssets();
    } catch (err) {
      console.error("Buy error:", err);
      toast.error("Purchase failed");
    }
  };

  useEffect(() => {
    fetchSaledAssets();
  }, [account]);

  return (
    <div className="px-[150px] max-mdp:px-[20px]">
      <div className="pt-[40px] w-full flex justify-center gap-1">
        <ShoppingCartIcon className="!text-5xl text-orange-500 -mt-1" />
        <h2 className="ml-1 text-3xl font-bold mb-6 text-center text-gray-700">
          Assets for Sale
        </h2>
      </div>
      {loading ? (
        <TokensSkeleton />
      ) : account === null ? (
        <NoWallet />
      ) : saledAssets.length === 0 ? (
        <EmptySaleList />
      ) : (
        <div>
          <div className="grid grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2 gap-6 mb-6">
            {saledAssets.map((asset, index) => (
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
