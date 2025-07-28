import { MongoClient, Collection, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { Document, FileMetadata } from './models/document';

// Load environment variables
dotenv.config();

// MongoDB connection
const uri = "mongodb+srv://czh1278341834:BDwN4JpWiTZ76aX5@cluster0.w9hmtjf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DATABASE_NAME = process.env.DATABASE_NAME || "document_mcp";

let client: MongoClient;
let documentsCollection: Collection<Document>;
let fileMetadataCollection: Collection<FileMetadata>;

/**
 * Connect to MongoDB database
 */
export async function connect(): Promise<void> {
  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    await client.connect();
    console.log("Connected to MongoDB Atlas successfully!");
    
    const db = client.db(DATABASE_NAME);
    documentsCollection = db.collection<Document>('documents');
    fileMetadataCollection = db.collection<FileMetadata>('file_metadata');
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

/**
 * Get the documents collection
 */
export function getDocumentsCollection(): Collection<Document> {
  if (!documentsCollection) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return documentsCollection;
}

/**
 * Get the file metadata collection
 */
export function getFileMetadataCollection(): Collection<FileMetadata> {
  if (!fileMetadataCollection) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return fileMetadataCollection;
} 