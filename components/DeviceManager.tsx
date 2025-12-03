
import React, { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff, Smartphone, RefreshCw, AlertCircle, Bot, Usb, Terminal, CheckCircle, X } from 'lucide-react';
import { MOCK_DEVICES, MOCK_CHILDREN, MOCK_TUTORS } from '../constants';
import { DeviceStatus, ChildProfile, Device } from '../types';
import { serialService } from '../services/serialService';

const DeviceManager: React.FC = () => {
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [children, setChildren] = useState<ChildProfile[]>(MOCK_CHILDREN);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Serial / Hardware State
  const [isSerialConnected, setIsSerialConnected] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Hardware Config Form
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [detectedSerial, setDetectedSerial] = useState<string | null>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [serialLogs]);

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

  // --- Serial / USB Handlers ---

  const handleUsbConnect = async () => {
      const connected = await serialService.connect((data) => {
          setSerialLogs(prev => [...prev.slice(-50), data]); // Keep last 50 lines
          
          // Simple parsing logic for detected serial/mac
          // Assuming log format like "Device MAC: AA:BB:CC..."
          if (data.includes("MAC:")) {
              const mac = data.split("MAC:")[1].trim().substring(0, 17);
              setDetectedSerial(mac);
          }
      });

      if (connected) {
          setIsSerialConnected(true);
          setShowHardwareModal(true);
          setSerialLogs(["Connected to device via USB...", "Waiting for device logs..."]);
          // Try to get info immediately
          setTimeout(() => serialService.getDeviceInfo(), 1000);
      }
  };

  const handleUsbDisconnect = async () => {
      await serialService.disconnect();
      setIsSerialConnected(false);
      setShowHardwareModal(false);
      setSerialLogs([]);
      setDetectedSerial(null);
  };

  const pushWifiConfig = async () => {
      if (!wifiSsid || !wifiPass) return;
      await serialService.setWifi(wifiSsid, wifiPass);
      setSerialLogs(prev => [...prev, `> Setting Wi-Fi: ${wifiSsid}`]);
  };

  const registerDetectedDevice = () => {
      if (!detectedSerial) return;
      
      const newDevice: Device = {
          id: `d-${Date.now()}`,
          serialNumber: detectedSerial,
          nickname: 'New Xiaozhi Device',
          status: DeviceStatus.ONLINE,
          firmwareVersion: '1.0.0',
          lastSeen: 'Just now'
      };
      
      setDevices([...devices, newDevice]);
      setShowHardwareModal(false);
      // alert("Device registered successfully!");
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">Device Manager</h1>
            <p className="text-gray-500 text-sm">Manage hardware, check connectivity, and push updates.</p>
        </div>
        <div className="flex space-x-3">
            <button 
                onClick={handleUsbConnect}
                disabled={isSerialConnected}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border ${
                    isSerialConnected 
                    ? 'bg-green-50 text-green-700 border-green-200 cursor-default' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
                <Usb size={18} />
                <span>{isSerialConnected ? 'USB Connected' : 'Connect via USB'}</span>
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Register Manually
            </button>
        </div>
      </div>

      {/* Hardware Config Modal */}
      {showHardwareModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                          <Terminal size={20} className="text-green-400" />
                          <h3 className="font-mono font-bold">Hardware Console (ESP32)</h3>
                      </div>
                      <button onClick={handleUsbDisconnect} className="text-gray-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="flex flex-1 overflow-hidden">
                      {/* Left: Controls */}
                      <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                          <h4 className="font-bold text-gray-800 mb-4">Device Configuration</h4>
                          
                          {/* Device Detection Status */}
                          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Detected Device</p>
                              {detectedSerial ? (
                                  <div>
                                      <p className="font-mono text-lg text-indigo-600 break-all">{detectedSerial}</p>
                                      <button 
                                        onClick={registerDetectedDevice}
                                        className="mt-3 w-full bg-indigo-600 text-white text-sm py-2 rounded flex items-center justify-center space-x-2 hover:bg-indigo-700"
                                      >
                                          <CheckCircle size={14} />
                                          <span>Register this Device</span>
                                      </button>
                                  </div>
                              ) : (
                                  <div className="flex items-center text-orange-500 text-sm">
                                      <RefreshCw size={14} className="animate-spin mr-2" />
                                      Scanning for ID...
                                  </div>
                              )}
                          </div>

                          <div className="space-y-4">
                              <h5 className="font-medium text-gray-700 text-sm">Wi-Fi Provisioning</h5>
                              <div>
                                  <label className="block text-xs text-gray-500 mb-1">Network SSID</label>
                                  <input 
                                    type="text" 
                                    value={wifiSsid}
                                    onChange={(e) => setWifiSsid(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 text-sm"
                                    placeholder="Home WiFi Name"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs text-gray-500 mb-1">Password</label>
                                  <input 
                                    type="password" 
                                    value={wifiPass}
                                    onChange={(e) => setWifiPass(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 text-sm"
                                    placeholder="Network Password"
                                  />
                              </div>
                              <button 
                                onClick={pushWifiConfig}
                                className="w-full bg-gray-800 text-white py-2 rounded text-sm hover:bg-gray-700"
                              >
                                  Push to Device
                              </button>
                          </div>
                      </div>

                      {/* Right: Terminal Logs */}
                      <div className="w-2/3 bg-black p-4 font-mono text-xs overflow-y-auto">
                          {serialLogs.map((log, i) => (
                              <div key={i} className="text-green-500 whitespace-pre-wrap mb-1 border-b border-gray-800 pb-1">
                                  <span className="text-gray-500 select-none mr-2">[{new Date().toLocaleTimeString()}]</span>
                                  {log}
                              </div>
                          ))}
                          <div ref={logsEndRef} />
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Main List */}
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
