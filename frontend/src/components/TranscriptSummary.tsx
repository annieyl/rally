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