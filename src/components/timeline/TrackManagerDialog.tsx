import { useState, useMemo } from 'react';
import { Dialog, TButton, TSwitch } from '@/components/ui-tdesign';
import {
  EditIcon,
  EyesIcon,
  EyesOffIcon,
  DeleteIcon,
  LinkIcon,
  XIcon,
} from '@/lib/icons';
import { TRACK_COLORS } from '@/lib/colors';
import { useUpdateTrack, useDeleteTrack } from '@/services/api-hooks';
import { MessagePlugin } from 'tdesign-react';
import type { Track } from '../../../shared/types';

export interface TrackManagerDialogProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  tracks: Track[];
  showConnectionLines: boolean;
  onToggleConnectionLines: () => void;
  visibleDateRange: { startMs: number; endMs: number } | null;
  onResetDateRange: () => void;
}

export function TrackManagerDialog({
  open,
  onClose,
  workspaceId,
  tracks,
  showConnectionLines,
  onToggleConnectionLines,
  visibleDateRange,
  onResetDateRange,
}: TrackManagerDialogProps) {
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const sortedTracks = useMemo(
    () => [...tracks].sort((a, b) => a.orderIndex - b.orderIndex),
    [tracks],
  );

  const startRename = (track: Track) => {
    setEditingId(track.id);
    setDraftName(track.name);
  };

  const commitRename = (track: Track) => {
    const trimmed = draftName.trim();
    setEditingId(null);
    if (!trimmed || trimmed === track.name) return;
    updateTrack.mutate(
      { workspaceId, trackId: track.id, data: { name: trimmed } },
      {
        onSuccess: () => MessagePlugin.success('轨道名称已更新'),
        onError: () => MessagePlugin.error('重命名失败'),
      },
    );
  };

  const cancelRename = () => {
    setEditingId(null);
    setDraftName('');
  };

  const handleToggleVisible = (track: Track) => {
    updateTrack.mutate({
      workspaceId,
      trackId: track.id,
      data: { isVisible: !track.isVisible },
    });
  };

  const handleChangeColor = (track: Track, color: string) => {
    if (color === track.color) return;
    updateTrack.mutate({
      workspaceId,
      trackId: track.id,
      data: { color },
    });
  };

  const handleDelete = (track: Track) => {
    if (!confirm(`确定删除轨道「${track.name}」吗？该轨道下的事件将变为未分类。`)) return;
    deleteTrack.mutate(
      { workspaceId, trackId: track.id },
      {
        onSuccess: () => MessagePlugin.success('轨道已删除'),
        onError: () => MessagePlugin.error('删除失败'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      header="轨道管理"
      width={520}
      footer={
        <TButton theme="default" variant="outline" size="small" onClick={onClose}>
          关闭
        </TButton>
      }
    >
      <div className="space-y-4 py-1">
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
          <span className="flex items-center gap-2 text-sm text-foreground">
            <LinkIcon size={14} />
            显示事件关联线
          </span>
          <TSwitch
            size="small"
            value={showConnectionLines}
            onChange={(v) => {
              if (v !== showConnectionLines) onToggleConnectionLines();
            }}
          />
        </div>

        {visibleDateRange && (
          <TButton
            theme="default"
            variant="text"
            size="small"
            block
            onClick={onResetDateRange}
          >
            <XIcon size={14} />
            <span>重置显示范围</span>
          </TButton>
        )}

        <div className="max-h-[50vh] space-y-2 overflow-auto pr-1">
          {sortedTracks.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              暂无轨道，点击“新建轨道”创建第一条轨道
            </div>
          )}
          {sortedTracks.map((track) => {
            const isEditing = editingId === track.id;
            return (
              <div
                key={track.id}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-2 transition-colors hover:bg-card/60"
              >
                <div
                  className="h-8 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: track.color || 'rgb(var(--primary))' }}
                />

                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onBlur={() => commitRename(track)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(track);
                        else if (e.key === 'Escape') cancelRename();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full rounded border border-input bg-background px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  ) : (
                    <div
                      className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold"
                      style={{ color: track.color || undefined }}
                      onClick={() => startRename(track)}
                      title="点击重命名"
                    >
                      <span className="truncate">{track.name}</span>
                      <EditIcon size={12} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {TRACK_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChangeColor(track, c)}
                        className="h-5 w-5 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        style={{
                          backgroundColor: c,
                          border:
                            track.color === c
                              ? '2px solid rgb(var(--foreground))'
                              : '2px solid transparent',
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                <TButton
                  size="small"
                  variant="text"
                  shape="square"
                  title={track.isVisible ? '隐藏此轨道' : '显示此轨道'}
                  onClick={() => handleToggleVisible(track)}
                >
                  {track.isVisible ? <EyesIcon size={14} /> : <EyesOffIcon size={14} />}
                </TButton>

                <TButton
                  size="small"
                  variant="text"
                  shape="square"
                  title="删除轨道"
                  onClick={() => handleDelete(track)}
                >
                  <DeleteIcon size={14} />
                </TButton>
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
