// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateToken is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;

    struct Asset {
        uint256 tokenId;
        address owner;
        string tokenURI;
        uint256 valuation;
        bool forSale;
        uint256 price;
    }

    mapping(uint256 => Asset) public assets;

    constructor() ERC721("RealEstateToken", "RET") Ownable(msg.sender) {}

    function mintAsset(string memory _tokenURI, uint256 _valuation) public {
        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        assets[tokenId] = Asset({
            tokenId: tokenId,
            owner: msg.sender,
            tokenURI: _tokenURI,
            valuation: _valuation,
            forSale: false,
            price: 0
        });

        nextTokenId++;
    }

    function listForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_price > 0, "Price must be greater than 0");

        assets[_tokenId].forSale = true;
        assets[_tokenId].price = _price;
    }

    function buyAsset(uint256 _tokenId) public payable {
        Asset memory asset = assets[_tokenId];

        require(asset.forSale, "Not for sale");
        require(msg.value >= asset.price, "Insufficient payment");
        require(msg.sender != asset.owner, "You already own this asset");

        payable(asset.owner).transfer(asset.price);

        _transfer(asset.owner, msg.sender, _tokenId);

        assets[_tokenId].owner = msg.sender;
        assets[_tokenId].forSale = false;
        assets[_tokenId].price = 0;
    }

    function transferAsset(address _to, uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        _transfer(msg.sender, _to, _tokenId);
        assets[_tokenId].owner = _to;
    }

    function getAssetsByOwner(address _owner) public view returns (Asset[] memory) {
        uint256 total = nextTokenId;
        uint256 count = 0;

        for (uint256 i = 0; i < total; i++) {
            if (assets[i].owner == _owner) count++;
        }

        Asset[] memory result = new Asset[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < total; i++) {
            if (assets[i].owner == _owner) {
                result[index] = assets[i];
                index++;
            }
        }

        return result;
    }

    function getAllAssetsForSale() public view returns (Asset[] memory) {
        uint256 total = nextTokenId;
        uint256 count = 0;

        for (uint256 i = 0; i < total; i++) {
            if (assets[i].forSale) count++;
        }

        Asset[] memory result = new Asset[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < total; i++) {
            if (assets[i].forSale) {
                result[index] = assets[i];
                index++;
            }
        }

        return result;
    }
}
