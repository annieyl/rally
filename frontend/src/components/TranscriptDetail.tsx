import { useParams, useNavigate } from 'react-router';
import { Card } from './ui/Card';
import { PrimaryButton } from './ui/PrimaryButton';
import { SecondaryButton } from './ui/SecondaryButton';
import { ArrowLeft, Sparkles } from 'lucide-react';

const transcriptMessages = [
  { speaker: 'AI', time: '10:23', text: 'Hello! I\'m here to help you capture your project requirements. What kind of project are you looking to build?' },
  { speaker: 'Client', time: '10:24', text: 'We need to build an e-commerce platform with a modern design and seamless checkout experience.' },
  { speaker: 'AI', time: '10:24', text: 'Great! Let me gather more details. What are the key features you need for the e-commerce platform?' },
  { speaker: 'Client', time: '10:25', text: 'We need product catalog, shopping cart, payment integration, user accounts, and an admin dashboard.' },
  { speaker: 'AI', time: '10:26', text: 'Perfect! Do you have any specific requirements for the payment integration? Which payment providers would you like to support?' },
  { speaker: 'Client', time: '10:27', text: 'We want to support Stripe and PayPal initially.' },
  { speaker: 'AI', time: '10:27', text: 'Excellent. What about the tech stack? Do you have any preferences for frontend and backend technologies?' },
  { speaker: 'Client', time: '10:28', text: 'We prefer React for the frontend and Node.js with PostgreSQL for the backend.' },
  { speaker: 'AI', time: '10:29', text: 'Great choices! Do you have any specific design requirements or references?' },
  { speaker: 'Client', time: '10:30', text: 'We want a clean, modern design similar to Shopify or Amazon, but more minimal.' },
  { speaker: 'AI', time: '10:30', text: 'Understood. What about the timeline? When do you need this project completed?' },
  { speaker: 'Client', time: '10:31', text: 'We\'re aiming for a 3-month timeline if possible.' },
];

export function TranscriptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleViewSummary = () => {
    navigate(`/transcript/${id}/summary`);
  };

  const handleBack = () => {
    navigate('/transcripts');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-4 mb-3">
          <SecondaryButton onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </SecondaryButton>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              E-commerce Platform Redesign
            </h1>
            <p className="text-sm text-gray-500">Session #{id} • Full Transcript</p>
          </div>
          <PrimaryButton onClick={handleViewSummary}>
            <Sparkles className="w-5 h-5" />
            View AI Summary
          </PrimaryButton>
        </div>
      </div>

      {/* Transcript View */}
      <div className="flex-1 overflow-auto p-8 bg-[#F8F9FB]">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="space-y-6">
              {transcriptMessages.map((msg, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      msg.speaker === 'AI' ? 'text-indigo-600' : 'text-gray-900'
                    }`}>
                      {msg.speaker}
                    </span>
                    <span className="text-xs text-gray-400">{msg.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed pl-4 border-l-2 border-gray-200">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
