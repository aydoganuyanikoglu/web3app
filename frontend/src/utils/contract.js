import { ethers } from "ethers";
import RealEstateToken from "../abi/RealEstateToken.json";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

export const getContract = async () => {
  if (!window.ethereum) throw new Error("Metamask not found");

  await window.ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(contractAddress, RealEstateToken.abi, signer);
};
