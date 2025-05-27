// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateToken is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    uint256 public nextAssetRequestId;

    struct AssetRequest {
        address requester;
        string tokenURI;
        uint256 valuation;
        bool approved;
    }

    struct Asset {
        uint256 tokenId;
        address owner;
        string tokenURI;
        uint256 valuation;
        bool forSale;
        uint256 price;
    }

    mapping(uint256 => Asset) public assets;
    mapping(uint256 => AssetRequest) public assetRequests;

    address public constant ADMIN = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    constructor() ERC721("RealEstateToken", "RET") Ownable(ADMIN) {}

    function mintAsset(string memory _tokenURI, uint256 _valuation) public {
        assetRequests[nextAssetRequestId] = AssetRequest({
            requester: msg.sender,
            tokenURI: _tokenURI,
            valuation: _valuation,
            approved: false
        });

        nextAssetRequestId++;
    }

    function approveAndMint(uint256 requestId) public onlyOwner { //only admin can run this function to mint new NFT
        AssetRequest storage request = assetRequests[requestId];
        require(!request.approved, "Already approved");
        require(request.requester != address(0), "Invalid request");

        request.approved = true;

        uint256 tokenId = nextTokenId;
        _safeMint(request.requester, tokenId);
        _setTokenURI(tokenId, request.tokenURI);

        assets[tokenId] = Asset({
            tokenId: tokenId,
            owner: request.requester,
            tokenURI: request.tokenURI,
            valuation: request.valuation,
            forSale: false,
            price: 0
        });

        nextTokenId++;
    }

    function getAssetRequest(uint256 requestId) public view returns (AssetRequest memory) {
        return assetRequests[requestId];
    }

    function listForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_price > 0, "Price must be greater than 0");

        assets[_tokenId].forSale = true;
        assets[_tokenId].price = _price;
    } //provides to owner to list their tokens for a sale.

    function delistAsset(uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(assets[_tokenId].forSale == true, "Asset is not listed for sale");

        assets[_tokenId].forSale = false;
        assets[_tokenId].price = 0;
    } //removing the token from sale list.

    function buyAsset(uint256 _tokenId) public payable {
        Asset memory asset = assets[_tokenId];

        require(asset.forSale, "Not for sale");
        require(msg.value >= asset.price, "Insufficient payment");
        require(msg.sender != asset.owner, "You already own this asset");

        payable(asset.owner).transfer(asset.price); //old owner gets his money

        _transfer(asset.owner, msg.sender, _tokenId); //new owner gets token

        assets[_tokenId].owner = msg.sender;
        assets[_tokenId].forSale = false;
        assets[_tokenId].price = 0;
    } //user can buys other users real world assets in this way.

    function transferAsset(address _to, uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        _transfer(msg.sender, _to, _tokenId);
        assets[_tokenId].owner = _to;
    } //provides transferring token to another user

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
    } //to provide to user list his/her tokens

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
    } //to list the tokens on sale.
}
