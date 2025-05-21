"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Paintbrush, Palette, Wallet, Image, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import WalletConnect from "@/components/wallet/wallet-connect";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/mint", label: "Mint NFT", icon: Paintbrush },
  { href: "/my-nfts", label: "My Gallery", icon: Image },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-md shadow-md py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Palette size={32} className="text-chart-1" />
          </motion.div>
          <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
            AI-Muse
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link 
              key={href} 
              href={href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-chart-1",
                pathname === href 
                  ? "text-chart-1" 
                  : "text-muted-foreground"
              )}
            >
              <Icon size={16} />
              <span>{label}</span>
              {pathname === href && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute bottom-0 h-0.5 w-full bg-chart-1"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <WalletConnect />
          
          <div className="md:hidden relative flex items-center">
            {/* Mobile menu button would go here */}
          </div>
        </div>
      </div>
    </header>
  );
}