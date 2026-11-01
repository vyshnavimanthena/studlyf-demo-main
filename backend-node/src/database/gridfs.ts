import { GridFSBucket } from 'mongodb';
import { getDb } from './connection';

let gridFSBucket: GridFSBucket | null = null;

export function getGridFSBucket(bucketName = 'stage_files'): GridFSBucket {
  if (!gridFSBucket) {
    gridFSBucket = new GridFSBucket(getDb(), { bucketName });
  }
  return gridFSBucket;
}
