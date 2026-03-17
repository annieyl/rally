// // import { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router';
// // import { createClient } from '@supabase/supabase-js';
// // import ReactMarkdown from 'react-markdown';
// // import { PrimaryButton } from './ui/PrimaryButton';
// // import { SecondaryButton } from './ui/SecondaryButton';
// // import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';

// // const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// // const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
// // const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

// // const supabase =
// //   SUPABASE_URL && SUPABASE_ANON_KEY
// //     ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
// //     : null;

// // export function TranscriptSummary() {
// //   const { id } = useParams();
// //   const navigate = useNavigate();

// //   const [summary, setSummary] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState<string | null>(null);

// //   // On mount, check if a summary already exists in Supabase
// //   // (skipped for now per requirements — always generate fresh)
// //   // And then for the regenerated ones just ignore <- FIX LATER

// //   const handleGenerateSummary = async () => {
// //     setLoading(true);
// //     setError(null);
// //     setSummary(null);

// //     try {
// //       const res = await fetch(`${BACKEND_URL}/api/summarize/${id}`, {
// //         method: 'POST',
// //       });

// //       if (!res.ok) {
// //         const body = await res.json().catch(() => ({}));
// //         throw new Error(body?.detail ?? `Request failed with status ${res.status}`);
// //       }

// //       const data = await res.json();
// //       setSummary(data.summary);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Failed to generate summary.');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleApproveAndRoute = () => navigate(`/tagging/${id}`);
// //   const handleBack = () => navigate(`/transcript/${id}`);

// //   return (
// //     <div className="h-full flex flex-col">
// //       {/* Header */}
// //       <div className="bg-white border-b border-gray-200 px-8 py-4">
// //         <div className="flex items-center gap-4 mb-3">
// //           <SecondaryButton onClick={handleBack}>
// //             <ArrowLeft className="w-4 h-4" />
// //             Back to Transcript
// //           </SecondaryButton>
// //         </div>
// //         <h1 className="text-2xl font-semibold text-gray-900 mb-1">AI Summary</h1>
// //         <p className="text-sm text-gray-500">Session #{id}</p>
// //       </div>

// //       {/* Body */}
// //       <div className="flex-1 overflow-auto p-8 bg-[#F8F9FB]">
// //         <div className="max-w-4xl mx-auto">

// //           {/* Initial state — prompt to generate */}
// //           {!loading && !error && !summary && (
// //             <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
// //               <Sparkles className="w-10 h-10 text-indigo-400" />
// //               <p className="text-gray-600 text-sm max-w-sm">
// //                 Click below to generate an AI summary of this session's transcript.
// //               </p>
// //               <PrimaryButton onClick={handleGenerateSummary}>
// //                 Generate Summary
// //               </PrimaryButton>
// //             </div>
// //           )}

// //           {/* Loading */}
// //           {loading && (
// //             <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-500">
// //               <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
// //               <span className="text-sm">Generating summary...</span>
// //             </div>
// //           )}

// //           {/* Error */}
// //           {!loading && error && (
// //             <div className="space-y-4">
// //               <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
// //                 <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
// //                 <div>
// //                   <p className="font-medium text-sm">Failed to generate summary</p>
// //                   <p className="text-sm mt-1 text-red-600">{error}</p>
// //                 </div>
// //               </div>
// //               <SecondaryButton onClick={handleGenerateSummary}>
// //                 Retry
// //               </SecondaryButton>
// //             </div>
// //           )}

// //           {/* Summary */}
// //           {!loading && !error && summary && (
// //             <div className="space-y-6">
// //               <div className="bg-white border border-gray-200 rounded-xl p-6 prose prose-sm max-w-none text-gray-800">
// //                 <ReactMarkdown
// //                   components={{
// //                     h2: ({ children }) => (
// //                       <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2 first:mt-0">{children}</h2>
// //                     ),
// //                     p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
// //                     ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
// //                     ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>,
// //                     li: ({ children }) => <li className="leading-relaxed">{children}</li>,
// //                     strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
// //                   }}
// //                 >
// //                   {summary}
// //                 </ReactMarkdown>
// //               </div>

