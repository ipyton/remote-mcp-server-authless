import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DocumentService } from "./services/documentService";

const documentService = new DocumentService();

export function setupDocumentRoutes(server: McpServer) {
  // Get files in path
  server.tool(
    "getFilesInPath",
    {
      path: z.string().describe("Directory path to list files")
    },
    async ({ path }) => {
      try {
        const files = await documentService.getFilesInPath(path);
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ files, count: files.length })
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) })
          }]
        };
      }
    }
  );

  // Get document by ID
  server.tool(
    "getDocumentById",
    {
      documentId: z.string().describe("Document ID"),
      path: z.string().optional().describe("Optional path parameter")
    },
    async ({ documentId, path }) => {
      try {
        const document = await documentService.getDocumentById(documentId, path);
        
        if (!document) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Document not found" }) }]
          };
        }
        
        return {
          content: [{ type: "text", text: JSON.stringify(document) }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) })
          }]
        };
      }
    }
  );

  // Create document
  server.tool(
    "createDocument",
    {
      path: z.string(),
      content: z.record(z.any()),
      metadata: z.object({
        path: z.string(),
        name: z.string(),
        description: z.string().optional(),
        fileType: z.string(),
        size: z.number(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional()
      })
    },
    async ({ path, content, metadata }) => {
      try {
        const document = {
          path,
          content,
          metadata: {
            path: metadata.path,
            name: metadata.name,
            description: metadata.description,
            fileType: metadata.fileType,
            size: metadata.size,
            createdAt: metadata.createdAt || new Date(),
            updatedAt: metadata.updatedAt || new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await documentService.createDocument(document);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) })
          }]
        };
      }
    }
  );

  // Update document
  server.tool(
    "updateDocument",
    {
      documentId: z.string(),
      path: z.string(),
      content: z.record(z.any()),
      metadata: z.object({
        path: z.string(),
        name: z.string(),
        description: z.string().optional(),
        fileType: z.string(),
        size: z.number(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional()
      })
    },
    async ({ documentId, path, content, metadata }) => {
      try {
        const document = {
          documentId,
          path,
          content,
          metadata: {
            path: metadata.path,
            name: metadata.name,
            description: metadata.description,
            fileType: metadata.fileType,
            size: metadata.size,
            createdAt: metadata.createdAt || new Date(),
            updatedAt: metadata.updatedAt || new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await documentService.updateDocument(document);
        
        if (!result) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Document not found" }) }]
          };
        }
        
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) })
          }]
        };
      }
    }
  );

  // Delete document
  server.tool(
    "deleteDocument",
    {
      documentId: z.string().describe("Document ID")
    },
    async ({ documentId }) => {
      try {
        const deleted = await documentService.deleteDocument(documentId);
        
        if (!deleted) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "Document not found" }) }]
          };
        }
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ message: "Document deleted successfully", documentId }) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) })
          }]
        };
      }
    }
  );
} 