import React, { useState } from 'react';
import { Play, Square, Pause, ExternalLink, Terminal, Copy, Check } from 'lucide-react';

export default function App() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const codeBlocks = {
    git: `git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/reponame.git
git push -u origin main`,
    clone: `git clone https://github.com/yourusername/reponame.git
cd reponame
npm install
node server.js`,
    deploy: `gcloud services enable run.googleapis.com
gcloud run deploy node-backend \\
  --source . \\
  --port 8080 \\
  --allow-unauthenticated \\
  --region us-central1`,
    curl: `curl -X POST https://YOUR-CLOUD-RUN-URL.a.run.app/timer \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: my-super-secret-key-2024" \\
  -d '{"seconds": 5}'`,
    fetch: `fetch('https://YOUR-CLOUD-RUN-URL.a.run.app/timer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'my-super-secret-key-2024'
  },
  body: JSON.stringify({ seconds: 10 })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));`
  };

  return (
    <div className="bg-slate-950 text-slate-200 min-h-screen w-full overflow-y-auto font-mono flex flex-col p-4 md:p-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Terminal size={24} className="text-cyan-400" />
            NodeOps v1.0
          </h1>
          <span className="text-[10px] md:text-xs bg-slate-800 px-2 py-0.5 md:py-1 rounded text-slate-400 border border-slate-700 hidden sm:inline-block">
            PRODUCTION-READY
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className="text-slate-500 italic">Port:</span>
            <span className="text-cyan-400">process.env.PORT</span>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-xs md:text-sm text-green-400">Cloud Run Ready</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-grow">
        {/* Sidebar: Metrics & Endpoints */}
        <section className="col-span-1 md:col-span-4 lg:col-span-3 flex flex-col gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg shadow-inner">
            <h2 className="text-xs text-slate-500 mb-3 uppercase tracking-widest font-bold">Architecture</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-cyan-300">
                <span className="opacity-50 text-lg">📄</span> server.js
              </li>
              <li className="flex items-center gap-3">
                <span className="opacity-50 text-lg">📦</span> package.json
              </li>
              <li className="flex items-center gap-3">
                <span className="opacity-50 text-lg">🐳</span> Dockerfile
              </li>
            </ul>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
            <h2 className="text-xs text-slate-500 mb-3 uppercase tracking-widest font-bold">Endpoints</h2>
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-blue-400 font-bold">POST</span>
                  <span className="text-slate-300">/timer</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-red-400 font-bold">POST</span>
                  <span className="text-slate-300">/run</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col gap-2">
            <div>
              <h3 className="text-[10px] text-slate-500 uppercase font-bold mb-1">Security Mode</h3>
              <p className="text-xs text-white">API Key Auth: <span className="text-green-500 font-bold">ACTIVE</span></p>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-2">
              Header: <span className="text-cyan-400">x-api-key</span>
            </p>
          </div>
        </section>

        {/* Main Body: Documentation & Commands */}
        <section className="col-span-1 md:col-span-8 lg:col-span-9 flex flex-col gap-6">
          
          {/* Instructions Block */}
          <div className="flex-grow bg-[#050510] rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="bg-slate-900 px-4 py-2.5 flex justify-between items-center border-b border-slate-800">
              <span className="text-xs text-slate-400 font-bold tracking-widest flex items-center gap-2">
                <Terminal size={14} /> DEPLOYMENT_GUIDE.md
              </span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
              </div>
            </div>
            
            <div className="p-5 md:p-6 overflow-y-auto space-y-8 flex-grow">
              
              {/* Step 1 & 2 */}
              <div className="space-y-4">
                <h3 className="text-lg text-white font-bold border-b border-slate-800 pb-2">1. Local Setup & GitHub Push</h3>
                <p className="text-slate-400 text-sm">প্রথমে আপনার প্রজেক্ট গিটহাবে পুশ করুন (আপনার লোকাল পিসি থেকে):</p>
                <div className="relative group">
                  <pre className="bg-black text-green-400 p-4 rounded-lg text-sm border border-slate-800 overflow-x-auto">
                    <code>{codeBlocks.git}</code>
                  </pre>
                  <button onClick={() => handleCopy(codeBlocks.git, 'git')} className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    {copiedScript === 'git' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>

                <p className="text-slate-400 text-sm mt-4">অথবা, গিটহাব থেকে ক্লোন করে সার্ভার রান করতে চাইলে:</p>
                <div className="relative group">
                  <pre className="bg-black text-green-400 p-4 rounded-lg text-sm border border-slate-800 overflow-x-auto">
                    <code>{codeBlocks.clone}</code>
                  </pre>
                  <button onClick={() => handleCopy(codeBlocks.clone, 'clone')} className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    {copiedScript === 'clone' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <h3 className="text-lg text-white font-bold border-b border-slate-800 pb-2">2. Google Cloud Run Deploy</h3>
                <p className="text-slate-400 text-sm">Google Cloud Shell ওপেন করুন এবং প্রজেক্ট ফোল্ডারে গিয়ে কমান্ডগুলো রান করুন:</p>
                <div className="relative group">
                  <pre className="bg-black text-cyan-400 p-4 rounded-lg text-sm border border-slate-800 overflow-x-auto">
                    <code>{codeBlocks.deploy}</code>
                  </pre>
                  <button onClick={() => handleCopy(codeBlocks.deploy, 'deploy')} className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    {copiedScript === 'deploy' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="bg-cyan-950/20 border-l-2 border-cyan-400 p-3 rounded">
                  <p className="text-slate-300 text-sm">✓ Deploying... Done.</p>
                  <p className="text-white text-sm mt-1">
                    Service URL: <span className="underline text-cyan-400">https://node-backend-xxx.a.run.app</span>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4">
                <h3 className="text-lg text-white font-bold border-b border-slate-800 pb-2">3. API Testing Examples</h3>
                
                <p className="text-slate-400 text-sm"><strong className="text-white">Sample Curl Command:</strong> টার্মিনাল থেকে API টেস্ট করতে:</p>
                <div className="relative group">
                  <pre className="bg-black text-yellow-400 p-4 rounded-lg text-sm border border-slate-800 overflow-x-auto">
                    <code>{codeBlocks.curl}</code>
                  </pre>
                  <button onClick={() => handleCopy(codeBlocks.curl, 'curl')} className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    {copiedScript === 'curl' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>

                <p className="text-slate-400 text-sm mt-4"><strong className="text-white">Website Fetch Example:</strong> ফ্রন্টএন্ড বা ওয়েবসাইট থেকে কল করতে:</p>
                <div className="relative group">
                  <pre className="bg-black text-pink-400 p-4 rounded-lg text-sm border border-slate-800 overflow-x-auto">
                    <code>{codeBlocks.fetch}</code>
                  </pre>
                  <button onClick={() => handleCopy(codeBlocks.fetch, 'fetch')} className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    {copiedScript === 'fetch' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              
            </div>
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
          <span className="italic text-slate-400">Bengali Documentation Integrated</span>
          <div className="w-1.5 h-1.5 bg-slate-700 rounded-full border border-slate-600"></div>
          <span className="text-slate-500">v1.2.0-stable</span>
        </div>
      </footer>
    </div>
  );
}