// //               <PrimaryButton onClick={handleApproveAndRoute} fullWidth>
// //                 Approve & Route to Tagging
// //               </PrimaryButton>
// //             </div>
// //           )}

// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { useState, useRef, useCallback, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router';
// import ReactMarkdown from 'react-markdown';
// import { PrimaryButton } from './ui/PrimaryButton';
// import { SecondaryButton } from './ui/SecondaryButton';
// import { ArrowLeft, Loader2, AlertCircle, Sparkles, MessageSquare, X, CheckCircle2 } from 'lucide-react';

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

// // ---------------------------------------------------------------------------
// // Types
// // ---------------------------------------------------------------------------

// interface Comment {
//   id: string;
//   highlightedText: string;
//   comment: string;
//   startOffset: number;
//   endOffset: number;
// }

// interface SelectionInfo {
//   text: string;
//   startOffset: number;
//   endOffset: number;
//   rect: DOMRect;
// }

// // ---------------------------------------------------------------------------
// // Helpers
// // ---------------------------------------------------------------------------

// function generateId() {
//   return Math.random().toString(36).slice(2, 9);
// }

// // ---------------------------------------------------------------------------
// // ApprovedView — read-only view shown after the summary is saved
// // ---------------------------------------------------------------------------

// interface ApprovedViewProps {
//   summary: string;
// }

// function ApprovedView({ summary }: ApprovedViewProps) {
//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       {/* Banner */}
//       <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
//         <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
//         <div>
//           <p className="text-sm font-semibold text-green-800">Summary approved and saved</p>
//           <p className="text-xs text-green-600 mt-0.5">This summary has been locked. Re-generate from the transcript page to make further changes.</p>
//         </div>
//       </div>

//       {/* Read-only summary */}
//       <div className="bg-white border border-gray-200 rounded-xl p-6 prose prose-sm max-w-none text-gray-800">
//         <ReactMarkdown
//           components={{
//             h2: ({ children }) => (
//               <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2 first:mt-0">{children}</h2>
//             ),
//             p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
//             ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
//             ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>,
//             li: ({ children }) => <li className="leading-relaxed">{children}</li>,
//             strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
//           }}
//         >
//           {summary}
//         </ReactMarkdown>
//       </div>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // CommentBubble
// // ---------------------------------------------------------------------------

// interface CommentBubbleProps {
//   selection: SelectionInfo;
//   onAdd: (text: string) => void;
//   onDismiss: () => void;
//   bubbleRef: React.RefObject<HTMLDivElement>;
// }

// function CommentBubble({ selection, onAdd, onDismiss, bubbleRef }: CommentBubbleProps) {
//   const [text, setText] = useState('');

//   return (
//     <div
//       ref={bubbleRef}
//       className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-72"
//       style={{
//         top: selection.rect.bottom + window.scrollY + 8,
//         left: Math.min(selection.rect.left + window.scrollX, window.innerWidth - 300),
//       }}
//     >
//       <p className="text-xs text-gray-500 mb-1 italic truncate">
//         "{selection.text.slice(0, 60)}{selection.text.length > 60 ? '…' : ''}"
//       </p>
//       <textarea
//         autoFocus
//         className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
//         rows={3}
//         placeholder="Add a comment…"
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             if (text.trim()) onAdd(text.trim());
//           }
//           if (e.key === 'Escape') onDismiss();
//         }}
//       />
//       <div className="flex justify-end gap-2 mt-2">
//         <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
//           Cancel
//         </button>
//         <button
//           disabled={!text.trim()}
//           onClick={() => onAdd(text.trim())}
//           className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg disabled:opacity-40 hover:bg-indigo-700"
//         >
//           Add
//         </button>
//       </div>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // CommentSidebar
// // ---------------------------------------------------------------------------

// interface CommentSidebarProps {
//   comments: Comment[];
//   onDelete: (id: string) => void;
// }

