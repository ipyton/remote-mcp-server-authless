# Document MCP Module

This module provides document management capabilities for the MCP server. It allows storing, retrieving, updating and deleting documents with their associated metadata.

## Features

- Store documents with metadata in MongoDB
- Retrieve document content by ID
- List files in a specified path
- Update existing documents
- Delete documents

## API Tools

The module provides the following MCP tools:

- `getFilesInPath`: List files in a specified path
- `getDocumentById`: Get document content by ID
- `createDocument`: Create a new document
- `updateDocument`: Update an existing document
- `deleteDocument`: Delete a document by ID

## Environment Variables

- `DATABASE_NAME`: The MongoDB database name (default: "document_mcp")

## Setup

1. Create a `.env` file with the following variables:
   ```
   DATABASE_NAME=document_mcp
   ```

2. Make sure MongoDB is running and accessible

3. The module will automatically initialize when the MCP server starts

## Types

### Document

```typescript
interface Document {
  documentId?: string;
  path: string;
  content: Record<string, any>;
  metadata: FileMetadata;
  createdAt: Date;
  updatedAt: Date;
}
```

### FileMetadata

```typescript
interface FileMetadata {
  path: string;
  name: string;
  description?: string;
  fileType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}
``` 