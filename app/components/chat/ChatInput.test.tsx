import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ChatInput } from './ChatInput';

// Mock motion/react to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    button: ({ children, className, disabled, onClick, ...props }: any) => (
      <button className={className} disabled={disabled} onClick={onClick} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock ConfirmDialog
vi.mock('@/components/ui/ConfirmDialog', () => ({
  default: ({ isOpen, message, onConfirm }: any) =>
    isOpen ? <button data-testid="confirm-dialog" onClick={onConfirm}>{message}</button> : null,
}));

describe('ChatInput', () => {
  const defaultProps = {
    input: '',
    isLoading: false,
    onSend: vi.fn(),
    onInputChange: vi.fn(),
    onShortcut: vi.fn(),
    shortcuts: [
      { id: '1', name: '翻译', prompt: '翻译以下内容' },
      { id: '2', name: '总结', prompt: '总结以下内容' },
    ],
  };

  it('renders with textarea and send button', () => {
    const { container } = render(<ChatInput {...defaultProps} />);
    expect(screen.getByPlaceholderText(/输入你的问题/)).toBeTruthy();
  });

  it('send button is disabled when input is empty', () => {
    const { container } = render(<ChatInput {...defaultProps} input="" />);
    const buttons = container.querySelectorAll('button');
    const disabledSendButton = Array.from(buttons).find(btn => {
      const svg = btn.querySelector('svg');
      return svg && btn.disabled === true;
    });
    expect(disabledSendButton).toBeTruthy();
  });

  it('send button is enabled when input has text', () => {
    const { container } = render(<ChatInput {...defaultProps} input="Hello" />);
    const buttons = container.querySelectorAll('button');
    const enabledSendButton = Array.from(buttons).find(btn => {
      const svg = btn.querySelector('svg');
      return svg && !btn.disabled;
    });
    expect(enabledSendButton).toBeTruthy();
  });

  it('send button is disabled when loading', () => {
    const { container } = render(<ChatInput {...defaultProps} input="Hello" isLoading={true} />);
    const buttons = container.querySelectorAll('button');
    const disabledButtons = Array.from(buttons).filter(btn => btn.disabled);
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it('calls onSend with trimmed text when Enter is pressed', async () => {
    const onSend = vi.fn();
    const onInputChange = vi.fn();
    render(<ChatInput {...defaultProps} input="  Hello World  " onSend={onSend} onInputChange={onInputChange} />);
    const textarea = screen.getByPlaceholderText(/输入你的问题/);
    await act(async () => {
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    });
    expect(onSend).toHaveBeenCalledWith('Hello World', undefined);
  });

  it('does not call onSend when Shift+Enter is pressed', () => {
    const onSend = vi.fn();
    render(<ChatInput {...defaultProps} input="Hello" onSend={onSend} />);
    const textarea = screen.getByPlaceholderText(/输入你的问题/);
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('renders shortcut buttons on mobile', () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByText('翻译')).toBeTruthy();
    expect(screen.getByText('总结')).toBeTruthy();
  });

  it('calls onShortcut when a shortcut is clicked', () => {
    const onShortcut = vi.fn();
    render(<ChatInput {...defaultProps} onShortcut={onShortcut} />);
    fireEvent.click(screen.getByText('翻译'));
    expect(onShortcut).toHaveBeenCalledWith('翻译以下内容');
  });

  it('calls onInputChange when textarea changes', () => {
    const onInputChange = vi.fn();
    render(<ChatInput {...defaultProps} onInputChange={onInputChange} />);
    const textarea = screen.getByPlaceholderText(/输入你的问题/);
    fireEvent.change(textarea, { target: { value: 'test input' } });
    expect(onInputChange).toHaveBeenCalledWith('test input');
  });

  it('renders voice button when voiceChat is provided with speech support', () => {
    const voiceChat = {
      isSpeechRecognitionSupported: true,
      isRecording: false,
      interimText: '',
      finalText: '',
      onStartRecording: vi.fn(),
      onStopRecording: vi.fn(),
    };
    render(<ChatInput {...defaultProps} voiceChat={voiceChat} />);
    // Mic button should be present
    const micButtons = screen.getAllByRole('button').filter(btn => {
      const svg = btn.querySelector('svg');
      return svg && btn.title === '语音输入';
    });
    expect(micButtons.length).toBeGreaterThan(0);
  });

  it('renders daily adventure toggle when handler provided', () => {
    const onToggle = vi.fn();
    render(<ChatInput {...defaultProps} showDailyAdventure={false} onToggleDailyAdventure={onToggle} />);
    const homeButton = screen.getAllByRole('button').find(btn => btn.title === '查看今日冒险');
    expect(homeButton).toBeTruthy();
  });
});
