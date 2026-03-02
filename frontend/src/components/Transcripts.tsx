import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { MessageSquare, Calendar, FileText } from 'lucide-react';
import { fetchSessions, getTranscript } from '../api/transcript';

interface Session {
  id: number;
  session_id: string;
  user_id?: string;
  transcript_url: string;
  created_at: string;
  ended_at: string;
}

// Mock transcripts for examples
const mockTranscripts = [
  { id: 1, title: 'E-commerce Platform Redesign', status: 'completed', date: 'Feb 13, 2026', messages: 24, duration: '45 min' },
  { id: 2, title: 'API Integration Project', status: 'completed', date: 'Feb 13, 2026', messages: 18, duration: '32 min' },
  { id: 3, title: 'Mobile App Development', status: 'completed', date: 'Feb 12, 2026', messages: 32, duration: '58 min' },
];

export function Transcripts() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await fetchSessions();
        // Sort sessions by most recent first
        const sortedData = data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setSessions(sortedData);
      } catch (err) {
        console.error('Failed to load sessions:', err);
        setError('Failed to load transcripts');
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Transcripts</h1>
        <p className="text-gray-600">View all chat session transcripts</p>
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
          const messageCount = 2;
          return (
            <Link key={session.id} to={`/transcript/${session.session_id}`}>
              <Card hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{session.title || `Session ${session.session_id}`}</h3>
                      <StatusBadge status="completed" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{createdDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{messageCount} messages</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}

        {/* Mock transcripts as examples */}
        {mockTranscripts.map((transcript, idx) => (
          <Link key={`mock-${idx}`} to={`/transcript/${transcript.id}`}>
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
