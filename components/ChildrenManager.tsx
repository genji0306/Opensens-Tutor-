import React, { useState } from 'react';
import { Plus, Edit2, Trash2, User, X, Save, Smartphone } from 'lucide-react';
import { MOCK_CHILDREN, MOCK_DEVICES, MOCK_TUTORS } from '../constants';
import { ChildProfile, Device } from '../types';

const ChildrenManager: React.FC = () => {
  const [children, setChildren] = useState<ChildProfile[]>(MOCK_CHILDREN);
  const [availableDevices] = useState<Device[]>(MOCK_DEVICES);
  
  // State for adding/editing
  const [editingProfile, setEditingProfile] = useState<Partial<ChildProfile> | null>(null);

  const startAddChild = () => {
    setEditingProfile({
      name: '',
      age: 0,
      grade: '',
      avatarUrl: `https://picsum.photos/100/100?random=${Date.now()}`,
      assignedDeviceId: ''
    });
  };

  const startEditChild = (child: ChildProfile) => {
    setEditingProfile({ ...child });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editingProfile.name) return;

    if (editingProfile.id) {
      // Update existing child
      setChildren(prev => prev.map(child => 
        child.id === editingProfile.id ? { ...child, ...editingProfile } as ChildProfile : child
      ));
    } else {
      // Create new child
      const newChild: ChildProfile = {
        ...editingProfile,
        id: Date.now().toString(),
        age: Number(editingProfile.age),
        grade: editingProfile.grade || 'Ungraded',
        avatarUrl: editingProfile.avatarUrl || `https://picsum.photos/100/100?random=${Date.now()}`
      } as ChildProfile;
      setChildren([...children, newChild]);
    }
    setEditingProfile(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this profile?')) {
        setChildren(prev => prev.filter(c => c.id !== id));
    }
  };

  const getAssignedDeviceName = (deviceId?: string) => {
    if (!deviceId) return null;
    return availableDevices.find(d => d.id === deviceId)?.nickname || 'Unknown Device';
  };

  const getAssignedTutorName = (tutorId?: string) => {
    if (!tutorId) return 'No Tutor Assigned';
    const tutor = MOCK_TUTORS.find(t => t.id === tutorId);
    return tutor ? tutor.name : 'Unknown Tutor';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Child Profiles</h1>
        {!editingProfile && (
          <button 
            onClick={startAddChild}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add Child</span>
          </button>
        )}
      </div>

      {/* Edit / Add Form */}
      {editingProfile && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-fade-in mb-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
             <h3 className="text-lg font-bold text-gray-800">
               {editingProfile.id ? 'Edit Profile' : 'New Profile'}
             </h3>
             <button 
               onClick={() => setEditingProfile(null)} 
               className="text-gray-400 hover:text-gray-600 transition-colors"
             >
               <X size={24} />
             </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                  placeholder="e.g. Leo Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input 
                  required
                  type="number" 
                  min="3"
                  max="18"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={editingProfile.age || ''}
                  onChange={(e) => setEditingProfile({...editingProfile, age: parseInt(e.target.value)})}
                  placeholder="Age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={editingProfile.grade || ''}
                  onChange={(e) => setEditingProfile({...editingProfile, grade: e.target.value})}
                  placeholder="e.g. 3rd Grade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Device</label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-lg p-3 pr-10 appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={editingProfile.assignedDeviceId || ''}
                    onChange={(e) => setEditingProfile({...editingProfile, assignedDeviceId: e.target.value})}
                  >
                    <option value="">-- No Device Assigned --</option>
                    {availableDevices.map(device => (
                       <option key={device.id} value={device.id}>
                         {device.nickname} ({device.serialNumber})
                       </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                     <Smartphone size={16} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select a registered device to link to this child.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setEditingProfile(null)}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center space-x-2 shadow-sm"
              >
                <Save size={18} />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <div key={child.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="relative mb-4">
               <img src={child.avatarUrl} alt={child.name} className="w-24 h-24 rounded-full object-cover border-4 border-indigo-50" />
               <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border border-gray-100">
                 <User size={14} className="text-gray-500"/>
               </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800">{child.name}</h3>
            <p className="text-gray-500 text-sm mb-4">{child.age} Years Old • {child.grade}</p>
            
            {/* Device & Tutor Info Badges */}
            <div className="w-full space-y-2 mb-6">
                <div className={`w-full py-2 px-3 rounded-lg flex items-center justify-center text-sm ${child.assignedDeviceId ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-400 border border-dashed border-gray-300'}`}>
                    <Smartphone size={16} className="mr-2" />
                    <span className="font-medium truncate">
                        {getAssignedDeviceName(child.assignedDeviceId) || 'No Device Linked'}
                    </span>
                </div>
                 <div className="w-full py-1 px-3 rounded text-xs text-gray-500 flex justify-between">
                    <span>Active Tutor:</span>
                    <span className="font-medium text-gray-700">{getAssignedTutorName(child.assignedTutorId)}</span>
                 </div>
            </div>

            <div className="w-full border-t border-gray-100 pt-4 mt-auto flex justify-between items-center text-sm">
               <span className="text-xs text-gray-400">ID: {child.id}</span>
               <div className="flex space-x-2">
                 <button 
                    onClick={() => startEditChild(child)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Edit Profile"
                 >
                   <Edit2 size={16} />
                 </button>
                 <button 
                    onClick={() => handleDelete(child.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Profile"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChildrenManager;