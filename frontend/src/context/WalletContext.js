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
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasNotifiedConnection, setHasNotifiedConnection] = useState(false);

  const admin_address = process.env.REACT_APP_WALLET_ADDRESS?.toLowerCase();

  const fetchAccount = async (silent = false) => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const acc = accounts[0];
        setAccount(acc);
        setIsAdmin(acc.toLowerCase() === admin_address);

        if (!silent && !hasNotifiedConnection) {
          toast.success("Wallet Connected!");
          setHasNotifiedConnection(true);
        }

        return acc;
      } else {
        if (!silent && !hasNotifiedConnection) {
          toast.warn("Please connect your wallet to view your assets.");
          setHasNotifiedConnection(true);
        }

        setLoading(false);
        return null;
      }
    } else {
      if (!silent) toast.error("Please install Metamask!");
      return null;
    }
  };

  const fetchMyAssets = async () => {
    try {
      const user = await fetchAccount(true);
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
    fetchAccount(true);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setAssets([]);
          setSaledAssets([]);
          toast.info("Wallet disconnected.");
          setHasNotifiedConnection(false);
        } else {
          toast.success("Account changed!");
          setAccount(accounts[0]);
          setIsAdmin(accounts[0].toLowerCase() === admin_address);
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
        isAdmin,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
