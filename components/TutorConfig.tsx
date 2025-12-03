import React, { useState } from 'react';
import { Bot, Save, MessageSquare, FileText } from 'lucide-react';
import { Subject, TutorConfig } from '../types';
import { chatWithTutorPreview } from '../services/geminiService';

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

  // Preview State
  const [previewMsg, setPreviewMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

      {/* Right Panel: Preview */}
      <div className="bg-gray-50 rounded-xl shadow-inner border border-gray-200 p-4 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-700 flex items-center">
                <MessageSquare size={18} className="mr-2" /> 
                Simulator
            </h3>
            <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                Mode: {config.tone}
            </span>
        </div>
        
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
      </div>
    </div>
  );
};

export default TutorConfigPage;