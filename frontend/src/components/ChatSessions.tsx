import { Link } from 'react-router';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { MessageSquare, Calendar, Tag } from 'lucide-react';

const sessions = [
  { id: 1, title: 'E-commerce Platform Redesign', status: 'completed', date: 'Feb 13, 2026', messages: 24, departments: ['Frontend', 'Backend', 'Design'] },
  { id: 2, title: 'API Integration Project', status: 'pending', date: 'Feb 13, 2026', messages: 18, departments: ['Backend'] },
  { id: 3, title: 'Mobile App Development', status: 'in-progress', date: 'Feb 12, 2026', messages: 32, departments: ['Frontend', 'Design'] },
  { id: 4, title: 'CRM System Enhancement', status: 'completed', date: 'Feb 12, 2026', messages: 28, departments: ['Business', 'Backend'] },
  { id: 5, title: 'Analytics Dashboard', status: 'completed', date: 'Feb 11, 2026', messages: 22, departments: ['Frontend'] },
  { id: 6, title: 'Customer Portal Rebuild', status: 'completed', date: 'Feb 11, 2026', messages: 35, departments: ['Frontend', 'Backend'] },
];

export function ChatSessions() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Chat Sessions</h1>
        <p className="text-gray-600">View and manage all client requirement sessions</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sessions.map((session) => (
          <Link key={session.id} to={`/chat/${session.id}`}>
            <Card hover>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                    <StatusBadge status={session.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{session.messages} messages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>{session.departments.join(', ')}</span>
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
