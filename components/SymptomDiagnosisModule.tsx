import React, { useState, useMemo } from 'react';
import DiagnosisPanel from './DiagnosisPanel';
import MatrixChart from './MatrixChart';
import { parseCSVData } from '../utils/dataProcessor';

interface SymptomDiagnosisModuleProps {
  onBack: () => void;
}

const SymptomDiagnosisModule: React.FC<SymptomDiagnosisModuleProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'matrix'>('diagnosis');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedHerb, setSearchedHerb] = useState<string | null>(null);

  // Parse CSV only once
  const allLinks = useMemo(() => parseCSVData(), []);

  // Filter links for the matrix view
  const displayLinks = useMemo(() => {
    if (!searchedHerb) {
      // Global view: Reduced to Top 300 for a cleaner aesthetic
      return allLinks.slice(0, 300);
    }
    // Search view: Show ALL links connected to the searched herb
    return allLinks.filter(l => l.source === searchedHerb || l.target === searchedHerb);
  }, [allLinks, searchedHerb]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchedHerb(null);
      return;
    }
    
    // Check if herb exists in links
    const exists = allLinks.some(l => l.source.includes(searchTerm) || l.target.includes(searchTerm));
    if (exists) {
      const canonical = allLinks.find(l => l.source === searchTerm || l.target === searchTerm);
      if (canonical) {
          setSearchedHerb(searchTerm);
      } else {
          // fuzzy find
          const fuzzy = allLinks.find(l => l.source.includes(searchTerm) || l.target.includes(searchTerm));
          if (fuzzy) {
             const name = fuzzy.source.includes(searchTerm) ? fuzzy.source : fuzzy.target;
             setSearchedHerb(name);
             setSearchTerm(name); // update input to full name
          }
      }
    } else {
      alert(`未找到“${searchTerm}”的共现数据。`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Statistics for the sidebar
  const stats = useMemo(() => {
    if (!searchedHerb) return null;
    const related = allLinks.filter(l => l.source === searchedHerb || l.target === searchedHerb);
    const topLink = related[0]; // already sorted
    const partner = topLink ? (topLink.source === searchedHerb ? topLink.target : topLink.source) : '--';
    const strongLinks = related.filter(l => l.value > 10);

    return {
        count: related.length,
        topPartner: `${partner} (${topLink?.value || 0})`,
        strongList: strongLinks
    };
  }, [searchedHerb, allLinks]);


  return (
    <div className="h-screen flex flex-col bg-[#000000] text-white/90 font-sans overflow-hidden selection:bg-blue-500/30">
      
      {/* Apple-style Header (Glass) */}
      <header className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
            title="返回首页"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="h-6 w-px bg-white/10 mx-1"></div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              <i className="fas fa-leaf"></i>
            </div>
            <h1 className="text-lg font-medium tracking-wide text-white">
              症状辩证 <span className="text-xs text-white/40 font-normal ml-2 tracking-widest uppercase">v2.1 Module</span>
            </h1>
          </div>
        </div>
        
        {/* iOS Segmented Control Style */}
        <div className="flex bg-white/10 rounded-lg p-1 border border-white/5">
          <button 
            onClick={() => setActiveTab('diagnosis')} 
            className={`px-5 py-1.5 rounded-[6px] text-xs font-medium transition-all duration-300 ${activeTab === 'diagnosis' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}
          >
            <i className="fas fa-user-md mr-2"></i>智能辨证
          </button>
          <button 
            onClick={() => setActiveTab('matrix')} 
            className={`px-5 py-1.5 rounded-[6px] text-xs font-medium transition-all duration-300 ${activeTab === 'matrix' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}
          >
            <i className="fas fa-project-diagram mr-2"></i>药材共现矩阵
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-gradient-to-b from-gray-900 to-black">
        
        {/* Diagnosis View */}
        <div className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${activeTab === 'diagnosis' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
           <DiagnosisPanel />
        </div>

        {/* Matrix View */}
        <div className={`absolute inset-0 flex transition-opacity duration-500 ease-in-out ${activeTab === 'matrix' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
            
            {/* Apple-style Sidebar (Frosted Glass) */}
            <div className="w-80 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col p-6 z-20 shadow-2xl">
                <h2 className="text-sm font-semibold text-white/90 mb-6 flex items-center gap-2 uppercase tracking-widest opacity-80">
                    <i className="fas fa-search text-blue-400"></i> 共现查询
                </h2>
                
                <div className="mb-8">
                    <label className="block text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2 pl-1">搜索核心药材</label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="输入药名，如：甘草" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm text-white focus:border-blue-500/50 focus:bg-black/30 outline-none placeholder-white/20 transition-all"
                        />
                        <button onClick={handleSearch} className="absolute right-3 top-2.5 text-white/30 hover:text-blue-400 transition-colors">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-[10px] text-white/40 uppercase font-bold tracking-wider mb-2 pl-1">视图模式</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => { setSearchTerm(''); setSearchedHerb(null); }} 
                          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all duration-300 border ${!searchedHerb ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-white/5 hover:bg-white/10 text-white/60 border-white/5'}`}
                        >
                            全景概览
                        </button>
                        <button 
                           disabled={!searchedHerb}
                           className={`py-2 px-3 rounded-xl text-xs font-medium transition-all duration-300 border ${searchedHerb ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-transparent text-white/20 border-white/5 cursor-not-allowed'}`}
                        >
                            单药链路
                        </button>
                    </div>
                </div>

                {searchedHerb && stats && (
                  <div className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col overflow-hidden animate-fadeIn">
                    <div className="text-center mb-6 shrink-0">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center text-blue-300 text-2xl font-bold mb-3 shadow-lg border border-white/5">
                            <span>药</span>
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-wide">{searchedHerb}</h3>
                    </div>
                    
                    <div className="space-y-3 text-xs shrink-0 mb-4">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-white/40">共现药材</span>
                            <span className="font-mono text-white/90 bg-white/10 px-2 py-0.5 rounded-md">{stats.count}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-white/40">最强关联</span>
                            <span className="font-bold text-[#FF453A]">{stats.topPartner}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider mb-3 block">高频强关联 (Weight {'>'} 10)</span>
                        <div className="flex flex-wrap gap-2 overflow-y-auto pr-1 custom-scrollbar content-start">
                          {stats.strongList.length > 0 ? stats.strongList.map((l, i) => {
                            const p = l.source === searchedHerb ? l.target : l.source;
                            // Apple Style Badges
                            const isHigh = l.value > 100;
                            const badgeClass = isHigh 
                              ? 'text-[#FF453A] border-[#FF453A]/30 bg-[#FF453A]/10' 
                              : 'text-[#0A84FF] border-[#0A84FF]/30 bg-[#0A84FF]/10';
                            
                            return (
                              <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass} transition hover:scale-105 cursor-default`}>
                                {p} <span className="ml-1 opacity-60 text-[10px]">{l.value}</span>
                              </span>
                            );
                          }) : <span className="text-white/20 text-xs italic">无强关联数据</span>}
                        </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Matrix Chart Area */}
            <div className="flex-1 relative bg-black/40">
                <MatrixChart links={displayLinks} focusNode={searchedHerb} />
                
                {/* Apple-style Legend */}
                <div className="absolute top-6 right-6 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl pointer-events-none">
                    <h4 className="text-[10px] font-bold text-white/40 mb-3 uppercase tracking-widest">关联强度图例</h4>
                    <div className="space-y-2.5 text-xs">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 bg-[#FF453A] rounded-full shadow-[0_0_8px_rgba(255,69,58,0.6)]"></span>
                            <span className="text-[#FF453A] font-medium">{'>'} 100 (High)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 bg-[#0A84FF] rounded-full shadow-[0_0_8px_rgba(10,132,255,0.6)]"></span>
                            <span className="text-[#0A84FF] font-medium">11 - 100 (Mid)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 bg-[#30D158] rounded-full opacity-80 shadow-[0_0_8px_rgba(48,209,88,0.4)]"></span>
                            <span className="text-[#30D158] font-medium">≤ 10 (Low)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default SymptomDiagnosisModule;