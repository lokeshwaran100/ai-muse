import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getCollection(db = 'ai-muse', collection: string) {
  const client = await clientPromise;
  return client.db(db).collection(collection);
}

// Interface representing NFT metadata in our database
export interface NFTMetadata {
  tokenId: number;
  owner: string;
  prompt: string;
  tokenURI: string;
  image: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  transactionHash: string;
}

// Get NFTs by owner address
export async function getNFTsByOwner(ownerAddress: string): Promise<NFTMetadata[]> {
  const collection = await getCollection('ai-muse', 'nfts');
  const nfts = await collection
    .find({ owner: ownerAddress.toLowerCase() })
    .sort({ createdAt: -1 })
    .toArray();
  
  return nfts as unknown as NFTMetadata[];
}

// Get NFT by token ID
export async function getNFTByTokenId(tokenId: number): Promise<NFTMetadata | null> {
  const collection = await getCollection('ai-muse', 'nfts');
  const nft = await collection.findOne({ tokenId });
  
  return nft as unknown as NFTMetadata;
}

// Save a new NFT to the database
export async function saveNFT(nft: NFTMetadata): Promise<void> {
  const collection = await getCollection('ai-muse', 'nfts');
  await collection.insertOne({
    ...nft,
    owner: nft.owner.toLowerCase(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// Update an existing NFT
export async function updateNFT(tokenId: number, updates: Partial<NFTMetadata>): Promise<void> {
  const collection = await getCollection('ai-muse', 'nfts');
  await collection.updateOne(
    { tokenId },
    { 
      $set: {
        ...updates,
        updatedAt: new Date(),
      } 
    }
  );
}