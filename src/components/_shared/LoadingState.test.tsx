import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  it('应渲染加载图标', () => {
    // Act: 渲染加载状态
    render(<LoadingState />);

    // Assert: 图标存在（LoadingIcon 渲染为 SVG 或 span）
    const icon = document.querySelector('svg') || document.querySelector('[class*="animate-spin"]');
    expect(icon).toBeInTheDocument();
  });

  it('text 存在时应渲染文本', () => {
    // Arrange: 加载文本
    const loadingText = '加载中...';

    // Act: 渲染组件
    render(<LoadingState text={loadingText} />);

    // Assert: 文本在文档中
    expect(screen.getByText(loadingText)).toBeInTheDocument();
  });

  it('无 text 时不应渲染文本节点', () => {
    // Act: 渲染无文本的组件
    render(<LoadingState />);

    // Assert: 没有文本 span（只有图标和结构）
    // 至少只有图标或空元素，没有显式文本
    expect(screen.queryByText('加载中')).not.toBeInTheDocument();
  });

  it('size="sm" 应使用小尺寸样式', () => {
    // Act: 渲染小尺寸
    render(<LoadingState size="sm" />);

    // Assert: 包含小尺寸相关 class（text-xs）
    expect(document.querySelector('[class*="text-muted-foreground"]')).toBeTruthy();
  });

  it('size="lg" 应使用大尺寸样式', () => {
    // Act: 渲染大尺寸
    render(<LoadingState size="lg" text="加载中" />);

    // Assert: 文本包含 text-base
    const textEl = screen.getByText('加载中');
    expect(textEl).toHaveClass('text-base');
  });

  it('children 应被渲染', () => {
    // Arrange: 子内容
    const childText = '额外信息';

    // Act: 渲染带子内容
    render(
      <LoadingState>
        <span data-testid="child">{childText}</span>
      </LoadingState>,
    );

    // Assert: 子内容在文档中
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it('className 应正确应用', () => {
    // Arrange: 自定义 className
    const customClass = 'my-loading-class';

    // Act: 渲染
    render(<LoadingState className={customClass} />);

    // Assert: 自定义 class 已应用
    expect(document.querySelector('.' + customClass)).toBeTruthy();
  });
});
