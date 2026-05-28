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
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [portfolioSort, setPortfolioSort] = useState<'value' | 'pnl' | 'symbol'>('value');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Real-time portfolio
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    { symbol: "NVDA", name: "NVIDIA", value: 12480, pnl: 1240, pnlPct: 11.0, price: 124.80, assetClass: "Tech" },
    { symbol: "TSLA", name: "Tesla", value: 8750, pnl: -320, pnlPct: -3.5, price: 350.00, assetClass: "Auto" },
    { symbol: "GC=F", name: "Gold", value: 13200, pnl: 890, pnlPct: 7.2, price: 2650.00, assetClass: "Commodity" },
    { symbol: "7203.T", name: "Toyota", value: 6450, pnl: 210, pnlPct: 3.4, price: 2150.00, assetClass: "Auto" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio(prev => prev.map(item => {
        const change = (Math.random() - 0.48) * 2.8;
        const newPrice = Math.max(10, parseFloat((item.price + change).toFixed(2)));
        const newValue = Math.round(newPrice * (item.value / item.price));
        const newPnl = newValue - (item.value - item.pnl);
        const newPnlPct = parseFloat(((newValue - (item.value - item.pnl)) / (item.value - item.pnl) * 100).toFixed(1));
        return { ...item, price: newPrice, value: newValue, pnl: newPnl, pnlPct: newPnlPct };
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

      if (lower.includes("nvda") || lower.includes("nvidia")) response = "NVDA showing strong institutional buying. RSI bullish. Potential move to $148–$152.";
      else if (lower.includes("tsla") || lower.includes("tesla")) response = "Tesla momentum positive near $350. Key resistance at $365. Shall I set an alert?";
      else if (lower.includes("gold") || lower.includes("gc")) response = "Gold holding firm above $2650 with safe-haven flows.";
      else if (lower.includes("alert")) {
        response = "Alert configured successfully!";
        addAlert("NVDA", "NVIDIA", "Price above $148");
      } else response = `Understood regarding "${userMsg}". What specific analysis would you like?`;

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
  };

  const deleteAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const playSquawk = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("High impact market move detected. Gold breaking out on safe-haven flows.");
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

  const filteredPortfolio = portfolio
    .filter(item => 
      item.symbol.toLowerCase().includes(portfolioSearch.toLowerCase()) || 
      item.name.toLowerCase().includes(portfolioSearch.toLowerCase())
    )
    .filter(item => portfolioFilter === 'all' || item.assetClass.toLowerCase() === portfolioFilter)
    .sort((a, b) => {
      if (portfolioSort === 'value') return b.value - a.value;
      if (portfolioSort === 'pnl') return b.pnl - a.pnl;
      return a.symbol.localeCompare(b.symbol);
    });

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex flex-col">
      {/* Top Bar */}
      <header className="bg-[#111827] border-b border-white/10 px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-[#00D4FF]">NovaTrade</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-emerald-400 text-sm">Live Markets • 24/7</div>
          <button onClick={playSquawk} className="bg-red-600 hover:bg-red-700 px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm">
            🔊 Test Squawk
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-72 bg-[#111827] border-r border-white/10 flex-col">
          <div className="p-6">
            <div className="uppercase text-xs tracking-widest text-gray-500 mb-6">Navigation</div>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full text-left flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-1 transition-all ${activeTab === item.id ? 'bg-[#00D4FF] text-black font-medium' : 'hover:bg-white/5'}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-5 left-5 z-[60] bg-[#1A2338] p-3 rounded-2xl text-2xl shadow-lg"
        >
          ☰
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/90 z-[70] flex items-start pt-20" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-[#111827] w-full max-w-xs mx-auto rounded-3xl p-6" onClick={e => e.stopPropagation()}>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as Tab); setIsMobileMenuOpen(false); }}
                  className="w-full text-left py-4 flex items-center gap-4 text-lg border-b border-white/10 last:border-0 hover:bg-white/5 rounded-xl px-4"
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold">Nova Chat</h2>
                <div className="bg-[#1A2338] rounded-3xl h-[65vh] flex flex-col p-6">
                  <div className="flex-1 overflow-auto space-y-6 pr-4" ref={messagesEndRef}>
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-6 py-4 rounded-3xl ${msg.role === 'user' ? 'bg-[#00D4FF] text-black' : 'bg-[#252F4A]'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Ask Nova anything about markets..."
                      className="flex-1 bg-[#252F4A] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#00D4FF]"
                    />
                    <button onClick={sendMessage} className="bg-[#00D4FF] text-black px-10 rounded-2xl font-medium">Send</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div>
                <h2 className="text-3xl font-semibold mb-8">Opportunity Insights</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { symbol: "NVDA", name: "NVIDIA", insight: "Strong institutional accumulation. RSI bullish." },
                    { symbol: "GC=F", name: "Gold", insight: "Safe-haven flows accelerating above $2650." },
                    { symbol: "TSLA", name: "Tesla", insight: "Momentum building near key support." }
                  ].map((item, i) => (
                    <div key={i} className="bg-[#1A2338] p-8 rounded-3xl">
