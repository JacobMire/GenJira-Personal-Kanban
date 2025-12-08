import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, Priority } from '../types';
import { AlertCircle, Check } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (taskId: string) => void;
  isCondensed?: boolean;
  showCheckboxes?: boolean;
  onToggleTaskCompletion?: (taskId: string, isCompleted: boolean) => void;
}

const PriorityBackgrounds = {
  [Priority.LOW]: 'bg-blue-900/40 border-blue-500/50 hover:bg-blue-900/60',
  [Priority.MEDIUM]: 'bg-yellow-900/40 border-yellow-500/50 hover:bg-yellow-900/60',
  [Priority.HIGH]: 'bg-orange-900/40 border-orange-500/50 hover:bg-orange-900/60',
  [Priority.CRITICAL]: 'bg-red-900/40 border-red-500/50 hover:bg-red-900/60',
};

const PriorityColors = {
  [Priority.LOW]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [Priority.MEDIUM]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [Priority.HIGH]: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  [Priority.CRITICAL]: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onClick,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  isCondensed = false,
  showCheckboxes = false,
  onToggleTaskCompletion
}) => {
  return (
    <Draggable draggableId={task.id} index={index} isDragDisabled={isSelectionMode}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={(e) => {
            if (isSelectionMode && onToggleSelection) {
              onToggleSelection(task.id);
            } else if (!showCheckboxes) {
              onClick(task);
            }
          }}
          className={`
            group relative mb-3 rounded-lg border 
            transition-all duration-200
            ${isCondensed ? 'flex items-center p-2' : 'p-4'}
            ${isSelectionMode
              ? 'bg-surface cursor-pointer hover:bg-slate-800'
              : isCondensed
                ? (PriorityBackgrounds[task.priority] || 'bg-slate-800 border-slate-700')
                : 'bg-surface border-slate-700 hover:border-slate-600'
            }
            ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : isCondensed ? '' : 'border-surfaceHighlight'}
            ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary rotate-2 z-50' : ''}
          `}
          style={provided.draggableProps.style}
        >
          {(isSelectionMode || showCheckboxes) && (
            <div
              className={`
                  z-10
                  ${isCondensed
                  ? 'mr-3 flex items-center'
                  : 'absolute top-4 right-4'
                }
              `}
              onClick={(e) => {
                e.stopPropagation();
                if (isSelectionMode && onToggleSelection) {
                  onToggleSelection(task.id);
                } else if (onToggleTaskCompletion) {
                  onToggleTaskCompletion(task.id, !task.isCompleted);
                }
              }}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer
                    ${isSelectionMode
                  ? (isSelected ? 'bg-primary border-primary' : 'border-slate-500 bg-slate-900/50 hover:border-primary/50')
                  : (task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 bg-slate-900/50 hover:border-emerald-500/50')
                }
                `}>
                {(isSelectionMode ? isSelected : task.isCompleted) && <Check size={14} className="text-white" />}
              </div>
            </div>
          )}

          {isCondensed ? (
            // Condensed View Content
            <div className={`flex items-center justify-between flex-1 min-w-0 ${(task.isCompleted && showCheckboxes) ? 'opacity-50' : ''}`} onClick={() => onClick(task)}>
              <Tooltip content={task.title} checkOverflow>
                <h4
                  className={`text-sm font-medium text-slate-100 truncate pr-2 ${(task.isCompleted && showCheckboxes) ? 'line-through text-slate-400' : ''}`}
                >
                  {task.title}
                </h4>
              </Tooltip>
              {task.storyPoints && (
                <span className="text-[10px] font-mono bg-black/20 text-white/70 px-1.5 py-0.5 rounded-full shrink-0">
                  {task.storyPoints}
                </span>
              )}
            </div>
          ) : (
            // Standard View Content
            <div className={`flex-1 ${(task.isCompleted && showCheckboxes) ? 'opacity-50' : ''}`} onClick={() => onClick(task)}>
              <div className="flex justify-between items-start mb-2 pr-6">
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${PriorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                {!isSelectionMode && task.storyPoints && (
                  <span className="text-xs font-mono bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">
                    {task.storyPoints}
                  </span>
                )}
              </div>

              <h4 className={`text-sm font-semibold text-slate-100 mb-1 leading-snug group-hover:text-primary transition-colors ${(task.isCompleted && showCheckboxes) ? 'line-through text-slate-400' : ''}`}>
                {task.title}
              </h4>

              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {task.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-1 overflow-hidden">
                  {task.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center text-slate-500">
                  {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
                    <AlertCircle size={14} className="ml-2 text-emerald-500/70" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;