import { Link } from 'react-router';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { MessageSquare, Calendar, FileText } from 'lucide-react';

const transcripts = [
  { id: 1, title: 'E-commerce Platform Redesign', status: 'completed', date: 'Feb 13, 2026', messages: 24, duration: '45 min' },
  { id: 2, title: 'API Integration Project', status: 'completed', date: 'Feb 13, 2026', messages: 18, duration: '32 min' },
  { id: 3, title: 'Mobile App Development', status: 'completed', date: 'Feb 12, 2026', messages: 32, duration: '58 min' },
  { id: 4, title: 'CRM System Enhancement', status: 'completed', date: 'Feb 12, 2026', messages: 28, duration: '48 min' },
  { id: 5, title: 'Analytics Dashboard', status: 'completed', date: 'Feb 11, 2026', messages: 22, duration: '38 min' },
  { id: 6, title: 'Customer Portal Rebuild', status: 'completed', date: 'Feb 11, 2026', messages: 35, duration: '62 min' },
];

export function Transcripts() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Transcripts</h1>
        <p className="text-gray-600">View all chat session transcripts</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {transcripts.map((transcript) => (
          <Link key={transcript.id} to={`/transcript/${transcript.id}`}>
            <Card hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{transcript.title}</h3>
                    <StatusBadge status={transcript.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{transcript.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{transcript.messages} messages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{transcript.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
