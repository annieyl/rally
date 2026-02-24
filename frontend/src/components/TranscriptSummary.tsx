import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from './ui/Card';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { Edit2, Check, ArrowLeft } from 'lucide-react';

const transcriptMessages = [
  { speaker: 'AI', time: '10:23', text: 'Hello! I\'m here to help you capture your project requirements. What kind of project are you looking to build?' },
  { speaker: 'Client', time: '10:24', text: 'We need to build an e-commerce platform with a modern design and seamless checkout experience.' },
  { speaker: 'AI', time: '10:24', text: 'Great! Let me gather more details. What are the key features you need for the e-commerce platform?' },
  { speaker: 'Client', time: '10:25', text: 'We need product catalog, shopping cart, payment integration, user accounts, and an admin dashboard.' },
  { speaker: 'AI', time: '10:26', text: 'Perfect! Do you have any specific requirements for the payment integration? Which payment providers would you like to support?' },
  { speaker: 'Client', time: '10:27', text: 'We want to support Stripe and PayPal initially.' },
  { speaker: 'AI', time: '10:27', text: 'Excellent. What about the tech stack? Do you have any preferences for frontend and backend technologies?' },
  { speaker: 'Client', time: '10:28', text: 'We prefer React for the frontend and Node.js with PostgreSQL for the backend.' },
];

export function TranscriptSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleApproveAndRoute = () => {
    navigate(`/tagging/${id}`);
  };

  const handleBack = () => {
    navigate(`/transcript/${id}`);
  };

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
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          E-commerce Platform Redesign
        </h1>
        <p className="text-sm text-gray-500">Session #{id} • AI Generated Summary</p>
      </div>

      {/* AI Summary View */}
      <div className="flex-1 overflow-auto p-8 bg-[#F8F9FB]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">AI Generated Summary</h2>
            <SecondaryButton onClick={() => setIsEditing(!isEditing)}>
              <Edit2 className="w-4 h-4" />
              Edit
            </SecondaryButton>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Project Overview</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Development of a modern e-commerce platform with seamless checkout experience. 
                The platform will include comprehensive product management, user authentication, 
                and payment processing capabilities.
              </p>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Key Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Product catalog with search and filtering</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Shopping cart functionality</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Payment integration (Stripe and PayPal)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>User account management</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Admin dashboard for management</span>
                </li>
              </ul>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Technical Stack</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Frontend:</span> React</p>
                <p><span className="font-medium">Backend:</span> Node.js</p>
                <p><span className="font-medium">Database:</span> PostgreSQL</p>
                <p><span className="font-medium">Payments:</span> Stripe, PayPal</p>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Constraints</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Must support multiple payment providers</li>
                <li>• Requires secure user authentication</li>
                <li>• Admin dashboard needed for content management</li>
              </ul>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Open Questions</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• What is the expected timeline for the project?</li>
                <li>• Are there any specific design guidelines or brand requirements?</li>
                <li>• What is the expected traffic volume?</li>
              </ul>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Suggested Departments</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  Frontend
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Backend
                </span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                  Design
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Business
                </span>
              </div>
            </Card>
          </div>

          <div className="mt-6">
            <PrimaryButton onClick={handleApproveAndRoute} fullWidth>
              Approve & Route to Tagging
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router';
// import { createClient } from '@supabase/supabase-js';
// import ReactMarkdown from 'react-markdown';
// import { Card } from './ui/Card';
// import { PrimaryButton } from './ui/PrimaryButton';
// import { SecondaryButton } from './ui/SecondaryButton';
// import { Edit2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

// /* ---------- Types ---------- */

// type TranscriptMessage = {
//   role: 'bot' | 'user';
//   message: string;
// };

// /* ---------- Supabase (safe init — won't crash if env vars missing) ---------- */

// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// const supabase =
//   SUPABASE_URL && SUPABASE_ANON_KEY
//     ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
//     : null;

// /* ---------- Component ---------- */

// export function TranscriptSummary() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [isEditing, setIsEditing] = useState(false);
//   const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchTranscript() {
//       if (!supabase) {
//         setError('Supabase is not configured. Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         const filePath = `transcripts/${id}.json`;

//         const { data, error: downloadError } = await supabase.storage
//           .from('transcripts')
//           .download(filePath);

//         if (downloadError) throw new Error(downloadError.message);

//         const text = await data.text();
//         const messages: TranscriptMessage[] = JSON.parse(text);

//         setTranscript(messages);
//       } catch (err) {
//         console.error('[TranscriptSummary] Failed to fetch transcript:', err);
//         setError(err instanceof Error ? err.message : 'Failed to load transcript.');
//       } finally {
//         setLoading(false);
//       }
//     }

//     if (id) fetchTranscript();
//   }, [id]);

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
//         <h1 className="text-2xl font-semibold text-gray-900 mb-1">Session Transcript</h1>
//         <p className="text-sm text-gray-500">Session #{id} • AI Generated Summary</p>
//       </div>

//       {/* Body */}
//       <div className="flex-1 overflow-auto p-8 bg-[#F8F9FB]">
//         <div className="max-w-4xl mx-auto">

//           {/* Loading */}
//           {loading && (
//             <div className="flex items-center justify-center py-24 gap-3 text-gray-500">
//               <Loader2 className="w-5 h-5 animate-spin" />
//               <span className="text-sm">Loading transcript...</span>
//             </div>
//           )}

//           {/* Error */}
//           {!loading && error && (
//             <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
//               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//               <div>
//                 <p className="font-medium text-sm">Failed to load transcript</p>
//                 <p className="text-sm mt-1 text-red-600">{error}</p>
//               </div>
//             </div>
//           )}

//           {/* Transcript */}
//           {!loading && !error && transcript.length > 0 && (
//             <>
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
//                 <SecondaryButton onClick={() => setIsEditing(!isEditing)}>
//                   <Edit2 className="w-4 h-4" />
//                   {isEditing ? 'Done' : 'Edit'}
//                 </SecondaryButton>
//               </div>

//               <div className="space-y-3">
//                 {transcript.map((msg, index) => {
//                   const isBot = msg.role === 'bot';
//                   return (
//                     <div
//                       key={index}
//                       className={`flex gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
//                     >
//                       {/* Avatar */}
//                       <div
//                         className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold
//                           ${isBot ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'}`}
//                       >
//                         {isBot ? 'AI' : 'U'}
//                       </div>

//                       {/* Bubble */}
//                       <div className={`max-w-[75%] ${isBot ? '' : 'flex flex-col items-end'}`}>
//                         <span className="text-xs font-medium text-gray-600 mb-1 block">
//                           {isBot ? 'AI' : 'Client'}
//                         </span>
//                         <div
//                           className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed
//                             ${isBot
//                               ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm prose prose-sm max-w-none'
//                               : 'bg-indigo-600 text-white rounded-tr-sm'
//                             }`}
//                         >
//                           {isBot ? (
//                             <ReactMarkdown>{msg.message}</ReactMarkdown>
//                           ) : (
//                             msg.message
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="mt-8">
//                 <PrimaryButton onClick={handleApproveAndRoute} fullWidth>
//                   Approve & Route to Tagging
//                 </PrimaryButton>
//               </div>
//             </>
//           )}

//           {/* Empty */}
//           {!loading && !error && transcript.length === 0 && (
//             <div className="text-center py-24 text-gray-400 text-sm">
//               No messages found for session #{id}.
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }