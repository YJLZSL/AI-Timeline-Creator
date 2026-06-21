import { Drawer as TDrawer } from 'tdesign-react';
import { HistoryIcon, DeleteIcon, UndoIcon } from '@/lib/icons';
import { TButton } from '@/components/ui-tdesign';
import { EmptyState } from '@/components/_shared/EmptyState';
import type { OutlineVersion } from '../../../shared/types';

interface OutlineHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  versions: OutlineVersion[] | undefined;
  onRestore: (versionId: string) => void;
  onDeleteVersion: (workspaceId: string, versionId: string) => void;
  expandedVersionId: string | null;
  onToggleExpand: (versionId: string | null) => void;
  pendingRestoreId: string | null;
  pendingDeleteVersionId: string | null;
  onSetPendingRestore: (versionId: string | null) => void;
  onSetPendingDelete: (versionId: string | null) => void;
  workspaceId: string | null;
  renderDiffPreview: (versionContent: string) => React.ReactNode;
}

export function OutlineHistoryDrawer({
  open,
  onClose,
  versions,
  onRestore,
  onDeleteVersion,
  expandedVersionId,
  onToggleExpand,
  pendingRestoreId,
  pendingDeleteVersionId,
  onSetPendingRestore,
  onSetPendingDelete,
  workspaceId,
  renderDiffPreview,
}: OutlineHistoryDrawerProps) {
  return (
    <TDrawer visible={open} onClose={onClose} header="大纲演进历史" size="520px" footer={null}>
      <div className="text-xs text-muted-foreground mb-3 font-sans">
        每次打开此面板会自动保存一份当前大纲快照（5 分钟内仅保留一次）。
      </div>
      {(!versions || versions.length === 0) ? (
        <EmptyState
          variant="minimal"
          icon={<HistoryIcon size={24} className="text-muted-foreground/60" />}
          title="暂无版本记录"
          description="保存第一份大纲快照后，这里会显示历史版本"
          className="py-8"
        />
      ) : (
        <div className="space-y-2">
          {versions.map((v) => {
            const isExpanded = expandedVersionId === v.id;
            const isPendingRestore = pendingRestoreId === v.id;
            const isPendingDelete = pendingDeleteVersionId === v.id;
            const created = v.createdAt ? new Date(v.createdAt) : null;
            return (
              <div key={v.id} className="border border-border rounded-md p-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium font-sans truncate">{v.description || '自动保存'}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {created ? created.toLocaleString('zh-CN') : ''}
                    </div>
                  </div>
                  <TButton size="small" variant="outline" onClick={() => onToggleExpand(isExpanded ? null : v.id)}>
                    {isExpanded ? '收起' : 'Diff'}
                  </TButton>
                  <TButton
                    theme="primary"
                    size="small"
                    onClick={() => onSetPendingRestore(isPendingRestore ? null : v.id)}
                  >
                    <UndoIcon size={14} />
                    回滚
                  </TButton>
                  <TButton
                    theme="danger"
                    variant="text"
                    shape="square"
                    size="small"
                    onClick={() => onSetPendingDelete(isPendingDelete ? null : v.id)}
                    title="删除"
                  >
                    <DeleteIcon size={14} />
                  </TButton>
                </div>
                {isPendingRestore && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <span className="text-[10px] text-foreground font-sans">将根据此版本批量更新事件标题与摘要，确认？</span>
                    <TButton theme="primary" size="small" onClick={() => onRestore(v.id)}>
                      确认
                    </TButton>
                    <TButton variant="outline" size="small" onClick={() => onSetPendingRestore(null)}>
                      取消
                    </TButton>
                  </div>
                )}
                {isPendingDelete && workspaceId && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <span className="text-[10px] text-destructive font-sans">删除此版本？</span>
                    <TButton
                      theme="danger"
                      size="small"
                      onClick={() => {
                        onDeleteVersion(workspaceId, v.id);
                        onSetPendingDelete(null);
                      }}
                    >
                      删除
                    </TButton>
                    <TButton variant="outline" size="small" onClick={() => onSetPendingDelete(null)}>
                      取消
                    </TButton>
                  </div>
                )}
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    {renderDiffPreview(v.content)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </TDrawer>
  );
}
