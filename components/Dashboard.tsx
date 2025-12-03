import React from 'react';
import { Users, Layout, Zap, Activity, BookOpen } from 'lucide-react';
import { MOCK_CHILDREN, MOCK_DEVICES, MOCK_SESSIONS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const totalLearningMinutes = MOCK_SESSIONS.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Children</p>
            <p className="text-2xl font-bold">{MOCK_CHILDREN.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Layout size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Devices</p>
            <p className="text-2xl font-bold">
              {MOCK_DEVICES.filter(d => d.status === 'Online').length} / {MOCK_DEVICES.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Learning Time</p>
            <p className="text-2xl font-bold">{Math.floor(totalLearningMinutes / 60)}h {totalLearningMinutes % 60}m</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Score</p>
            <p className="text-2xl font-bold">89%</p>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-6">
            <Activity size={20} className="text-gray-500"/>
            <h2 className="text-lg font-semibold text-gray-700">Activity Overview</h2>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_SESSIONS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
              <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Area type="monotone" dataKey="durationMinutes" stroke="#4F46E5" fill="#EEF2FF" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
          <h3 className="text-xl font-bold mb-2">Build a New Lesson</h3>
          <p className="mb-4 opacity-90">Create an AI-powered lesson plan for your child in seconds.</p>
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Start Builder
          </button>
        </div>
         <div className="bg-white border border-gray-200 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-2 text-gray-800">Firmware Status</h3>
          <p className="mb-4 text-gray-500">All devices are running stable versions. No critical updates pending.</p>
          <button className="text-indigo-600 font-medium hover:text-indigo-800">
            Check for Updates &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;