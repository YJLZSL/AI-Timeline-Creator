import { BookOpenIcon, PlusIcon } from '@/lib/icons';
import { TButton } from '@/components/ui-tdesign';
import { EmptyState } from '@/components/_shared/EmptyState';
import { OutlineHeader } from './OutlineHeader';
import { OutlineTrackSection } from './OutlineTrackSection';
import { OutlineHistoryDrawer } from './OutlineHistoryDrawer';
import { useOutlineState } from './hooks/useOutlineState';

export function OutlineView() {
  const state = useOutlineState();

  const {
    containerRef,
    workspaceId,
    tracks,
    characters,
    outlineVersions,
    deleteEvent,
    updateEvent,
    deleteOutlineVersion,
    selectedEventId,
    outlineFilterTrackId,
    setOutlineFilterTrackId,
    outlineFontSize,
    search,
    stageFilter,
    collapsedTracks,
    deletingEventId,
    editingEventId,
    editingTitle,
    editingSummary,
    dragSortState,
    dropIndicatorIndex,
    historyOpen,
    expandedVersionId,
    pendingRestoreId,
    pendingDeleteVersionId,
    eventsByTrack,
    visibleTracks,
    totalEvents,
    setSearch,
    setStageFilter,
    toggleTrack,
    setDeletingEventId,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    setEditingTitle,
    setEditingSummary,
    handleDragSortStart,
    setHistoryOpen,
    setExpandedVersionId,
    setPendingRestoreId,
    setPendingDeleteVersionId,
    openEventEditor,
    jumpToEventOnTimeline,
    saveOutlineSnapshot,
    handleRestoreVersion,
    renderDiffPreview,
    bindEventsListRef,
    ctx,
  } = state;

  return (
    <div ref={containerRef} className="h-full flex flex-col p-6 overflow-auto" style={{ fontSize: outlineFontSize }}>
      <OutlineHeader
        search={search}
        stageFilter={stageFilter}
        onSearchChange={setSearch}
        onStageFilterChange={setStageFilter}
        outlineFilterTrackId={outlineFilterTrackId}
        onClearFilter={() => setOutlineFilterTrackId(null)}
        workspaceId={workspaceId}
        onCreateEvent={() => ctx.createEvent()}
        onOpenHistory={() => {
          saveOutlineSnapshot('手动保存快照');
          setHistoryOpen(true);
        }}
      />

      {totalEvents === 0 && !search && stageFilter === 'all' ? (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            size="lg"
            icon={<BookOpenIcon size={40} className="text-primary/70" />}
            title="大纲还是一片空白"
            description="在时间轴上创建事件后，它们会在这里以卡片形式整齐排列，方便你随时编排与调整。"
            action={
              <TButton theme="success" size="small" disabled={!workspaceId} onClick={() => ctx.createEvent()}>
                <PlusIcon size={16} />
                新建章节
              </TButton>
            }
            className="max-w-sm w-full"
          />
        </div>
      ) : (
        <div className="space-y-5">
          {visibleTracks.map((track) => {
            const trackEvents = eventsByTrack.get(track.id) || [];
            const collapsed = collapsedTracks.has(track.id);
            return (
              <OutlineTrackSection
                key={track.id}
                track={track}
                events={trackEvents}
                collapsed={collapsed}
                onToggle={() => toggleTrack(track.id)}
                selectedEventId={selectedEventId}
                dragSortState={dragSortState}
                dropIndicatorIndex={dropIndicatorIndex}
                onDragSortStart={handleDragSortStart}
                onEventJump={jumpToEventOnTimeline}
                onEventEdit={handleStartEdit}
                onEventDelete={(eventId) => setDeletingEventId(eventId)}
                onEventSave={handleSaveEdit}
                onEventCancel={handleCancelEdit}
                editingEventId={editingEventId}
                editingTitle={editingTitle}
                editingSummary={editingSummary}
                onEditingTitleChange={setEditingTitle}
                onEditingSummaryChange={setEditingSummary}
                workspaceId={workspaceId}
                tracks={tracks}
                characters={characters}
                deleteEvent={deleteEvent}
                updateEvent={updateEvent}
                openEventEditor={openEventEditor}
                bindEventsListRef={bindEventsListRef}
                deletingEventId={deletingEventId}
              />
            );
          })}
        </div>
      )}

      <OutlineHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        versions={outlineVersions}
        onRestore={handleRestoreVersion}
        onDeleteVersion={(wsId, versionId) => {
          deleteOutlineVersion.mutate({ workspaceId: wsId, versionId });
        }}
        expandedVersionId={expandedVersionId}
        onToggleExpand={setExpandedVersionId}
        pendingRestoreId={pendingRestoreId}
        pendingDeleteVersionId={pendingDeleteVersionId}
        onSetPendingRestore={setPendingRestoreId}
        onSetPendingDelete={setPendingDeleteVersionId}
        workspaceId={workspaceId}
        renderDiffPreview={renderDiffPreview}
      />
    </div>
  );
}
