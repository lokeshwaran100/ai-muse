"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/use-wallet";
import { mintNFT } from "@/lib/contract";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function MintPage() {
  const router = useRouter();
  const { address, provider } = useWallet();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<string>("");
  
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !provider) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Generate metadata
      setLoadingState("Generating AI image and metadata...");
      const { data } = await axios.post('/api/generate-metadata', { prompt });
      const { tokenURI, metadata } = data;
      
      // 2. Mint NFT on blockchain
      setLoadingState("Minting NFT to blockchain...");
      const result = await mintNFT(tokenURI, { provider });
      
      if (!result) {
        throw new Error("Failed to mint NFT");
      }
      
      const { tokenId, txHash } = result;
      
      // 3. Save NFT metadata to database
      setLoadingState("Saving NFT metadata...");
      await axios.post('/api/nfts', {
        tokenId,
        owner: address,
        prompt,
        tokenURI,
        image: metadata.image,
        name: metadata.name,
        description: metadata.description,
        transactionHash: txHash
      });
      
      toast.success("NFT minted successfully!");
      
      // Redirect to gallery page
      router.push('/my-nfts');
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      toast.error(error.message || "Failed to mint NFT");
    } finally {
      setIsLoading(false);
      setLoadingState("");
    }
  };
  
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Mint Your AI-Generated NFT</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter a creative prompt, and our AI will generate unique artwork for your NFT on the Base blockchain.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left side - Input form */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Create Your NFT</h2>
          
          <form onSubmit={handleMint}>
            <div className="mb-6">
              <label htmlFor="prompt" className="block text-sm font-medium mb-1">
                Enter your creative prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the artwork you want to create..."
                className="w-full rounded-md bg-background text-foreground border border-input p-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-chart-1"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {!address ? (
                  "Connect wallet to mint"
                ) : (
                  `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`
                )}
              </p>
              
              <button
                type="submit"
                disabled={isLoading || !address}
                className={cn(
                  "px-6 py-3 rounded-lg font-medium",
                  "bg-chart-1 text-white hover:bg-chart-1/90 transition-colors",
                  "flex items-center gap-2",
                  (isLoading || !address) && "opacity-70 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Mint NFT</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
            
            {isLoading && loadingState && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm">{loadingState}</p>
              </div>
            )}
          </form>
        </div>
        
        {/* Right side - Example/Preview */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-chart-1 to-chart-2 rounded-xl blur opacity-30"></div>
          <div className="relative bg-card border border-border rounded-xl overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold mb-2">NFT Preview</h2>
              <p className="text-muted-foreground">
                Your NFT will be minted on the Base blockchain with metadata stored on IPFS.
              </p>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-6">
              {isLoading ? (
                <div className="text-center space-y-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-muted-foreground">{loadingState}</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="h-48 w-48 bg-muted rounded-lg mx-auto flex items-center justify-center">
                    <Sparkles size={48} className="text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground">
                    {prompt ? `"${prompt}"` : "Enter a prompt to see a preview"}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-muted/50 border-t border-border">
              <h3 className="font-medium mb-2">What happens when you mint?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-chart-1/20 text-chart-1 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">1</span>
                  </div>
                  <span>AI generates image based on your prompt</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-chart-1/20 text-chart-1 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">2</span>
                  </div>
                  <span>Metadata is stored on IPFS</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-chart-1/20 text-chart-1 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">3</span>
                  </div>
                  <span>NFT is minted on Base blockchain</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}