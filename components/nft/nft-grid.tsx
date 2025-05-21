"use client";

import { useState } from "react";
import { NFTMetadata } from "@/lib/db";
import NFTCard from "@/components/nft/nft-card";
import NFTUpdateModal from "@/components/nft/nft-update-modal";
import { useWallet } from "@/hooks/use-wallet";
import { updateNFTMetadata } from "@/lib/contract";
import axios from "axios";
import { toast } from "sonner";

interface NFTGridProps {
  nfts: NFTMetadata[];
  onUpdate?: (updatedNft: NFTMetadata) => void;
}

export default function NFTGrid({ nfts, onUpdate }: NFTGridProps) {
  const { provider } = useWallet();
  const [selectedNft, setSelectedNft] = useState<NFTMetadata | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleUpdateClick = (nft: NFTMetadata) => {
    setSelectedNft(nft);
  };
  
  const handleCloseModal = () => {
    setSelectedNft(null);
  };
  
  const handleUpdateSubmit = async (prompt: string, tokenId: number) => {
    if (!provider) {
      toast.error("Please connect your wallet");
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // 1. Generate new metadata
      const { data } = await axios.post('/api/generate-metadata', { prompt });
      const { tokenURI, metadata } = data;
      
      // 2. Update blockchain metadata
      const txHash = await updateNFTMetadata(tokenId, tokenURI, { provider });
      
      if (!txHash) {
        throw new Error("Failed to update metadata on blockchain");
      }
      
      // 3. Update database
      await axios.put(`/api/nfts/${tokenId}`, {
        prompt,
        tokenURI,
        image: metadata.image,
        name: metadata.name,
        description: metadata.description,
        transactionHash: txHash
      });
      
      toast.success("NFT metadata updated successfully!");
      
      // 4. Update UI if callback provided
      if (onUpdate && selectedNft) {
        const updatedNft: NFTMetadata = {
          ...selectedNft,
          prompt,
          tokenURI,
          image: metadata.image,
          name: metadata.name,
          description: metadata.description,
          updatedAt: new Date(),
          transactionHash: txHash
        };
        onUpdate(updatedNft);
      }
      
      // 5. Close modal
      setSelectedNft(null);
    } catch (error: any) {
      console.error("Error updating NFT:", error);
      toast.error(error.message || "Failed to update NFT");
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No NFTs found</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => (
          <NFTCard 
            key={nft.tokenId} 
            nft={nft} 
            onUpdateClick={handleUpdateClick} 
          />
        ))}
      </div>
      
      <NFTUpdateModal
        nft={selectedNft}
        onClose={handleCloseModal}
        onSubmit={handleUpdateSubmit}
        isLoading={isUpdating}
      />
    </>
  );
}