// function CommentSidebar({ comments, onDelete }: CommentSidebarProps) {
//   if (comments.length === 0) {
//     return (
//       <p className="text-sm text-gray-400 italic text-center mt-8">
//         Highlight text in the summary to add a comment.
//       </p>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       {comments.map((c) => (
//         <div key={c.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm relative group">
//           <p className="text-xs text-gray-500 italic mb-1 truncate">
//             "{c.highlightedText.slice(0, 50)}{c.highlightedText.length > 50 ? '…' : ''}"
//           </p>
//           <p className="text-gray-700 leading-relaxed">{c.comment}</p>
//           <button
//             onClick={() => onDelete(c.id)}
//             className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
//           >
//             <X className="w-3.5 h-3.5" />
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // SummaryWithHighlights
// // ---------------------------------------------------------------------------

// interface SummaryWithHighlightsProps {
//   summary: string;
//   comments: Comment[];
//   containerRef: React.RefObject<HTMLDivElement>;
//   onMouseUp: () => void;
// }

// function SummaryWithHighlights({ summary, comments, containerRef, onMouseUp }: SummaryWithHighlightsProps) {
//   const buildHighlightedText = () => {
//     if (comments.length === 0) return null;

//     const sorted = [...comments].sort((a, b) => a.startOffset - b.startOffset);
//     let result = '';
//     let cursor = 0;

//     for (const c of sorted) {
//       if (c.startOffset > cursor) {
//         result += summary.slice(cursor, c.startOffset);
//       }
//       const end = Math.min(c.endOffset, summary.length);
//       result += `<mark class="bg-yellow-200 rounded-sm">${summary.slice(c.startOffset, end)}</mark>`;
//       cursor = end;
//     }
//     result += summary.slice(cursor);
//     return result;
//   };

//   const highlighted = buildHighlightedText();

//   return (
//     <div
//       ref={containerRef}
//       onMouseUp={onMouseUp}
//       className="bg-white border border-gray-200 rounded-xl p-6 prose prose-sm max-w-none text-gray-800 select-text cursor-text"
//     >
//       {highlighted ? (
//         <div
//           className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
//           dangerouslySetInnerHTML={{ __html: highlighted }}
//         />
//       ) : (
//         <ReactMarkdown
//           components={{
//             h2: ({ children }) => (
//               <h2 className="text-base font-semibold text-gray-900 mt-6 mb-2 first:mt-0">{children}</h2>
//             ),
//             p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
//             ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
//             ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>,
//             li: ({ children }) => <li className="leading-relaxed">{children}</li>,
//             strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
//           }}
//         >
//           {summary}
//         </ReactMarkdown>
//       )}
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // Main component
// // ---------------------------------------------------------------------------

// export function TranscriptSummary() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [summary, setSummary] = useState<string | null>(null);
//   const [approved, setApproved] = useState(false); // true = locked read-only view
//   const [loading, setLoading] = useState(false);
//   const [regenerating, setRegenerating] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [regenerateError, setRegenerateError] = useState<string | null>(null);
//   const [saveError, setSaveError] = useState<string | null>(null);
//   const [regenerateSuccess, setRegenerateSuccess] = useState(false);

//   const [comments, setComments] = useState<Comment[]>([]);
//   const [pendingSelection, setPendingSelection] = useState<SelectionInfo | null>(null);

//   const summaryContainerRef = useRef<HTMLDivElement>(null);
//   const bubbleRef = useRef<HTMLDivElement>(null);

//   // Dismiss the comment bubble when clicking outside both the bubble and the summary
//   useEffect(() => {
//     const handleMouseDown = (e: MouseEvent) => {
//       if (!pendingSelection) return;
//       const target = e.target as Node;
//       const insideBubble = bubbleRef.current?.contains(target);
//       const insideSummary = summaryContainerRef.current?.contains(target);
//       if (!insideBubble && !insideSummary) {
//         setPendingSelection(null);
//       }
//     };
//     document.addEventListener('mousedown', handleMouseDown);
//     return () => document.removeEventListener('mousedown', handleMouseDown);
//   }, [pendingSelection]);

//   // ---- Generate initial summary ----

