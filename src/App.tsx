import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Search, 
  Menu, 
  X, 
  Sparkles,
  RefreshCcw,
  Copy,
  Check,
  Send,
  Download,
  Moon,
  Sun,
  Trash2,
  Trash,
  History,
  FileText,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TOOLS, ToolDef } from './constants';
import { generateContent, generateImage, ChatMessage } from './services/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolDef | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAction = async (forcedInput?: string) => {
    const currentInput = forcedInput || input;
    if (!currentInput.trim() || !activeTool) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: currentInput }] };
    setChatHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (activeTool.id === 'image') {
        const imageUrl = await generateImage(currentInput);
        const modelMessage: ChatMessage = { 
          role: 'model', 
          parts: [{ text: imageUrl ? `![Generated Image](${imageUrl})` : 'Failed to generate image.' }] 
        };
        setChatHistory(prev => [...prev, modelMessage]);
      } else {
        // Filter out image results from history if switching tools, though ideally history is per tool session
        const result = await generateContent(currentInput, activeTool.systemPrompt, chatHistory);
        const modelMessage: ChatMessage = { role: 'model', parts: [{ text: result }] };
        setChatHistory(prev => [...prev, modelMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: 'Error: Could not reach the AI. Check your connection.' }] };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = (text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `OmniAI-${activeTool?.id || 'export'}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const clearChat = () => {
    setChatHistory([]);
    setInput('');
  };

  const filteredTools = TOOLS.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn(
      "flex h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-300",
      isDarkMode && "dark"
    )}>
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex-shrink-0 flex flex-col z-20 overflow-hidden"
      >
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Sparkles className="text-white dark:text-black w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">OmniAI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search tools..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-sm w-full border-transparent focus:bg-white dark:focus:bg-neutral-700 focus:ring-1 focus:ring-neutral-200 transition-all outline-none"
              />
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 pt-0 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Capabilities</span>
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
          </div>
          {filteredTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool);
                setChatHistory([]);
                setInput('');
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left",
                activeTool?.id === tool.id 
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-lg" 
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                activeTool?.id === tool.id ? "bg-white/20 dark:bg-black/10" : "bg-neutral-100 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700"
              )}>
                <tool.icon className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">{tool.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4">
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Credits Used</p>
              <p className="text-[10px] text-neutral-400">128/200</p>
            </div>
            <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div className="h-full bg-black dark:bg-white w-2/3 transition-all duration-1000" />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        {/* Header */}
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-10 transition-colors">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
             {activeTool && (
               <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", activeTool.color)}>
                 <activeTool.icon className="text-white w-4 h-4" />
               </div>
             )}
             <h1 className="font-bold text-lg tracking-tight">
               {activeTool ? activeTool.name : 'Welcome to OmniAI'}
             </h1>
          </div>
          
          <div className="ml-auto flex items-center gap-3">
             {activeTool && chatHistory.length > 0 && (
                <button 
                  onClick={clearChat}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 rounded-lg transition-all"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
             )}
             <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-white dark:border-neutral-800 shadow-sm" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div 
             ref={scrollRef}
             className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
          >
            <AnimatePresence mode="wait">
              {!activeTool ? (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-5xl mx-auto py-10"
                >
                  <div className="text-center mb-16">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-100 dark:border-amber-900/30"
                    >
                      <Sparkles className="w-3 h-3" /> All-in-One Intelligence
                    </motion.div>
                    <h2 className="text-5xl font-black tracking-tight mb-4">Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Workflow</span></h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
                      Transform how you write, code, and create with our suite of next-generation AI tools powered by Gemini.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOOLS.map((tool, idx) => (
                      <motion.button
                        key={tool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTool(tool)}
                        className="group relative bg-white dark:bg-neutral-900 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-all duration-300 text-left shadow-sm hover:shadow-2xl overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <tool.icon className="w-32 h-32 text-black dark:text-white" />
                        </div>
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner", tool.color)}>
                          <tool.icon className="text-white w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-2xl mb-3 tracking-tight">{tool.name}</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-6">{tool.description}</p>
                        <div className="flex items-center text-xs font-bold uppercase tracking-widest text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                          Get Started <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="max-w-4xl mx-auto w-full space-y-6">
                   {/* Welcome message if empty */}
                   {chatHistory.length === 0 && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 px-6 bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm"
                     >
                        <div className={cn("w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6", activeTool.color)}>
                          <activeTool.icon className="text-white w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">How can I help with {activeTool.name}?</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto">Selected tool: {activeTool.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {activeTool.templates?.map((template, i) => (
                            <button
                              key={i}
                              onClick={() => handleAction(template.prompt)}
                              className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-2xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 transition-all text-center flex flex-col items-center gap-2 group"
                            >
                              <FileText className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white" />
                              {template.label}
                            </button>
                          ))}
                        </div>
                     </motion.div>
                   )}

                   {/* Chat History Messages */}
                   <div className="space-y-6">
                     {chatHistory.map((msg, i) => (
                       <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex gap-4 p-6 rounded-[2rem] border transition-all",
                            msg.role === 'user' 
                              ? "bg-neutral-100 dark:bg-neutral-800 border-transparent ml-12" 
                              : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 mr-12 shadow-sm"
                          )}
                       >
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center",
                           msg.role === 'user' ? "bg-black dark:bg-white" : activeTool.color
                         )}>
                            {msg.role === 'user' ? (
                              <div className="text-white dark:text-black text-[10px] font-bold">ME</div>
                            ) : (
                              <activeTool.icon className="text-white w-5 h-5" />
                            )}
                         </div>
                         <div className="flex-1 overflow-hidden">
                           <div className="prose prose-neutral dark:prose-invert max-w-none prose-img:rounded-2xl prose-pre:bg-neutral-900 prose-pre:text-neutral-100">
                             <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                           </div>
                           {msg.role === 'model' && (
                             <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex gap-2">
                               <button 
                                 onClick={() => copyToClipboard(msg.parts[0].text)}
                                 className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
                               >
                                 {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                 {copied ? 'Copied' : 'Copy'}
                               </button>
                               <button 
                                 onClick={() => downloadText(msg.parts[0].text)}
                                 className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
                               >
                                 <Download className="w-3 h-3" />
                                 Export
                               </button>
                             </div>
                           )}
                         </div>
                       </motion.div>
                     ))}
                     
                     {isLoading && (
                        <motion.div 
                          className="flex gap-4 p-6 rounded-[2rem] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mr-12 shadow-sm animate-pulse"
                        >
                           <div className={cn("w-10 h-10 rounded-xl flex-shrink-0 animate-pulse", activeTool.color)} />
                           <div className="space-y-3 flex-1">
                             <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
                             <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-full" />
                             <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-2/3" />
                           </div>
                        </motion.div>
                     )}
                   </div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Bar */}
          <AnimatePresence>
            {activeTool && (
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="p-4 md:p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800"
              >
                <div className="max-w-4xl mx-auto relative">
                  <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAction();
                      }
                    }}
                    placeholder={`Ask ${activeTool.name}... (Press Enter to send)`}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-[2rem] px-6 py-5 pr-16 outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all text-sm resize-none scrollbar-hide min-h-[64px] max-h-[200px]"
                    rows={1}
                  />
                  <div className="absolute right-3 bottom-3 flex gap-2">
                    <button 
                      onClick={() => handleAction()}
                      disabled={isLoading || !input.trim()}
                      className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-lg"
                    >
                      {isLoading ? (
                        <RefreshCcw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="max-w-4xl mx-auto px-6 py-2 flex items-center justify-between">
                   <p className="text-[10px] text-neutral-400 font-medium tracking-tight">Gemini 2.0 Flash is currently active.</p>
                   <div className="flex gap-4">
                     <button className="text-[10px] text-neutral-400 hover:text-black dark:hover:text-white transition-colors font-bold uppercase tracking-widest flex items-center gap-1 group">
                       <History className="w-3 h-3" /> Chat history
                     </button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

