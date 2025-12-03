import React, { useState, useEffect, useRef } from 'react';
import { Bot, Save, MessageSquare, FileText, Mic, Phone, PhoneOff, Volume2, Activity } from 'lucide-react';
import { Subject, TutorConfig } from '../types';
import { chatWithTutorPreview, LiveSession } from '../services/geminiService';

const TutorConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [config, setConfig] = useState<TutorConfig>({
    id: 'new',
    name: 'My Friendly Tutor',
    model: 'gemini-2.5-flash',
    tone: 'Encouraging',
    subjectFocus: [Subject.MATH, Subject.SCIENCE],
    knowledgeBaseFiles: [],
    systemInstruction: 'You are a friendly tutor designed for a 10 year old.'
  });

  // Simulator State
  const [simMode, setSimMode] = useState<'text' | 'voice'>('text');
  
  // Text Chat State
  const [previewMsg, setPreviewMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Voice Call State
  const [callStatus, setCallStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'speaking' | 'error'>('disconnected');
  const liveSessionRef = useRef<LiveSession | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
        if (liveSessionRef.current) {
            liveSessionRef.current.disconnect();
        }
    };
  }, []);

  const handleSubjectChange = (subject: Subject) => {
    setConfig(prev => {
        const exists = prev.subjectFocus.includes(subject);
        return {
            ...prev,
            subjectFocus: exists 
                ? prev.subjectFocus.filter(s => s !== subject)
                : [...prev.subjectFocus, subject]
        };
    });
  };

  const handlePreviewSend = async () => {
    if (!previewMsg.trim()) return;
    
    setIsLoading(true);
    const userMsg = { role: 'user' as const, parts: [{ text: previewMsg }] };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setPreviewMsg('');

    const responseText = await chatWithTutorPreview(
        config.systemInstruction + ` Tone: ${config.tone}.`,
        previewMsg,
        newHistory
    );

    setChatHistory([...newHistory, { role: 'model', parts: [{ text: responseText }] }]);
    setIsLoading(false);
  };

  const toggleCall = async () => {
      if (callStatus === 'disconnected' || callStatus === 'error') {
          setCallStatus('connecting');
          
          // Map tone to a rough voice equivalent for now
          let voiceName = 'Kore'; // Default
          if (config.tone === 'Strict') voiceName = 'Fenrir';
          if (config.tone === 'Playful') voiceName = 'Puck';
          if (config.tone === 'Socratic') voiceName = 'Aoede';

          const session = new LiveSession(
              config.systemInstruction + ` The user is testing your personality. Your tone should be ${config.tone}.`,
              voiceName,
              (status) => setCallStatus(status)
          );
          
          liveSessionRef.current = session;
          await session.connect();
      } else {
          if (liveSessionRef.current) {
              await liveSessionRef.current.disconnect();
          }
          setCallStatus('disconnected');
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
      {/* Left Panel: Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
        <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                <Bot size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">Tutor Configuration</h2>
                <p className="text-sm text-gray-500">Design the AI personality for your child.</p>
            </div>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tutor Name</label>
                <input 
                    type="text" 
                    value={config.name} 
                    onChange={e => setConfig({...config, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                <select 
                    value={config.model}
                    onChange={e => setConfig({...config, model: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Efficient)</option>
                    <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Complex Reasoning)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Recommended: Flash for daily tasks, Pro for complex math.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Tone</label>
                <div className="grid grid-cols-2 gap-2">
                    {['Encouraging', 'Strict', 'Socratic', 'Playful'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setConfig({...config, tone: t as any})}
                            className={`p-2 rounded-lg text-sm border ${
                                config.tone === t 
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Expertise</label>
                <div className="flex flex-wrap gap-2">
                    {Object.values(Subject).map((subj) => (
                        <button
                            key={subj}
                            onClick={() => handleSubjectChange(subj)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                config.subjectFocus.includes(subj)
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {subj}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Knowledge Base (RAG)</label>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                    <FileText className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Drag PDF/Docs here or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">School curriculum, textbooks, etc.</p>
                 </div>
            </div>

            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center space-x-2">
                <Save size={18} />
                <span>Save Tutor Profile</span>
            </button>
        </div>
      </div>

      {/* Right Panel: Simulator */}
      <div className="bg-gray-50 rounded-xl shadow-inner border border-gray-200 p-4 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-700 flex items-center">
                <Activity size={18} className="mr-2 text-indigo-500" /> 
                Live Simulator
            </h3>
            
            {/* Mode Toggle */}
            <div className="flex bg-gray-200 p-1 rounded-lg">
                <button
                    onClick={() => setSimMode('text')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        simMode === 'text' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Text Chat
                </button>
                <button
                    onClick={() => setSimMode('voice')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        simMode === 'voice' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Voice Mode
                </button>
            </div>
        </div>
        
        {simMode === 'text' ? (
            /* Text Simulator */
            <>
                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto space-y-4 mb-4">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                            <p>Start chatting to test {config.name}'s personality.</p>
                        </div>
                    )}
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-gray-100 text-gray-800 rounded-tl-none'
                            }`}>
                                {msg.parts[0].text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-xl rounded-tl-none text-sm text-gray-500 italic">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        value={previewMsg}
                        onChange={e => setPreviewMsg(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handlePreviewSend()}
                        placeholder="Ask a test question..."
                        className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button 
                        onClick={handlePreviewSend}
                        disabled={isLoading}
                        className="bg-indigo-600 text-white px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </>
        ) : (
            /* Voice Simulator */
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200 p-6 relative overflow-hidden">
                {/* Background Animation for Active State */}
                {callStatus === 'speaking' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                         <div className="w-64 h-64 bg-indigo-500 rounded-full animate-ping"></div>
                    </div>
                )}
                
                <div className="z-10 text-center space-y-8">
                    <div className="relative">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                            callStatus === 'connected' || callStatus === 'speaking' 
                            ? 'bg-gradient-to-br from-teal-400 to-indigo-500 shadow-lg scale-105' 
                            : 'bg-gray-100'
                        }`}>
                             <Bot size={64} className={`${
                                 callStatus === 'connected' || callStatus === 'speaking' 
                                 ? 'text-white' 
                                 : 'text-gray-300'
                             }`} />
                        </div>
                        {callStatus === 'speaking' && (
                             <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border border-gray-100">
                                 <Volume2 size={20} className="text-teal-500 animate-pulse" />
                             </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-800">
                            {callStatus === 'disconnected' ? 'Ready to Call' : config.name}
                        </h3>
                        <p className={`text-sm font-medium uppercase tracking-wide ${
                            callStatus === 'error' ? 'text-red-500' :
                            callStatus === 'connecting' ? 'text-indigo-500 animate-pulse' :
                            callStatus === 'connected' ? 'text-green-500' :
                            callStatus === 'speaking' ? 'text-teal-500' :
                            'text-gray-400'
                        }`}>
                            {callStatus === 'disconnected' ? 'Simulator Offline' : callStatus}
                        </p>
                    </div>
                </div>

                <div className="mt-12 z-10">
                    <button 
                        onClick={toggleCall}
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${
                            callStatus === 'disconnected' || callStatus === 'error'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        {callStatus === 'disconnected' || callStatus === 'error' ? (
                            <Phone size={32} fill="currentColor" />
                        ) : (
                            <PhoneOff size={32} />
                        )}
                    </button>
                    <p className="mt-4 text-xs text-gray-400 text-center">
                        {callStatus === 'disconnected' ? 'Tap to Start' : 'Tap to End'}
                    </p>
                </div>

                {callStatus === 'connected' && (
                     <div className="absolute bottom-6 flex items-center space-x-2 text-indigo-400 text-xs bg-indigo-50 px-3 py-1 rounded-full">
                        <Mic size={12} />
                        <span>Listening...</span>
                     </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default TutorConfigPage;