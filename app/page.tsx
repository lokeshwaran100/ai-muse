import Link from 'next/link';
import { ArrowRight, Paintbrush, Palette, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1 space-y-6">
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Create Unique NFTs with
                <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent"> AI-Generated </span>
                Metadata
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl">
                AI-Muse empowers you to mint and update NFTs using AI-generated metadata stored on IPFS and deployed on the Base blockchain.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/mint" 
                  className={cn(
                    "px-6 py-3 rounded-lg text-white font-medium",
                    "bg-chart-1 hover:bg-chart-1/90 transition-colors",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  <Paintbrush size={20} />
                  Start Minting
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                
                <Link 
                  href="/my-nfts" 
                  className={cn(
                    "px-6 py-3 rounded-lg font-medium",
                    "bg-muted hover:bg-muted/80 transition-colors",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  <Palette size={20} />
                  View Gallery
                </Link>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-chart-1 to-chart-2 rounded-2xl blur opacity-50"></div>
                <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="https://picsum.photos/seed/aimuse/800/800"
                    alt="AI-generated NFT example"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-xl">AI-Muse #0042</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      A vibrant digital painting of a cosmic muse inspiring creativity across the universe
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="w-full bg-muted py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-Muse combines cutting-edge technologies to create a seamless NFT creation experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Wallet,
                title: "Connect Wallet",
                description: "Connect your MetaMask wallet to interact with the Base blockchain"
              },
              {
                icon: Paintbrush,
                title: "Create with AI",
                description: "Enter a prompt and our AI generates unique imagery and metadata"
              },
              {
                icon: Palette,
                title: "Mint & Update",
                description: "Mint your NFT to the blockchain and update it anytime with new AI content"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-card rounded-lg p-6 border border-border">
                <div className="h-12 w-12 rounded-full bg-chart-1/10 text-chart-1 flex items-center justify-center mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-r from-chart-1/10 to-chart-2/10 rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Create Your AI-Powered NFT?</h2>
              <p className="text-muted-foreground mb-8">
                Start your creative journey with AI-Muse and mint your first NFT today.
              </p>
              
              <Link 
                href="/mint" 
                className={cn(
                  "px-8 py-4 rounded-lg text-white font-medium",
                  "bg-chart-1 hover:bg-chart-1/90 transition-colors",
                  "inline-flex items-center justify-center gap-2"
                )}
              >
                <Paintbrush size={20} />
                Start Creating
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}