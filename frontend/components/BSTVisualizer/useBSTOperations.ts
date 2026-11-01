import { useState, useCallback } from 'react';
import { BSTNode, FlatBSTNode, LogEntry } from './types';

let idCounter = 0;
const newId = () => `bst-${++idCounter}`;
const logId = () => `bstlog-${++idCounter}`;

function insertIntoBST(root: BSTNode | null, value: number): BSTNode {
  if (!root) return { id: newId(), value, left: null, right: null, highlighted: false };
  if (value < root.value) return { ...root, left: insertIntoBST(root.left, value) };
  if (value > root.value) return { ...root, right: insertIntoBST(root.right, value) };
  return root;
}

function deleteFromBST(root: BSTNode | null, value: number): BSTNode | null {
  if (!root) return null;
  if (value < root.value) return { ...root, left: deleteFromBST(root.left, value) };
  if (value > root.value) return { ...root, right: deleteFromBST(root.right, value) };
  if (!root.left) return root.right;
  if (!root.right) return root.left;
  let minNode = root.right;
  while (minNode.left) minNode = minNode.left;
  return { ...root, value: minNode.value, right: deleteFromBST(root.right, minNode.value) };
}

function searchBST(root: BSTNode | null, value: number): BSTNode | null {
  if (!root) return null;
  if (value === root.value) return { ...root, highlighted: true };
  if (value < root.value) return { ...root, highlighted: false, left: searchBST(root.left, value) };
  return { ...root, highlighted: false, right: searchBST(root.right, value) };
}

function flattenBST(node: BSTNode | null, x: number, y: number, spread: number, parentId: string | null, parentX: number, parentY: number): FlatBSTNode[] {
  if (!node) return [];
  const current: FlatBSTNode = { id: node.id, value: node.value, x, y, highlighted: node.highlighted, parentId, parentX, parentY };
  const leftNodes = flattenBST(node.left, x - spread, y - 2, spread * 0.55, node.id, x, y);
  const rightNodes = flattenBST(node.right, x + spread, y - 2, spread * 0.55, node.id, x, y);
  return [current, ...leftNodes, ...rightNodes];
}

export function useBSTOperations() {
  const [root, setRoot] = useState<BSTNode | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [{ id: logId(), message, timestamp: new Date() }, ...prev]);
  }, []);

  const createBST = useCallback((values: number[]) => {
    let tree: BSTNode | null = null;
    values.forEach((v) => { tree = insertIntoBST(tree, v); });
    setRoot(tree);
    addLog(`BST created with [${values.join(', ')}]`);
  }, [addLog]);

  const insert = useCallback((value: number) => {
    setRoot((prev) => insertIntoBST(prev, value));
    addLog(`Inserted ${value}`);
  }, [addLog]);

  const deleteNode = useCallback((value: number) => {
    setRoot((prev) => deleteFromBST(prev, value));
    addLog(`Deleted ${value}`);
  }, [addLog]);

  const search = useCallback((value: number) => {
    setRoot((prev) => searchBST(prev, value));
    addLog(`Searched ${value}`);
  }, [addLog]);

  const clear = useCallback(() => {
    setRoot(null);
    addLog('BST cleared');
  }, [addLog]);

  const flatNodes = flattenBST(root, 0, 8, 5, null, 0, 0);

  return { flatNodes, logs, createBST, insert, deleteNode, search, clear };
}
