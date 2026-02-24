// import { useState } from 'react';
// import { useParams, useNavigate } from 'react-router';
// import { Card } from './ui/Card';
// import { PrimaryButton } from './ui/PrimaryButton';
// import { SecondaryButton } from './ui/SecondaryButton';
// import { Edit2, Check, ArrowLeft } from 'lucide-react';

// const transcriptMessages = [
//   { speaker: 'AI', time: '10:23', text: 'Hello! I\'m here to help you capture your project requirements. What kind of project are you looking to build?' },
//   { speaker: 'Client', time: '10:24', text: 'We need to build an e-commerce platform with a modern design and seamless checkout experience.' },
//   { speaker: 'AI', time: '10:24', text: 'Great! Let me gather more details. What are the key features you need for the e-commerce platform?' },
//   { speaker: 'Client', time: '10:25', text: 'We need product catalog, shopping cart, payment integration, user accounts, and an admin dashboard.' },
//   { speaker: 'AI', time: '10:26', text: 'Perfect! Do you have any specific requirements for the payment integration? Which payment providers would you like to support?' },
//   { speaker: 'Client', time: '10:27', text: 'We want to support Stripe and PayPal initially.' },
//   { speaker: 'AI', time: '10:27', text: 'Excellent. What about the tech stack? Do you have any preferences for frontend and backend technologies?' },
//   { speaker: 'Client', time: '10:28', text: 'We prefer React for the frontend and Node.js with PostgreSQL for the backend.' },
// ];

// export function TranscriptSummary() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [isEditing, setIsEditing] = useState(false);

//   const handleApproveAndRoute = () => {
//     navigate(`/tagging/${id}`);
//   };

//   const handleBack = () => {
//     navigate(`/transcript/${id}`);
//   };

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
//         <h1 className="text-2xl font-semibold text-gray-900 mb-1">
//           E-commerce Platform Redesign
//         </h1>
//         <p className="text-sm text-gray-500">Session #{id} • AI Generated Summary</p>
//       </div>

//       {/* AI Summary View */}
//       <div className="flex-1 overflow-auto p-8 bg-[#F8F9FB]">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-semibold text-gray-900">AI Generated Summary</h2>
//             <SecondaryButton onClick={() => setIsEditing(!isEditing)}>
//               <Edit2 className="w-4 h-4" />
//               Edit
//             </SecondaryButton>
//           </div>

//           <div className="space-y-6">
//             <Card>
//               <h3 className="font-semibold text-gray-900 mb-3">Project Overview</h3>
//               <p className="text-sm text-gray-700 leading-relaxed">
//                 Development of a modern e-commerce platform with seamless checkout experience. 
//                 The platform will include comprehensive product management, user authentication, 
//                 and payment processing capabilities.
//               </p>
//             </Card>

//             <Card>
//               <h3 className="font-semibold text-gray-900 mb-3">Key Requirements</h3>
//               <ul className="space-y-2 text-sm text-gray-700">
//                 <li className="flex items-start gap-2">
//                   <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                   <span>Product catalog with search and filtering</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                   <span>Shopping cart functionality</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                   <span>Payment integration (Stripe and PayPal)</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                   <span>User account management</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
//                   <span>Admin dashboard for management</span>
//                 </li>
//               </ul>
//             </Card>

//             <Card>
//               <h3 className="font-semibold text-gray-900 mb-3">Technical Stack</h3>
//               <div className="space-y-2 text-sm text-gray-700">
//                 <p><span className="font-medium">Frontend:</span> React</p>
//                 <p><span className="font-medium">Backend:</span> Node.js</p>
//                 <p><span className="font-medium">Database:</span> PostgreSQL</p>
//                 <p><span className="font-medium">Payments:</span> Stripe, PayPal</p>
//               </div>
//             </Card>

//             <Card>
//               <h3 className="font-semibold text-gray-900 mb-3">Constraints</h3>
//               <ul className="space-y-2 text-sm text-gray-700">
//                 <li>• Must support multiple payment providers</li>
//                 <li>• Requires secure user authentication</li>
//                 <li>• Admin dashboard needed for content management</li>
//               </ul>
//             </Card>

//             <Card>
//               <h3 className="font-semibold text-gray-900 mb-3">Open Questions</h3>
//               <ul className="space-y-2 text-sm text-gray-700">
//                 <li>• What is the expected timeline for the project?</li>
//                 <li>• Are there any specific design guidelines or brand requirements?</li>
//                 <li>• What is the expected traffic volume?</li>
//               </ul>
//             </Card>

//             <Card>
//               <h3 className="font-semibold text-gray-900 mb-3">Suggested Departments</h3>
//               <div className="flex flex-wrap gap-2">
//                 <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
//                   Frontend
//                 </span>
//                 <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
//                   Backend
//                 </span>
//                 <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
//                   Design
//                 </span>
//                 <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
//                   Business
//                 </span>
//               </div>
//             </Card>
//           </div>

//           <div className="mt-6">
//             <PrimaryButton onClick={handleApproveAndRoute} fullWidth>
//               Approve & Route to Tagging
//             </PrimaryButton>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export function TranscriptSummary() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if a summary already exists in Supabase
  // (skipped for now per requirements — always generate fresh)

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/summarize/${id}`, {
        method: 'POST',
      });

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

  const handleApproveAndRoute = () => navigate(`/tagging/${id}`);
  const handleBack = () => navigate(`/transcript/${id}`);

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
        <div className="max-w-4xl mx-auto">

          {/* Initial state — prompt to generate */}
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
              <span className="text-sm">Generating summary...</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Failed to generate summary</p>
                  <p className="text-sm mt-1 text-red-600">{error}</p>
                </div>
              </div>
              <SecondaryButton onClick={handleGenerateSummary}>
                Retry
              </SecondaryButton>
            </div>
          )}

          {/* Summary */}
          {!loading && !error && summary && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 prose prose-sm max-w-none text-gray-800">
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
              </div>

              <PrimaryButton onClick={handleApproveAndRoute} fullWidth>
                Approve & Route to Tagging
              </PrimaryButton>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}