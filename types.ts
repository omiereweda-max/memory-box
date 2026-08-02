export type ItemType = 'file' | 'note';

export interface MemoryItem {
  id: string;
  type: ItemType;
  title: string;
  /** File-only fields */
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  data?: Blob;
  /** Note-only field */
  content?: string;
  createdAt: number;
}

export interface ItemSummary {
  id: string;
  type: ItemType;
  title: string;
  content?: string;
  fileName?: string;
}

export interface ContextItem {
  id: string;
  type: ItemType;
  title: string;
  text: string;
}
