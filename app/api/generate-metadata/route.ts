import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface MetadataResponse {
  tokenURI: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Parse request body
    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }
    
    // 2. Generate AI image (mocked for demo purposes)
    // In a real implementation, you would call an AI image generation API like DALL-E
    const imageUrl = await generateAIImage(prompt);
    
    // 3. Create metadata
    const metadata = {
      name: `AI-Muse #${Math.floor(Math.random() * 1000)}`,
      description: prompt,
      image: imageUrl,
      attributes: [
        {
          trait_type: "Created with",
          value: "AI-Muse"
        },
        {
          trait_type: "Prompt",
          value: prompt
        },
        {
          trait_type: "Timestamp",
          value: new Date().toISOString()
        }
      ]
    };
    
    // 4. Upload metadata to IPFS (mocked for demo)
    const tokenURI = await uploadToIPFS(metadata);
    
    // 5. Return tokenURI and metadata
    const response: MetadataResponse = {
      tokenURI,
      metadata
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error generating metadata:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate metadata" },
      { status: 500 }
    );
  }
}

// Mock function to simulate AI image generation
// In a real implementation, you would call an AI API
async function generateAIImage(prompt: string): Promise<string> {
  // For demo, we'll use a placeholder image service
  // In production, replace with actual AI image generation
  const imageSize = 512;
  const seed = Math.floor(Math.random() * 1000000);
  
  // Using Picsum for placeholder images
  return `https://picsum.photos/seed/${seed}/${imageSize}`;
}

// Mock function to simulate IPFS upload
// In a real implementation, you would use a service like Pinata or NFT.Storage
async function uploadToIPFS(metadata: any): Promise<string> {
  // For demo purposes, we'll just return a fake IPFS URL
  // In production, replace with actual IPFS upload
  const ipfsHash = `Qm${Array.from({length: 44}, () => 
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[
      Math.floor(Math.random() * 58)
    ]
  ).join("")}`;
  
  return `ipfs://${ipfsHash}`;
}