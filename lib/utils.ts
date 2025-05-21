import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ethers } from 'ethers';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Truncate Ethereum address to format: 0x1234...5678
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  const start = address.substring(0, chars + 2); // +2 for "0x"
  const end = address.substring(address.length - chars);
  return `${start}...${end}`;
}

// Format balance with 4 decimal places
export function formatBalance(balance: string, decimals = 18, displayDecimals = 4): string {
  try {
    return (+ethers.formatUnits(balance, decimals)).toFixed(displayDecimals);
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0.0000';
  }
}

// Format a date
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format NFT ID to padded string
export function formatNftId(id: number | string): string {
  return `#${id.toString().padStart(4, '0')}`;
}

// Generate a color based on a string (deterministic)
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

// Format transaction hash
export function formatTxHash(hash: string): string {
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
}

// Create a transaction explorer URL for Base
export function getExplorerUrl(txHash: string, isTestnet = false): string {
  const baseUrl = isTestnet 
    ? 'https://goerli.basescan.org' 
    : 'https://basescan.org';
  return `${baseUrl}/tx/${txHash}`;
}