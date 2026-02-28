// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router';
// import { createClient } from '@supabase/supabase-js';
// import ReactMarkdown from 'react-markdown';
// import { PrimaryButton } from './ui/PrimaryButton';
// import { SecondaryButton } from './ui/SecondaryButton';
// import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

// const supabase =
//   SUPABASE_URL && SUPABASE_ANON_KEY
//     ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
//     : null;

// export function TranscriptSummary() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [summary, setSummary] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // On mount, check if a summary already exists in Supabase
//   // (skipped for now per requirements — always generate fresh)
//   // And then for the regenerated ones just ignore <- FIX LATER

//   const handleGenerateSummary = async () => {
//     setLoading(true);
//     setError(null);
//     setSummary(null);

//     try {
//       const res = await fetch(`${BACKEND_URL}/api/summarize/${id}`, {
//         method: 'POST',
//       });

//       if (!res.ok) {
//         const body = await res.json().catch(() => ({}));
//         throw new Error(body?.detail ?? `Request failed with status ${res.status}`);
//       }

//       const data = await res.json();
//       setSummary(data.summary);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to generate summary.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApproveAndRoute = () => navigate(`/tagging/${id}`);
//   const handleBack = () => navigate(`/transcript/${id}`);

//   return (
//     <div className="h-full flex flex-col">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 px-8 py-4">
//         <div className="flex items-center gap-4 mb-3">
//           <SecondaryButton onClick={handleBack}>
//             <ArrowLeft className="w-4 h-4" />
//             Back to Transcript
//           </SecondaryButton>
//         </div>
//         <h1 className="text-2xl font-semibold text-gray-900 mb-1">AI Summary</h1>
//         <p className="text-sm text-gray-500">Session #{id}</p>
//       </div>

//       {/* Body */}
//       <div className="flex-1 overflow-auto p-8 bg-[#F8F9FB]">
//         <div className="max-w-4xl mx-auto">

//           {/* Initial state — prompt to generate */}
//           {!loading && !error && !summary && (
//             <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
//               <Sparkles className="w-10 h-10 text-indigo-400" />
//               <p className="text-gray-600 text-sm max-w-sm">
//                 Click below to generate an AI summary of this session's transcript.
//               </p>
//               <PrimaryButton onClick={handleGenerateSummary}>
//                 Generate Summary
//               </PrimaryButton>
//             </div>
//           )}

//           {/* Loading */}
//           {loading && (
//             <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-500">
//               <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
//               <span className="text-sm">Generating summary...</span>
//             </div>
//           )}

//           {/* Error */}
//           {!loading && error && (
//             <div className="space-y-4">
//               <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
//                 <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <p className="font-medium text-sm">Failed to generate summary</p>
//                   <p className="text-sm mt-1 text-red-600">{error}</p>
//                 </div>
//               </div>
//               <SecondaryButton onClick={handleGenerateSummary}>
//                 Retry
//               </SecondaryButton>
//             </div>
//           )}

//           {/* Summary */}
//           {!loading && !error && summary && (
//             <div className="space-y-6">
//               <div className="bg-white border border-gray-200 rounded-xl p-6 prose prose-sm max-w-none text-gray-800">
//                 <ReactMarkdown
//                   components={{
//                     h2: ({ children }) => (
//                       <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2 first:mt-0">{children}</h2>
//                     ),
//                     p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
//                     ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
//                     ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>,
//                     li: ({ children }) => <li className="leading-relaxed">{children}</li>,
//                     strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
//                   }}
//                 >
//                   {summary}
//                 </ReactMarkdown>
//               </div>

//               <PrimaryButton onClick={handleApproveAndRoute} fullWidth>
//                 Approve & Route to Tagging
//               </PrimaryButton>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import ReactMarkdown from 'react-markdown';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { ArrowLeft, Loader2, AlertCircle, Sparkles, MessageSquare, X, CheckCircle2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Comment {
  id: string;
  highlightedText: string;
  comment: string;
  /** Character offsets within the plain-text summary, used to re-highlight */
  startOffset: number;
  endOffset: number;
}

