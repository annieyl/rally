import { Card } from './ui/Card';
import { Sparkles, Clock } from 'lucide-react';

const summaries = [
  { id: 1, title: 'E-commerce Platform Redesign', departments: ['Frontend', 'Backend', 'Design', 'Business'], date: '2 hours ago' },
  { id: 2, title: 'API Integration Project', departments: ['Backend'], date: '5 hours ago' },
  { id: 3, title: 'Mobile App Development', departments: ['Frontend', 'Design'], date: '1 day ago' },
];

export function AISummaries() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">AI Summaries</h1>
        <p className="text-gray-600">Generated project summaries from chat sessions</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {summaries.map((summary) => (
          <Card key={summary.id} hover>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{summary.title}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {summary.departments.map((dept) => (
                    <span key={dept} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {dept}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{summary.date}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
