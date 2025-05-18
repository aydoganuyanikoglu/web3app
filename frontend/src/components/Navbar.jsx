import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) {
        toast.error("Please install Metamask!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        toast.success("Wallet Connected!");
      }
    };

    checkConnection();

    const handleAccountChange = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
        toast.warn("Wallet disconnected!");
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChange);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountChange);
      }
    };
  }, []);

  return (
    <>
      <ToastContainer position="top-center" autoClose={2500} />
      <nav className="w-full pt-[30px] px-[150px] max-mdp:px-[20px]">
        <div className="py-4 px-10 max-md:px-2 text-black flex justify-between items-center border-[2px] shadow-sm shadow-gray-600 rounded-[20px] hover:shadow-lg cursor-pointer">
          <Link to="/" className="text-xl hover:text-gray-400 font-semibold">
            RWA Tokenization
          </Link>
          <div className="space-x-8 flex items-center">
            <Link to="/" className="text-md hover:text-gray-400 font-semibold">
              Home
            </Link>
            <Link
              to="/add"
              className="text-md hover:text-gray-400 font-semibold"
            >
              Add Asset
            </Link>
            <Link
              to="/my-assets"
              className="text-md hover:text-gray-400 font-semibold"
            >
              My Assets
            </Link>
            <Link
              to="/transfer"
              className="text-md hover:text-gray-400 font-semibold"
            >
              Transfer
            </Link>
            {account && (
              <div className="relative group ml-4">
                <span className="bg-white text-orange-600 px-3 py-1 rounded font-medium cursor-default">
                  <span className="!text-black">wallet:</span>{" "}
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <div className="absolute left-0 top-full mt-1 w-max px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {account}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
