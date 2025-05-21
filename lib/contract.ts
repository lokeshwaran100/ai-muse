"use client";

import { ethers } from "ethers";
import contractAbi from "@/contracts/abi/AIMuse.json";
import { toast } from "sonner";

// Constants - Update with your deployed contract address
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 
  "0x00000000000000000000000000000000";

// Base network ChainId values
export const BASE_MAINNET_CHAIN_ID = 8453;
export const BASE_TESTNET_CHAIN_ID = 84531;

export interface ContractConfig {
  provider: ethers.BrowserProvider;
  chainId?: number;
}

// Get read-only contract instance
export function getContract({ provider }: ContractConfig) {
  return new ethers.Contract(CONTRACT_ADDRESS, contractAbi, provider);
}

// Get contract with signer for write operations
export async function getSignedContract({ provider }: ContractConfig) {
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);
}

// Check if user is on the correct network
export async function checkNetwork(provider: ethers.BrowserProvider) {
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);
  
  return (
    chainId === BASE_MAINNET_CHAIN_ID || 
    chainId === BASE_TESTNET_CHAIN_ID
  );
}

// Request switch to Base network
export async function switchToBaseNetwork() {
  if (!window.ethereum) return false;
  
  try {
    // Try to switch to Base
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${BASE_TESTNET_CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (switchError: any) {
    // If Base is not added to MetaMask, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${BASE_TESTNET_CHAIN_ID.toString(16)}`,
              chainName: "Base Goerli Testnet",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://goerli.base.org"],
              blockExplorerUrls: ["https://goerli.basescan.org"],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Error adding Base network:", addError);
        return false;
      }
    }
    console.error("Error switching to Base network:", switchError);
    return false;
  }
}

// Mint a new NFT
export async function mintNFT(
  tokenURI: string, 
  { provider }: ContractConfig
): Promise<{ tokenId: number; txHash: string } | null> {
  if (!await checkNetwork(provider)) {
    const switched = await switchToBaseNetwork();
    if (!switched) {
      toast.error("Please switch to Base network to mint NFTs");
      return null;
    }
  }
  
  try {
    const contract = await getSignedContract({ provider });
    
    // Get mint fee (if any)
    const mintFee = await contract.mintFee();
    
    // Call mint function with tokenURI
    const tx = await contract.mintNFT(tokenURI, { value: mintFee });
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    // Get token ID from event logs
    if (receipt && receipt.logs) {
      const event = receipt.logs.find(
        (log: any) => log.fragment && log.fragment.name === "NFTMinted"
      );
      
      if (event && event.args) {
        const tokenId = Number(event.args[0]);
        return { 
          tokenId, 
          txHash: receipt.hash 
        };
      }
    }
    
    return null;
  } catch (error: any) {
    console.error("Error minting NFT:", error);
    toast.error(error.message || "Failed to mint NFT");
    return null;
  }
}

// Update NFT metadata
export async function updateNFTMetadata(
  tokenId: number,
  newTokenURI: string,
  { provider }: ContractConfig
): Promise<string | null> {
  if (!await checkNetwork(provider)) {
    const switched = await switchToBaseNetwork();
    if (!switched) {
      toast.error("Please switch to Base network to update NFTs");
      return null;
    }
  }
  
  try {
    const contract = await getSignedContract({ provider });
    
    // Call update function
    const tx = await contract.updateMetadata(tokenId, newTokenURI);
    
    // Wait for transaction
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error("Error updating NFT metadata:", error);
    toast.error(error.message || "Failed to update NFT");
    return null;
  }
}

// Get token URI
export async function getTokenURI(
  tokenId: number,
  { provider }: ContractConfig
): Promise<string | null> {
  try {
    const contract = getContract({ provider });
    return await contract.tokenURI(tokenId);
  } catch (error) {
    console.error("Error getting token URI:", error);
    return null;
  }
}

// Get token owner
export async function getTokenOwner(
  tokenId: number,
  { provider }: ContractConfig
): Promise<string | null> {
  try {
    const contract = getContract({ provider });
    return await contract.ownerOf(tokenId);
  } catch (error) {
    console.error("Error getting token owner:", error);
    return null;
  }
}

// Get user NFT balance
export async function getUserNFTBalance(
  address: string,
  { provider }: ContractConfig
): Promise<number> {
  try {
    const contract = getContract({ provider });
    const balance = await contract.balanceOf(address);
    return Number(balance);
  } catch (error) {
    console.error("Error getting NFT balance:", error);
    return 0;
  }
}