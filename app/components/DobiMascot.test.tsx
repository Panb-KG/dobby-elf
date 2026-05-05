import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DobiMascot } from './DobiMascot';

describe('DobiMascot', () => {
  it('renders without crashing', () => {
    const { container } = render(<DobiMascot />);
    expect(container.firstChild).toBeTruthy();
  });

  it('applies custom className', () => {
    const { container } = render(<DobiMascot className="custom-class" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('custom-class');
  });

  it('renders with default props', () => {
    const { container } = render(<DobiMascot />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('relative');
    expect(root.className).toContain('flex');
  });
});
