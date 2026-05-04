import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingScreen from './LoadingScreen';

describe('LoadingScreen', () => {
  it('renders loading text', () => {
    render(<LoadingScreen />);
    expect(screen.getByText(/多比正在准备魔法/)).toBeTruthy();
  });

  it('renders loading dots', () => {
    const { container } = render(<LoadingScreen />);
    const dots = container.querySelectorAll('.bg-magic-accent');
    expect(dots.length).toBe(3);
  });
});
