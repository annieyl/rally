import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from './ui/Card';
import { TagChip } from './ui/TagChip';
import { PrimaryButton } from './ui/PrimaryButton';
import { StepProgress } from './ui/StepProgress';
import { CheckCircle2, Loader2 } from 'lucide-react';

const departments = ['Frontend', 'Backend', 'Design', 'Business', 'DevOps', 'QA'];

const steps = [
  { label: 'Chat Completed', status: 'completed' },
  { label: 'Transcript Generated', status: 'completed' },
  { label: 'Summary Created', status: 'completed' },
  { label: 'Tagged', status: 'current' },
  { label: 'Routed', status: 'pending' },
];

export function TaggingRouting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDepartments, setSelectedDepartments] = useState(['Frontend', 'Backend', 'Design', 'Business']);
  const [notes, setNotes] = useState('Client prefers React and Node.js. Payment integration is critical. Estimated 3-month timeline.');
  const [isRouting, setIsRouting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments(prev =>
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleSendToTeams = () => {
    setIsRouting(true);
    setTimeout(() => {
      setIsRouting(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Department Tagging & Team Routing
          </h1>
          <p className="text-sm text-gray-500">Session #{id} • E-commerce Platform Redesign</p>
        </div>

        {/* Status Progress */}
        <Card className="mb-8">
          <StepProgress steps={steps} />
        </Card>

        {/* Summary Card */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Summary</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-medium">Project:</span> E-commerce platform with product catalog, 
              shopping cart, payment integration, user accounts, and admin dashboard.
            </p>
            <p>
              <span className="font-medium">Tech Stack:</span> React (Frontend), Node.js + PostgreSQL (Backend)
            </p>
            <p>
              <span className="font-medium">Key Features:</span> Stripe & PayPal integration, user authentication, 
              admin dashboard
            </p>
          </div>
        </Card>

        {/* Department Tagging */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Departments</h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose which departments should receive this project
          </p>
          <div className="flex flex-wrap gap-3">
            {departments.map((dept) => (
              <TagChip
                key={dept}
                label={dept}
                selected={selectedDepartments.includes(dept)}
                onClick={() => toggleDepartment(dept)}
              />
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-900"
            rows={4}
            placeholder="Add any additional context or notes for the teams..."
          />
        </Card>

        {/* Send Button */}
        <div className="flex justify-end">
          <PrimaryButton 
            onClick={handleSendToTeams}
            disabled={selectedDepartments.length === 0 || isRouting}
          >
            {isRouting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Routing to Teams...
              </>
            ) : (
              'Send to Teams'
            )}
          </PrimaryButton>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Successfully Routed!
              </h3>
              <p className="text-sm text-gray-600">
                Project has been sent to {selectedDepartments.length} department{selectedDepartments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
