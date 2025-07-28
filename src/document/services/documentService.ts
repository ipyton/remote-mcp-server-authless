import { ObjectId } from 'mongodb';
import { getDocumentsCollection, getFileMetadataCollection } from '../database';
import { Document, DocumentResponse, FileMetadata } from '../models/document';
import path from 'path';

export class DocumentService {
  /**
   * Get all files in the specified path with their metadata
   */
  async getFilesInPath(pathStr: string): Promise<FileMetadata[]> {
    const fileMetadataCollection = getFileMetadataCollection();
    const cursor = fileMetadataCollection.find({
      path: { $regex: `^${pathStr}` }
    });
    
    const files: FileMetadata[] = await cursor.toArray();
    return files;
  }

  /**
   * Get document by ID and optional path
   */
  async getDocumentById(documentId: string, pathStr?: string): Promise<Document | null> {
    const documentsCollection = getDocumentsCollection();
    const query: any = { _id: new ObjectId(documentId) };
    
    if (pathStr) {
      query.path = pathStr;
    }

    const document = await documentsCollection.findOne(query);
    if (!document) {
      return null;
    }

    // Fetch metadata for this document
    const fileMetadataCollection = getFileMetadataCollection();
    let metadata = await fileMetadataCollection.findOne({ path: document.path });
    
    if (!metadata) {
      // Create default metadata if not found
      metadata = {
        path: document.path,
        name: path.basename(document.path),
        description: "No description available",
        fileType: path.extname(document.path),
        size: 0,
        createdAt: document.createdAt || new Date(),
        updatedAt: document.updatedAt || new Date()
      };
    }

    // Format the document with proper types
    return {
      documentId: document._id.toString(),
      path: document.path,
      content: document.content,
      metadata: metadata as FileMetadata,
      createdAt: document.createdAt || new Date(),
      updatedAt: document.updatedAt || new Date()
    };
  }

  /**
   * Create a new document with content and metadata
   */
  async createDocument(document: Document): Promise<DocumentResponse> {
    const documentsCollection = getDocumentsCollection();
    
    // Prepare document for insertion
    const docData: any = {
      path: document.path,
      content: document.content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Extract metadata to save separately
    const metadata: FileMetadata = {
      ...document.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert document
    const result = await documentsCollection.insertOne(docData);
    const documentId = result.insertedId.toString();
    
    // Save metadata separately
    const fileMetadataCollection = getFileMetadataCollection();
    await fileMetadataCollection.insertOne({
      ...metadata,
      path: docData.path
    });
    
    return {
      documentId,
      path: docData.path,
      metadata
    };
  }

  /**
   * Update an existing document by ID
   */
  async updateDocument(document: Document): Promise<DocumentResponse | null> {
    if (!document.documentId) {
      throw new Error('Document ID is required for update');
    }
    
    const documentsCollection = getDocumentsCollection();
    
    // Check if document exists
    const existing = await documentsCollection.findOne({
      _id: new ObjectId(document.documentId)
    });
    
    if (!existing) {
      return null;
    }
    
    // Prepare document for update
    const docData: any = {
      path: document.path,
      content: document.content,
      updatedAt: new Date()
    };
    
    // Extract metadata to save separately
    const metadata: FileMetadata = {
      ...document.metadata,
      updatedAt: new Date()
    };
    
    // Update document
    await documentsCollection.updateOne(
      { _id: new ObjectId(document.documentId) },
      { $set: docData }
    );
    
    // Update metadata
    const fileMetadataCollection = getFileMetadataCollection();
    await fileMetadataCollection.updateOne(
      { path: docData.path },
      { $set: metadata },
      { upsert: true }
    );
    
    return {
      documentId: document.documentId,
      path: docData.path,
      metadata
    };
  }

  /**
   * Delete a document by ID
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    const documentsCollection = getDocumentsCollection();
    
    // Get document path before deletion
    const document = await documentsCollection.findOne({
      _id: new ObjectId(documentId)
    });
    
    if (!document) {
      return false;
    }
    
    const path = document.path;
    
    // Delete document
    const result = await documentsCollection.deleteOne({
      _id: new ObjectId(documentId)
    });
    
    // Delete associated metadata
    if (path) {
      const fileMetadataCollection = getFileMetadataCollection();
      await fileMetadataCollection.deleteOne({ path });
    }
    
    return result.deletedCount > 0;
  }
} 