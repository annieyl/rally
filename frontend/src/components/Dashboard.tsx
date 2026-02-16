import { MessageSquare, FileText, Send, Tag } from 'lucide-react';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { Link } from 'react-router';

const stats = [
  { label: 'Total Sessions', value: '247', icon: MessageSquare, color: 'indigo' },
  { label: 'Pending Summaries', value: '12', icon: FileText, color: 'amber' },
  { label: 'Projects Routed', value: '189', icon: Send, color: 'green' },
  { label: 'Most Tagged Dept', value: 'Frontend', icon: Tag, color: 'purple' },
];

const recentSessions = [
  { id: 1, title: 'E-commerce Platform Redesign', status: 'completed', department: 'Frontend', date: '2 hours ago' },
  { id: 2, title: 'API Integration Project', status: 'pending', department: 'Backend', date: '5 hours ago' },
  { id: 3, title: 'Mobile App Development', status: 'in-progress', department: 'Design', date: '1 day ago' },
  { id: 4, title: 'CRM System Enhancement', status: 'completed', department: 'Business', date: '1 day ago' },
  { id: 5, title: 'Analytics Dashboard', status: 'completed', department: 'Frontend', date: '2 days ago' },
];

export function Dashboard() {
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
                  <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
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
                      to={`/transcript/${session.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {session.title}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={session.status} />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{session.department}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-500">{session.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}