import React, { useState } from 'react';
import { Wifi, WifiOff, Smartphone, RefreshCw, AlertCircle, Bot } from 'lucide-react';
import { MOCK_DEVICES, MOCK_CHILDREN, MOCK_TUTORS } from '../constants';
import { DeviceStatus, ChildProfile } from '../types';

const DeviceManager: React.FC = () => {
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [children, setChildren] = useState<ChildProfile[]>(MOCK_CHILDREN);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleSimulateOTA = (id: string) => {
    setUpdatingId(id);
    // Simulate API call delay
    setTimeout(() => {
        setDevices(prev => prev.map(d => 
            d.id === id ? { ...d, firmwareVersion: '2.2.0 (Latest)' } : d
        ));
        setUpdatingId(null);
    }, 3000);
  };

  const handleAssignChange = (deviceId: string, childId: string) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, assignedChildId: childId === "" ? undefined : childId } : d
    ));
  };

  const handleTutorChange = (childId: string, tutorId: string) => {
    setChildren(prev => prev.map(c => 
      c.id === childId ? { ...c, assignedTutorId: tutorId === "" ? undefined : tutorId } : c
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">Device Manager</h1>
            <p className="text-gray-500 text-sm">Manage hardware, check connectivity, and push updates.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Register New Device
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Device Info</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Tutor</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Firmware</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {devices.map((device) => {
              const assignedChild = children.find(c => c.id === device.assignedChildId);
              
              return (
                <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                          <Smartphone size={20} className="text-gray-600" />
                      </div>
                      <div>
                          <p className="font-medium text-gray-900">{device.nickname}</p>
                          <p className="text-xs text-gray-400 font-mono">{device.serialNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {device.status === DeviceStatus.ONLINE ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Wifi size={12} className="mr-1" /> Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <WifiOff size={12} className="mr-1" /> Offline
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Last seen: {device.lastSeen}</p>
                  </td>
                  <td className="p-4">
                      <select
                          className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none block w-full p-2"
                          value={device.assignedChildId || ''}
                          onChange={(e) => handleAssignChange(device.id, e.target.value)}
                      >
                          <option value="">-- Unassigned --</option>
                          {children.map((child) => (
                              <option key={child.id} value={child.id}>
                                  {child.name}
                              </option>
                          ))}
                      </select>
                  </td>
                  <td className="p-4">
                     {device.assignedChildId ? (
                       <div className="relative">
                         <select
                           className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none block w-full p-2 pl-8 appearance-none"
                           value={assignedChild?.assignedTutorId || ''}
                           onChange={(e) => handleTutorChange(device.assignedChildId!, e.target.value)}
                         >
                           <option value="">No Tutor</option>
                           {MOCK_TUTORS.map(t => (
                             <option key={t.id} value={t.id}>{t.name}</option>
                           ))}
                         </select>
                         <Bot size={14} className="absolute left-2.5 top-3 text-gray-400 pointer-events-none"/>
                       </div>
                     ) : (
                       <span className="text-xs text-gray-400 italic pl-1">Link child first</span>
                     )}
                  </td>
                  <td className="p-4">
                      <span className="font-mono text-sm text-gray-700">{device.firmwareVersion}</span>
                  </td>
                  <td className="p-4 text-right">
                      {updatingId === device.id ? (
                          <div className="flex items-center justify-end text-indigo-600 animate-pulse">
                              <RefreshCw size={16} className="mr-2 animate-spin" />
                              <span className="text-sm font-medium">Updating...</span>
                          </div>
                      ) : (
                          <button 
                              onClick={() => handleSimulateOTA(device.id)}
                              disabled={device.status === DeviceStatus.OFFLINE}
                              className={`text-sm font-medium px-3 py-1 rounded-lg border transition-colors ${
                                  device.status === DeviceStatus.OFFLINE 
                                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                  : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                              }`}
                          >
                              Update Firmware
                          </button>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {devices.length === 0 && (
            <div className="p-12 text-center">
                <AlertCircle size={48} className="mx-auto text-gray-300 mb-4"/>
                <p className="text-gray-500">No devices registered. Click the button above to add one.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DeviceManager;