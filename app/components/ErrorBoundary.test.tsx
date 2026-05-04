import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../error';

describe('ErrorBoundary', () => {
  const mockError = new Error('Test error');
  const mockReset = vi.fn();

  it('renders error message', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(screen.getByText(/哎呀，魔法出错了/)).toBeTruthy();
    expect(screen.getByText(/多比的魔杖好像打了个结/)).toBeTruthy();
  });

  it('calls reset on retry button click', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    const retryButton = screen.getByText(/重新施法/);
    fireEvent.click(retryButton);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('shows error message in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(screen.getByText('Test error')).toBeTruthy();

    process.env.NODE_ENV = originalEnv;
  });
});
