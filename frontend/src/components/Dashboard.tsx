import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, FileText, Send, Tag } from 'lucide-react';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { Link } from 'react-router';
import { fetchSessions } from '../api/transcript';

interface Session {
  id: number;
  session_id: string;
  title?: string;
  created_at: string;
}

export function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await fetchSessions();
        const sorted = data
          .slice()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setSessions(sorted);
      } catch (error) {
        console.error('Failed to load dashboard sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const recentSessions = useMemo(() => sessions.slice(0, 5), [sessions]);

  const stats = [
    { label: 'Total Sessions', value: String(sessions.length), icon: MessageSquare, color: 'indigo' },
    { label: 'Pending Summaries', value: String(sessions.length), icon: FileText, color: 'amber' },
    { label: 'Projects Routed', value: '189', icon: Send, color: 'green' },
    { label: 'Most Tagged Dept', value: 'Frontend', icon: Tag, color: 'purple' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your project requirements and team routing</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-900">{isLoading ? '-' : stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Sessions Table */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
        </div>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <Link 
                      to={`/chat/${session.session_id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {session.title || `Session ${session.session_id.slice(-8)}`}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status="completed" />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">—</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && recentSessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                    No sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}