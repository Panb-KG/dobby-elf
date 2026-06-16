import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DobiAvatar } from './DobiAvatar';

describe('DobiAvatar', () => {
  it('renders without crashing', () => {
    const { container } = render(<DobiAvatar />);
    // DobiAvatar 渲染的是一个带 motion.div 的容器，不是 SVG
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { container: sm } = render(<DobiAvatar size="sm" />);
    expect((sm.firstChild as HTMLElement).className).toContain('w-8');

    const { container: md } = render(<DobiAvatar size="md" />);
    expect((md.firstChild as HTMLElement).className).toContain('w-12');

    const { container: lg } = render(<DobiAvatar size="lg" />);
    expect((lg.firstChild as HTMLElement).className).toContain('w-20');
  });

  it('applies custom className', () => {
    const { container } = render(<DobiAvatar className="custom-avatar" />);
    expect((container.firstChild as HTMLElement).className).toContain('custom-avatar');
  });
});
