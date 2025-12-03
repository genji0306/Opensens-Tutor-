import React from 'react';
import { Save } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">General Preferences</h2>
          <div className="grid gap-4">
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Dark Mode</span>
                <span className="text-xs text-gray-400 font-mono">Coming Soon</span>
             </div>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Notifications</span>
                <span className="text-xs text-gray-400 font-mono">Enabled</span>
             </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Application Info</h2>
          <div className="text-sm text-gray-500 space-y-2">
            <p>Version: <span className="font-mono text-gray-700">1.0.0-beta</span></p>
            <p>Build: <span className="font-mono text-gray-700">Opensens Tutor Manager</span></p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors">
                <Save size={18} />
                <span>Save Changes</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;