//   const handleGenerateSummary = async () => {
//     setLoading(true);
//     setError(null);
//     setSummary(null);
//     setComments([]);

//     try {
//       const res = await fetch(`${BACKEND_URL}/api/summarize/${id}`, { method: 'POST' });
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

//   // ---- Text selection → comment bubble ----

//   const handleMouseUp = useCallback(() => {
//     if (bubbleRef.current && bubbleRef.current.contains(document.activeElement)) return;

//     const selection = window.getSelection();
//     if (!selection || selection.isCollapsed) return;

//     const selectedText = selection.toString().trim();
//     if (!selectedText || !summaryContainerRef.current) return;

//     const range = selection.getRangeAt(0);
//     if (!summaryContainerRef.current.contains(range.commonAncestorContainer)) return;

//     const start = summary?.indexOf(selectedText) ?? -1;
//     if (start === -1) return;

//     setPendingSelection({
//       text: selectedText,
//       startOffset: start,
//       endOffset: start + selectedText.length,
//       rect: range.getBoundingClientRect(),
//     });
//   }, [summary]);

//   const handleAddComment = (commentText: string) => {
//     if (!pendingSelection) return;
//     setComments((prev) => [
//       ...prev,
//       {
//         id: generateId(),
//         highlightedText: pendingSelection.text,
//         comment: commentText,
//         startOffset: pendingSelection.startOffset,
//         endOffset: pendingSelection.endOffset,
//       },
//     ]);
//     setPendingSelection(null);
//     window.getSelection()?.removeAllRanges();
//   };

//   const handleDeleteComment = (commentId: string) => {
//     setComments((prev) => prev.filter((c) => c.id !== commentId));
//   };

//   // ---- Regenerate ----

//   const handleDoneWithEdits = async () => {
//     if (!summary || comments.length === 0) return;

//     setRegenerating(true);
//     setRegenerateError(null);
//     setRegenerateSuccess(false);

//     try {
//       const res = await fetch(`${BACKEND_URL}/api/summarize/${id}/regenerate`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ summary, comments }),
//       });

//       if (!res.ok) {
//         const body = await res.json().catch(() => ({}));
//         throw new Error(body?.detail ?? `Request failed with status ${res.status}`);
//       }

//       const data = await res.json();
//       setSummary(data.summary);
//       setComments([]);
//       setRegenerateSuccess(true);
//       setTimeout(() => setRegenerateSuccess(false), 3000);
//     } catch (err) {
//       setRegenerateError(err instanceof Error ? err.message : 'Failed to regenerate summary.');
//     } finally {
//       setRegenerating(false);
//     }
//   };

//   // ---- Save final summary ----

//   const saveSummary = async () => {
//     if (!summary) return;

//     setSaving(true);
//     setSaveError(null);

//     try {
//       const res = await fetch(`${BACKEND_URL}/api/summarize/${id}/approve`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ summary }),
//       });

//       if (!res.ok) {
//         const body = await res.json().catch(() => ({}));
//         throw new Error(body?.detail ?? `Request failed with status ${res.status}`);
//       }

//       // Switch to the locked read-only view
//       setApproved(true);
//       setComments([]);
//       setPendingSelection(null);
//     } catch (err) {
//       setSaveError(err instanceof Error ? err.message : 'Failed to save summary.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ---- Navigation ----

//   const handleBack = () => navigate(`/transcript/${id}`);

//   // ---------------------------------------------------------------------------
//   // Render
//   // ---------------------------------------------------------------------------

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
//         <div className="max-w-6xl mx-auto">

//           {/* ── APPROVED: locked read-only view ── */}
//           {approved && summary && (
//             <ApprovedView summary={summary} />
//           )}

//           {/* ── EDITING FLOW (not yet approved) ── */}
//           {!approved && (
//             <>
//               {/* Initial state */}
//               {!loading && !error && !summary && (
//                 <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
//                   <Sparkles className="w-10 h-10 text-indigo-400" />
//                   <p className="text-gray-600 text-sm max-w-sm">
//                     Click below to generate an AI summary of this session's transcript.
//                   </p>
//                   <PrimaryButton onClick={handleGenerateSummary}>
//                     Generate Summary
//                   </PrimaryButton>
//                 </div>
//               )}

