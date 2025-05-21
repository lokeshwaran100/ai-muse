"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { NFTMetadata } from "@/lib/db";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface NFTUpdateModalProps {
  nft: NFTMetadata | null;
  onClose: () => void;
  onSubmit: (prompt: string, tokenId: number) => Promise<void>;
  isLoading: boolean;
}

export default function NFTUpdateModal({
  nft,
  onClose,
  onSubmit,
  isLoading
}: NFTUpdateModalProps) {
  const [prompt, setPrompt] = useState(nft?.prompt || "");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nft) return;
    await onSubmit(prompt, nft.tokenId);
  };
  
  return (
    <AnimatePresence>
      {nft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative z-50 w-full max-w-lg bg-card rounded-lg shadow-xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Update NFT {nft.tokenId}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Current NFT Preview */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-md overflow-hidden">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{nft.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Current prompt: <span className="italic">{nft.prompt}</span>
                </p>
              </div>
            </div>
            
            {/* Update Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium mb-1">
                  New Prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter a new prompt to update your NFT's image and metadata..."
                  className="w-full rounded-md bg-background text-foreground border border-input p-3 min-h-24 focus:outline-none focus:ring-2 focus:ring-chart-1"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-md bg-chart-1 text-white hover:bg-chart-1/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" /> 
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update NFT</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}