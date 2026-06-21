import { type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { SearchIcon } from '@/lib/icons';
import { TInput, TSelect } from '@/components/ui-tdesign';

/**
 * 筛选器选项配置
 */
export interface FilterOption {
  /** 筛选器标签（如"状态"） */
  label: string;
  /** 筛选器标识值 */
  value: string;
  /** 下拉选项列表 */
  options: { label: string; value: string }[];
  /** 选择变化回调 */
  onChange: (value: string) => void;
}

/**
 * 统一搜索栏 Props
 */
export interface SearchBarProps {
  /** 搜索框提示文字 */
  placeholder?: string;
  /** 搜索框当前值 */
  value: string;
  /** 搜索值变化回调 */
  onChange: (value: string) => void;
  /** 筛选器列表 */
  filters?: FilterOption[];
  /** 回车/确认搜索回调 */
  onSearch?: (query: string) => void;
  /** 额外类名 */
  className?: string;
}

/**
 * 统一搜索栏组件
 *
 * 功能：提供统一的搜索框 + 筛选器组合区域。
 * 搜索框采用圆角大、浅色背景风格，左侧带 SearchIcon。
 * 筛选器紧跟搜索框，使用下拉选择器。
 *
 * 使用示例：
 * ```tsx
 * <SearchBar
 *   placeholder="搜索角色名称..."
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   onSearch={handleSearch}
 *   filters={[
 *     {
 *       label: "状态",
 *       value: statusFilter,
 *       options: [
 *         { label: "全部", value: "" },
 *         { label: "活跃", value: "active" },
 *         { label: "归档", value: "archived" },
 *       ],
 *       onChange: setStatusFilter,
 *     },
 *   ]}
 * />
 * ```
 */
export function SearchBar({
  placeholder = '搜索...',
  value,
  onChange,
  filters,
  onSearch,
  className,
}: SearchBarProps) {
  /** 处理回车搜索（TInput onKeydown 签名适配） */
  const handleKeyDown = (_value: string, context: { e: KeyboardEvent<HTMLDivElement> }) => {
    if (context.e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={cn('flex items-center gap-2 py-3 px-6', className)}>
      {/* 搜索框 */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <SearchIcon size={16} />
        </div>
        <TInput
          value={value}
          onChange={(val) => onChange(val ?? '')}
          onKeydown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl bg-muted/50',
            'pl-9 pr-4 py-2',
            'text-sm text-foreground placeholder:text-muted-foreground/60',
            'border border-transparent focus:border-primary/50',
            'transition-colors duration-200'
          )}
          clearable
          onClear={() => onChange('')}
        />
      </div>

      {/* 筛选器列表 */}
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-2">
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {filter.label}
              </span>
              <TSelect
                value={filter.value}
                onChange={(val) => filter.onChange(String(val ?? ''))}
                className="min-w-[100px]"
                size="small"
                options={filter.options}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