interface SelectionInfo {
  text: string;
  startOffset: number;
  endOffset: number;
  /** Bounding rect of the selection for positioning the popover */
  rect: DOMRect;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

// ---------------------------------------------------------------------------
// CommentBubble — the little popover that appears after selecting text
// ---------------------------------------------------------------------------

interface CommentBubbleProps {
  selection: SelectionInfo;
  onAdd: (text: string) => void;
  onDismiss: () => void;
  bubbleRef: React.RefObject<HTMLDivElement>;
}

function CommentBubble({ selection, onAdd, onDismiss, bubbleRef }: CommentBubbleProps) {
  const [text, setText] = useState('');

  return (
    <div
      ref={bubbleRef}
      className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-72"
      style={{
        top: selection.rect.bottom + window.scrollY + 8,
        left: Math.min(selection.rect.left + window.scrollX, window.innerWidth - 300),
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
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) onAdd(text.trim());
          }
          if (e.key === 'Escape') onDismiss();
        }}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onDismiss}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
        >
          Cancel
        </button>
        <button
          disabled={!text.trim()}
          onClick={() => onAdd(text.trim())}
          className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg disabled:opacity-40 hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommentSidebar — list of all comments with delete
// ---------------------------------------------------------------------------

interface CommentSidebarProps {
  comments: Comment[];
  onDelete: (id: string) => void;
}

