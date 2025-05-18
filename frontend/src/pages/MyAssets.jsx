import React, { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import AssetCard from "../components/AssetCard";
import { toast } from "react-toastify";
import { parseEther } from "ethers";
import NoWallet from "../components/NoWallet";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import { useWallet } from "../context/WalletContext";
import { TokensSkeleton } from "../components/Skeletons";
import { EmptyAssetsList } from "../components/Skeletons";

const MyAssets = () => {
  const { loading, account, assets, fetchMyAssets } = useWallet();

  const handleDelist = async (tokenId) => {
    try {
      const contract = await getContract();
      const tx = await contract.delistAsset(tokenId);
      await tx.wait();
      toast.success("Asset removed from sale.");
      fetchMyAssets();
    } catch (err) {
      console.error("Delist error:", err);
      toast.error("Failed to remove asset from sale.");
    }
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
    <div className="px-[150px] max-mdp:px-[20px]">
      <div className="pt-[40px] flex w-full justify-center gap-1">
        <WebAssetIcon className="!text-5xl text-orange-500 -mt-1" />
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
          My Assets
        </h2>
      </div>
      {loading ? (
        <TokensSkeleton />
      ) : !account ? (
        <NoWallet />
      ) : assets.length === 0 ? (
        <EmptyAssetsList />
      ) : (
        <div className="grid grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2 gap-6 mb-6">
          {assets.map((asset, index) => (
            <AssetCard
              key={index}
              asset={asset}
              isOwned={true}
              onList={handleList}
              deList={handleDelist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssets;
