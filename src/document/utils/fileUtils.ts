import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { FileMetadata } from '../models/document';

/**
 * Extract metadata from a file at the given path
 */
export function getFileMetadata(filePath: string, description?: string): FileMetadata {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const stats = fs.statSync(filePath);
  let fileType = mime.lookup(filePath) || 'application/octet-stream';
  
  if (!fileType) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext) {
      fileType = `application/${ext.substring(1)}`;
    } else {
      fileType = 'application/octet-stream';
    }
  }
  
  return {
    path: filePath,
    name: path.basename(filePath),
    description: description || 'No description available',
    fileType,
    size: stats.size,
    createdAt: stats.birthtime,
    updatedAt: stats.mtime
  };
}

/**
 * Scan a directory and return metadata for all files found
 */
export function scanDirectory(directoryPath: string): FileMetadata[] {
  if (!fs.existsSync(directoryPath)) {
    throw new Error(`Directory not found: ${directoryPath}`);
  }
  
  if (!fs.statSync(directoryPath).isDirectory()) {
    throw new Error(`Path is not a directory: ${directoryPath}`);
  }
  
  const filesMetadata: FileMetadata[] = [];
  
  function scanRecursive(dir: string) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        scanRecursive(itemPath);
      } else {
        try {
          const metadata = getFileMetadata(itemPath);
          filesMetadata.push(metadata);
        } catch (e) {
          console.error(`Error processing file ${itemPath}:`, e);
        }
      }
    }
  }
  
  scanRecursive(directoryPath);
  return filesMetadata;
}

/**
 * Read JSON content from a file
 */
export function readJsonContent(filePath: string): Record<string, any> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new Error(`Invalid JSON content in file: ${filePath}`);
    }
    throw new Error(`Error reading file ${filePath}: ${e}`);
  }
} 