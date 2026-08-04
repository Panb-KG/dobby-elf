/**
 * DiaryEntryItem 组件测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiaryEntryItem } from './DiaryEntryItem';
import type { DiaryEntry } from '@/lib/diary';

// Mock DiaryEntryEditor
vi.mock('./DiaryEntryEditor', () => ({
  DiaryEntryEditor: ({ entry, onSave, onCancel }: any) => (
    <div data-testid="editor">
      <span>编辑: {entry.title}</span>
      <button onClick={() => onSave({ title: 'edited', content: 'edited content' })}>保存</button>
      <button onClick={onCancel}>取消</button>
    </div>
  ),
}));

const mockEntry: DiaryEntry = {
  id: 'e1',
  userId: 'u1',
  date: '2026-08-01',
  title: '开心的一天',
  content: '今天去了公园玩',
  mood: '😊',
  weather: '☀️',
  isVoice: false,
  createdAt: '2026-08-01T10:00:00Z',
  updatedAt: '2026-08-01T10:00:00Z',
};

describe('DiaryEntryItem', () => {
  const mockOnUpdate = vi.fn().mockResolvedValue(undefined);
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  it('renders entry title, content, mood and weather', () => {
    render(<DiaryEntryItem entry={mockEntry} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    expect(screen.getByText('开心的一天')).toBeTruthy();
    expect(screen.getByText('今天去了公园玩')).toBeTruthy();
    expect(screen.getByText('😊')).toBeTruthy();
    expect(screen.getByText('☀️')).toBeTruthy();
  });

  it('shows voice badge when isVoice is true', () => {
    const voiceEntry = { ...mockEntry, isVoice: true };
    render(<DiaryEntryItem entry={voiceEntry} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    expect(screen.getByText(/🎤 语音/)).toBeTruthy();
  });

  it('does not show voice badge when isVoice is false', () => {
    render(<DiaryEntryItem entry={mockEntry} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    expect(screen.queryByText(/🎤 语音/)).toBeFalsy();
  });

  it('renders images when present', () => {
    const entryWithImages = { ...mockEntry, images: ['https://img1.jpg', 'https://img2.jpg'] };
    render(<DiaryEntryItem entry={entryWithImages} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    const imgs = screen.getAllByRole('img');
    expect(imgs.length).toBe(2);
  });

  it('renders audio player when audioUrl is present', () => {
    const entryWithAudio = { ...mockEntry, audioUrl: 'https://audio.mp3' };
    const { container } = render(<DiaryEntryItem entry={entryWithAudio} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    const audio = container.querySelector('audio');
    expect(audio).toBeTruthy();
    expect(audio?.src).toContain('audio.mp3');
  });

  it('shows voice duration when no audioUrl', () => {
    const entryWithDuration = { ...mockEntry, isVoice: true, voiceDuration: 30 };
    render(<DiaryEntryItem entry={entryWithDuration} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    expect(screen.getByText(/语音时长 30 秒/)).toBeTruthy();
  });

  it('switches to edit mode on edit button click', () => {
    render(<DiaryEntryItem entry={mockEntry} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    const editBtn = screen.getByText('😊').parentElement?.parentElement?.querySelector('button');
    // Click the first button (edit)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(screen.getByTestId('editor')).toBeTruthy();
    expect(screen.getByText(/编辑: 开心的一天/)).toBeTruthy();
  });

  it('calls onUpdate and exits edit mode on save', async () => {
    render(<DiaryEntryItem entry={mockEntry} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    // Switch to edit mode
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    // Click save in editor
    fireEvent.click(screen.getByText('保存'));
    expect(mockOnUpdate).toHaveBeenCalledWith('e1', { title: 'edited', content: 'edited content' });
  });

  it('exits edit mode on cancel', () => {
    render(<DiaryEntryItem entry={mockEntry} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(screen.getByTestId('editor')).toBeTruthy();
    fireEvent.click(screen.getByText('取消'));
    expect(screen.queryByTestId('editor')).toBeFalsy();
    expect(screen.getByText('开心的一天')).toBeTruthy();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<DiaryEntryItem entry={mockEntry} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />);
    const buttons = screen.getAllByRole('button');
    // Second button is delete
    fireEvent.click(buttons[1]);
    expect(mockOnDelete).toHaveBeenCalledWith('e1');
  });
});
