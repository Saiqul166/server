import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Pause, ExternalLink, Terminal, Copy, Check, MessageSquare, Code, Cpu } from 'lucide-react';

export default function App() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [terminalHistory, setTerminalHistory] = useState<{type: 'user'|'system'|'ai'|'error', text: string}[]>([
    { type: 'system', text: 'Welcome to CloudNode v1.0 Interactive Terminal' },
    { type: 'system', text: 'Type a bash command or ask AI to do it for you.' }
  ]);
  const [commandInput, setCommandInput] = useState('');
  const [apiKey, setApiKey] = useState('my-super-secret-key-2024');
  const [isAiMode, setIsAiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalHistory]);
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const currentCmd = commandInput;
    setCommandInput('');
    setTerminalHistory(prev => [...prev, { type: 'user', text: currentCmd }]);
    setIsLoading(true);

    try {
      if (isAiMode) {
        // AI Mode: generate command then execute
        setTerminalHistory(prev => [...prev, { type: 'ai', text: `🧠 Thinking...` }]);
        const aiRes = await fetch('/ai-command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
          body: JSON.stringify({ prompt: currentCmd })
        });
        const aiData = await aiRes.json();
        
        if (!aiRes.ok) throw new Error(aiData.error || 'Failed to generate AI command');
        
        setTerminalHistory(prev => {
          const newHist = [...prev];
          newHist[newHist.length - 1] = { type: 'ai', text: `Generated Command: ${aiData.command}` };
          return newHist;
        });

        // automatically execute the generated command
        await executeCommand(aiData.command);

      } else {
        // Direct Bash Mode
        await executeCommand(currentCmd);
      }
    } catch (err: any) {
       setTerminalHistory(prev => [...prev, { type: 'error', text: err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = async (cmd: string) => {
    const runRes = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ command: cmd })
    });
    const runData = await runRes.json();

    if (!runRes.ok) {
        setTerminalHistory(prev => [...prev, { type: 'error', text: runData.stderr || runData.error }]);
    } else {
        if (runData.output) {
          setTerminalHistory(prev => [...prev, { type: 'system', text: runData.output }]);
        }
        if (runData.warnings) {
          setTerminalHistory(prev => [...prev, { type: 'error', text: runData.warnings }]);
        }
    }
  }

  const codeBlocks = {
    clone: `git pull origin main\nnpm install\nnpm start`,
    deploy: `gcloud services enable run.googleapis.com\ngcloud run deploy node-backend \\\n  --source . \\\n  --port 8080 \\\n  --allow-unauthenticated \\\n  --region us-central1`
  };

  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen w-full overflow-y-auto font-mono flex flex-col p-4 md:p-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Terminal size={24} className="text-cyan-400" />
            NodeOps + AI v2.0
          </h1>
          <span className="text-[10px] md:text-xs bg-slate-800 px-2 py-0.5 md:py-1 rounded text-slate-400 border border-slate-700 hidden sm:inline-block">
            WITH GEMMA-7B
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className="text-slate-500 italic">API Key:</span>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-400 w-32 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-xs md:text-sm text-green-400">System Ready</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow">
        {/* Sidebar: Metrics & Endpoints */}
        <section className="col-span-1 md:col-span-4 lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg shadow-inner">
            <h2 className="text-xs text-slate-500 mb-3 uppercase tracking-widest font-bold">Quick Actions</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <button onClick={() => executeCommand('ls -la')} className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 w-full text-left">
                   <Terminal size={14} /> List Files
                </button>
              </li>
              <li className="flex items-center gap-3">
                <button onClick={() => executeCommand('npm run dev')} className="flex items-center gap-2 text-slate-300 hover:text-green-400 w-full text-left">
                   <Play size={14} /> Start Dev Server
                </button>
              </li>
              <li className="flex items-center gap-3">
                <button onClick={() => executeCommand('env')} className="flex items-center gap-2 text-slate-300 hover:text-yellow-400 w-full text-left">
                   <Code size={14} /> Check Env Variables
                </button>
              </li>
            </ul>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg shadow-inner">
            <h2 className="text-xs text-slate-500 mb-3 uppercase tracking-widest font-bold">AI Power (Google Gemini)</h2>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
               সার্ভারে কোনো বিশাল মডেল ডাউনলোড করার ঝামেলা এড়াতে সরাসরি <strong>Google Gemini API</strong> ব্যবহার করা হয়েছে। শুধু লিখে বললেই টার্মিনাল আপনার জন্য সঠিক লিনাক্স কমান্ড জেনারেট করে রান করতে পারবে। 
            </p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 bg-slate-800 rounded border border-slate-700 hover:border-cyan-500 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isAiMode} 
                  onChange={() => setIsAiMode(!isAiMode)} 
                  className="accent-cyan-500"
                />
                <Cpu size={16} className={isAiMode ? 'text-cyan-400' : 'text-slate-500'} />
                <span className={isAiMode ? 'text-white' : 'text-slate-400'}>Enable Gemini Assistant</span>
              </label>
            </div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
             <h2 className="text-xs text-slate-500 mb-3 uppercase tracking-widest font-bold">Info</h2>
             <p className="text-xs text-slate-400 leading-relaxed mb-4">
               Cloud Run বা Cloud Shell-এর সীমিত RAM-এ 31B মডেল ডাউনলোড করে লোকালি চালানো অসম্ভব। তাই প্রজেক্টের বিল্ট-ইন Gemini API ব্যবহার করে দ্রুততম AI সাপোর্ট নিশ্চিত করা হয়েছে।
             </p>
             <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
               Environment Variable GEMINI_API_KEY is actively used.
             </p>
          </div>
        </section>

        {/* Main Body: Interactive Terminal */}
        <section className="col-span-1 md:col-span-8 lg:col-span-9 flex flex-col gap-6">
          
          <div className="flex-grow bg-[#050510] rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl relative min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent z-10"></div>
            
            <div className="bg-slate-900 px-4 py-2.5 flex justify-between items-center border-b border-slate-800">
              <span className="text-xs text-slate-400 font-bold tracking-widest flex items-center gap-2">
                <MessageSquare size={14} className={isAiMode ? "text-cyan-400" : "text-slate-500"} /> 
                {isAiMode ? "AI ASSISTANT TERMINAL" : "BASH TERMINAL"}
              </span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow flex flex-col gap-2 font-mono text-sm leading-relaxed max-h-[500px]">
              {terminalHistory.map((msg, i) => (
                <div key={i} className="mb-1 whitespace-pre-wrap word-break">
                  {msg.type === 'user' && (
                    <div className="text-white flex gap-2">
                      <span className="text-green-400">root@cloudnode:~#</span> 
                      {msg.text}
                    </div>
                  )}
                  {msg.type === 'system' && (
                    <div className="text-slate-300 pl-4 border-l-2 border-slate-700">{msg.text}</div>
                  )}
                  {msg.type === 'error' && (
                    <div className="text-red-400 pl-4 border-l-2 border-red-900/50">{msg.text}</div>
                  )}
                  {msg.type === 'ai' && (
                    <div className="text-cyan-400 pl-4 border-l-2 border-cyan-900/50 italic flex items-center gap-2">
                      <Cpu size={14} /> {msg.text}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="text-slate-500 pl-4 flex items-center gap-2 animate-pulse mt-2">
                  <span className="w-2 h-4 bg-cyan-400 block"></span> Processing...
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            <form onSubmit={handleCommandSubmit} className="border-t border-slate-800 bg-black p-3 flex">
              <span className={isAiMode ? "text-cyan-400 mr-2 flex items-center" : "text-green-400 mr-2 flex items-center"}>
                {isAiMode ? '✨ AI >' : 'root@cloudnode:~#'}
              </span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder={isAiMode ? "Write what you want to do in Bengali or English..." : "Type a bash command (e.g. ls -la)"}
                className="flex-grow bg-transparent text-white border-none focus:outline-none font-mono text-sm"
                autoComplete="off"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading} className="text-slate-500 hover:text-cyan-400 ml-2">
                <Play size={16} fill="currentColor" />
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Bottom Ribbon */}
      <footer className="mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 gap-4">
        <div className="flex gap-4 md:gap-6 w-full md:w-auto justify-center md:justify-start">
          <span className="flex items-center gap-1"><span className="text-cyan-500/50">●</span> NODE_ENV: production</span>
          <span className="flex items-center gap-1"><span className="text-green-500/50">●</span> CLOUD_RUN: optimized</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="italic text-slate-400">Interactive Web Terminal</span>
          <div className="w-1.5 h-1.5 bg-slate-700 rounded-full border border-slate-600"></div>
          <span className="text-slate-500">v2.0.0-ai-ready</span>
        </div>
      </footer>
    </div>
  );
}

