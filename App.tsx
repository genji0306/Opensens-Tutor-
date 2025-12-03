import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChildrenManager from './components/ChildrenManager';
import DeviceManager from './components/DeviceManager';
import TutorConfigPage from './components/TutorConfig';
import LessonBuilder from './components/LessonBuilder';
import Settings from './components/Settings';

// Basic wrapper component for pages not fully implemented to avoid routing errors
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-10 text-center">
    <h2 className="text-2xl font-bold text-gray-300">{title}</h2>
    <p className="text-gray-400">Coming soon</p>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/children" element={<ChildrenManager />} />
          <Route path="/devices" element={<DeviceManager />} />
          <Route path="/tutors" element={<TutorConfigPage />} />
          <Route path="/lessons" element={<LessonBuilder />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Placeholder title="Page Not Found" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;