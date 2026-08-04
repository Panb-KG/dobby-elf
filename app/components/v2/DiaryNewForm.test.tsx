/**
 * DiaryNewForm 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiaryNewForm } from './DiaryNewForm';

// Mock child components
vi.mock('./VoiceRecorderModal', () => ({
  VoiceRecorderModal: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="voice-recorder">
        <button onClick={onClose}>关闭录音</button>
      </div>
    ) : null,
}));

vi.mock('./DiaryImagePicker', () => ({
  DiaryImagePicker: ({ onChange }: any) => (
    <div data-testid="image-picker">
      <button onClick={() => onChange([])}>选择图片</button>
    </div>
  ),
}));

vi.mock('@/components/ui/ConfirmDialog', () => ({
  default: ({ isOpen, message, onConfirm }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <span>{message}</span>
        <button onClick={onConfirm}>确定</button>
      </div>
    ) : null,
}));

vi.mock('@/lib/api-client', () => ({
  authFetch: vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ urls: ['https://uploaded.jpg'] }),
  }),
}));

describe('DiaryNewForm', () => {
  const mockOnCreate = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with title input and content textarea', () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    expect(screen.getByPlaceholderText('日记标题（可选）')).toBeTruthy();
    expect(screen.getByPlaceholderText('今天发生了什么有趣的事情？')).toBeTruthy();
  });

  it('renders mood options', () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    expect(screen.getByText('今天的心情')).toBeTruthy();
    expect(screen.getByTitle('开心')).toBeTruthy();
    expect(screen.getByTitle('难过')).toBeTruthy();
  });

  it('renders weather options', () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    expect(screen.getByText('天气')).toBeTruthy();
    expect(screen.getByTitle('晴天')).toBeTruthy();
  });

  it('calls onCancel when close button clicked', () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    const closeBtn = screen.getByText('✍️ 新日记').parentElement?.querySelector('button');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables save button when content is empty', () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    const saveBtn = screen.getByText('保存日记 (+5 积分)').closest('button');
    expect(saveBtn?.disabled).toBe(true);
  });

  it('enables save button when content is entered', () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    const textarea = screen.getByPlaceholderText('今天发生了什么有趣的事情？');
    fireEvent.change(textarea, { target: { value: '今天去了公园' } });
    const saveBtn = screen.getByText('保存日记 (+5 积分)').closest('button');
    expect(saveBtn?.disabled).toBe(false);
  });

  it('calls onCreate with form data when save is clicked', async () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    const titleInput = screen.getByPlaceholderText('日记标题（可选）');
    const textarea = screen.getByPlaceholderText('今天发生了什么有趣的事情？');

    fireEvent.change(titleInput, { target: { value: '公园日记' } });
    fireEvent.change(textarea, { target: { value: '今天去了公园玩' } });

    const saveBtn = screen.getByText('保存日记 (+5 积分)').closest('button');
    if (saveBtn) fireEvent.click(saveBtn);

    // Wait for async operations
    await new Promise((r) => setTimeout(r, 10));

    expect(mockOnCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2026-08-01',
        title: '公园日记',
        content: '今天去了公园玩',
        isVoice: false,
      })
    );
  });

  it('uses "无标题" when title is empty', async () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    const textarea = screen.getByPlaceholderText('今天发生了什么有趣的事情？');
    fireEvent.change(textarea, { target: { value: '有内容但没标题' } });

    const saveBtn = screen.getByText('保存日记 (+5 积分)').closest('button');
    if (saveBtn) fireEvent.click(saveBtn);

    await new Promise((r) => setTimeout(r, 10));

    expect(mockOnCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '无标题',
      })
    );
  });

  it('opens voice recorder modal on mic button click', () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    const micBtn = screen.getByText('语音录制').closest('button');
    if (micBtn) fireEvent.click(micBtn);
    expect(screen.getByTestId('voice-recorder')).toBeTruthy();
  });

  it('selects mood emoji', () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    fireEvent.click(screen.getByTitle('开心'));
    // After clicking, the button should have active styling (ring)
    const moodBtn = screen.getByTitle('开心');
    expect(moodBtn.className).toContain('bg-orange-500/30');
  });

  it('selects weather emoji', () => {
    render(
      <DiaryNewForm selectedDate="2026-08-01" userId="u1" onCreate={mockOnCreate} onCancel={mockOnCancel} />
    );
    fireEvent.click(screen.getByTitle('晴天'));
    const weatherBtn = screen.getByTitle('晴天');
    expect(weatherBtn.className).toContain('bg-blue-500/30');
  });
});