function CommentSidebar({ comments, onDelete }: CommentSidebarProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic text-center mt-8">
        Highlight text in the summary to add a comment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm relative group">
          <p className="text-xs text-gray-500 italic mb-1 truncate">
            "{c.highlightedText.slice(0, 50)}{c.highlightedText.length > 50 ? '…' : ''}"
          </p>
          <p className="text-gray-700 leading-relaxed">{c.comment}</p>
          <button
            onClick={() => onDelete(c.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SummaryWithHighlights — renders markdown and applies yellow highlight spans
// for already-saved comments
// ---------------------------------------------------------------------------

interface SummaryWithHighlightsProps {
  summary: string;
  comments: Comment[];
  containerRef: React.RefObject<HTMLDivElement>;
  onMouseUp: () => void;
}

function SummaryWithHighlights({ summary, comments, containerRef, onMouseUp }: SummaryWithHighlightsProps) {
  /**
   * Build a highlighted HTML string by marking all comment ranges.
   * We operate on the raw markdown text so offsets stay stable.
   */
  const buildHighlightedText = () => {
    if (comments.length === 0) return null;

    // Sort by start offset so we can walk through in order
    const sorted = [...comments].sort((a, b) => a.startOffset - b.startOffset);

    let result = '';
    let cursor = 0;

    for (const c of sorted) {
      if (c.startOffset > cursor) {
        result += summary.slice(cursor, c.startOffset);
      }
      const end = Math.min(c.endOffset, summary.length);
      result += `<mark class="bg-yellow-200 rounded-sm">${summary.slice(c.startOffset, end)}</mark>`;
      cursor = end;
    }
    result += summary.slice(cursor);
    return result;
  };

  const highlighted = buildHighlightedText();

  return (
    <div
      ref={containerRef}
      onMouseUp={onMouseUp}
      className="bg-white border border-gray-200 rounded-xl p-6 prose prose-sm max-w-none text-gray-800 select-text cursor-text"
    >
      {highlighted ? (
        // Render raw highlighted HTML — markdown rendering and highlight spans
        // don't compose cleanly, so we fall back to a plain <pre>-style render
        // with highlight markup when comments exist.
        <div
          className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      ) : (
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
          {summary}
        </ReactMarkdown>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TranscriptSummary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingSelection, setPendingSelection] = useState<SelectionInfo | null>(null);

  const summaryContainerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Dismiss the comment bubble when clicking outside both the bubble and the summary
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!pendingSelection) return;
      const target = e.target as Node;
      const insideBubble = bubbleRef.current?.contains(target);
      const insideSummary = summaryContainerRef.current?.contains(target);
      if (!insideBubble && !insideSummary) {
        setPendingSelection(null);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [pendingSelection]);

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

  const handleMouseUp = useCallback(() => {
    // If the user is typing inside the bubble, don't overwrite it
    if (bubbleRef.current && bubbleRef.current.contains(document.activeElement)) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || !summaryContainerRef.current) return;

    // Make sure the selection is inside our summary container
    const range = selection.getRangeAt(0);
    if (!summaryContainerRef.current.contains(range.commonAncestorContainer)) return;

    const start = summary?.indexOf(selectedText) ?? -1;
    if (start === -1) return;

    setPendingSelection({
      text: selectedText,
      startOffset: start,
      endOffset: start + selectedText.length,
      rect: range.getBoundingClientRect(),
    });
  }, [summary]);

  const handleAddComment = (commentText: string) => {
    if (!pendingSelection) return;
    const newComment: Comment = {
      id: generateId(),
      highlightedText: pendingSelection.text,
      comment: commentText,
      startOffset: pendingSelection.startOffset,
      endOffset: pendingSelection.endOffset,
    };
    setComments((prev) => [...prev, newComment]);
    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDeleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  // ---- Regenerate ----

  const handleDoneWithEdits = async () => {
    if (!summary || comments.length === 0) return;

    setRegenerating(true);
    setRegenerateError(null);
    setRegenerateSuccess(false);

    try {
      const res = await fetch(`${BACKEND_URL}/api/summarize/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, comments }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setSummary(data.summary);
      setComments([]); // Clear comments — they've been incorporated
      setRegenerateSuccess(true);
      setTimeout(() => setRegenerateSuccess(false), 3000);
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : 'Failed to regenerate summary.');
    } finally {
      setRegenerating(false);
    }
  };

  // ---- Navigation ----

  const handleApproveAndRoute = () => navigate(`/tagging/${id}`);
  const handleBack = () => navigate(`/transcript/${id}`);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-4 mb-3">
          <SecondaryButton onClick={handleBack}>
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

          {/* Initial state */}
          {!loading && !error && !summary && (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <Sparkles className="w-10 h-10 text-indigo-400" />
              <p className="text-gray-600 text-sm max-w-sm">
                Click below to generate an AI summary of this session's transcript.
              </p>
              <PrimaryButton onClick={handleGenerateSummary}>
                Generate Summary
              </PrimaryButton>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-sm">Generating summary…</span>
            </div>
          )}

          {/* Error (initial generation) */}
          {!loading && error && (
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

          {/* Summary + comment panel */}
          {!loading && !error && summary && (
            <div className="flex gap-6 items-start relative">

              {/* ---- Left: summary ---- */}
              <div className="flex-1 min-w-0 space-y-4">

                {/* Hint banner */}
                <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  Highlight any text to add a comment. When you're done, click "Done with edits" to regenerate.
                </div>

                <SummaryWithHighlights
                  summary={summary}
                  comments={comments}
                  containerRef={summaryContainerRef}
                  onMouseUp={handleMouseUp}
                />

                {/* Regenerate error */}
                {regenerateError && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {regenerateError}
                  </div>
                )}

                {/* Success flash */}
                {regenerateSuccess && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Summary updated successfully!
                  </div>
                )}

                {/* Action row */}
                <div className="flex gap-3">
                  <PrimaryButton onClick={handleApproveAndRoute} fullWidth>
                    Approve &amp; Route to Tagging
                  </PrimaryButton>
                </div>
              </div>

              {/* ---- Right: comment sidebar ---- */}
              <div className="w-72 flex-shrink-0 sticky top-0">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      Comments
                      {comments.length > 0 && (
                        <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs rounded-full px-1.5 py-0.5 font-medium">
                          {comments.length}
                        </span>
                      )}
                    </h3>
                  </div>

                  <CommentSidebar comments={comments} onDelete={handleDeleteComment} />

                  {comments.length > 0 && (
                    <button
                      disabled={regenerating}
                      onClick={handleDoneWithEdits}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
                    >
                      {regenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Regenerating…
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Done with edits
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* ---- Floating comment bubble (on text selection) ---- */}
              {pendingSelection && (
                <CommentBubble
                  selection={pendingSelection}
                  onAdd={handleAddComment}
                  onDismiss={() => setPendingSelection(null)}
                  bubbleRef={bubbleRef}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}