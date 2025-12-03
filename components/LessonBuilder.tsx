import React, { useState } from 'react';
import { Sparkles, BookOpen, Send, Download } from 'lucide-react';
import { generateLessonContent } from '../services/geminiService';
import { LessonPlan } from '../types';

const LessonBuilder: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [age, setAge] = useState(8);
  const [subject, setSubject] = useState('Science');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedLesson(null);

    try {
      const lesson = await generateLessonContent(topic, age, subject, 'Encouraging');
      setGeneratedLesson(lesson);
    } catch (err) {
      setError("Failed to generate lesson. Please check API Key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Lesson Builder</h1>
        <p className="text-gray-500">Create personalized educational content instantly using Gemini AI.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Question</label>
                <input 
                    type="text" 
                    placeholder="e.g., How do volcanoes work?"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Age</label>
                <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))}
                />
            </div>
        </div>
        
        <div className="flex items-center justify-between">
            <div className="flex space-x-2">
                {['Science', 'Math', 'History', 'English'].map(s => (
                    <button 
                        key={s}
                        onClick={() => setSubject(s)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                            subject === s 
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                            : 'border-gray-200 text-gray-600'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>Generating...</>
                ) : (
                    <>
                        <Sparkles size={18} className="mr-2" /> Generate Magic Lesson
                    </>
                )}
            </button>
        </div>
        
        {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                {error}
            </div>
        )}
      </div>

      {generatedLesson && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-fade-in">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img 
                    src={generatedLesson.imageUrl} 
                    alt="Lesson Header" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h2 className="text-3xl font-bold text-white shadow-sm">{generatedLesson.topic}</h2>
                </div>
            </div>
            
            <div className="p-8 space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                        <BookOpen size={20} className="mr-2 text-indigo-600"/> Lesson Content
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        {generatedLesson.content}
                    </p>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-indigo-900 mb-4">Quick Quiz</h3>
                    <div className="space-y-4">
                        {generatedLesson.quizQuestions.map((q, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                                <p className="font-medium text-gray-800 mb-3">{idx + 1}. {q.question}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className={`px-3 py-2 border rounded text-sm ${
                                            optIdx === q.answer ? 'border-green-300 bg-green-50' : 'border-gray-200'
                                        }`}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2">
                        <Download size={18} />
                        <span>Save PDF</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md">
                        <Send size={18} />
                        <span>Send to Device</span>
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LessonBuilder;