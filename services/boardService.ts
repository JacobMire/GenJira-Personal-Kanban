import { supabase } from './supabase';
import { BoardData, Task, Column, Priority } from '../types';

// --- Types mirroring DB structure ---
interface DBBoard {
  id: string;
  user_id: string;
  title: string;
  settings: any;
}

interface DBColumn {
  id: string;
  board_id: string;
  title: string;
  width: number;
  position: number;
}

interface DBTask {
  id: string;
  column_id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  story_points: number;
  acceptance_criteria: string[];
  position: number;
  is_completed: boolean;
  created_at: string;
}

// --- Service Functions ---

export const fetchBoardData = async (userId: string): Promise<BoardData | null> => {
  // 1. Get Board (Assume 1 board per user for now, or create if none)
  let { data: boards } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .limit(1);

  let boardId = boards?.[0]?.id;

  if (!boardId) {
    // Create default board
    const { data: newBoard, error } = await supabase
      .from('boards')
      .insert([{ user_id: userId, title: 'My Board' }])
      .select()
      .single();
    
    if (error || !newBoard) throw error;
    boardId = newBoard.id;

    // Create default columns
    const defaultCols = [
        { board_id: boardId, title: 'To Do', width: 320, position: 0 },
        { board_id: boardId, title: 'In Progress', width: 320, position: 1 },
        { board_id: boardId, title: 'Done', width: 320, position: 2 },
    ];
    await supabase.from('columns').insert(defaultCols);
  }

  // 2. Get Columns
  const { data: dbColumns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position');

  if (!dbColumns) return null;

  // 3. Get Tasks
  const { data: dbTasks } = await supabase
    .from('tasks')
    .select('*')
    .in('column_id', dbColumns.map(c => c.id))
    .order('position');

  // 4. Transform to BoardData
  const tasks: Record<string, Task> = {};
  const columns: Record<string, Column> = {};
  const columnOrder: string[] = dbColumns.map(c => c.id);

  dbColumns.forEach(col => {
    columns[col.id] = {
      id: col.id,
      title: col.title,
      width: col.width,
      taskIds: [] // Will populate next
    };
  });

  dbTasks?.forEach(t => {
    const task: Task = {
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority as Priority,
      tags: t.tags || [],
      storyPoints: t.story_points,
      acceptanceCriteria: t.acceptance_criteria || [],
      isCompleted: t.is_completed || false,
      createdAt: new Date(t.created_at).getTime()
    };
    tasks[task.id] = task;
    
    // Add to column (dbTasks is already ordered by position)
    if (columns[t.column_id]) {
      columns[t.column_id].taskIds.push(task.id);
    }
  });

  return { tasks, columns, columnOrder, settings: boards?.[0]?.settings || {} };
};

export const updateBoardSettings = async (boardId: string, settings: any) => {
    const { error } = await supabase.from('boards').update({ settings }).eq('id', boardId);
    if (error) console.error('Update Settings Error:', error);
};

export const createTask = async (columnId: string, task: Task, position: number) => {
  const { error } = await supabase.from('tasks').insert({
    id: task.id, 
    column_id: columnId,
    title: task.title,
    description: task.description,
    priority: task.priority,
    tags: task.tags,
    story_points: task.storyPoints,
    acceptance_criteria: task.acceptanceCriteria,
    is_completed: task.isCompleted,
    position: position,
    created_at: new Date(task.createdAt).toISOString()
  });
  if (error) console.error('Create Task Error:', error);
};

export const updateTask = async (task: Task) => {
  const { error } = await supabase.from('tasks').update({
    title: task.title,
    description: task.description,
    priority: task.priority,
    tags: task.tags,
    story_points: task.storyPoints,
    acceptance_criteria: task.acceptanceCriteria,
    is_completed: task.isCompleted,
  }).eq('id', task.id);
  
  if (error) console.error('Update Task Error:', error);
};

export const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
};

export const deleteTasks = async (taskIds: string[]) => {
    if (taskIds.length === 0) return;
    await supabase.from('tasks').delete().in('id', taskIds);
};

export const createColumn = async (boardId: string, column: Column, position: number) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const { data: boards } = await supabase.from('boards').select('id').eq('user_id', data.user.id).limit(1).maybeSingle();
    if (!boards) return;

    const { error } = await supabase.from('columns').insert({
        id: column.id,
        board_id: boards.id,
        title: column.title,
        width: column.width,
        position: position
    });

    if (error) {
        console.error('Create Column Error:', error);
    }
};

export const updateColumn = async (columnId: string, updates: Partial<Column>) => {
   // Only supporting width and title updates primarily
   const dbUpdates: any = {};
   if (updates.width) dbUpdates.width = updates.width;
   if (updates.title) dbUpdates.title = updates.title;

   const { error } = await supabase.from('columns').update(dbUpdates).eq('id', columnId);
   if (error) console.error('Update Column Error:', error);
};

export const deleteColumn = async (columnId: string) => {
    const { error } = await supabase.from('columns').delete().eq('id', columnId);
    if (error) console.error('Delete Column Error:', error);
};

export const moveTask = async (taskId: string, newColumnId: string, newPosition: number) => {
    const { error } = await supabase.from('tasks').update({
        column_id: newColumnId,
        position: newPosition
    }).eq('id', taskId);
    if (error) console.error('Move Task Error:', error);
};

export const updateColumnOrder = async (columnId: string, newPosition: number) => {
     await supabase.from('columns').update({ position: newPosition }).eq('id', columnId);
};

export const reorderTasksInColumn = async (columnId: string, taskIds: string[]) => {
    const updates = taskIds.map((id, index) => 
        supabase.from('tasks').update({ position: index, column_id: columnId }).eq('id', id)
    );
    await Promise.all(updates);
};

export const reorderColumns = async (columnIds: string[]) => {
    const updates = columnIds.map((id, index) => 
        supabase.from('columns').update({ position: index }).eq('id', id)
    );
    await Promise.all(updates);
}