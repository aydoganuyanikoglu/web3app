import { toast } from "react-toastify";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const NoWallet = () => {
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        window.location.reload();
      } else {
        toast.error("Metamask not found. Please install Metamask.");
      }
    } catch (err) {
      toast.error(`Wallet connection failed: ${err.message}`);
      console.error("Connection error:", err);
    }
  };

  return (
    <div className="pt-[40px] flex justify-center">
      <div className="w-[600px] flex flex-col justify-center items-center py-10 px-5 border-[2px] border-gray-200 rounded-md text-gray-800 shadow-gray-500 shadow-lg max-sm:w-full">
        <div className="flex gap-1.5 max-md:flex-col max-md:items-center">
          <h2 className="text-3xl font-bold">Connect Your Wallet </h2>
          <div className="-mt-1">
            <AccountBalanceWalletIcon className="!text-5xl text-orange-500" />
          </div>
        </div>
        <p className="mt-2 text-center text-lg font-medium">
          You need to connect your wallet to access the application!
        </p>
        <button
          onClick={connectWallet}
          className="mt-4 bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default NoWallet;
