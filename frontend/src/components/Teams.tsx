import { Card } from './ui/Card';
import { Users } from 'lucide-react';

const teams = [
  { name: 'Frontend', members: 8, activeProjects: 12, color: 'indigo' },
  { name: 'Backend', members: 6, activeProjects: 9, color: 'purple' },
  { name: 'Design', members: 5, activeProjects: 7, color: 'pink' },
  { name: 'Business', members: 4, activeProjects: 5, color: 'blue' },
  { name: 'DevOps', members: 3, activeProjects: 4, color: 'green' },
  { name: 'QA', members: 5, activeProjects: 8, color: 'amber' },
];

export function Teams() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Teams</h1>
        <p className="text-gray-600">Manage departments and team members</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.name} hover>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-${team.color}-100 rounded-lg flex items-center justify-center`}>
                <Users className={`w-6 h-6 text-${team.color}-600`} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{team.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{team.members} team members</p>
              <p>{team.activeProjects} active projects</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
