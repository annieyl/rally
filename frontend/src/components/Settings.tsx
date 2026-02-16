import { Card } from './ui/Card';
import { Bell, Lock, User, Palette } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="max-w-3xl space-y-4">
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Profile Settings</h3>
              <p className="text-sm text-gray-600">Update your personal information</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Configure notification preferences</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-pink-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Security</h3>
              <p className="text-sm text-gray-600">Manage password and authentication</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Appearance</h3>
              <p className="text-sm text-gray-600">Customize theme and display settings</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
