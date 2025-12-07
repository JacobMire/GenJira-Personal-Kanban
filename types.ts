export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  assignee?: string;
  storyPoints?: number;
  acceptanceCriteria?: string[];
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
  width?: number;
}

export interface BoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
  settings?: {
    isCondensed?: boolean;
  };
}

export interface AIResponse {
  improvedTitle: string;
  improvedDescription: string;
  acceptanceCriteria: string[];
  suggestedTags: string[];
  estimatedStoryPoints: number;
}