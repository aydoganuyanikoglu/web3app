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

//we are checking for the metamask wallet in here, with window.ethereum if there is no metamask we send error 'metamask could not found', we want a connection from user, with provider we are able to make a connection with metamask. With signer, we using it to sign contract functions to send new processes. In the end with the object that function is returning, we are able to call our functions coming from our smart contract.
