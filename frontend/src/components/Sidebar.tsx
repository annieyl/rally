import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, MessageSquare, FileText, Sparkles, Users, Settings, Plus, PanelLeftClose, PanelLeft } from 'lucide-react';
import { PrimaryButton } from './ui/PrimaryButton';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sessions', label: 'Chat Sessions', icon: MessageSquare },
  { path: '/transcripts', label: 'Transcripts', icon: FileText },
  { path: '/summaries', label: 'AI Summaries', icon: Sparkles },
  { path: '/teams', label: 'Teams', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNewSession = () => {
    navigate('/chat/new');
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {isOpen ? (
          <>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-semibold text-xl text-gray-900">Rally</span>
            </Link>
            <button
              onClick={onToggle}
              className="flex items-center justify-center p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <Link to="/" className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">R</span>
          </Link>
        )}
      </div>

      {/* Collapsed Toggle Button */}
      {!isOpen && (
        <div className="px-4 py-3 border-b border-gray-200 flex justify-center">
          <button
            onClick={onToggle}
            className="flex items-center justify-center p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            title="Expand sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* New Session Button - Moved to top */}
      <div className="p-3 border-b border-gray-200">
        {isOpen ? (
          <button
            onClick={handleNewSession}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md font-medium text-sm"
          >
            <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            New Session
          </button>
        ) : (
          <button
            onClick={handleNewSession}
            className="w-full h-10 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg flex items-center justify-center hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              } ${!isOpen ? 'justify-center' : ''}`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}