// import { useState, useRef, useCallback, useEffect } from 'react';
import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { ArrowLeft, Loader2, AlertCircle, Sparkles, MessageSquare, X, CheckCircle2, Tag, User } from 'lucide-react';
import { marked } from 'marked';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const SUMMARY_DRAFT_STORAGE_PREFIX = 'rally:summary-draft:';

const DEPARTMENTS = ['Frontend', 'Backend', 'Design', 'Business', 'DevOps', 'QA'] as const;
type DepartmentName = (typeof DEPARTMENTS)[number];

const DEFAULT_DEPARTMENT_STYLE = {
  markClass: 'bg-gray-200/80',
  cardClass: 'bg-gray-50',
  borderClass: 'border-gray-200',
  chipClass: 'bg-gray-200 text-gray-700',
  quoteClass: 'bg-gray-100 text-gray-700',
};

const DEPARTMENT_STYLE: Record<DepartmentName, typeof DEFAULT_DEPARTMENT_STYLE> = {
  Frontend: {
    markClass: 'bg-indigo-200/80',
    cardClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
    chipClass: 'bg-indigo-100 text-indigo-700',
    quoteClass: 'bg-indigo-100 text-indigo-700',
  },
  Backend: {
    markClass: 'bg-purple-200/80',
    cardClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    chipClass: 'bg-purple-100 text-purple-700',
    quoteClass: 'bg-purple-100 text-purple-700',
  },
  Design: {
    markClass: 'bg-pink-200/80',
    cardClass: 'bg-pink-50',
    borderClass: 'border-pink-200',
    chipClass: 'bg-pink-100 text-pink-700',
    quoteClass: 'bg-pink-100 text-pink-700',
  },
  Business: {
    markClass: 'bg-blue-200/80',
    cardClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    chipClass: 'bg-blue-100 text-blue-700',
    quoteClass: 'bg-blue-100 text-blue-700',
  },
  DevOps: {
    markClass: 'bg-green-200/80',
    cardClass: 'bg-green-50',
    borderClass: 'border-green-200',
    chipClass: 'bg-green-100 text-green-700',
    quoteClass: 'bg-green-100 text-green-700',
  },
  QA: {
    markClass: 'bg-amber-200/80',
    cardClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    chipClass: 'bg-amber-100 text-amber-700',
    quoteClass: 'bg-amber-100 text-amber-700',
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Comment {
  id: string;
  highlightedText: string;
  comment: string;
  startOffset: number;
  endOffset: number;
  departments: DepartmentName[];
  assignees: TaggedAssignee[];
}

interface TaggedAssignee {
  id: number;
  name: string;
  team: DepartmentName;
}

interface TeamMember {
  id: number;
  team: DepartmentName;
  name: string;
  role: string;
  email: string;
}

interface NewCommentPayload {
  text: string;
  departments: DepartmentName[];
  assignees: TaggedAssignee[];
}

interface StoredSummaryDraft {
  summary: string;
  comments: Comment[];
}

interface SelectionInfo {
  text: string;
  startOffset: number;
  endOffset: number;
  rect: DOMRect;
  rects: Array<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clearHighlights(container: HTMLElement) {
  container.querySelectorAll('mark[data-highlight]').forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  });
  container.normalize();
}

function getTextNodes(container: HTMLElement): Array<{ node: Text; start: number; end: number }> {
  const result: Array<{ node: Text; start: number; end: number }> = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let node = walker.nextNode() as Text | null;
  while (node) {
    const len = node.textContent?.length ?? 0;
    result.push({ node, start: offset, end: offset + len });
    offset += len;
    node = walker.nextNode() as Text | null;
  }
  return result;
}

function applyHighlights(
  container: HTMLElement,
  ranges: Array<{ start: number; end: number; className: string }>
) {
  clearHighlights(container);
  if (ranges.length === 0) return;
 
  // Sort descending by start so DOM mutations don't shift earlier offsets
  const sorted = [...ranges].sort((a, b) => b.start - a.start);
 
  for (const { start, end, className } of sorted) {
    // Re-collect text nodes each iteration because previous iterations
    // may have split/wrapped nodes, changing the DOM
    const textNodes = getTextNodes(container);
 
    // Find every text node that overlaps this range
    const affected = textNodes.filter((n) => n.end > start && n.start < end);
 
    // Process in reverse document order so splits don't affect earlier nodes
    for (const { node, start: nodeStart, end: nodeEnd } of [...affected].reverse()) {
      const overlapStart = Math.max(start, nodeStart) - nodeStart;
      const overlapEnd = Math.min(end, nodeEnd) - nodeStart;
 
      // Split off the portion before the highlight
      const targetNode = overlapStart > 0 ? node.splitText(overlapStart) : node;
 
      // Split off the portion after the highlight
      if (overlapEnd - overlapStart < (targetNode.textContent?.length ?? 0)) {
        targetNode.splitText(overlapEnd - overlapStart);
      }
 
      // Wrap just this text fragment in a <mark>
      const mark = document.createElement('mark');
      mark.className = className;
      mark.dataset.highlight = 'true'; // used by clearHighlights
      targetNode.parentNode?.insertBefore(mark, targetNode);
      mark.appendChild(targetNode);
    }
  }
}

function getCharOffset(root: Node, targetNode: Node, targetOffset: number): number {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let total = 0;
  let node = walker.nextNode();
  while (node) {
    if (node === targetNode) {
      return total + targetOffset;
    }
    total += node.textContent?.length ?? 0;
    node = walker.nextNode();
  }
  return total + targetOffset;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function isDepartment(team: unknown): team is DepartmentName {
  return typeof team === 'string' && DEPARTMENTS.includes(team as DepartmentName);
}

function getDepartmentStyle(department: DepartmentName | null | undefined) {
  return department ? DEPARTMENT_STYLE[department] : DEFAULT_DEPARTMENT_STYLE;
}

function normalizeStoredAssignee(raw: unknown): TaggedAssignee | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as { id?: unknown; name?: unknown; team?: unknown };
  if (
    typeof record.id !== 'number' ||
    typeof record.name !== 'string' ||
    !isDepartment(record.team)
  ) {
    return null;
  }
  return { id: record.id, name: record.name, team: record.team };
}

function normalizeStoredComment(raw: unknown): Comment | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as {
    id?: unknown;
    highlightedText?: unknown;
    comment?: unknown;
    startOffset?: unknown;
    endOffset?: unknown;
    departments?: unknown;
    assignees?: unknown;
    department?: unknown;
    assigneeId?: unknown;
    assigneeName?: unknown;
  };

  if (
    typeof record.id !== 'string' ||
    typeof record.highlightedText !== 'string' ||
    typeof record.comment !== 'string' ||
    typeof record.startOffset !== 'number' ||
    typeof record.endOffset !== 'number'
  ) {
    return null;
  }

  const departments = Array.isArray(record.departments)
    ? record.departments.filter((item): item is DepartmentName => isDepartment(item))
    : [];

  if (departments.length === 0 && isDepartment(record.department)) {
    departments.push(record.department);
  }

  const assignees = Array.isArray(record.assignees)
    ? record.assignees
        .map((item) => normalizeStoredAssignee(item))
        .filter((item): item is TaggedAssignee => item !== null)
    : [];

  if (
    assignees.length === 0 &&
    typeof record.assigneeId === 'number' &&
    typeof record.assigneeName === 'string'
  ) {
    const legacyTeam = isDepartment(record.department) ? record.department : departments[0] ?? null;
    if (legacyTeam) {
      assignees.push({ id: record.assigneeId, name: record.assigneeName, team: legacyTeam });
    }
  }

  return {
    id: record.id,
    highlightedText: record.highlightedText,
    comment: record.comment,
    startOffset: record.startOffset,
    endOffset: record.endOffset,
    departments: [...new Set(departments)],
    assignees: assignees.filter(
      (a, i, self) => i === self.findIndex((b) => b.id === a.id)
    ),
  };
}

