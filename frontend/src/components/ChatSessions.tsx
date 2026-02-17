import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { MessageSquare, Calendar, Tag } from 'lucide-react';
import { fetchSessions } from '../api/transcript';

interface RealSession {
  id: number;
  session_id: string;
  user_id?: string;
  transcript_url: string;
  created_at: string;
  ended_at: string;
}

// Mock sessions for fallback/examples
const mockSessions = [
  { id: 1, title: 'E-commerce Platform Redesign', status: 'completed', date: 'Feb 13, 2026', messages: 24, departments: ['Frontend', 'Backend', 'Design'] },
  { id: 2, title: 'API Integration Project', status: 'pending', date: 'Feb 13, 2026', messages: 18, departments: ['Backend'] },
  { id: 3, title: 'Mobile App Development', status: 'in-progress', date: 'Feb 12, 2026', messages: 32, departments: ['Frontend', 'Design'] },
];

export function ChatSessions() {
  const [sessions, setSessions] = useState<RealSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await fetchSessions();
        setSessions(data);
      } catch (err) {
        console.error('Failed to load sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Chat Sessions</h1>
        <p className="text-gray-600">View and manage all client requirement sessions</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Real sessions from database */}
        {sessions.map((session) => {
          const createdDate = new Date(session.created_at).toLocaleDateString();
          return (
            <Link key={session.id} to={`/chat/${session.session_id}`}>
              <Card hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Session {session.session_id}</h3>
                      <StatusBadge status="completed" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{createdDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Saved session</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}

        {/* Mock sessions as examples */}
        {mockSessions.map((session, idx) => (
          <Link key={`mock-${idx}`} to={`/chat/${session.id}`}>
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
