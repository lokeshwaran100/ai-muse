"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { atom, useAtom } from "jotai";
import { toast } from "sonner";
import { BrowserProvider, Eip1193Provider } from "ethers";


// Account atom
const walletAtom = atom<string | null>(null);
const chainIdAtom = atom<number | null>(null);

interface UseWalletReturn {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  provider: ethers.BrowserProvider | null;
}

export function useWallet(): UseWalletReturn {
  const [address, setAddress] = useAtom(walletAtom);
  const [chainId, setChainId] = useAtom(chainIdAtom);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Handle account change
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setAddress(null);
    } else {
      setAddress(accounts[0]);
    }
  }, [setAddress]);

  // Handle chain change
  const handleChainChanged = useCallback((chainIdHex: string) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);
    
    // Check if on Base Mainnet (8453) or Base Goerli (84531)
    if (newChainId !== 8453 && newChainId !== 84531) {
      toast.warning("Please connect to Base network");
    }
  }, [setChainId]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed");
      return;
    }

    setIsConnecting(true);

    try {
      const ethereum = window.ethereum;
      const newProvider = new ethers.BrowserProvider(window.ethereum as Eip1193Provider);
      setProvider(newProvider);
      
      // Request accounts
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      handleAccountsChanged(accounts);
      
      // Get chain ID
      const chainIdHex = await ethereum.request({ method: "eth_chainId" });
      handleChainChanged(chainIdHex);
      
      toast.success("Wallet connected successfully");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [handleAccountsChanged, handleChainChanged]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setProvider(null);
    toast.info("Wallet disconnected");
  }, [setAddress, setChainId]);

  // Initialize event listeners
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    // Set initial accounts if already connected
    window.ethereum
      .request({ method: "eth_accounts" })
      .then(handleAccountsChanged)
      .catch(console.error);
      
    // Set initial chain ID if already connected
    window.ethereum
      .request({ method: "eth_chainId" })
      .then(handleChainChanged)
      .catch(console.error);

    // Set up event listeners
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("disconnect", disconnect);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", disconnect);
      }
    };
  }, [handleAccountsChanged, handleChainChanged, disconnect]);

  return {
    address,
    chainId,
    isConnecting,
    connect,
    disconnect,
    provider
  };
}

// Add global type for window.ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}