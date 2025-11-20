
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type, ChatSession } from "@google/genai";
import { marked } from 'marked';

// --- Configuration ---
const SUBJECTS = [
  { 
    id: 'math', 
    name: 'Mathematics', 
    icon: 'fa-calculator', 
    color: 'bg-blue-600',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'eng', 
    name: 'English', 
    icon: 'fa-book', 
    color: 'bg-emerald-600',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'phy', 
    name: 'Physics', 
    icon: 'fa-atom', 
    color: 'bg-purple-600',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'chem', 
    name: 'Chemistry', 
    icon: 'fa-flask', 
    color: 'bg-teal-600',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'bio', 
    name: 'Biology', 
    icon: 'fa-dna', 
    color: 'bg-rose-600',
    image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'geo', 
    name: 'Geography', 
    icon: 'fa-globe-africa', 
    color: 'bg-amber-600',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'hist', 
    name: 'History', 
    icon: 'fa-landmark', 
    color: 'bg-orange-700',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'cre', 
    name: 'C.R.E', 
    icon: 'fa-cross', 
    color: 'bg-indigo-500',
    image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'ent', 
    name: 'Entrepreneurship', 
    icon: 'fa-briefcase', 
    color: 'bg-blue-800',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'ict', 
    name: 'ICT', 
    icon: 'fa-laptop-code', 
    color: 'bg-slate-700',
    image: 'https://images.unsplash.com/photo-1531297461136-82b3f602ba6b?auto=format&fit=crop&w=800&q=80'
  },
];

const CLASSES = ['S1', 'S2', 'S3', 'S4'];

// --- Components ---

const Loader = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center p-12 animate-fade-in">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fas fa-graduation-cap text-green-500 text-xs animate-pulse"></i>
      </div>
    </div>
    <p className="text-gray-600 font-medium mt-4 animate-pulse tracking-wide">{text}</p>
  </div>
);

const Header = ({ onHome }: { onHome: () => void }) => (
  <header className="bg-black/90 backdrop-blur-md text-white shadow-lg sticky top-0 z-40 border-b border-white/10">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div 
        onClick={onHome}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(34,197,94,0.5)] group-hover:shadow-[0_0_25px_rgba(34,197,94,0.7)] transition-all duration-300">
            <i className="fas fa-brain"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Smart<span className="text-green-400">Study</span></h1>
      </div>
      <div className="hidden sm:block text-xs font-medium text-gray-400 px-3 py-1 rounded-full border border-white/10 bg-white/5">
        Uganda New Curriculum
      </div>
    </div>
  </header>
);

const BottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => (
  <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe pt-2 z-50 flex justify-around items-center h-[70px] shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
    <button 
      onClick={() => onTabChange('home')}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'home' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <i className={`fas fa-book-open text-xl ${activeTab === 'home' ? 'animate-bounce-subtle' : ''}`}></i>
      <span className="text-[10px] font-bold uppercase tracking-wide">Study</span>
    </button>
    
    <button 
      onClick={() => onTabChange('chat')}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'chat' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 transition-all ${activeTab === 'chat' ? 'bg-green-600 text-white shadow-green-200 shadow-lg transform -translate-y-2' : 'bg-gray-100'}`}>
         <i className="fas fa-robot text-lg"></i>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wide ${activeTab === 'chat' ? 'text-green-600' : 'text-gray-400'}`}>Ask AI</span>
    </button>

    <button 
      onClick={() => onTabChange('settings')}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'settings' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <i className={`fas fa-cog text-xl ${activeTab === 'settings' ? 'rotate-90' : ''} transition-transform duration-500`}></i>
      <span className="text-[10px] font-bold uppercase tracking-wide">Settings</span>
    </button>
  </div>
);

