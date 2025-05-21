import { NextRequest, NextResponse } from "next/server";
import { getNFTByTokenId, updateNFT } from "@/lib/db";

// GET /api/nfts/[tokenId]
export async function GET(
  req: NextRequest,
  { params }: { params: { tokenId: string } }
): Promise<NextResponse> {
  try {
    const tokenId = Number(params.tokenId);
    
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: "Invalid token ID" },
        { status: 400 }
      );
    }
    
    const nft = await getNFTByTokenId(tokenId);
    
    if (!nft) {
      return NextResponse.json(
        { error: "NFT not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ nft });
  } catch (error: any) {
    console.error("Error fetching NFT:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch NFT" },
      { status: 500 }
    );
  }
}

// PUT /api/nfts/[tokenId]
export async function PUT(
  req: NextRequest,
  { params }: { params: { tokenId: string } }
): Promise<NextResponse> {
  try {
    const tokenId = Number(params.tokenId);
    
    if (isNaN(tokenId)) {
      return NextResponse.json(
        { error: "Invalid token ID" },
        { status: 400 }
      );
    }
    
    const updates = await req.json();
    
    // Check if NFT exists
    const nft = await getNFTByTokenId(tokenId);
    
    if (!nft) {
      return NextResponse.json(
        { error: "NFT not found" },
        { status: 404 }
      );
    }
    
    // Update NFT
    await updateNFT(tokenId, updates);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating NFT:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update NFT" },
      { status: 500 }
    );
  }
}