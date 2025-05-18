import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getContract } from "../utils/contract";
import { formatEther } from "ethers";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [saledAssets, setSaledAssets] = useState([]);

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
      console.error("Error fetching my assets:", err);
    }

    setLoading(false);
  };

  const fetchSaledAssets = async () => {
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

      setSaledAssets(enrichedAssets);
    } catch (err) {
      console.error("Error fetching assets:", err);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchAccount();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setAssets([]);
          setSaledAssets([]);
          toast.info("Wallet disconnected.");
        } else {
          toast.info("Account Changed");
          setAccount(accounts[0]);
          fetchMyAssets();
          fetchSaledAssets();
        }
      });
    }
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        fetchAccount,
        fetchMyAssets,
        loading,
        assets,
        saledAssets,
        fetchSaledAssets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
