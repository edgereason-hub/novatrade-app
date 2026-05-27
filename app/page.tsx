'use client';

import { useState, useEffect, useRef } from 'react';

type Tab = 'chat' | 'insights' | 'alerts' | 'calendar' | 'portfolio' | 'feed';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Alert {
  id: number;
  symbol: string;
  name: string;
  reason: string;
  timestamp: string;
}

interface PortfolioItem {
  symbol: string;
  name: string;
  value: number;
  pnl: number;
  pnlPct: number;
  price: number;
  assetClass: string;
  priceChange: number;
}

export default function NovaTrade() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello Hamish! I'm Nova, your personal 24/7 trading intelligence agent. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showMarketPulse, setShowMarketPulse] = useState(false);

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    { symbol: "NVDA", name: "NVIDIA", value: 12480, pnl: 1240, pnlPct: 11.0, price: 124.8, assetClass: "Tech", priceChange: 0.8 },
    { symbol: "TSLA", name: "Tesla", value: 8750, pnl: -320, pnlPct: -3.5, price: 320.5, assetClass: "Auto", priceChange: -1.2 },
    { symbol: "GC=F", name: "Gold", value: 6350, pnl: 180, pnlPct: 2.9, price: 2650, assetClass: "Commodity", priceChange: 0.4 },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Real-time price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio(prev => prev.map(item => {
        const change = (Math.random() - 0.48) * 1.4;
        const newPrice = Math.max(10, parseFloat((item.price + change).toFixed(2)));
        const newValue = Math.round(newPrice * 100);
        const newPnlPct = parseFloat(((newValue - (item.value - item.pnl)) / (item.value - item.pnl) * 100).toFixed(1));

        return {
          ...item,
          price: newPrice,
          value: newValue,
          pnl: Math.round(newValue * 0.1),
          pnlPct: newPnlPct,
          priceChange: change
        };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setTimeout(() => {
      let response = "I'm analyzing the latest market data for you...";
      const lower = userMsg.toLowerCase();
      if (lower.includes("nvda") || lower.includes("nvidia")) response = "NVDA showing strong institutional accumulation. RSI bullish. Target $148-152. Set alert?";
      else if (lower.includes("tsla") || lower.includes("tesla")) response = "Tesla has positive momentum. Key level $320. Shall I set an alert?";
      else if (lower.includes("yen") || lower.includes("jpy")) response = "USD/JPY testing resistance near 148. Yen remains weak.";
      else if (lower.includes("gold") || lower.includes("gc")) response = "Gold holding above $2650 with safe-haven flows.";
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 700);
  };

  const addAlert = (symbol: string, name: string, reason: string) => {
    const newAlert: Alert = {
      id: Date.now(),
      symbol,
      name,
      reason,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAlerts(prev => [newAlert, ...prev]);
    setActiveTab('alerts');
  };

  const deleteAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const playSquawk = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("High impact market move detected. Pay attention.");
      utterance.rate = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  const menuItems = [
    { id: 'chat', label: 'Nova Chat', icon: '💬' },
    { id: 'insights', label: 'Opportunity Insights', icon: '📈' },
    { id: 'alerts', label: 'Alerts & Squawks', icon: '🚨' },
    { id: 'calendar', label: 'Economic Calendar', icon: '📅' },
    { id: 'portfolio', label: 'My Portfolio', icon: '💼' },
    { id: 'feed', label: 'Live Global Feed', icon: '🌍' },
  ];

  return (
    <div className="flex h-screen bg-[#0A0F1C] text-white overflow-hidden">
      <div className="hidden md:flex w-72 border-r border-white/10 flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-3xl font-bold text-[#00D4FF]">NovaTrade</h1>
        </div>
        <div className="flex-1 overflow-auto py-4">
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex items-center gap-3 px-6 py-3.5 mx-3 rounded-2xl cursor-pointer transition-all ${activeTab === item.id ? 'bg-[#00D4FF] text-black' : 'hover:bg-white/5'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-3xl p-2">☰</button>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/10 flex items-center px-8 justify-between">
          <h2 className="text-2xl font-semibold">{menuItems.find(m => m.id === activeTab)?.label}</h2>
          <button onClick={playSquawk} className="bg-red-600 px-6 py-2 rounded-2xl text-sm">🔊 Squawk</button>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'chat' && (
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              <div className="flex-1 overflow-auto space-y-6 pb-8" ref={messagesEndRef}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-6 py-4 rounded-3xl ${msg.role === 'user' ? 'bg-[#00D4FF] text-black' : 'bg-[#1A2338]'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask Nova anything about markets..."
                  className="flex-1 bg-[#1A2338] rounded-2xl px-6 py-4 focus:outline-none"
                />
                <button onClick={sendMessage} className="bg-[#00D4FF] text-black px-10 rounded-2xl font-medium">Send</button>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1A2338] p-8 rounded-3xl">
                <h3 className="font-semibold mb-3">NVDA - Strong institutional accumulation</h3>
                <p className="text-gray-400">RSI bullish. Target $148-152.</p>
                <button onClick={() => addAlert("NVDA", "NVIDIA", "Price above $148")} className="mt-6 bg-[#00D4FF] text-black px-8 py-3 rounded-2xl">Set Alert</button>
              </div>
              <div className="bg-[#1A2338] p-8 rounded-3xl">
                <h3 className="font-semibold mb-3">Gold - Safe haven flows accelerating</h3>
                <p className="text-gray-400">Holding above $2650.</p>
                <button onClick={() => addAlert("GC=F", "Gold", "Price above $2680")} className="mt-6 bg-[#00D4FF] text-black px-8 py-3 rounded-2xl">Set Alert</button>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div>
              <button onClick={playSquawk} className="bg-red-600 px-10 py-4 rounded-2xl text-lg mb-8">🔊 Test High-Impact Squawk</button>
              <div className="space-y-4">
                {alerts.length === 0 && <p className="text-gray-400">No alerts yet.</p>}
                {alerts.map(a => (
                  <div key={a.id} className="bg-[#1A2338] p-5 rounded-2xl flex justify-between items-center">
                    <div>{a.symbol} — {a.reason}</div>
                    <button onClick={() => deleteAlert(a.id)} className="text-red-400">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && <div className="text-center text-2xl py-12 text-emerald-400">Economic Calendar - Major events this week</div>}
          {activeTab === 'portfolio' && (
            <div>
              <div className="mb-8">
                <h3 className="text-xl mb-2">Total Portfolio Value</h3>
                <div className="text-5xl font-bold text-[#00D4FF]">${portfolio.reduce((sum, p) => sum + p.value, 0).toLocaleString()}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-4">Symbol</th>
                      <th className="py-4">Name</th>
                      <th className="py-4 text-right">Price</th>
                      <th className="py-4 text-right">Value</th>
                      <th className="py-4 text-right">P&L %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item, i) => (
                      <tr key={i} className="border-b border-white/10">
                        <td className="py-4 font-medium">{item.symbol}</td>
                        <td className="py-4 text-gray-400">{item.name}</td>
                        <td className="py-4 text-right font-mono">${item.price}</td>
                        <td className="py-4 text-right font-mono">${item.value.toLocaleString()}</td>
                        <td className={`py-4 text-right font-medium ${item.pnlPct > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.pnlPct > 0 ? '↑' : '↓'} {item.pnlPct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'feed' && <div className="text-center text-2xl py-12 text-emerald-400">Live Global Feed - Real-time headlines</div>}
        </div>
      </div>

      <button onClick={() => setShowMarketPulse(true)} className="fixed bottom-8 right-8 bg-[#00D4FF] text-black px-6 py-4 rounded-full text-lg shadow-2xl z-50">📊 Market Pulse</button>

      {showMarketPulse && (
        <div className="fixed inset-0 bg-black/90 z-[2000] flex items-center justify-center p-4" onClick={() => setShowMarketPulse(false)}>
          <div className="bg-[#1A2338] rounded-3xl max-w-md w-full p-8" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Market Pulse • Live</h2>
            <div className="space-y-6">
              {portfolio.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.symbol}</div>
                    <div className="text-sm text-gray-400">{item.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">${item.price}</div>
                    <div className={`text-sm ${item.pnlPct > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.pnlPct > 0 ? '↑' : '↓'} {item.pnlPct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowMarketPulse(false)} className="mt-8 w-full py-4 bg-white/10 rounded-2xl">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