const SettingsView = () => (
  <div className="animate-fade-in p-6 pb-24 max-w-2xl mx-auto">
    <h2 className="text-3xl font-black text-gray-900 mb-8">Settings</h2>
    
    <div className="space-y-6">
      {/* Profile Section Placeholder */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-2xl">
          <i className="fas fa-user"></i>
        </div>
        <div>
          <h3 className="font-bold text-lg">Student Profile</h3>
          <p className="text-gray-500 text-sm">Guest User</p>
        </div>
        <button className="ml-auto text-green-600 font-semibold text-sm">Edit</button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fas fa-moon"></i></div>
             <span className="font-medium text-gray-700">Dark Mode</span>
          </div>
          <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-not-allowed">
             <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><i className="fas fa-wifi"></i></div>
             <span className="font-medium text-gray-700">Offline Mode</span>
          </div>
          <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
             <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
        <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><i className="fas fa-trash-alt"></i></div>
             <span className="font-medium text-gray-700">Clear Cache</span>
          </div>
          <i className="fas fa-chevron-right text-gray-300"></i>
        </div>
      </div>

      {/* About */}
      <div className="bg-green-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
           <h3 className="font-bold text-xl mb-2">Smart Study Uganda</h3>
           <p className="opacity-90 text-sm mb-4">Built for the New Lower Secondary Curriculum.</p>
           <div className="flex gap-2">
             <span className="text-xs bg-white/20 px-2 py-1 rounded">v1.2.0</span>
             <span className="text-xs bg-white/20 px-2 py-1 rounded">Gemini 2.5 Flash</span>
           </div>
        </div>
        <i className="fas fa-brain absolute -right-4 -bottom-4 text-9xl opacity-10"></i>
      </div>
    </div>
  </div>
);

const ChatOverlay = ({ isVisible, apiKey }: { isVisible: boolean, apiKey: string }) => {
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
        { role: 'model', text: "Hello! I'm your SmartStudy Tutor. I can help you revise, explain complex topics, or create practice questions. What do you need help with today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const aiRef = useRef<GoogleGenAI | null>(null);
    const chatRef = useRef<any>(null); // Type: ChatSession
    
    // Initialize chat once
    useEffect(() => {
        if (!aiRef.current) {
            aiRef.current = new GoogleGenAI({ apiKey });
            chatRef.current = aiRef.current.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You are a friendly, encouraging, and highly intelligent AI study tutor for Ugandan High School students (S1-S4). Your answers must be well-structured using Markdown. Use bold headings (###), bullet points, and clear paragraph spacing to make notes easy to read. Be concise but comprehensive. If asked for a diagram, describe it vividly.",
                    thinkingConfig: { thinkingBudget: 0 } 
                }
            });
        }
    }, [apiKey]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isVisible]);

    const handleSend = async () => {
        if (!input.trim() || !chatRef.current) return;
        
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            const result = await chatRef.current.sendMessageStream({ message: userMsg });
            let fullResponse = '';
            
            // Create a placeholder message for the stream
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            for await (const chunk of result) {
                const text = chunk.text;
                if (text) {
                    fullResponse += text;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].text = fullResponse;
                        return newMsgs;
                    });
                }
            }
        } catch (e) {
            console.error("Chat Error", e);
            setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    // We use CSS hiding instead of null return to preserve state
    return (
        <div className={`fixed inset-0 z-40 bg-gray-50 flex flex-col pb-[70px] animate-fade-in ${isVisible ? 'flex' : 'hidden'}`}>
            {/* Header */}
            <div className="bg-white p-4 flex items-center gap-4 shadow-sm z-10">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <i className="fas fa-robot"></i>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Smart Tutor</h3>
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-green-600 text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                        }`}>
                            {msg.role === 'model' ? (
                                <div 
                                    className="markdown-body text-sm"
                                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                                />
                            ) : (
                                <p className="text-sm">{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-gray-200 shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2 max-w-5xl mx-auto">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for explanation..." 
                        className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="bg-green-600 text-white w-12 h-12 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center"
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClassSelector = ({ onSelect }: { onSelect: (c: string) => void }) => (
  <div className="animate-fade-in pb-24">
    <h2 className="text-4xl font-extrabold text-center mb-2 text-gray-900 tracking-tight">Start Revising</h2>
    <p className="text-center text-gray-500 mb-10">Select your class to access tailored notes.</p>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4">
      {CLASSES.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className="group relative h-48 overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Decorative Circles */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-all duration-500"></div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center">
             <span className="text-6xl font-black text-white tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-300">{c}</span>
             <div className="h-1 w-12 bg-green-500 rounded-full mb-2 group-hover:w-20 transition-all duration-300"></div>
             <span className="text-xs text-gray-300 uppercase tracking-widest font-semibold">Lower Secondary</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const SubjectGrid = ({ selectedClass, onSelect, onBack }: { selectedClass: string, onSelect: (s: any) => void, onBack: () => void }) => (
  <div className="animate-fade-in px-4 pb-24">
    <div className="max-w-7xl mx-auto">
      <button onClick={onBack} className="mb-8 group flex items-center text-gray-500 hover:text-black font-medium transition-colors">
        <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
             <i className="fas fa-arrow-left"></i>
        </span>
        Back to Classes
      </button>
      
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8">
        <div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">{selectedClass} Subjects</h2>
            <p className="text-gray-500 mt-2 text-lg">Choose a subject to generate syllabus topics.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {SUBJECTS.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject)}
            className="group relative h-64 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 w-full text-left"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img 
                    src={subject.image} 
                    alt={subject.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className={`w-10 h-10 ${subject.color} backdrop-blur-sm bg-opacity-90 text-white rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <i className={`fas ${subject.icon}`}></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{subject.name}</h3>
                <div className="flex items-center text-gray-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                    <span>View Topics</span>
                    <i className="fas fa-arrow-right ml-2 text-green-400"></i>
                </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const TopicBrowser = ({ 
  selectedClass, 
  subject, 
  topics, 
  loading, 
  onSelectTopic, 
  onBack 
}: { 
  selectedClass: string, 
  subject: any, 
  topics: string[], 
  loading: boolean, 
  onSelectTopic: (t: string) => void,
  onBack: () => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTopics = topics.filter(topic => 
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in pb-24">
      {/* Hero Header */}
      <div className="relative h-64 lg:h-80 w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <img src={subject.image} className="w-full h-full object-cover absolute inset-0" alt="Subject Banner" />
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-20 opacity-10"></div>
          
          <div className="relative z-30 container mx-auto px-4 h-full flex flex-col justify-end pb-14">
              <button onClick={onBack} className="absolute top-6 left-4 text-white/80 hover:text-white flex items-center font-medium bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-black/50 transition-all">
                  <i className="fas fa-arrow-left mr-2"></i> Back
              </button>
              
              <div className="flex items-end gap-4">
                  <div className={`w-16 h-16 ${subject.color} text-white rounded-2xl flex items-center justify-center text-2xl shadow-2xl`}>
                      <i className={`fas ${subject.icon}`}></i>
                  </div>
                  <div className="mb-1">
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">{subject.name}</h2>
                      <p className="text-gray-200 font-medium text-lg flex items-center gap-2">
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">{selectedClass}</span>
                          NCDC Syllabus
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {/* Search & Content Container */}
      <div className="container mx-auto px-4 max-w-5xl -mt-8 relative z-40">
        
        {/* Search Input */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex items-center border border-gray-100 mb-6">
          <div className="w-12 h-12 flex items-center justify-center text-gray-400">
            <i className="fas fa-search text-lg"></i>
          </div>
          <input 
              type="text" 
              placeholder={`Search for a chapter or type a new one...`} 
              className="w-full h-12 outline-none text-lg text-gray-700 placeholder-gray-400 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
              >
                  <i className="fas fa-times"></i>
              </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
              <Loader text={`Asking Gemini for the ${subject.name} Syllabus...`} />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-lg">Available Topics</h3>
              <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  {filteredTopics.length} Items
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {/* Custom Search Result Option */}
              {searchTerm.length > 0 && (
                <button 
                    onClick={() => onSelectTopic(searchTerm)}
                    className="w-full text-left p-6 bg-green-50 hover:bg-green-100 transition-all flex items-center justify-between group border-b border-green-200 animate-fade-in"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-green-200">
                            <i className="fas fa-magic"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-green-900 text-lg">Study Topic: "{searchTerm}"</h4>
                            <p className="text-sm text-green-700">Generate detailed custom notes for this topic</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-green-600 shadow-sm">
                         <i className="fas fa-arrow-right"></i>
                    </div>
                </button>
              )}

              {filteredTopics.length === 0 && searchTerm.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-exclamation-circle text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">No topics found</h3>
                  <p className="text-gray-500">Please try checking your connection or try another subject.</p>
                </div>
              ) : (
                filteredTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectTopic(topic)}
                    className="w-full text-left p-6 hover:bg-green-50 transition-all flex items-center justify-between group relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <div className="flex items-start gap-5">
                      <span className="mt-0.5 w-8 h-8 bg-gray-100 text-gray-400 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-lg text-gray-700 group-hover:text-black leading-tight">
                         {/* Highlight matching text if searching */}
                         {searchTerm ? (
                             <span>
                                {topic.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => 
                                    part.toLowerCase() === searchTerm.toLowerCase() 
                                    ? <span key={i} className="bg-yellow-200 text-black rounded px-1">{part}</span> 
                                    : part
                                )}
                             </span>
                         ) : topic}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 group-hover:text-green-600 group-hover:bg-green-100 transition-all flex-shrink-0 ml-4">
                       <i className="fas fa-chevron-right"></i>
                    </div>
                  </button>
                ))
              )}
              
              {filteredTopics.length === 0 && searchTerm.length > 0 && (
                 <div className="p-8 text-center text-gray-500">
                    No other topics match your search. Click the green card above to generate custom notes.
                 </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NoteViewer = ({
  topic,
  content,
  loading,
  onBack
}: {
  topic: string,
  content: string,
  loading: boolean,
  onBack: () => void
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (contentRef.current) {
      navigator.clipboard.writeText(contentRef.current.innerText);
      alert('Notes copied to clipboard!');
    }
  };

  return (
    <div className="animate-fade-in px-4 pb-24 max-w-5xl mx-auto h-full flex flex-col pt-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="group flex items-center text-gray-500 hover:text-black font-medium transition-colors">
          <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
              <i className="fas fa-arrow-left"></i>
          </span>
          Back to Topics
        </button>
        {!loading && content.length > 0 && (
          <button 
            onClick={handleCopy}
            className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg"
          >
            <i className="fas fa-copy"></i> Copy Notes
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 shadow-lg border border-gray-100 min-h-[400px] flex items-center justify-center">
            <Loader text="Gemini is writing your notes and drawing diagrams..." />
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 md:p-10 text-white relative overflow-hidden">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
             <div className="uppercase text-xs font-black tracking-widest opacity-80 mb-3 border-b border-white/20 pb-2 inline-block">Topic Notes</div>
             <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{topic}</h1>
          </div>
          {content ? (
            <div 
                ref={contentRef}
                className="markdown-body p-8 md:p-12 overflow-y-auto text-lg"
                dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
            />
          ) : (
              <div className="p-12 flex items-center justify-center text-gray-400 italic">
                  Starting generation...
              </div>
          )}
          <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
             <div className="inline-flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                <i className="fas fa-magic"></i> Generated by Gemini AI • NCDC Aligned
             </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main App Container ---

const App = () => {
  // State Machine
  const [activeTab, setActiveTab] = useState<string>('home');
  const [view, setView] = useState<'class' | 'subject' | 'topics' | 'notes'>('class');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  
  // Data
  const [topics, setTopics] = useState<string[]>([]);
  const [notesContent, setNotesContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // API Client
  // Ensure process.env.API_KEY is available
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return <div className="p-10 text-red-500">Error: API_KEY is missing from environment variables.</div>;
  }
  const ai = new GoogleGenAI({ apiKey });

  // Handlers
  const handleClassSelect = (c: string) => {
    setSelectedClass(c);
    setView('subject');
  };

  const handleSubjectSelect = async (subject: any) => {
    setSelectedSubject(subject);
    setView('topics');
    setLoading(true);
    setTopics([]);

    try {
      // Use Gemini to fetch syllabus topics
      const model = 'gemini-2.5-flash';
      const prompt = `List the main syllabus topics for ${selectedClass} ${subject.name} according to the new Ugandan NCDC (National Curriculum Development Centre) lower secondary curriculum. 
      Return ONLY a JSON object with a property "topics" containing an array of strings. Do not format as markdown code block. Just raw JSON.`;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.OBJECT,
             properties: {
               topics: {
                 type: Type.ARRAY,
                 items: { type: Type.STRING }
               }
             }
          }
        }
      });

      const jsonText = response.text;
      if (jsonText) {
        const data = JSON.parse(jsonText);
        setTopics(data.topics || []);
      } else {
        setTopics(['Introduction', 'Topic 1', 'Topic 2']); // Fallback
      }
    } catch (e) {
      console.error(e);
      setTopics(['Error loading topics. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  // Helper to clean markdown code blocks from specific HTML structures
  const cleanResponse = (text: string) => {
    if (!text) return '';
    // 1. Robustly remove code fences wrapping the SVG/HTML container.
    // This finds ```html (or xml or nothing) surrounding a <div...<svg...svg>...div> block and removes the backticks.
    let cleaned = text.replace(/```(?:html|xml)?\s*(<div[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>)\s*```/gi, '$1');
    
    // 2. Fallback: If it wraps just the SVG or if structure is slightly different
    cleaned = cleaned.replace(/```(?:html|xml)?\s*(<svg[\s\S]*?<\/svg>)\s*```/gi, '$1');
    
    // 3. Generic Code Block Strip for specific container class if regex 1 missed slightly
    cleaned = cleaned.replace(/```(?:html|xml)?\s*(<div class="my-8[\s\S]*?<\/div>)\s*```/gi, '$1');

    return cleaned;
  };

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setView('notes');
    setLoading(true);
    setNotesContent('');

    try {
      const model = 'gemini-2.5-flash';
      const prompt = `Act as an expert teacher for the Ugandan NCDC New Lower Secondary Curriculum. 
      You are generating revision notes for a student in ${selectedClass} studying ${selectedSubject.name}.
      Topic: "${topic}".

      **CONTENT REQUIREMENTS:**
      1. **Visual Illustrations (MANDATORY):** 
         - You MUST generate **HTML <svg>** diagrams for this topic to visually explain concepts.
         - **Mathematics:** Draw the exact shapes, graphs, or geometric figures being discussed with clear labels, dimensions, and angles.
         - **Biology/Science:** Draw schematic diagrams (e.g., a plant cell structure, human heart, electric circuits, forces on a block).
         - **CRITICAL:** Output the HTML <div> and <svg> tags RAW. **DO NOT** wrap them in \`\`\`html or \`\`\` blocks.
         - **Style:** Use <svg> tags directly in the text stream. Use colors matching the app theme (greens, blues, reds).
         - **Layout:** Wrap the SVG in exactly this div structure: 
           <div class="my-8 flex justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full overflow-x-auto"><div class="w-full max-w-md"> ...svg content... </div></div>
           
         (Insert Newlines before and after the HTML block).
      
      2. **Structure:**
         - **Learning Goal:** Brief bullet point.
         - **Core Knowledge:** Detailed explanation of the concept.
         - **ILLUSTRATION:** (Insert your SVG here).
         - **Step-by-Step / Key Facts:** Use bullet points or numbered lists.
         - **Activity of Integration:** A real-world problem or scenario for the student to solve (NCDC requirement).
         - **Summary:** Quick recap.
      
      3. **Format:**
         - Use Markdown for text (Bold headers, lists).
         - Use raw HTML for SVGs (do not escape them).
         - Start responding IMMEDIATELY.
      `;

      const streamingResp = await ai.models.generateContentStream({
        model: model,
        contents: prompt,
        config: {
            // Disable thinking budget to ensure instant first-token response
            thinkingConfig: { thinkingBudget: 0 } 
        }
      });

      let fullText = '';
      for await (const chunk of streamingResp) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setNotesContent(fullText);
          // If this is the first chunk, stop loading so user sees content
          setLoading(false);
        }
      }
    } catch (e) {
      console.error(e);
      setNotesContent('Error generating notes. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const reset = () => {
    setView('class');
    setActiveTab('home');
    setSelectedClass('');
    setSelectedSubject(null);
    setSelectedTopic('');
    setTopics([]);
    setNotesContent('');
  };

  return (
    <div className="min-h-screen bg-green-50/30 flex flex-col font-sans text-gray-900 selection:bg-green-200 selection:text-black">
      <Header onHome={reset} />
      
      <main className="flex-grow relative">
        {/* Background decoration */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Tab Views */}
        <div className="py-8">
            {activeTab === 'home' && (
                <>
                    {view === 'class' && (
                      <ClassSelector onSelect={handleClassSelect} />
                    )}

                    {view === 'subject' && (
                      <SubjectGrid 
                        selectedClass={selectedClass} 
                        onSelect={handleSubjectSelect} 
                        onBack={() => setView('class')} 
                      />
                    )}

                    {view === 'topics' && selectedSubject && (
                      <TopicBrowser 
                        selectedClass={selectedClass}
                        subject={selectedSubject}
                        topics={topics}
                        loading={loading}
                        onSelectTopic={handleTopicSelect}
                        onBack={() => setView('subject')}
                      />
                    )}

                    {view === 'notes' && (
                      <NoteViewer 
                        topic={selectedTopic}
                        content={cleanResponse(notesContent)}
                        loading={loading}
                        onBack={() => setView('topics')}
                      />
                    )}
                </>
            )}
            
            {/* Settings View */}
            {activeTab === 'settings' && <SettingsView />}

            {/* Chat Overlay - Always mounted to preserve state, but hidden via CSS */}
            <ChatOverlay 
                isVisible={activeTab === 'chat'} 
                apiKey={apiKey} 
            />
        </div>
      </main>
      
      {view !== 'class' && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