// ---------------------------------------------------------------------------
// Shared markdown renderer
// ---------------------------------------------------------------------------

function SummaryMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2 first:mt-0">{children}</h2>
        ),
        p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ---------------------------------------------------------------------------
// CommentBubble
// ---------------------------------------------------------------------------

interface CommentBubbleProps {
  selection: SelectionInfo;
  onAdd: (payload: NewCommentPayload) => void;
  onDismiss: () => void;
  bubbleRef: React.RefObject<HTMLDivElement>;
  departments: readonly DepartmentName[];
  teamMembers: TeamMember[];
}

function CommentBubble({ selection, onAdd, onDismiss, bubbleRef, departments, teamMembers }: CommentBubbleProps) {
  const [text, setText] = useState('');
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<DepartmentName[]>([]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<number[]>([]);

  const selectedAssignees = teamMembers.filter((member) => selectedAssigneeIds.includes(member.id));
  const canSubmit = Boolean(text.trim() || selectedDepartments.length > 0 || selectedAssignees.length > 0);

  const submit = () => {
    if (!canSubmit) return;
    const mergedDepartments = new Set<DepartmentName>(selectedDepartments);
    selectedAssignees.forEach((a) => mergedDepartments.add(a.team));
    onAdd({
      text: text.trim(),
      departments: [...mergedDepartments],
      assignees: selectedAssignees.map((a) => ({ id: a.id, name: a.name, team: a.team })),
    });
  };

  return (
    <div
      ref={bubbleRef}
      className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-80"
      style={{
        top: selection.rect.bottom + window.scrollY + 8,
        left: Math.min(selection.rect.left + window.scrollX, window.innerWidth - 332),
      }}
    >
      <p className="text-xs text-gray-500 mb-1 italic truncate">
        "{selection.text.slice(0, 60)}{selection.text.length > 60 ? '…' : ''}"
      </p>
      <textarea
        autoFocus
        className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
        rows={3}
        placeholder="Add a comment…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === 'Escape') onDismiss();
        }}
      />

      {(selectedDepartments.length > 0 || selectedAssignees.length > 0) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedDepartments.map((d) => (
            <span key={d} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getDepartmentStyle(d).chipClass}`}>
              {d}
            </span>
          ))}
          {selectedAssignees.map((a) => (
            <span key={a.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
              <User className="w-3 h-3" />{a.name}
            </span>
          ))}
        </div>
      )}

      <div className="relative flex items-center justify-between mt-2">
        <button
          type="button"
          onClick={() => setShowTagPicker((prev) => !prev)}
          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50"
        >
          <Tag className="w-3.5 h-3.5" />Tag
        </button>

        {showTagPicker && (
          <div className="absolute left-0 top-9 z-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3 space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Departments</p>
              <div className="flex flex-wrap gap-1.5">
                {departments.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDepartments((prev) =>
                      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
                    )}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium border ${selectedDepartments.includes(d) ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Team Members</p>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {teamMembers.length > 0 ? teamMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedAssigneeIds((prev) =>
                        prev.includes(member.id) ? prev.filter((x) => x !== member.id) : [...prev, member.id]
                      );
                      if (!selectedDepartments.includes(member.team)) {
                        setSelectedDepartments((prev) => [...prev, member.team]);
                      }
                    }}
                    className={`w-full text-left px-2 py-1 rounded-md text-[11px] border ${selectedAssigneeIds.includes(member.id) ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    {member.name}<span className="ml-1 text-gray-400">({member.team})</span>
                  </button>
                )) : (
                  <p className="text-[11px] text-gray-400 italic">No team members found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">Cancel</button>
          <button
            disabled={!canSubmit}
            onClick={submit}
            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg disabled:opacity-40 hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommentSidebar
// ---------------------------------------------------------------------------

interface CommentSidebarProps {
  comments: Comment[];
  onDelete: (id: string) => void;
  onRemoveDepartment: (id: string, department: DepartmentName) => void;
  onRemoveAssignee: (id: string, assigneeId: number) => void;
}

function CommentSidebar({ comments, onDelete, onRemoveDepartment, onRemoveAssignee }: CommentSidebarProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic text-center mt-8">
        Highlight text in the summary to add a comment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => {
        const primaryDepartment = c.departments[0] ?? c.assignees[0]?.team;
        const style = getDepartmentStyle(primaryDepartment);
        return (
          <div key={c.id} className={`${style.cardClass} border ${style.borderClass} rounded-xl p-3 text-sm relative group`}>
            <p className={`${style.quoteClass} text-xs italic mb-2 truncate px-2 py-1 rounded-md`}>
              "{c.highlightedText.slice(0, 50)}{c.highlightedText.length > 50 ? '…' : ''}"
            </p>
            {(c.departments.length > 0 || c.assignees.length > 0) && (
              <div className="flex flex-wrap gap-1 mb-2">
                {c.departments.map((d) => (
                  <span key={d} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${getDepartmentStyle(d).chipClass}`}>
                    {d}
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveDepartment(c.id, d); }} className="inline-flex items-center justify-center rounded-full hover:bg-black/10">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {c.assignees.map((a) => (
                  <span key={a.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                    <User className="w-3 h-3" />{a.name}
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveAssignee(c.id, a.id); }} className="inline-flex items-center justify-center rounded-full hover:bg-black/10">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {c.comment ? (
              <p className="text-gray-700 leading-relaxed">{c.comment}</p>
            ) : (
              <p className="text-gray-500 italic">Tag only</p>
            )}
            <button type="button" onClick={() => onDelete(c.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SummaryWithHighlights
// ---------------------------------------------------------------------------

interface SummaryWithHighlightsProps {
  summary: string;
  comments: Comment[];
  pendingSelection: SelectionInfo | null;
  containerRef: React.RefObject<HTMLDivElement>;
  onMouseUp: () => void;
}
 
function SummaryWithHighlights({
  summary,
  comments,
  pendingSelection,
  containerRef,
  onMouseUp,
}: SummaryWithHighlightsProps) {
  // React-owned source of truth — hidden, never manually mutated
  const sourceRef = useRef<HTMLDivElement>(null);
 
  const html = marked(summary) as string;
 
  const ranges = [
    ...comments.map((c) => ({
      start: c.startOffset,
      end: c.endOffset,
      className: 'bg-yellow-200 rounded-sm',
    })),
    ...(pendingSelection
      ? [{ start: pendingSelection.startOffset, end: pendingSelection.endOffset, className: 'bg-yellow-200 rounded-sm' }]
      : []),
  ];
 
  const rangesKey = ranges.map((r) => `${r.start}-${r.end}`).join(',');
 
  // Whenever the clean HTML or highlight ranges change, re-clone the source
  // into the visible container and apply marks to the clone.
  useLayoutEffect(() => {
    if (!sourceRef.current || !containerRef.current) return;
    // Replace visible container's content with a fresh clone of the clean HTML
    containerRef.current.innerHTML = sourceRef.current.innerHTML;
    // Now mutate only the visible container — React never touches it
    applyHighlights(containerRef.current, ranges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, rangesKey]);
 
  return (
    <>
      {/* Hidden React-owned div — markdown rendered here, never mutated */}
      <div
        ref={sourceRef}
        style={{ display: 'none' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {/* Visible div — we own this DOM entirely, React never renders into it */}
      <div
        ref={containerRef}
        onMouseUp={onMouseUp}
        className="bg-white border border-gray-200 rounded-xl p-6 prose prose-sm max-w-none text-gray-800 select-text cursor-text"
      />
    </>
  );
}
 
// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TranscriptSummary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);

  // pendingSelection is mirrored into a ref so the once-registered mousedown
  // listener can read the current value without ever re-registering.
  const [pendingSelection, _setPendingSelection] = useState<SelectionInfo | null>(null);
  const pendingSelectionRef = useRef<SelectionInfo | null>(null);
  // Memoize the setter so it's stable across renders and safe to use in useCallback deps.
  const setPendingSelection = useCallback((val: SelectionInfo | null) => {
    pendingSelectionRef.current = val;
    _setPendingSelection(val);
  }, []); // no deps — _setPendingSelection from useState is always stable

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const commentsForRegeneration = comments.filter((c) => c.comment.trim().length > 0);
  const draftStorageKey = id ? `${SUMMARY_DRAFT_STORAGE_PREFIX}${id}` : null;
  const hasHydratedDraftRef = useRef(false);

  const summaryContainerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  // Keep a stable ref to the current summary so handleMouseUp doesn't need
  // to re-memoize every time the summary text changes.
  const summaryRef = useRef<string | null>(null);
  summaryRef.current = summary;

  // On mount: try to load an existing summary (final → draft).
  useEffect(() => {
    if (!id || !supabase) { setLoading(false); return; }

    async function loadExistingSummary() {
      try {
        setLoading(true);
        setError(null);
        const paths = [`summaries/${id}_final.md`, `summaries/${id}.txt`];
        for (const path of paths) {
          const { data, error: dlError } = await supabase!.storage.from('transcripts').download(path);
          if (!dlError && data) {
            setSummary(await data.text());
            return;
          }
        }
      } catch (err) {
        console.error('Failed to probe existing summary:', err);
      } finally {
        setLoading(false);
      }
    }

    loadExistingSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadTeamMembers() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/teams/members`);
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data) || cancelled) return;
        const normalized: TeamMember[] = data
          .filter((item: unknown) => item && typeof item === 'object' && isDepartment((item as { team?: unknown }).team))
          .map((item: { id?: unknown; team: DepartmentName; name?: unknown; role?: unknown; email?: unknown }) => ({
            id: typeof item.id === 'number' ? item.id : 0,
            team: item.team,
            name: typeof item.name === 'string' ? item.name : 'Unknown',
            role: typeof item.role === 'string' ? item.role : '',
            email: typeof item.email === 'string' ? item.email : '',
          }))
          .filter((m) => m.id > 0);
        setTeamMembers(normalized);
      } catch {
        setTeamMembers([]);
      }
    }
    loadTeamMembers();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!draftStorageKey || !summary || hasHydratedDraftRef.current) return;
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) { hasHydratedDraftRef.current = true; return; }
      const parsed = JSON.parse(raw) as Partial<StoredSummaryDraft>;
      if (parsed.summary !== summary || !Array.isArray(parsed.comments)) { hasHydratedDraftRef.current = true; return; }
      const normalized = parsed.comments.map(normalizeStoredComment).filter((x): x is Comment => x !== null);
      setComments(normalized);
    } catch { /* ignore */ } finally {
      hasHydratedDraftRef.current = true;
    }
  }, [draftStorageKey, summary]);

  useEffect(() => {
    if (!draftStorageKey || !summary || !hasHydratedDraftRef.current) return;
    try {
      localStorage.setItem(draftStorageKey, JSON.stringify({ summary, comments }));
    } catch { /* ignore */ }
  }, [draftStorageKey, summary, comments]);

  // Registered once — reads live values via refs, never needs to re-register.
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!pendingSelectionRef.current) return;
      const target = e.target as Node;
      if (!bubbleRef.current?.contains(target) && !summaryContainerRef.current?.contains(target)) {
        pendingSelectionRef.current = null;
        _setPendingSelection(null);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []); // empty — intentional

  // ---- Generate initial summary ----

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    setComments([]);
    try {
      const res = await fetch(`${BACKEND_URL}/api/summarize/${id}`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  // ---- Text selection → comment bubble ----
  // Uses summaryRef (not summary) so it never needs to re-memoize when summary changes,
  // and uses the stable setPendingSelection so its own identity is also stable.

    const handleMouseUp = useCallback(() => {
    if (bubbleRef.current?.contains(document.activeElement)) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const selectedText = selection.toString();
    if (!selectedText.trim() || !summaryContainerRef.current) return;
    const range = selection.getRangeAt(0);
    if (!summaryContainerRef.current.contains(range.commonAncestorContainer)) return;
 
    // Use TreeWalker to get character offsets that are reliable across
    // all node types and multi-line selections.
    const start = getCharOffset(summaryContainerRef.current, range.startContainer, range.startOffset);
    const end = getCharOffset(summaryContainerRef.current, range.endContainer, range.endOffset);
 
    const containerRect = summaryContainerRef.current.getBoundingClientRect();
    const rects = Array.from(range.getClientRects())
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({
        top: r.top - containerRect.top,
        left: r.left - containerRect.left,
        width: r.width,
        height: r.height,
      }));
 
    setPendingSelection({
      text: selectedText.trim(),
      startOffset: start,
      endOffset: end,
      rect: range.getBoundingClientRect(),
      rects,
    });
  }, [setPendingSelection]);
 

  const handleAddComment = useCallback((payload: NewCommentPayload) => {
    if (!pendingSelectionRef.current) return;
    const sel = pendingSelectionRef.current;
    setComments((prev) => [
      ...prev,
      {
        id: generateId(),
        highlightedText: sel.text,
        comment: payload.text,
        startOffset: sel.startOffset,
        endOffset: sel.endOffset,
        departments: payload.departments,
        assignees: payload.assignees,
      },
    ]);
    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();
  }, [setPendingSelection]);

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleRemoveDepartmentTag = (commentId: string, department: DepartmentName) => {
    setComments((prev) =>
      prev.flatMap((comment) => {
        if (comment.id !== commentId) return [comment];
        const next: Comment = { ...comment, departments: comment.departments.filter((d) => d !== department) };
        if (!next.comment.trim() && !next.departments.length && !next.assignees.length) return [];
        return [next];
      })
    );
  };

  const handleRemoveAssigneeTag = (commentId: string, assigneeId: number) => {
    setComments((prev) =>
      prev.flatMap((comment) => {
        if (comment.id !== commentId) return [comment];
        const next: Comment = { ...comment, assignees: comment.assignees.filter((a) => a.id !== assigneeId) };
        if (!next.comment.trim() && !next.departments.length && !next.assignees.length) return [];
        return [next];
      })
    );
  };

  // ---- Regenerate ----

  const handleDoneWithEdits = async () => {
    if (!summary || commentsForRegeneration.length === 0) return;
    setRegenerating(true);
    setRegenerateError(null);
    setRegenerateSuccess(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/summarize/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, comments: commentsForRegeneration }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setSummary(data.summary);
      setComments([]);
      setRegenerateSuccess(true);
      setTimeout(() => setRegenerateSuccess(false), 3000);
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : 'Failed to regenerate summary.');
    } finally {
      setRegenerating(false);
    }
  };

  // ---- Save final summary ----

  const saveSummary = async () => {
    if (!summary) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/summarize/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Request failed with status ${res.status}`);
      }
      setPendingSelection(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save summary.');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-4 mb-3">
          <SecondaryButton onClick={() => navigate(`/transcript/${id}`)}>
            <ArrowLeft className="w-4 h-4" />
            Back to Transcript
          </SecondaryButton>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">AI Summary</h1>
        <p className="text-sm text-gray-500">Session #{id}</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-8 bg-[#F8F9FB]">
        <div className="max-w-6xl mx-auto">

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-sm">Loading summary…</span>
            </div>
          )}

          {!loading && (
            <>
              {!error && !summary && (
                <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                  <Sparkles className="w-10 h-10 text-indigo-400" />
                  <p className="text-gray-600 text-sm max-w-sm">
                    Click below to generate an AI summary of this session's transcript.
                  </p>
                  <PrimaryButton onClick={handleGenerateSummary}>Generate Summary</PrimaryButton>
                </div>
              )}

              {error && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Failed to generate summary</p>
                      <p className="text-sm mt-1 text-red-600">{error}</p>
                    </div>
                  </div>
                  <SecondaryButton onClick={handleGenerateSummary}>Retry</SecondaryButton>
                </div>
              )}

              {!error && summary && (
                <div className="flex gap-6 items-start relative">

                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      Highlight any text to add a comment or tag. If you wish to regenerate from your edits, click "Done with edits".
                    </div>

                    <SummaryWithHighlights
                      summary={summary}
                      comments={comments}
                      pendingSelection={pendingSelection}
                      containerRef={summaryContainerRef}
                      onMouseUp={handleMouseUp}
                    />

                    {regenerateError && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{regenerateError}
                      </div>
                    )}
                    {regenerateSuccess && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                        <CheckCircle2 className="w-4 h-4" />Summary updated successfully!
                      </div>
                    )}
                    {saveError && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{saveError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <PrimaryButton onClick={saveSummary} fullWidth disabled={saving}>
                        {saving
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                          : <><CheckCircle2 className="w-4 h-4" /> Approve &amp; Save</>
                        }
                      </PrimaryButton>
                    </div>
                  </div>

                  <div className="w-72 flex-shrink-0 sticky top-0">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-3">
                        <MessageSquare className="w-4 h-4 text-indigo-500" />
                        Comments
                        {comments.length > 0 && (
                          <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs rounded-full px-1.5 py-0.5 font-medium">
                            {comments.length}
                          </span>
                        )}
                      </h3>

                      <CommentSidebar
                        comments={comments}
                        onDelete={handleDeleteComment}
                        onRemoveDepartment={handleRemoveDepartmentTag}
                        onRemoveAssignee={handleRemoveAssigneeTag}
                      />

                      {commentsForRegeneration.length > 0 && (
                        <button
                          type="button"
                          disabled={regenerating}
                          onClick={handleDoneWithEdits}
                          className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
                        >
                          {regenerating
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating…</>
                            : <><Sparkles className="w-4 h-4" /> Done with edits</>
                          }
                        </button>
                      )}
                    </div>
                  </div>

                  {pendingSelection && (
                    <CommentBubble
                      selection={pendingSelection}
                      onAdd={handleAddComment}
                      onDismiss={() => setPendingSelection(null)}
                      bubbleRef={bubbleRef}
                      departments={DEPARTMENTS}
                      teamMembers={teamMembers}
                    />
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}