"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { NFTMetadata } from "@/lib/db";
import NFTGrid from "@/components/nft/nft-grid";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ArrowRight, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import axios from "axios";

export default function MyNFTsPage() {
  const { address, provider } = useWallet();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch NFTs when wallet address changes
  useEffect(() => {
    if (!address) {
      setNfts([]);
      return;
    }
    
    const fetchNFTs = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/api/nfts?owner=${address}`);
        setNfts(data.nfts || []);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNFTs();
  }, [address]);
  
  // Handle NFT update in the UI
  const handleNftUpdate = (updatedNft: NFTMetadata) => {
    setNfts(current => 
      current.map(nft => 
        nft.tokenId === updatedNft.tokenId ? updatedNft : nft
      )
    );
  };
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">My NFT Gallery</h1>
          <p className="text-muted-foreground">
            View and manage your AI-generated NFTs on the Base blockchain
          </p>
        </div>
        
        <Link 
          href="/mint" 
          className={cn(
            "px-4 py-2 rounded-lg font-medium",
            "bg-chart-1 text-white hover:bg-chart-1/90 transition-colors",
            "flex items-center gap-2"
          )}
        >
          <Paintbrush size={16} />
          <span>Mint New NFT</span>
          <ArrowRight size={14} />
        </Link>
      </div>
      
      {!address ? (
        <div className="text-center py-20 bg-muted rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Please connect your wallet to view your NFT collection.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your NFTs...</p>
          </div>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-16 bg-muted/50 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">No NFTs Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            You haven't minted any NFTs yet. Start creating your collection now!
          </p>
          
          <Link 
            href="/mint" 
            className={cn(
              "px-6 py-3 rounded-lg font-medium",
              "bg-chart-1 text-white hover:bg-chart-1/90 transition-colors",
              "inline-flex items-center gap-2"
            )}
          >
            <Paintbrush size={20} />
            <span>Mint Your First NFT</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-6 pb-6 border-b border-border">
            <p className="text-muted-foreground">
              Showing {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} owned by {address.substring(0, 6)}...{address.substring(address.length - 4)}
            </p>
          </div>
          
          <NFTGrid nfts={nfts} onUpdate={handleNftUpdate} />
        </div>
      )}
    </div>
  );
}