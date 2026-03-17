import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { createClient } from '@supabase/supabase-js';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { Sparkles, Clock } from 'lucide-react';
import { fetchSessions } from '../api/transcript';

interface Session {
  id: number;
  session_id: string;
  user_id?: string;
  transcript_url: string;
  created_at: string;
  ended_at: string;
  title?: string;
}

type SummaryStatus = 'completed' | 'pending';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export function AISummaries() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [summaryStatusBySession, setSummaryStatusBySession] = useState<Record<string, SummaryStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await fetchSessions();
        const sortedData = data
          .slice()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setSessions(sortedData);

        if (!supabase) {
          const pendingStatus = Object.fromEntries(
            sortedData.map((session) => [session.session_id, 'pending'])
          ) as Record<string, SummaryStatus>;
          setSummaryStatusBySession(pendingStatus);
          return;
        }

        const { data: summaryFiles, error: summaryListError } = await supabase.storage
          .from('transcripts')
          .list('summaries', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

        if (summaryListError) {
          throw new Error(summaryListError.message);
        }

        const names = (summaryFiles || []).map((file) => file.name);
        const completedSessionIds = new Set([
          // Finalized summaries
          ...names
            .filter((name) => name.endsWith('_final.md'))
            .map((name) => name.replace('_final.md', '')),
          // Draft summaries (generated but not yet approved)
          ...names
            .filter((name) => name.endsWith('.txt'))
            .map((name) => name.replace('.txt', '')),
        ]);

        const statusMap = Object.fromEntries(
          sortedData.map((session) => [
            session.session_id,
            completedSessionIds.has(session.session_id) ? 'completed' : 'pending',
          ])
        ) as Record<string, SummaryStatus>;

        setSummaryStatusBySession(statusMap);
      } catch (err) {
        console.error('Failed to load summaries:', err);
        setError('Failed to load summaries');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">AI Summaries</h1>
        <p className="text-gray-600">Generated project summaries from chat sessions</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {!isLoading && sessions.length === 0 && (
          <Card>
            <div className="text-sm text-gray-500">No sessions found.</div>
          </Card>
        )}

        {sessions.map((session) => {
          const status = summaryStatusBySession[session.session_id] || 'pending';
          const timeAgo = getTimeAgo(session.created_at);
          const summaryPath = `/transcript/${session.session_id}/summary`;

          return (
            <Link key={session.id} to={summaryPath}>
              <Card hover>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {session.title || `Session ${session.session_id.slice(-8)}`}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <StatusBadge status={status} />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
