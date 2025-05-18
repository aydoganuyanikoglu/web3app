import React, { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import AssetCard from "../components/AssetCard";
import { getContract } from "../utils/contract";
import { toast } from "react-toastify";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import NoWallet from "../components/NoWallet";
import { TokensSkeleton } from "../components/Skeletons";
import { EmptyTransferList } from "../components/Skeletons";

const TransferAsset = () => {
  const { account, assets, fetchMyAssets, loading } = useWallet();
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [receiver, setReceiver] = useState("");

  const transferableAssets = assets.filter((a) => !a.forSale);

  const handleTransfer = async () => {
    if (!selectedTokenId || !receiver) {
      toast.warn("Please select an asset and enter receiver address.");
      return;
    }

    try {
      const contract = await getContract();
      const tx = await contract.transferAsset(receiver, selectedTokenId);
      await tx.wait();

      toast.success("Asset transferred successfully!");
      setReceiver("");
      setSelectedTokenId(null);
      fetchMyAssets();
    } catch (err) {
      console.error("Transfer error:", err);
      toast.error("Transfer failed.");
    }
  };

  useEffect(() => {
    fetchMyAssets();
  }, []);

  return (
    <div className="px-[150px] max-mdp:px-[20px]">
      <div className="pt-[40px] w-full flex justify-center gap-1">
        <MoveUpIcon className="!text-5xl text-orange-500 -mt-1" />
        <h2 className="ml-1 text-3xl font-bold mb-6 text-center text-gray-700">
          Transfer Your Assets
        </h2>
      </div>
      {loading ? (
        <TokensSkeleton />
      ) : !account ? (
        <NoWallet />
      ) : (
        <div>
          {transferableAssets.length === 0 ? (
            <EmptyTransferList />
          ) : (
            <div>
              <div className="grid grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2 gap-6 mb-6">
                {transferableAssets.map((asset, index) => (
                  <div
                    key={index}
                    className={`border-[4px] rounded-xl cursor-pointer ${
                      selectedTokenId === asset.tokenId
                        ? "border-blue-400 shadow-lg shadow-black"
                        : "border-transparent"
                    } transition`}
                    onClick={() => setSelectedTokenId(asset.tokenId)}
                  >
                    <AssetCard asset={asset} isOwned={true} />
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-4">
                  <label className="block mb-1 font-bold">
                    Receiver Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    className="w-1/2 max-sm:w-full border rounded px-3 py-2"
                  />
                </div>

                <button
                  onClick={handleTransfer}
                  className="bg-black text-white px-6 py-2 rounded border-[1px] border-black hover:bg-white hover:text-black"
                >
                  Transfer Asset
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransferAsset;
