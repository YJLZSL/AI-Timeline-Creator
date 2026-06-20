import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('应渲染标题文本', () => {
    // Arrange: 准备 props
    const title = '暂无数据';

    // Act: 渲染组件
    render(<EmptyState title={title} />);

    // Assert: 标题在文档中
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('描述存在时应渲染描述文本', () => {
    // Arrange: 准备含描述的 props
    const title = '空列表';
    const description = '点击按钮添加第一个项目';

    // Act: 渲染组件
    render(<EmptyState title={title} description={description} />);

    // Assert: 描述在文档中
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('无描述时不应渲染描述元素', () => {
    // Arrange: 无描述
    const title = '空列表';

    // Act: 渲染组件
    render(<EmptyState title={title} />);

    // Assert: 只有标题，描述不存在
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.queryByText('点击按钮')).not.toBeInTheDocument();
  });

  it('action 存在时应渲染 action 内容', () => {
    // Arrange: 准备 action
    const actionText = '去创建';
    const action = <button>{actionText}</button>;

    // Act: 渲染组件
    render(<EmptyState title="空列表" action={action} />);

    // Assert: action 按钮在文档中
    expect(screen.getByRole('button', { name: actionText })).toBeInTheDocument();
  });

  it('variant 为 dashed 时应应用虚线边框样式', () => {
    // Arrange: dashed 变体
    const title = '虚线框';

    // Act: 渲染组件
    const { container } = render(<EmptyState title={title} variant="dashed" />);

    // Assert: 包含 dashed 样式相关的 class
    expect(container.firstChild).toHaveClass('border-dashed');
  });

  it('variant 为 minimal 时不应有边框和过多 padding', () => {
    // Arrange: minimal 变体
    const title = '极简';

    // Act: 渲染组件
    const { container } = render(<EmptyState title={title} variant="minimal" />);

    // Assert: 不包含 border 相关 class
    expect(container.firstChild).not.toHaveClass('border');
    expect(container.firstChild).not.toHaveClass('rounded-xl');
  });

  it('icon 存在时应渲染图标内容', () => {
    // Arrange: 图标节点
    const icon = <span data-testid="test-icon">📄</span>;

    // Act: 渲染组件
    render(<EmptyState title="有图标" icon={icon} />);

    // Assert: 图标在文档中
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
