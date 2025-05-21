"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Paintbrush, ExternalLink } from "lucide-react";
import { formatNftId, formatDate, getExplorerUrl } from "@/lib/utils";
import { NFTMetadata } from "@/lib/db";
import Link from "next/link";

interface NFTCardProps {
  nft: NFTMetadata;
  onUpdateClick?: (nft: NFTMetadata) => void;
}

export default function NFTCard({ nft, onUpdateClick }: NFTCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-lg overflow-hidden border border-border shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden aspect-square">
        {/* NFT Image */}
        <img 
          src={nft.image} 
          alt={nft.name}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        
        {/* Overlay with actions */}
        <div 
          className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {onUpdateClick && (
            <button
              onClick={() => onUpdateClick(nft)}
              className="bg-chart-1 text-white rounded-full p-3 mx-2 hover:bg-chart-1/80 transition-all"
            >
              <Paintbrush size={20} />
            </button>
          )}
          
          <Link
            href={getExplorerUrl(nft.transactionHash, true)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary/20 text-white rounded-full p-3 mx-2 hover:bg-primary/30 transition-all"
          >
            <ExternalLink size={20} />
          </Link>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">{nft.name}</h3>
          <span className="text-sm text-muted-foreground">
            {formatNftId(nft.tokenId)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {nft.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created: {formatDate(nft.createdAt)}</span>
          {nft.updatedAt > nft.createdAt && (
            <span>Updated: {formatDate(nft.updatedAt)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}