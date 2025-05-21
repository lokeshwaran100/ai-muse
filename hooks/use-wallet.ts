"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { atom, useAtom } from "jotai";
import { toast } from "sonner";

// Account atom
const walletAtom = atom<string | null>(null);
const chainIdAtom = atom<number | null>(null);
const providerAtom = atom<ethers.BrowserProvider | null>(null);

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
  const [provider, setProvider] = useAtom(providerAtom);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize provider
  const initializeProvider = useCallback(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
      return newProvider;
    }
    return null;
  }, [setProvider]);

  // Handle account change
  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length === 0) {
      setAddress(null);
      setProvider(null);
    } else {
      setAddress(accounts[0]);
      if (!provider) {
        initializeProvider();
      }
    }
  }, [setAddress, provider, initializeProvider, setProvider]);

  // Handle chain change
  const handleChainChanged = useCallback((chainIdHex: string) => {
    const newChainId = parseInt(chainIdHex, 16);
    setChainId(newChainId);
    
    // Reinitialize provider on chain change
    initializeProvider();
    
    // Check if on Base Mainnet (8453) or Base Goerli (84531)
    if (newChainId !== 8453 && newChainId !== 84531) {
      toast.warning("Please connect to Base network");
    }
  }, [setChainId, initializeProvider]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed");
      return;
    }

    setIsConnecting(true);

    try {
      const newProvider = initializeProvider();
      if (!newProvider) {
        throw new Error("Failed to initialize provider");
      }
      
      // Request accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      await handleAccountsChanged(accounts);
      
      // Get chain ID
      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
      handleChainChanged(chainIdHex);
      
      toast.success("Wallet connected successfully");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
      setProvider(null);
    } finally {
      setIsConnecting(false);
    }
  }, [handleAccountsChanged, handleChainChanged, initializeProvider, setProvider]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setProvider(null);
    toast.info("Wallet disconnected");
  }, [setAddress, setChainId, setProvider]);

  // Initialize event listeners
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    // Initialize provider if wallet is already connected
    const init = async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          initializeProvider();
          await handleAccountsChanged(accounts);
          
          const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
          handleChainChanged(chainIdHex);
        }
      } catch (error) {
        console.error("Error initializing wallet:", error);
      }
    };
    
    init();

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
  }, [handleAccountsChanged, handleChainChanged, disconnect, initializeProvider]);

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