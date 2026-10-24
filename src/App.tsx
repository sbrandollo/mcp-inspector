import { useState, type FormEvent, useEffect, useRef, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Terminal, Box, AlertCircle, ChevronRight, Loader2, Globe, Settings2, Plus, Trash2, ChevronDown, History, X } from 'lucide-react';

interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: any;
}

interface ListToolsResponse {
  result: {
    tools: MCPTool[];
  };
}

const STORAGE_KEY = 'mcp_url_history';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [toolSearchQuery, setToolSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveHistory = (newHistory: string[]) => {
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const addToHistory = (newUrl: string) => {
    const filtered = history.filter(h => h !== newUrl);
    const updated = [newUrl, ...filtered].slice(0, 10);
    saveHistory(updated);
  };

  const removeFromHistory = (e: MouseEvent, urlToRemove: string) => {
    e.stopPropagation();
    const updated = history.filter(h => h !== urlToRemove);
    saveHistory(updated);
  };

  const addHeader = () => setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  const removeHeader = (index: number) => setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const next = [...customHeaders];
    next[index][field] = val;
    setCustomHeaders(next);
  };

  const fetchTools = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setTools([]);
    setShowHistory(false);

    // Convert headers to object
    const headersObj = customHeaders.reduce((acc, curr) => {
      if (curr.key.trim()) {
        acc[curr.key.trim()] = curr.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    try {
      const response = await fetch('/api/mcp/list-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: url.trim(),
          headers: headersObj
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch tools');
      }

      if (data.result?.tools) {
        setTools(data.result.tools);
        addToHistory(url.trim());
      } else {
        throw new Error('Invalid MCP response format');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(h => 
    h.toLowerCase().includes(url.toLowerCase())
  );

  const filteredTools = tools.filter(tool => {
    const query = toolSearchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(query) ||
      (tool.description || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-[1024px] mx-auto min-h-screen bg-[#FAFAFA] text-[#111111] font-sans flex flex-col p-12">
      {/* Header */}
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">MCP Tool Explorer</h1>
        </div>
        <p className="text-zinc-500 text-lg max-w-xl">
          Enter a Model Context Protocol server URL to discover the tools it exposes.
        </p>
      </header>

      <main className="flex-grow flex flex-col">
        <div className="w-full max-w-3xl">
          {/* Input Area */}
          <div className="relative z-20" ref={historyRef}>
            <div className="relative flex items-center group">
              <div className="absolute left-4 text-zinc-400">
                <Search size={20} />
              </div>
              <form onSubmit={fetchTools} className="w-full flex items-center">
                <input
                  type="url"
                  required
                  placeholder="http://localhost:3000/mcp"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setShowHistory(true);
                  }}
                  onFocus={() => setShowHistory(true)}
                  className="w-full bg-white border border-zinc-200 rounded-2xl py-5 pl-12 pr-44 text-lg shadow-sm focus:outline-none focus:border-zinc-400 transition-colors"
                  disabled={loading}
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Fetch Tools'}
                </button>
              </form>
            </div>

            {/* History Dropdown */}
            <AnimatePresence>
              {showHistory && filteredHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden z-30"
                >
                  <div className="py-2">
                    <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50 mb-1">
                      Recent Servers
                    </div>
                    {filteredHistory.map((h, i) => (
                      <div
                        key={h}
                        onClick={() => {
                          setUrl(h);
                          setShowHistory(false);
                        }}
                        className="group flex items-center justify-between px-4 py-3 hover:bg-zinc-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <History size={14} className="text-zinc-400 shrink-0" />
                          <span className="text-sm text-zinc-600 truncate">{h}</span>
                        </div>
                        <button
                          onClick={(e) => removeFromHistory(e, h)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-200 rounded text-zinc-400 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Advanced Section */}
          <div className="mt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
            >
              <Settings2 size={14} />
              Advanced
              <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                <ChevronDown size={14} />
              </motion.div>
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 pb-2 space-y-3">
                    <p className="text-xs text-zinc-500 mb-2 font-medium">Custom Request Headers</p>
                    {customHeaders.map((header, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex gap-2"
                      >
                        <input
                          placeholder="Header Name"
                          value={header.key}
                          onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                          className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
                        />
                        <input
                          placeholder="Value"
                          value={header.value}
                          onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                          className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
                        />
                        <button
                          onClick={() => removeHeader(idx)}
                          className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                    <button
                      onClick={addHeader}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-black transition-colors py-1"
                    >
                      <Plus size={14} />
                      Add Header
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {toolSearchQuery ? `Matching Tools (${filteredTools.length}/${tools.length})` : `Discovered Tools (${tools.length})`}
              </h2>
              {tools.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Connected
                </div>
              )}
            </div>

            {tools.length > 0 && (
              <div className="mb-6 relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Search tools by name or description..."
                  value={toolSearchQuery}
                  onChange={(e) => setToolSearchQuery(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-zinc-400 transition-colors shadow-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredTools.map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-zinc-100 p-5 rounded-2xl shadow-sm hover:border-zinc-300 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <code className="bg-zinc-100 text-zinc-800 px-2 py-1 rounded text-sm font-mono group-hover:bg-black group-hover:text-white transition-colors">
                        {tool.name}
                      </code>
                    </div>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-4 line-clamp-2 min-h-[40px]">
                      {tool.description || 'No description provided.'}
                    </p>
                    <div className="flex gap-2">
                       <span className="text-[10px] px-2 py-0.5 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-full">
                        params: {tool.inputSchema?.properties ? Object.keys(tool.inputSchema.properties).length : 0}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-50 hidden group-hover:block overflow-hidden transition-all">
                      <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-50 p-3 rounded-lg overflow-x-auto max-h-40">
                         {JSON.stringify(tool.inputSchema || {}, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tools.length === 0 && !loading && !error && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
                  <p className="text-zinc-300 font-medium">Ready for exploration</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="pt-8 mt-auto border-t border-zinc-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-400 font-mono tracking-tighter uppercase">MCP protocol 2024-11-05</span>
          <nav className="flex gap-6 text-xs text-zinc-400 font-medium uppercase tracking-widest">
            <a href="https://github.com/sbrandollo/mcp-inspector" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">GitHub</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
