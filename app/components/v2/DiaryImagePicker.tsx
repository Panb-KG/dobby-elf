/**
 * 日记图片选择器组件
 * 支持多图选择、预览、删除、验证
 */

"use client";

import { useState } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { validateImageFile } from '@/lib/supabase-storage';

interface DiaryImagePickerProps {
  maxImages?: number;
  maxSizeMB?: number;
  onChange: (files: File[]) => void;
  onError: (message: string, type: 'warning' | 'error') => void;
}

export function DiaryImagePicker({
  maxImages = 5,
  maxSizeMB = 10,
  onChange,
  onError,
}: DiaryImagePickerProps) {
  const [images, setImages] = useState<File[]>([]);

  const removeImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
    onChange(newImages);
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;

    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateImageFile(file, maxSizeMB);
      if (!validation.valid) {
        onError(validation.error!, 'warning');
        return;
      }
      validFiles.push(file);
    }

    const newImages = [...images, ...validFiles].slice(0, maxImages);
    setImages(newImages);
    onChange(newImages);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">📸 添加照片</span>
        {images.length > 0 && (
          <span className="text-xs text-orange-400">已选择 {images.length} 张</span>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-white/10">
              <img
                src={URL.createObjectURL(img)}
                alt={`预览 ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all bg-white/10 hover:bg-white/20 text-gray-300 cursor-pointer">
        <ImageIcon size={16} />
        <span>选择照片（最多 {maxImages} 张）</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
      </label>
    </div>
  );
}
