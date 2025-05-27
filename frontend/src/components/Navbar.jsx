import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useWallet } from "../context/WalletContext";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const Navbar = () => {
  const { account, isAdmin } = useWallet();

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
            {!isAdmin && (
              <div className="space-x-8 flex items-center">
                {" "}
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
              </div>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-md text-orange-500 hover:text-gray-400 font-semibold"
              >
                <span>
                  <AdminPanelSettingsIcon className="!text-lg text-orange-500 -mt-1" />
                </span>
                Admin
              </Link>
            )}
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
