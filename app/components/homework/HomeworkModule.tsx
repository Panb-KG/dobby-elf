'use client';

import React, { useState, memo } from 'react';
import { Pencil, CheckCircle, Circle, Plus, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HomeworkTask } from '../../types';

interface HomeworkModuleProps {
  tasks: HomeworkTask[];
  onAddTask: (task: Omit<HomeworkTask, 'id'>) => void;
  onToggleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onImageUpload: (file: File) => void;
}

export const HomeworkModule = memo(function HomeworkModule({
  tasks,
  onAddTask,
  onToggleStatus,
  onDeleteTask,
  onImageUpload,
}: HomeworkModuleProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    subject: '',
    title: '',
    dueDate: '',
  });
  const [image, setImage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!newTask.subject || !newTask.title || !newTask.dueDate) return;
    
    onAddTask({
      subject: newTask.subject,
      title: newTask.title,
      status: 'pending',
      dueDate: newTask.dueDate,
      image,
    });
    
    setIsAdding(false);
    setNewTask({ subject: '', title: '', dueDate: '' });
    setImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      '数学': 'text-blue-400 bg-blue-500/10',
      '语文': 'text-red-400 bg-red-500/10',
      '英语': 'text-green-400 bg-green-500/10',
      '物理': 'text-purple-400 bg-purple-500/10',
      '化学': 'text-yellow-400 bg-yellow-500/10',
    };
    return colors[subject] || 'text-white/60 bg-white/5';
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-serif italic text-white">作业清单</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-xl bg-magic-accent/10 text-magic-accent hover:bg-magic-accent/20 transition-all"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <input
            type="text"
            placeholder="科目（如：数学）"
            value={newTask.subject}
            onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
          />
          <input
            type="text"
            placeholder="作业标题"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
          />
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50"
          />
          
          {/* Image Upload */}
          <div className="flex items-center gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 transition-all cursor-pointer">
              <ImageIcon className="w-4 h-4" />
              {image ? '已选择图片' : '上传作业照片'}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {image && (
              <button
                onClick={() => setImage(null)}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-xl bg-magic-accent text-white text-xs font-bold hover:bg-magic-accent/90 transition-all"
          >
            添加作业
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
            <Pencil className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40">暂无作业</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-4 rounded-2xl border flex items-start gap-3 transition-all",
                task.status === 'completed'
                  ? "bg-white/5 border-white/5 opacity-60"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <button
                onClick={() => onToggleStatus(task.id)}
                className="mt-0.5"
              >
                {task.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-white/20" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded", getSubjectColor(task.subject))}>
                    {task.subject}
                  </span>
                  <span className="text-[10px] text-white/40">{task.dueDate}</span>
                </div>
                <p className={cn(
                  "text-sm font-medium",
                  task.status === 'completed' ? "text-white/40 line-through" : "text-white"
                )}>
                  {task.title}
                </p>
                {task.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                    <img src={task.image} alt="作业" className="w-full h-24 object-cover" />
                  </div>
                )}
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
