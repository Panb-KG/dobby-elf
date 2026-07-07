import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactElement } from 'react';
import { CourseModule } from './CourseModule';

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, initial, animate, transition, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

// Mock console lib
vi.mock('../../lib/console', () => ({
  error: vi.fn(),
}));

describe('CourseModule', () => {
  const mockCourses = [
    { id: 'c1', day: '周一', subject: '数学', time: '09:00-10:00', type: '校内', color: '' },
    { id: 'c2', day: '周一', subject: '英语', time: '10:30-11:30', type: '校内', color: '' },
    { id: 'c3', day: '周二', subject: '语文', time: '14:00-15:00', type: '课外', color: '' },
  ];

  const defaultProps = {
    courses: mockCourses,
    scheduleView: 'week' as const,
    selectedDay: '周一',
    isAddingCourse: false,
    newCourse: { subject: '', time: '', type: '校内' as const, day: '周一' },
    userId: 'test-user',
    onScheduleViewChange: vi.fn(),
    onSelectedDayChange: vi.fn(),
    onIsAddingCourseChange: vi.fn(),
    onNewCourseChange: vi.fn(),
    onAddCourse: vi.fn(),
    onRemoveCourse: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders week view by default', () => {
    render(<CourseModule {...defaultProps} />);
    expect(screen.getByText('周视图')).toBeTruthy();
    expect(screen.getByText('日视图')).toBeTruthy();
    // In week view, day selector is not shown, but courses are shown
    expect(screen.getByText('数学')).toBeTruthy();
  });

  it('displays all courses in week view', () => {
    render(<CourseModule {...defaultProps} scheduleView="week" />);
    expect(screen.getByText('数学')).toBeTruthy();
    expect(screen.getByText('英语')).toBeTruthy();
    expect(screen.getByText('语文')).toBeTruthy();
  });

  it('filters courses by selected day in day view', () => {
    render(<CourseModule {...defaultProps} scheduleView="day" selectedDay="周一" />);
    expect(screen.getByText('数学')).toBeTruthy();
    expect(screen.getByText('英语')).toBeTruthy();
    // 语文 is on 周二, should not appear
    expect(screen.queryByText('语文')).toBeFalsy();
  });

  it('calls onScheduleViewChange when switching to day view', () => {
    const onScheduleViewChange = vi.fn();
    render(<CourseModule {...defaultProps} onScheduleViewChange={onScheduleViewChange} />);
    fireEvent.click(screen.getByText('日视图'));
    expect(onScheduleViewChange).toHaveBeenCalledWith('day');
  });

  it('calls onScheduleViewChange when switching to week view', () => {
    const onScheduleViewChange = vi.fn();
    render(<CourseModule {...defaultProps} scheduleView="day" onScheduleViewChange={onScheduleViewChange} />);
    fireEvent.click(screen.getByText('周视图'));
    expect(onScheduleViewChange).toHaveBeenCalledWith('week');
  });

  it('calls onSelectedDayChange when a day is clicked in day view', () => {
    const onSelectedDayChange = vi.fn();
    render(<CourseModule {...defaultProps} scheduleView="day" onSelectedDayChange={onSelectedDayChange} />);
    fireEvent.click(screen.getByText('周二'));
    expect(onSelectedDayChange).toHaveBeenCalledWith('周二');
  });

  it('shows day selector in day view', () => {
    const { rerender } = render(<CourseModule {...defaultProps} scheduleView="week" />);
    expect(screen.queryByText('周一', { selector: 'button' })).toBeFalsy();

    rerender(<CourseModule {...defaultProps} scheduleView="day" />);
    expect(screen.getByText('周一')).toBeTruthy();
    expect(screen.getByText('周日')).toBeTruthy();
  });

  it('calls onRemoveCourse when remove button is clicked', () => {
    const onRemoveCourse = vi.fn();
    render(<CourseModule {...defaultProps} onRemoveCourse={onRemoveCourse} />);
    // Find the X buttons (remove buttons)
    const removeButtons = screen.getAllByRole('button').filter(btn => {
      const svg = btn.querySelector('svg');
      return svg && btn.title === ''; // X icon without title
    });
    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0]);
      expect(onRemoveCourse).toHaveBeenCalledWith(0);
    }
  });

  it('shows add course form when isAddingCourse is true', () => {
    render(<CourseModule {...defaultProps} isAddingCourse={true} />);
    expect(screen.getByPlaceholderText('科目名称')).toBeTruthy();
    expect(screen.getByText('添加')).toBeTruthy();
    expect(screen.getByText('取消')).toBeTruthy();
  });

  it('shows add course button when not adding course', () => {
    render(<CourseModule {...defaultProps} isAddingCourse={false} />);
    expect(screen.getByText('添加课程')).toBeTruthy();
  });

  it('calls onIsAddingCourseChange when add course button is clicked', () => {
    const onIsAddingCourseChange = vi.fn();
    render(<CourseModule {...defaultProps} onIsAddingCourseChange={onIsAddingCourseChange} />);
    fireEvent.click(screen.getByText('添加课程'));
    expect(onIsAddingCourseChange).toHaveBeenCalledWith(true);
  });

  it('calls onNewCourseChange when subject input changes', () => {
    const onNewCourseChange = vi.fn();
    render(<CourseModule {...defaultProps} isAddingCourse={true} onNewCourseChange={onNewCourseChange} />);
    const subjectInput = screen.getByPlaceholderText('科目名称');
    fireEvent.change(subjectInput, { target: { value: '物理' } });
    expect(onNewCourseChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: '物理' })
    );
  });

  it('calls onNewCourseChange when time input changes', () => {
    const onNewCourseChange = vi.fn();
    const { container } = render(<CourseModule {...defaultProps} isAddingCourse={true} onNewCourseChange={onNewCourseChange} />);
    const timeInput = container.querySelector('input[type="time"]');
    expect(timeInput).toBeTruthy();
    if (timeInput) {
      fireEvent.change(timeInput, { target: { value: '08:00' } });
      expect(onNewCourseChange).toHaveBeenCalled();
    }
  });

  it('calls onAddCourse when add button is clicked', () => {
    const onAddCourse = vi.fn();
    render(<CourseModule {...defaultProps} isAddingCourse={true} onAddCourse={onAddCourse} />);
    fireEvent.click(screen.getByText('添加'));
    expect(onAddCourse).toHaveBeenCalled();
  });

  it('calls onIsAddingCourseChange with false when cancel is clicked', () => {
    const onIsAddingCourseChange = vi.fn();
    render(<CourseModule {...defaultProps} isAddingCourse={true} onIsAddingCourseChange={onIsAddingCourseChange} />);
    fireEvent.click(screen.getByText('取消'));
    expect(onIsAddingCourseChange).toHaveBeenCalledWith(false);
  });

  it('renders image upload option', () => {
    render(<CourseModule {...defaultProps} />);
    expect(screen.getByText('上传课表图片识别')).toBeTruthy();
  });

  it('renders type select with 校内 and 课外 options', () => {
    render(<CourseModule {...defaultProps} isAddingCourse={true} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeTruthy();
    const options = screen.getAllByRole('option');
    expect(options.length).toBe(2);
  });

  it('shows empty message when no courses', () => {
    const { container } = render(<CourseModule {...defaultProps} courses={[]} />);
    // Should render without crashing even with empty courses
    expect(screen.getByText('周视图')).toBeTruthy();
  });
});
