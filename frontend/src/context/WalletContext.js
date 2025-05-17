import React, { createContext, useContext, useEffect, useState } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);

  const fetchAccount = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error("Failed to fetch account:", err);
      }
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [account]);

  return (
    <WalletContext.Provider value={{ account, fetchAccount }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
