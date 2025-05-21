import { NextRequest, NextResponse } from "next/server";
import { getNFTsByOwner, saveNFT } from "@/lib/db";

// GET /api/nfts?owner=0x...
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const owner = url.searchParams.get("owner");
    
    if (!owner) {
      return NextResponse.json(
        { error: "Owner address is required" },
        { status: 400 }
      );
    }
    
    const nfts = await getNFTsByOwner(owner);
    return NextResponse.json({ nfts });
  } catch (error: any) {
    console.error("Error fetching NFTs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch NFTs" },
      { status: 500 }
    );
  }
}

// POST /api/nfts
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const nftData = await req.json();
    
    // Validate required fields
    const requiredFields = [
      "tokenId", "owner", "prompt", "tokenURI", "image", "name", "description", "transactionHash"
    ];
    
    for (const field of requiredFields) {
      if (!nftData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Save NFT to database
    await saveNFT({
      ...nftData,
      tokenId: Number(nftData.tokenId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving NFT:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save NFT" },
      { status: 500 }
    );
  }
}