//               {/* Loading */}
//               {loading && (
//                 <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-500">
//                   <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
//                   <span className="text-sm">Generating summary…</span>
//                 </div>
//               )}

//               {/* Error (initial generation) */}
//               {!loading && error && (
//                 <div className="space-y-4">
//                   <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
//                     <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="font-medium text-sm">Failed to generate summary</p>
//                       <p className="text-sm mt-1 text-red-600">{error}</p>
//                     </div>
//                   </div>
//                   <SecondaryButton onClick={handleGenerateSummary}>Retry</SecondaryButton>
//                 </div>
//               )}

//               {/* Summary + comment panel */}
//               {!loading && !error && summary && (
//                 <div className="flex gap-6 items-start relative">

//                   {/* ---- Left: summary ---- */}
//                   <div className="flex-1 min-w-0 space-y-4">

//                     <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
//                       <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
//                       Highlight any text to add a comment. When you're done, click "Done with edits" to regenerate.
//                     </div>

//                     <SummaryWithHighlights
//                       summary={summary}
//                       comments={comments}
//                       containerRef={summaryContainerRef}
//                       onMouseUp={handleMouseUp}
//                     />

//                     {regenerateError && (
//                       <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
//                         <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
//                         {regenerateError}
//                       </div>
//                     )}

//                     {regenerateSuccess && (
//                       <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
//                         <CheckCircle2 className="w-4 h-4" />
//                         Summary updated successfully!
//                       </div>
//                     )}

//                     {saveError && (
//                       <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
//                         <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
//                         {saveError}
//                       </div>
//                     )}

//                     <div className="flex gap-3">
//                       <PrimaryButton onClick={saveSummary} fullWidth disabled={saving}>
//                         {saving ? (
//                           <>
//                             <Loader2 className="w-4 h-4 animate-spin" />
//                             Saving…
//                           </>
//                         ) : (
//                           <>
//                             <CheckCircle2 className="w-4 h-4" />
//                             Approve &amp; Save
//                           </>
//                         )}
//                       </PrimaryButton>
//                     </div>
//                   </div>

//                   {/* ---- Right: comment sidebar ---- */}
//                   <div className="w-72 flex-shrink-0 sticky top-0">
//                     <div className="bg-white border border-gray-200 rounded-xl p-4">
//                       <div className="flex items-center justify-between mb-3">
//                         <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//                           <MessageSquare className="w-4 h-4 text-indigo-500" />
//                           Comments
//                           {comments.length > 0 && (
//                             <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs rounded-full px-1.5 py-0.5 font-medium">
//                               {comments.length}
//                             </span>
//                           )}
//                         </h3>
//                       </div>

//                       <CommentSidebar comments={comments} onDelete={handleDeleteComment} />

