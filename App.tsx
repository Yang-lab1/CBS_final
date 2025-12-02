import React, { useState } from 'react';
import SymptomDiagnosisModule from './components/SymptomDiagnosisModule';
import KnowledgeGraphModule from './components/KnowledgeGraphModule';

const App: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<'home' | 'diagnosis' | 'knowledge'>('home');

  const renderContent = () => {
    switch (currentModule) {
      case 'diagnosis':
        return <SymptomDiagnosisModule onBack={() => setCurrentModule('home')} />;
      case 'knowledge':
        return <KnowledgeGraphModule onBack={() => setCurrentModule('home')} />;
      default:
        return (
          <div className="min-h-screen w-full bg-[#000000] text-white font-sans selection:bg-blue-500/30 flex flex-col relative overflow-hidden">
            
            {/* Background Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[8000ms]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[10000ms]"></div>

            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
              
              <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-teal-400 to-blue-500 shadow-[0_0_40px_rgba(20,184,166,0.3)] mb-4">
                  <i className="fas fa-leaf text-3xl text-black"></i>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  中医辩证图谱
                </h1>
                <p className="text-white/40 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
                  融合传统中医智慧与现代数据可视化的智能诊疗系统
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                
                {/* Module Card: Knowledge Graph (Moved to Left) */}
                <div 
                  onClick={() => setCurrentModule('knowledge')}
                  className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                     <i className="fas fa-project-diagram text-8xl text-purple-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-700"></i>
                  </div>

                  <div className="relative z-10 h-full flex flex-col justify-between space-y-8">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300 border border-purple-500/30 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                      <i className="fas fa-network-wired text-2xl"></i>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">知识图谱</h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        全景式药材关系网络探索。
                        深度挖掘中药材之间的共现规律与潜在联系，基于五行同心圆结构展示。
                      </p>
                    </div>

                    <div className="flex items-center text-purple-400 text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      进入图谱 <i className="fas fa-arrow-right ml-2"></i>
                    </div>
                  </div>
                </div>

                {/* Module Card: Symptom Diagnosis (Moved to Right) */}
                <div 
                  onClick={() => setCurrentModule('diagnosis')}
                  className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                     <i className="fas fa-user-md text-8xl text-blue-400 transform rotate-12 group-hover:rotate-0 transition-transform duration-700"></i>
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col justify-between space-y-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-300 border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                      <i className="fas fa-stethoscope text-2xl"></i>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">症状辩证</h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        基于肺脾两脏的智能辩证系统。
                        通过勾选临床症状，自动匹配经典证型、分析病机并推荐经典方剂。
                      </p>
                    </div>

                    <div className="flex items-center text-blue-400 text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      进入辩证 <i className="fas fa-arrow-right ml-2"></i>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-16 text-center">
                 <p className="text-white/20 text-xs font-medium tracking-widest uppercase">
                   Traditional Chinese Medicine Intelligent System v2.1
                 </p>
              </div>

            </main>
          </div>
        );
    }
  };

  return renderContent();
};

export default App;
