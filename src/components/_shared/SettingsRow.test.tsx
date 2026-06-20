import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsRow } from './SettingsRow';

describe('SettingsRow', () => {
  it('应渲染 label 文本', () => {
    // Arrange: 准备 props
    const label = '设置项';
    const control = <input type="checkbox" />;

    // Act: 渲染组件
    render(<SettingsRow label={label}>{control}</SettingsRow>);

    // Assert: label 在文档中
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('描述存在时应渲染 description 文本', () => {
    // Arrange: 准备含描述的 props
    const label = '自动保存';
    const description = '每 30 秒自动保存一次';
    const control = <input type="checkbox" />;

    // Act: 渲染组件
    render(<SettingsRow label={label} description={description}>{control}</SettingsRow>);

    // Assert: 描述在文档中
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('无描述时不应渲染 description 元素', () => {
    // Arrange: 无描述
    const label = '设置项';
    const control = <input type="checkbox" />;

    // Act: 渲染组件
    render(<SettingsRow label={label}>{control}</SettingsRow>);

    // Assert: 没有多余的描述文本节点
    const labelEl = screen.getByText(label);
    expect(labelEl).toBeInTheDocument();
  });

  it('htmlFor 应与 label 的 htmlFor 属性一致', () => {
    // Arrange: 准备 htmlFor
    const label = '开关';
    const htmlFor = 'toggle-switch';
    const control = <input id="toggle-switch" type="checkbox" />;

    // Act: 渲染组件
    render(<SettingsRow label={label} htmlFor={htmlFor}>{control}</SettingsRow>);

    // Assert: label 元素有正确的 htmlFor
    const labelEl = screen.getByText(label);
    expect(labelEl).toHaveAttribute('for', htmlFor);
  });

  it('应渲染子控件内容', () => {
    // Arrange: 测试控件
    const controlText = '测试按钮';
    const control = <button>{controlText}</button>;

    // Act: 渲染组件
    render(<SettingsRow label="设置项">{control}</SettingsRow>);

    // Assert: 子控件在文档中
    expect(screen.getByRole('button', { name: controlText })).toBeInTheDocument();
  });

  it('className 应正确应用', () => {
    // Arrange: 自定义 className
    const customClass = 'my-custom-class';

    // Act: 渲染组件
    const { container } = render(
      <SettingsRow label="设置项" className={customClass}>
        <input type="checkbox" />
      </SettingsRow>,
    );

    // Assert: 自定义 class 已应用
    expect(container.firstChild).toHaveClass(customClass);
  });
});