//                       {comments.length > 0 && (
//                         <button
//                           disabled={regenerating}
//                           onClick={handleDoneWithEdits}
//                           className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
//                         >
//                           {regenerating ? (
//                             <>
//                               <Loader2 className="w-4 h-4 animate-spin" />
//                               Regenerating…
//                             </>
//                           ) : (
//                             <>
//                               <Sparkles className="w-4 h-4" />
//                               Done with edits
//                             </>
//                           )}
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* ---- Floating comment bubble ---- */}
//                   {pendingSelection && (
//                     <CommentBubble
//                       selection={pendingSelection}
//                       onAdd={handleAddComment}
//                       onDismiss={() => setPendingSelection(null)}
//                       bubbleRef={bubbleRef}
//                     />
//                   )}
//                 </div>
//               )}
//             </>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { ArrowLeft, Loader2, AlertCircle, Sparkles, MessageSquare, X, CheckCircle2, Tag, User } from 'lucide-react';

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

  return {
    id: record.id,
    name: record.name,
    team: record.team,
  };
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
      assignees.push({
        id: record.assigneeId,
        name: record.assigneeName,
        team: legacyTeam,
      });
    }
  }

  const uniqueDepartments = [...new Set(departments)];
  const uniqueAssignees = assignees.filter(
    (assignee, index, self) => index === self.findIndex((other) => other.id === assignee.id)
  );

  return {
    id: record.id,
    highlightedText: record.highlightedText,
    comment: record.comment,
    startOffset: record.startOffset,
    endOffset: record.endOffset,
    departments: uniqueDepartments,
    assignees: uniqueAssignees,
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

  const visibleTeamMembers = teamMembers;

  const canSubmit = Boolean(text.trim() || selectedDepartments.length > 0 || selectedAssignees.length > 0);

  const submit = () => {
    if (!canSubmit) return;

    const mergedDepartments = new Set<DepartmentName>(selectedDepartments);
    selectedAssignees.forEach((assignee) => mergedDepartments.add(assignee.team));

    onAdd({
      text: text.trim(),
      departments: [...mergedDepartments],
      assignees: selectedAssignees.map((assignee) => ({
        id: assignee.id,
        name: assignee.name,
        team: assignee.team,
      })),
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
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
          if (e.key === 'Escape') onDismiss();
        }}
      />

      {(selectedDepartments.length > 0 || selectedAssignees.length > 0) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedDepartments.map((department) => (
            <span key={department} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getDepartmentStyle(department).chipClass}`}>
              {department}
            </span>
          ))}
          {selectedAssignees.map((assignee) => (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
              <User className="w-3 h-3" />
              {assignee.name}
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
          <Tag className="w-3.5 h-3.5" />
          Tag
        </button>

        {showTagPicker && (
          <div className="absolute left-0 top-9 z-10 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-3 space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Departments</p>
              <div className="flex flex-wrap gap-1.5">
                {departments.map((department) => (
                  <button
                    key={department}
                    type="button"
                    onClick={() => {
                      if (selectedDepartments.includes(department)) {
                        setSelectedDepartments((prev) => prev.filter((item) => item !== department));
                        return;
                      }
                      setSelectedDepartments((prev) => [...prev, department]);
                    }}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium border ${selectedDepartments.includes(department) ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                  >
                    {department}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Team Members</p>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {visibleTeamMembers.length > 0 ? (
                  visibleTeamMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        if (selectedAssigneeIds.includes(member.id)) {
                          setSelectedAssigneeIds((prev) => prev.filter((item) => item !== member.id));
                          return;
                        }
                        setSelectedAssigneeIds((prev) => [...prev, member.id]);
                        if (!selectedDepartments.includes(member.team)) {
                          setSelectedDepartments((prev) => [...prev, member.team]);
                        }
                      }}
                      className={`w-full text-left px-2 py-1 rounded-md text-[11px] border ${selectedAssigneeIds.includes(member.id) ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {member.name}
                      <span className="ml-1 text-gray-400">({member.team})</span>
                    </button>
                  ))
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No team members found for this department.</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
        <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
          Cancel
        </button>
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
              {c.departments.map((department) => (
                <span key={department} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${getDepartmentStyle(department).chipClass}`}>
                  {department}
                  <button
                    type="button"
                    title="Untag department"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveDepartment(c.id, department);
                    }}
                    className="inline-flex items-center justify-center rounded-full hover:bg-black/10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {c.assignees.map((assignee) => (
                <span key={assignee.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                  <User className="w-3 h-3" />
                  {assignee.name}
                  <button
                    type="button"
                    title="Untag assignee"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveAssignee(c.id, assignee.id);
                    }}
                    className="inline-flex items-center justify-center rounded-full hover:bg-black/10"
                  >
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
          <button
            type="button"
            onClick={() => onDelete(c.id)}
            title="Untag"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )})}
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

function SummaryWithHighlights({ summary, comments, pendingSelection, containerRef, onMouseUp }: SummaryWithHighlightsProps) {
  const buildHighlightedText = () => {
    if (comments.length === 0) return null;
    const sorted = [...comments].sort((a, b) => a.startOffset - b.startOffset);
    let result = '';
    let cursor = 0;
    for (const c of sorted) {
      if (c.startOffset > cursor) result += summary.slice(cursor, c.startOffset);
      const end = Math.min(c.endOffset, summary.length);
      const primaryDepartment = c.departments[0] ?? c.assignees[0]?.team;
      const style = getDepartmentStyle(primaryDepartment);
      result += `<mark class="${style.markClass} rounded-sm">${summary.slice(c.startOffset, end)}</mark>`;
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
      className="relative bg-white border border-gray-200 rounded-xl p-6 prose prose-sm max-w-none text-gray-800 select-text cursor-text"
    >
      {highlighted ? (
        <div
          className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      ) : (
        <SummaryMarkdown content={summary} />
      )}

      {pendingSelection && pendingSelection.rects.length > 0 && (
        <div className="pointer-events-none absolute inset-0">
          {pendingSelection.rects.map((rect, index) => (
            <div
              key={`${pendingSelection.startOffset}-${pendingSelection.endOffset}-${index}`}
              className="absolute rounded-sm bg-indigo-200/70"
              style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              }}
            />
          ))}
        </div>
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
  const [loading, setLoading] = useState(true); // always try to load existing summary on mount
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [regenerateSuccess, setRegenerateSuccess] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingSelection, setPendingSelection] = useState<SelectionInfo | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const commentsForRegeneration = comments.filter((c) => c.comment.trim().length > 0);
  const draftStorageKey = id ? `${SUMMARY_DRAFT_STORAGE_PREFIX}${id}` : null;
  const hasHydratedDraftRef = useRef(false);

  const summaryContainerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // On mount: try to load an existing summary (final → draft), then drop into edit mode.
  useEffect(() => {
    if (!id) { setLoading(false); return; }
    if (!supabase) { setLoading(false); return; }

    async function loadExistingSummary() {
      try {
        setLoading(true);
        setError(null);

        // Prefer the finalized version; fall back to draft.
        const paths = [`summaries/${id}_final.md`, `summaries/${id}.txt`];
        for (const path of paths) {
          const { data, error: dlError } = await supabase!.storage
            .from('transcripts')
            .download(path);
          if (!dlError && data) {
            setSummary(await data.text());
            return; // found one — stop searching
          }
        }
        // No existing summary found — leave summary null so the generate prompt shows.
      } catch (err) {
        console.error('Failed to probe existing summary:', err);
      } finally {
        setLoading(false);
      }
    }

    loadExistingSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  useEffect(() => {
    let cancelled = false;

    async function loadTeamMembers() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/teams/members`);
        if (!res.ok) return;

        const data = await res.json();
        if (!Array.isArray(data) || cancelled) return;

        const normalized: TeamMember[] = data
          .filter((item: unknown) => {
            if (!item || typeof item !== 'object') return false;
            const record = item as { team?: unknown };
            return isDepartment(record.team);
          })
          .map((item: { id?: unknown; team: DepartmentName; name?: unknown; role?: unknown; email?: unknown }) => ({
            id: typeof item.id === 'number' ? item.id : 0,
            team: item.team,
            name: typeof item.name === 'string' ? item.name : 'Unknown',
            role: typeof item.role === 'string' ? item.role : '',
            email: typeof item.email === 'string' ? item.email : '',
          }))
          .filter((member) => member.id > 0);

        setTeamMembers(normalized);
      } catch {
        setTeamMembers([]);
      }
    }

    loadTeamMembers();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!draftStorageKey || !summary || hasHydratedDraftRef.current) return;

    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) {
        hasHydratedDraftRef.current = true;
        return;
      }

      const parsed = JSON.parse(raw) as Partial<StoredSummaryDraft>;
      if (parsed.summary !== summary || !Array.isArray(parsed.comments)) {
        hasHydratedDraftRef.current = true;
        return;
      }

      const normalized = parsed.comments
        .map((item) => normalizeStoredComment(item))
        .filter((item): item is Comment => item !== null);

      setComments(normalized);
    } catch {
      // ignore invalid local draft payload
    } finally {
      hasHydratedDraftRef.current = true;
    }
  }, [draftStorageKey, summary]);

  useEffect(() => {
    if (!draftStorageKey || !summary || !hasHydratedDraftRef.current) return;

    const payload: StoredSummaryDraft = {
      summary,
      comments,
    };

    try {
      localStorage.setItem(draftStorageKey, JSON.stringify(payload));
    } catch {
      // ignore storage quota/access errors
    }
  }, [draftStorageKey, summary, comments]);

  // Dismiss comment bubble on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!pendingSelection) return;
      const target = e.target as Node;
      if (!bubbleRef.current?.contains(target) && !summaryContainerRef.current?.contains(target)) {
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
    if (bubbleRef.current?.contains(document.activeElement)) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const selectedText = selection.toString().trim();
    if (!selectedText || !summaryContainerRef.current) return;
    const range = selection.getRangeAt(0);
    if (!summaryContainerRef.current.contains(range.commonAncestorContainer)) return;
    const start = summary?.indexOf(selectedText) ?? -1;
    if (start === -1) return;

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
      text: selectedText,
      startOffset: start,
      endOffset: start + selectedText.length,
      rect: range.getBoundingClientRect(),
      rects,
    });
  }, [summary]);

  // TODO: for some reason after adding a comment, it's no longer
  // rendering the markdown.
  const handleAddComment = (payload: NewCommentPayload) => {
    if (!pendingSelection) return;
    setComments((prev) => [
      ...prev,
      {
        id: generateId(),
        highlightedText: pendingSelection.text,
        comment: payload.text,
        startOffset: pendingSelection.startOffset,
        endOffset: pendingSelection.endOffset,
        departments: payload.departments,
        assignees: payload.assignees,
      },
    ]);
    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleRemoveDepartmentTag = (commentId: string, department: DepartmentName) => {
    setComments((prev) =>
      prev.flatMap((comment) => {
        if (comment.id !== commentId) return [comment];

        const nextComment: Comment = {
          ...comment,
          departments: comment.departments.filter((item) => item !== department),
        };

        const hasText = nextComment.comment.trim().length > 0;
        const hasDepartment = nextComment.departments.length > 0;
        const hasAssignee = nextComment.assignees.length > 0;

        if (!hasText && !hasDepartment && !hasAssignee) {
          return [];
        }

        return [nextComment];
      })
    );
  };

  const handleRemoveAssigneeTag = (commentId: string, assigneeId: number) => {
    setComments((prev) =>
      prev.flatMap((comment) => {
        if (comment.id !== commentId) return [comment];

        const nextComment: Comment = {
          ...comment,
          assignees: comment.assignees.filter((assignee) => assignee.id !== assigneeId),
        };

        const hasText = nextComment.comment.trim().length > 0;
        const hasDepartment = nextComment.departments.length > 0;
        const hasAssignee = nextComment.assignees.length > 0;

        if (!hasText && !hasDepartment && !hasAssignee) {
          return [];
        }

        return [nextComment];
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

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-sm">Loading summary…</span>
            </div>
          )}

          {/* ── EDITING / COMMENTABLE FLOW (always) ── */}
          {!loading && (
            <>
              {/* Initial state */}
              {!error && !summary && (
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

              {/* Error */}
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

              {/* Summary + comment panel */}
              {!error && summary && (
                <div className="flex gap-6 items-start relative">

                  {/* ---- Left: summary ---- */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      Highlight any text to add a comment. When you're done, click "Done with edits" to regenerate.
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
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {regenerateError}
                      </div>
                    )}
                    {regenerateSuccess && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Summary updated successfully!
                      </div>
                    )}
                    {saveError && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {saveError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <PrimaryButton onClick={saveSummary} fullWidth disabled={saving}>
                        {saving ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                        ) : (
                          <><CheckCircle2 className="w-4 h-4" /> Approve &amp; Save</>
                        )}
                      </PrimaryButton>
                    </div>
                  </div>

                  {/* ---- Right: comment sidebar ---- */}
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
                          {regenerating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating…</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Done with edits</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ---- Floating comment bubble ---- */}
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