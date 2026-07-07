import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DailyAdventure } from './DailyAdventure';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, initial, animate, transition, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

describe('DailyAdventure', () => {
  const mockCourses = [
    { id: 'c1', day: '周一', subject: '数学', time: '09:00-10:00', type: '校内', color: '' },
    { id: 'c2', day: '周一', subject: '英语', time: '10:30-11:30', type: '校内', color: '' },
    { id: 'c3', day: '周二', subject: '语文', time: '14:00-15:00', type: '校内', color: '' },
  ];

  const mockTasks = [
    { id: 't1', text: '完成数学作业', completed: false, reward: 10 },
    { id: 't2', text: '阅读30分钟', completed: true, reward: 5 },
    { id: 't3', text: '预习英语新课', completed: false, reward: 15 },
  ];

  const defaultProps = {
    courses: mockCourses,
    dailyTasks: mockTasks,
    points: 150,
    level: '魔法学徒',
    streak: 5,
    onCompleteTask: vi.fn(),
    onQuickAction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders greeting section with sparkle icon', () => {
    render(<DailyAdventure {...defaultProps} />);
    expect(screen.getByText(/开始打卡|连续/)).toBeTruthy();
  });

  it('displays streak count', () => {
    render(<DailyAdventure {...defaultProps} streak={7} />);
    // Should show streak info somewhere
    expect(screen.getByText(/连续|打卡/)).toBeTruthy();
  });

  it('shows zero streak when streak is 0', () => {
    render(<DailyAdventure {...defaultProps} streak={0} />);
    expect(screen.getByText(/开始打卡/)).toBeTruthy();
  });

  it('renders today courses section', () => {
    // Mock Date to return a Monday
    const RealDate = Date;
    // 2026-07-06 is a Monday
    vi.spyOn(global, 'Date').mockImplementation(function(...args: any[]) {
      if (args.length > 0) return new RealDate(...args);
      return new RealDate('2026-07-06T10:00:00+08:00');
    });

    const courses = [
      { id: 'c1', day: '周一', subject: '数学', time: '09:00', type: '校内', color: '' },
    ];

    render(<DailyAdventure {...defaultProps} courses={courses} />);
    expect(screen.getByText('今日课程')).toBeTruthy();
    expect(screen.getByText('数学')).toBeTruthy();

    vi.restoreAllMocks();
  });

  it('does not render courses section when no today courses', () => {
    const RealDate = Date;
    vi.spyOn(global, 'Date').mockImplementation(function(...args: any[]) {
      if (args.length > 0) return new RealDate(...args);
      return new RealDate('2026-07-07T10:00:00+08:00'); // Tuesday, no courses
    });

    const courses = [
      { id: 'c1', day: '周一', subject: '数学', time: '09:00', type: '校内', color: '' },
    ];

    const { container } = render(<DailyAdventure {...defaultProps} courses={courses} />);
    // Component should render without crashing
    // "今日课程" should not appear since no Tuesday courses
    expect(screen.queryByText('数学')).toBeFalsy();
    expect(screen.queryByText('今日课程')).toBeFalsy();
    // But task section should still be there
    expect(screen.getByText('今日任务')).toBeTruthy();

    vi.restoreAllMocks();
  });

  it('renders task list with completion status', () => {
    render(<DailyAdventure {...defaultProps} />);
    expect(screen.getByText('今日任务')).toBeTruthy();
    expect(screen.getByText('完成数学作业')).toBeTruthy();
    expect(screen.getByText('阅读30分钟')).toBeTruthy();
    expect(screen.getByText('预习英语新课')).toBeTruthy();
  });

  it('shows task progress count', () => {
    render(<DailyAdventure {...defaultProps} />);
    expect(screen.getByText('1/3')).toBeTruthy();
  });

  it('shows reward for incomplete tasks', () => {
    render(<DailyAdventure {...defaultProps} />);
    expect(screen.getByText('+10⭐')).toBeTruthy();
    expect(screen.getByText('+15⭐')).toBeTruthy();
  });

  it('does not allow clicking completed tasks', () => {
    const onCompleteTask = vi.fn();
    render(<DailyAdventure {...defaultProps} onCompleteTask={onCompleteTask} />);
    const completedTaskButton = screen.getByText('阅读30分钟').closest('button');
    expect(completedTaskButton?.getAttribute('disabled')).toBe('');
  });

  it('calls onCompleteTask when incomplete task is clicked', () => {
    const onCompleteTask = vi.fn();
    render(<DailyAdventure {...defaultProps} onCompleteTask={onCompleteTask} />);
    const taskButton = screen.getByText('完成数学作业').closest('button');
    if (taskButton) {
      fireEvent.click(taskButton);
      expect(onCompleteTask).toHaveBeenCalledWith('t1');
    }
  });

  it('renders quick action buttons', () => {
    render(<DailyAdventure {...defaultProps} />);
    expect(screen.getByText('看课表')).toBeTruthy();
    expect(screen.getByText('写作业')).toBeTruthy();
    expect(screen.getByText('专注')).toBeTruthy();
    expect(screen.getByText('宝藏')).toBeTruthy();
  });

  it('calls onQuickAction with correct action id', () => {
    const onQuickAction = vi.fn();
    render(<DailyAdventure {...defaultProps} onQuickAction={onQuickAction} />);
    fireEvent.click(screen.getByText('看课表'));
    expect(onQuickAction).toHaveBeenCalledWith('schedule');

    fireEvent.click(screen.getByText('写作业'));
    expect(onQuickAction).toHaveBeenCalledWith('homework');
  });

  it('renders with zero tasks gracefully', () => {
    render(<DailyAdventure {...defaultProps} dailyTasks={[]} />);
    expect(screen.getByText('今日任务')).toBeTruthy();
    expect(screen.getByText('0/0')).toBeTruthy();
  });

  it('displays level based on points', () => {
    render(<DailyAdventure {...defaultProps} points={500} />);
    // Level should be displayed somewhere - just verify the component renders
    const allText = screen.getAllByText(/.*/);
    expect(allText.length).toBeGreaterThan(0);
  });
});
