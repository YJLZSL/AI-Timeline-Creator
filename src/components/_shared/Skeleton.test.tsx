import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, SkeletonGroup, TimelineSkeleton, WorkspaceCardSkeleton } from './Skeleton';

describe('Skeleton', () => {
  it('默认 variant 应渲染为 4px 高的元素', () => {
    // Act: 渲染默认骨架
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;

    // Assert: 包含默认高度 class
    expect(el).toHaveClass('h-4');
    expect(el).toHaveClass('w-full');
    expect(el).toHaveClass('skeleton-pulse');
  });

  it('card variant 应渲染为圆角矩形', () => {
    // Act: 渲染 card 变体
    const { container } = render(<Skeleton variant="card" />);
    const el = container.firstChild as HTMLElement;

    // Assert: 包含 card 样式
    expect(el).toHaveClass('h-32');
    expect(el).toHaveClass('rounded-xl');
  });

  it('circle variant 应渲染为圆形', () => {
    // Act: 渲染 circle 变体
    const { container } = render(<Skeleton variant="circle" />);
    const el = container.firstChild as HTMLElement;

    // Assert: 包含圆形样式
    expect(el).toHaveClass('h-10');
    expect(el).toHaveClass('w-10');
    expect(el).toHaveClass('rounded-full');
  });

  it('text variant 应渲染为短圆角条', () => {
    // Act: 渲染 text 变体
    const { container } = render(<Skeleton variant="text" />);
    const el = container.firstChild as HTMLElement;

    // Assert: 包含 text 样式
    expect(el).toHaveClass('h-3');
    expect(el).toHaveClass('w-3/4');
    expect(el).toHaveClass('rounded');
  });

  it('className 应覆盖和追加样式', () => {
    // Act: 渲染带自定义 className
    const { container } = render(<Skeleton className="custom-class" />);
    const el = container.firstChild as HTMLElement;

    // Assert: 包含自定义 class
    expect(el).toHaveClass('custom-class');
  });
});

describe('SkeletonGroup', () => {
  it('应渲染子元素并包含 flex-col 布局', () => {
    // Arrange: 子元素
    const children = <div data-testid="child">内容</div>;

    // Act: 渲染
    const { container } = render(<SkeletonGroup>{children}</SkeletonGroup>);

    // Assert: 子元素存在且容器有 flex 布局
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('flex-col');
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});

describe('TimelineSkeleton', () => {
  it('应渲染时间轴骨架结构（多个 Skeleton 组合）', () => {
    // Act: 渲染时间轴骨架
    render(<TimelineSkeleton />);

    // Assert: 渲染多个 skeleton 元素
    const skeletons = document.querySelectorAll('.skeleton-pulse');
    expect(skeletons.length).toBeGreaterThan(4);
  });
});

describe('WorkspaceCardSkeleton', () => {
  it('应渲染工作区卡片骨架', () => {
    // Act: 渲染工作区卡片骨架
    const { container } = render(<WorkspaceCardSkeleton />);

    // Assert: 包含骨架元素和卡片结构
    const skeletons = container.querySelectorAll('.skeleton-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });
});
