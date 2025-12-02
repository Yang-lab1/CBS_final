import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { SYMPTOM_DB, DIAGNOSIS_DB } from '../constants';
import { DiagnosisRule } from '../types';

const DiagnosisPanel: React.FC = () => {
  const [activeOrgan, setActiveOrgan] = useState<'肺' | '脾' | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ rule: DiagnosisRule; hitCount: number; score: number } | null>(null);

  const toggleSymptom = (sym: string) => {
    const next = new Set(selectedSymptoms);
    if (next.has(sym)) {
      next.delete(sym);
    } else {
      next.add(sym);
    }
    setSelectedSymptoms(next);
  };

  const selectOrgan = (organ: '肺' | '脾') => {
    setActiveOrgan(organ);
    setSelectedSymptoms(new Set());
    setResult(null);
  };

  const handleDiagnose = () => {
    if (!activeOrgan || selectedSymptoms.size === 0) {
      alert("请先选择病位并勾选至少一个症状");
      return;
    }

    const inputs: string[] = Array.from(selectedSymptoms);
    
    // Logic matching
    let matches = DIAGNOSIS_DB
      .filter(d => d.organ === activeOrgan)
      .map(item => {
        const dbSymptoms = item.symptoms.split(/、|，/);
        let hitCount = 0;
        inputs.forEach(input => {
          if (dbSymptoms.some(ds => ds.includes(input) || input.includes(ds))) {
            hitCount++;
          }
        });
        
        let score = hitCount > 0 ? (hitCount / Math.max(inputs.length, 3)) * 100 : 0;
        if(dbSymptoms.length === hitCount) score += 10; 

        return { rule: item, score: score, hitCount: hitCount };
      });

    matches.sort((a, b) => b.score - a.score);
    const best = matches[0];

    if (!best || best.score === 0) {
      alert("未找到匹配的证型，请尝试调整症状组合。");
      return;
    }
    setResult(best);
  };

  const getGraphOption = (data: DiagnosisRule) => {
    const herbs = data.herbs.split(/、|，/);
    const nodes = [
        { name: data.name, symbolSize: 60, category: 0, itemStyle: { color: '#eab308', shadowBlur: 10 } },
        { name: data.formula, symbolSize: 50, category: 1, itemStyle: { color: '#0d9488' } }
    ];
    const links = [
        { source: data.name, target: data.formula, value: "方剂" }
    ];

    herbs.forEach(h => {
        nodes.push({ name: h, symbolSize: 25, category: 2, itemStyle: { color: '#3b82f6' } });
        links.push({ source: data.formula, target: h, value: "" });
    });

    return {
        tooltip: {},
        series: [{
            type: 'graph',
            layout: 'force',
            data: nodes,
            links: links,
            categories: [{name: '证型'}, {name: '方剂'}, {name: '药材'}],
            roam: true,
            label: { show: true, position: 'right', color: '#fff' },
            force: { repulsion: 400, edgeLength: 80 }
        }]
    };
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Left Sidebar */}
      <div className="w-full md:w-[450px] bg-slate-800/80 border-r border-slate-700 flex flex-col shadow-2xl z-20 overflow-y-auto">
        
        {/* Step 1 */}
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider">第一步：选择病位</h2>
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => selectOrgan('肺')} 
              className={`cursor-pointer p-4 rounded-xl border transition flex items-center gap-3 group ${activeOrgan === '肺' ? 'bg-slate-600 border-teal-500 ring-2 ring-teal-500' : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-blue-400 font-bold text-lg">肺</div>
              <div>
                <div className="font-bold text-white">肺系病证</div>
                <div className="text-xs text-slate-400">金 / 呼吸系统</div>
              </div>
            </div>
            <div 
              onClick={() => selectOrgan('脾')} 
              className={`cursor-pointer p-4 rounded-xl border transition flex items-center gap-3 group ${activeOrgan === '脾' ? 'bg-slate-600 border-teal-500 ring-2 ring-teal-500' : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'}`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-yellow-400 font-bold text-lg">脾</div>
              <div>
                <div className="font-bold text-white">脾系病证</div>
                <div className="text-xs text-slate-400">土 / 消化系统</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex-1 p-5">
           <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">第二步：勾选症状</h2>
              <span className="text-xs text-slate-500">已选 {selectedSymptoms.size} 项</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeOrgan && SYMPTOM_DB[activeOrgan]?.map(sym => (
              <button
                key={sym}
                onClick={() => toggleSymptom(sym)}
                className={`px-3 py-1.5 rounded text-sm border transition-all ${selectedSymptoms.has(sym) 
                  ? 'bg-amber-500 text-white border-amber-500 transform scale-105 shadow-md' 
                  : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-400'}`}
              >
                {sym}
              </button>
            ))}
            {!activeOrgan && <div className="text-slate-500 text-sm italic">请先选择病位...</div>}
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-slate-700 bg-slate-800">
           <button 
             onClick={handleDiagnose}
             className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-teal-900/50 transition active:scale-95 flex items-center justify-center gap-2"
           >
              <i className="fas fa-stethoscope"></i> 开始辨证分析
           </button>
           <button 
             onClick={() => setSelectedSymptoms(new Set())}
             className="w-full mt-2 py-2 text-slate-400 hover:text-white text-sm transition"
           >
             重置所有选项
           </button>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 relative bg-slate-900 flex flex-col overflow-hidden">
        {!result ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
             <i className="fas fa-user-md text-6xl mb-4 opacity-30"></i>
             <p className="text-lg">请在左侧选择症状进行分析</p>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-fadeIn">
             {/* Result Header */}
             <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-800/30 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-slate-400 text-sm">最佳匹配:</span>
                    <span className="text-xl font-bold text-yellow-400">{result.rule.name}</span>
                    <span className="text-xs px-2 py-1 bg-slate-700 rounded text-green-400">匹配度 {Math.round(result.score)}%</span>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-300 text-xs border border-blue-800">{result.rule.wuxing}</span>
                    <span className="px-2 py-1 rounded bg-purple-900/50 text-purple-300 text-xs border border-purple-800">{result.rule.type}</span>
                </div>
             </div>

             {/* Result Content */}
             <div className="flex-1 flex overflow-hidden">
                <div className="w-1/3 border-r border-slate-800 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">主治症状</h3>
                            <p className="text-sm text-slate-300 leading-relaxed">{result.rule.symptoms}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">病机分析</h3>
                            <p className="text-sm text-slate-300 leading-relaxed bg-slate-800 p-3 rounded border-l-2 border-purple-500">{result.rule.reason}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">治法治则</h3>
                            <p className="text-sm text-slate-300">{result.rule.method}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                <i className="fas fa-prescription-bottle-alt text-teal-500"></i> 经典方剂
                            </h3>
                            <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-teal-400 text-lg">{result.rule.formula}</span>
                                    <span className="text-xs text-teal-600/70">{result.rule.source}</span>
                                </div>
                                <div className="text-sm text-teal-100/80 leading-7">{result.rule.herbs}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 h-full w-full">
                   <ReactECharts option={getGraphOption(result.rule)} style={{height: '100%', width: '100%'}} />
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisPanel;