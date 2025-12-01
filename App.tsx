import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from './components/Column';
import Modal from './components/Modal';
import { Auth } from './components/Auth';
import { BoardData, Task, Priority, Column as ColumnType } from './types';
import { Plus, Search, Kanban, X, Settings2, Check, LogOut, Loader2 } from 'lucide-react';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';
import * as boardService from './services/boardService';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState<BoardData>({ tasks: {}, columns: {}, columnOrder: [] });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isLayoutMode, setIsLayoutMode] = useState(false);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        if (session) {
           await loadBoard(session.user.id);
        } else {
           setLoading(false);
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadBoard(session.user.id);
      else {
        setData({ tasks: {}, columns: {}, columnOrder: [] });
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadBoard = async (userId: string) => {
    setLoading(true);
    try {
      const boardData = await boardService.fetchBoardData(userId);
      if (boardData) setData(boardData);
    } catch (e) {
      console.error('Failed to load board', e);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Optimistic Update
    let newData = { ...data };

    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds) as string[];
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      newData.columns[newColumn.id] = newColumn;
      setData(newData);

      // DB Sync: Reorder column tasks
      await boardService.reorderTasksInColumn(newColumn.id, newTaskIds);
      return;
    }

    // Moving to different column
    const startTaskIds = Array.from(startColumn.taskIds) as string[];
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startColumn, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishColumn.taskIds) as string[];
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, taskIds: finishTaskIds };

    newData.columns[newStart.id] = newStart;
    newData.columns[newFinish.id] = newFinish;
    setData(newData);

    // DB Sync
    await boardService.reorderTasksInColumn(newStart.id, startTaskIds);
    await boardService.reorderTasksInColumn(newFinish.id, finishTaskIds);
    // Explicitly update the moved task to ensure column_id is correct
    await boardService.moveTask(draggableId, newFinish.id, destination.index);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (updatedTask: Task) => {
    // Optimistic
    setData((prev) => ({
      ...prev,
      tasks: { ...prev.tasks, [updatedTask.id]: updatedTask },
    }));
    setIsModalOpen(false);
    
    // DB
    await boardService.updateTask(updatedTask);
  };

  const handleDeleteTask = async (taskId: string) => {
    // Correctly immutable delete
    const newData = { 
        ...data, 
        tasks: { ...data.tasks },
        columns: { ...data.columns }
    };
    
    delete newData.tasks[taskId];
    
    Object.keys(newData.columns).forEach(colId => {
      const col = newData.columns[colId];
      if (col.taskIds.includes(taskId)) {
          newData.columns[colId] = {
              ...col,
              taskIds: col.taskIds.filter(id => id !== taskId)
          };
      }
    });

    setData(newData);
    setIsModalOpen(false);

    // DB
    await boardService.deleteTask(taskId);
  };

  const handleCreateTask = async (columnId: string) => {
    // Fallback for randomUUID in older browsers/http or if crypto is undefined
    const newTaskId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID() 
        : `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newTask: Task = {
      id: newTaskId,
      title: 'New Issue',
      description: '',
      priority: Priority.MEDIUM,
      tags: [],
      createdAt: Date.now(),
    };

    const newData = {
      ...data,
      tasks: { ...data.tasks, [newTaskId]: newTask },
      columns: {
        ...data.columns,
        [columnId]: {
          ...data.columns[columnId],
          taskIds: [newTaskId, ...data.columns[columnId].taskIds] 
        }
      }
    };

    setData(newData);
    setSelectedTask(newTask);
    setIsModalOpen(true);

    // DB: Insert at position 0
    await boardService.createTask(columnId, newTask, 0);
    // We should also push down other tasks in DB, but for now we rely on reorderTasksInColumn on next drag or reload
    await boardService.reorderTasksInColumn(columnId, newData.columns[columnId].taskIds);
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;

    const newColumnId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID() 
        : `col-${Date.now()}`;

    const newColumn: ColumnType = {
      id: newColumnId,
      title: newColumnTitle,
      taskIds: [],
      width: 320,
    };

    const newOrder = [...data.columnOrder, newColumnId];

    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: newOrder,
    }));

    setNewColumnTitle('');
    setIsAddingColumn(false);

    // DB
    await boardService.createColumn('', newColumn, newOrder.length - 1); 
  };

  const handleRenameColumn = async (columnId: string, title: string) => {
    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: { ...prev.columns[columnId], title },
      },
    }));
    await boardService.updateColumn(columnId, { title });
  };

  const handleDeleteColumn = async (columnId: string) => {
    setData((prev) => {
      const newOrder = prev.columnOrder.filter((id) => id !== columnId);
      const newColumns = { ...prev.columns };
      
      // Cleanup tasks that were in this column from local state
      const tasksToDelete = newColumns[columnId]?.taskIds || [];
      const newTasks = { ...prev.tasks };
      tasksToDelete.forEach(tid => delete newTasks[tid]);

      delete newColumns[columnId];
  
      return {
          ...prev,
          columnOrder: newOrder,
          columns: newColumns,
          tasks: newTasks
      };
    });
    
    await boardService.deleteColumn(columnId);
  };

  const handleResizeColumn = async (columnId: string, width: number) => {
    setData((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          width,
        },
      },
    }));
    await boardService.updateColumn(columnId, { width });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Filter logic remains client side
  const filteredData = {
      ...data,
      columns: Object.keys(data.columns).reduce((acc, colId) => {
          const col = data.columns[colId];
          const filteredTaskIds = col.taskIds.filter(taskId => {
              const task = data.tasks[taskId];
              if (!task) return false;
              const query = searchQuery.toLowerCase();
              return task.title.toLowerCase().includes(query) || 
                     task.description.toLowerCase().includes(query) ||
                     task.tags.some(t => t.toLowerCase().includes(query));
          });
          acc[colId] = { ...col, taskIds: filteredTaskIds };
          return acc;
      }, {} as Record<string, ColumnType>)
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
         <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background text-slate-100 overflow-hidden font-sans selection:bg-primary/30">
      
      {/* Top Navigation */}
      <nav className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-lg">
             <Kanban className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">GenJira</h1>
            <p className="text-xs text-slate-500">Cloud Workspace</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18}/>
                <input 
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900/50 border border-transparent focus:border-primary/50 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all focus:bg-slate-900" 
                />
            </div>
        </div>

        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setIsLayoutMode(!isLayoutMode)}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                ${isLayoutMode 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800'
                }
            `}
          >
            {isLayoutMode ? <Check size={14} /> : <Settings2 size={14} />}
            {isLayoutMode ? 'Done' : 'Layout'}
          </button>

          <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

          <div className="flex items-center gap-3">
             <span className="text-xs text-slate-400 hidden sm:block">{session.user.email}</span>
             <button 
                onClick={handleSignOut}
                className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-slate-400"
                title="Sign Out"
             >
                <LogOut size={18} />
             </button>
          </div>
        </div>
      </nav>

      {/* Main Board Area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-background to-background">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full items-start gap-2">
            {data.columnOrder.map((columnId) => {
              const column = filteredData.columns[columnId];
              // Safety check if column exists
              if (!column) return null;
              
              const tasks = column.taskIds.map((taskId) => data.tasks[taskId]).filter(Boolean);
              
              return (
                <Column 
                  key={column.id} 
                  column={column} 
                  tasks={tasks} 
                  onTaskClick={handleTaskClick}
                  onAddTask={handleCreateTask}
                  isLayoutMode={isLayoutMode}
                  onResize={handleResizeColumn}
                  onRename={handleRenameColumn}
                  onDelete={handleDeleteColumn}
                />
              );
            })}
            
            {/* Add Column Section */}
            {isLayoutMode && (
              isAddingColumn ? (
                <div className="w-80 min-w-[320px] max-w-[320px] mx-2 p-3 bg-slate-900/50 rounded-xl border border-white/5 flex flex-col gap-2 shrink-0 animate-in fade-in zoom-in-95 duration-200">
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Column Title"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                    className="w-full bg-slate-800 text-slate-200 text-sm rounded border border-slate-700 p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleAddColumn}
                      className="px-3 py-1.5 bg-primary hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors"
                    >
                      Add Column
                    </button>
                    <button 
                      onClick={() => setIsAddingColumn(false)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                    onClick={() => setIsAddingColumn(true)}
                    className="w-80 min-w-[320px] max-w-[320px] h-12 mx-2 shrink-0 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-800/30 cursor-pointer transition-all"
                >
                    <span className="flex items-center gap-2 text-sm font-medium"><Plus size={16}/> Add Column</span>
                </button>
              )
            )}
          </div>
        </DragDropContext>
      </main>

      <Modal 
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        columnTitle={selectedTask ? (Object.values(data.columns) as ColumnType[]).find(col => col.taskIds.includes(selectedTask.id))?.title : ''}
      />
    </div>
  );
};

export default App;