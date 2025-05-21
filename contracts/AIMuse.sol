// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AIMuse
 * @dev ERC721 token with storage based token URI management.
 * Allows users to mint tokens with AI-generated metadata and update them later.
 */
contract AIMuse is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event MetadataUpdated(uint256 indexed tokenId, string newTokenURI);
    
    // Keep track of token creators for authorization
    mapping(uint256 => address) public tokenCreators;
    
    // Maximum tokens per address (can be changed by owner)
    uint256 public maxTokensPerAddress = 10;
    
    // Optional mint fee
    uint256 public mintFee = 0;
    
    constructor() ERC721("AI-Muse", "AIMUSE") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new NFT with the given token URI
     * @param tokenURI The URI containing the metadata for the NFT
     * @return The ID of the newly minted token
     */
    function mintNFT(string memory tokenURI) public payable returns (uint256) {
        // Check if mint fee is required
        if (mintFee > 0) {
            require(msg.value >= mintFee, "Insufficient funds sent");
        }
        
        // Check if user hasn't exceeded max tokens
        require(
            balanceOf(msg.sender) < maxTokensPerAddress,
            "Exceeded maximum tokens per address"
        );
        
        // Increment token ID
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint token to sender
        _mint(msg.sender, newTokenId);
        
        // Set token URI
        _setTokenURI(newTokenId, tokenURI);
        
        // Record creator
        tokenCreators[newTokenId] = msg.sender;
        
        emit NFTMinted(newTokenId, msg.sender, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Update the metadata of an existing NFT
     * @param tokenId The ID of the token to update
     * @param newTokenURI The new URI containing updated metadata
     */
    function updateMetadata(uint256 tokenId, string memory newTokenURI) public {
        // Must be token owner or approved
        require(
            _isApprovedOrOwner(msg.sender, tokenId) || 
            tokenCreators[tokenId] == msg.sender,
            "Not authorized to update"
        );
        
        // Update token URI
        _setTokenURI(tokenId, newTokenURI);
        
        emit MetadataUpdated(tokenId, newTokenURI);
    }
    
    /**
     * @dev Allow owner to update the mint fee
     * @param newFee The new mint fee in wei
     */
    function setMintFee(uint256 newFee) public onlyOwner {
        mintFee = newFee;
    }
    
    /**
     * @dev Allow owner to update max tokens per address
     * @param newMax The new maximum
     */
    function setMaxTokensPerAddress(uint256 newMax) public onlyOwner {
        maxTokensPerAddress = newMax;
    }
    
    /**
     * @dev Withdraw contract funds to owner
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}