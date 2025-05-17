const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("📦 Deploying contracts with account:", deployer.address);

  const RealEstateToken = await hre.ethers.getContractFactory(
    "RealEstateToken"
  );
  const contract = await RealEstateToken.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ RealEstateToken deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
