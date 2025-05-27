import React, { useState } from "react";

const resolveIPFS = (url) => {
  if (!url) return "";
  return url.replace(
    "ipfs://",
    "https://peach-official-lemming-719.mypinata.cloud/ipfs/"
  );
};

const AssetCard = ({ asset, onBuy, onList, isOwned, account, deList }) => {
  const { tokenId, tokenURI, valuation, owner, forSale, price } = asset;
  const [salePrice, setSalePrice] = useState("");

  const handleList = () => {
    const numericPrice = parseFloat(salePrice);
    if (isNaN(numericPrice) || numericPrice <= 0) return;
    onList(tokenId, numericPrice);
    setSalePrice("");
  };

  const isUserOwner =
    account && owner && account.toLowerCase() === owner.toLowerCase();

  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-sm mx-auto">
      <img
        src={resolveIPFS(asset.image)}
        alt={asset.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-xl font-semibold mb-1">{asset.name}</h3>
      <p className="text-gray-600 text-sm mb-2">{asset.description}</p>
      <p className="text-sm">Valuation: {valuation} ETH</p>
      {forSale && <p className="text-sm">Price: {price} ETH</p>}
      <p className="text-sm text-gray-500">
        Owner: {owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : "Unknown"}
      </p>
      {onBuy &&
        forSale &&
        (isUserOwner ? (
          <p className="mt-3 text-green-600 text-sm font-semibold">
            This asset is yours
          </p>
        ) : (
          <button
            onClick={() => onBuy(tokenId, price)}
            className="mt-3 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Buy
          </button>
        ))}
      {isOwned && !forSale && onList && (
        <div className="mt-4">
          <input
            type="number"
            placeholder="Set price in ETH"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full mb-2"
          />
          <button
            onClick={handleList}
            className="w-full bg-black text-white py-2 rounded border-[1px] border-black hover:bg-white hover:text-black"
          >
            List for Sale
          </button>
        </div>
      )}
      {isOwned && forSale && (
        <div>
          <p className="mt-3 text-yellow-600 text-sm font-semibold">
            This asset is already listed
          </p>
          <button
            onClick={() => deList(asset.tokenId)}
            className="mt-2 w-full bg-red-600 text-white py-2 rounded border-[1px] border-red-600 hover:bg-white hover:text-red-600"
          >
            Remove from Sale
          </button>
        </div>
      )}
    </div>
  );
};

export default AssetCard;
