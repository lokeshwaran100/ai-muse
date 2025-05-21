"use client";

import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";

export default function WalletConnect() {
  const { address, isConnecting, connect, disconnect } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isDropdownOpen) setIsDropdownOpen(false);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="relative">
      {!address ? (
        <button
          onClick={connect}
          disabled={isConnecting}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            "bg-chart-1 text-white hover:bg-chart-1/90",
            isConnecting && "opacity-70 cursor-not-allowed"
          )}
        >
          {isConnecting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet size={16} />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      ) : (
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all bg-muted hover:bg-muted/80"
        >
          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-chart-1 to-chart-2" />
          <span className="hidden sm:inline">{truncateAddress(address)}</span>
          <span className="sm:hidden">Connected</span>
        </button>
      )}

      <AnimatePresence>
        {isDropdownOpen && address && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border overflow-hidden"
          >
            <div className="py-2 px-3 border-b border-border">
              <p className="text-xs text-muted-foreground">Connected Wallet</p>
              <p className="text-sm font-medium truncate">{address}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  disconnect();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}