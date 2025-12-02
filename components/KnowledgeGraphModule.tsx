
import React, { useState, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';

interface KnowledgeGraphModuleProps {
  onBack: () => void;
}

interface GraphNode {
  wuxing: string;
  organ: string;
  type: string;
  detail: string;
  formula: string;
  herbs: string;
}

// Complete Data Set (Lung & Spleen)
const INITIAL_DATA: GraphNode[] = [
    // --- 肺系 (Lung - Metal) ---
    {wuxing:"金", organ:"肺", type:"风寒犯肺", detail:"表寒实", formula:"麻黄汤", herbs:"麻黄、桂枝、苦杏仁、甘草"},
    {wuxing:"金", organ:"肺", type:"风寒犯肺(轻)", detail:"表寒实", formula:"杏苏散", herbs:"紫苏叶、半夏、茯苓、前胡、桔梗、枳壳、甘草、生姜、橘皮、苦杏仁、大枣"},
    {wuxing:"金", organ:"肺", type:"风热犯肺", detail:"表热实", formula:"银翘散", herbs:"金银花、连翘、薄荷、牛蒡子、荆芥、淡豆豉、桔梗、竹叶、芦根、甘草"},
    {wuxing:"金", organ:"肺", type:"风热犯肺(轻)", detail:"表热实", formula:"桑菊饮", herbs:"桑叶、菊花、薄荷、杏仁、桔梗、连翘、芦根、甘草"},
    {wuxing:"金", organ:"肺", type:"风热犯肺(喘)", detail:"表热实", formula:"麻杏石甘汤", herbs:"麻黄、杏仁、石膏、甘草"},
    {wuxing:"金", organ:"肺", type:"燥邪犯肺", detail:"表燥实", formula:"桑杏汤", herbs:"桑叶、苦杏仁、沙参、浙贝母、淡豆豉、栀子皮、梨皮"},
    {wuxing:"金", organ:"肺", type:"燥邪犯肺(重)", detail:"表燥实", formula:"清燥救肺汤", herbs:"桑叶、石膏、人参、胡麻仁、阿胶、麦冬、杏仁、枇杷叶、甘草"},
    {wuxing:"金", organ:"肺", type:"痰湿阻肺", detail:"里寒实", formula:"二陈汤", herbs:"半夏、陈皮、茯苓、甘草、生姜、乌梅"},
    {wuxing:"金", organ:"肺", type:"痰湿阻肺(气逆)", detail:"里寒实", formula:"三子养亲汤", herbs:"紫苏子、白芥子、莱菔子"},
    {wuxing:"金", organ:"肺", type:"痰热壅肺", detail:"里热实", formula:"清气化痰丸", herbs:"瓜蒌、黄芩、茯苓、枳实、杏仁、陈皮、胆南星、半夏"},
    {wuxing:"金", organ:"肺", type:"痰热壅肺(痈)", detail:"里热实", formula:"千金苇茎汤", herbs:"苇茎、薏苡仁、冬瓜子、桃仁"},
    {wuxing:"金", organ:"肺", type:"饮停胸胁", detail:"里寒实", formula:"十枣汤", herbs:"芫花、甘遂、大戟、大枣"},
    {wuxing:"金", organ:"肺", type:"饮停胸胁(温化)", detail:"里寒实", formula:"苓桂术甘汤", herbs:"茯苓、桂枝、白术、甘草"},
    {wuxing:"金", organ:"肺", type:"肺气虚", detail:"里寒虚", formula:"玉屏风散", herbs:"黄芪、白术、防风"},
    {wuxing:"金", organ:"肺", type:"肺气虚(咳喘)", detail:"里寒虚", formula:"补肺汤", herbs:"人参、黄芪、熟地、五味子、紫菀、桑白皮"},
    {wuxing:"金", organ:"肺", type:"肺阴虚", detail:"里热虚", formula:"沙参麦冬汤", herbs:"沙参、麦冬、玉竹、天花粉、桑叶、生扁豆、甘草"},
    {wuxing:"金", organ:"肺", type:"肺肾阴虚", detail:"里热虚", formula:"百合固金汤", herbs:"百合、生地、熟地、麦冬、玄参、当归、白芍、贝母、桔梗、甘草"},
    {wuxing:"金", organ:"肺", type:"肺肾阴虚(纳气)", detail:"里热虚", formula:"麦味地黄丸", herbs:"熟地黄、山茱萸、山药、泽泻、牡丹皮、茯苓、麦冬、五味子"},
    {wuxing:"金", organ:"肺", type:"肺脾气虚", detail:"里寒虚", formula:"六君子汤", herbs:"人参、白术、茯苓、甘草、半夏、陈皮、生姜、大枣"},
    {wuxing:"金", organ:"肺", type:"肺脾气虚(湿盛)", detail:"里寒虚", formula:"参苓白术散", herbs:"人参、茯苓、白术、山药、白扁豆、莲子、薏苡仁、砂仁、桔梗、甘草、大枣"},

    // --- 脾系 (Spleen - Earth) ---
    {wuxing:"土", organ:"脾", type:"脾气虚", detail:"里虚", formula:"四君子汤", herbs:"人参、白术、茯苓、甘草"},
    {wuxing:"土", organ:"脾", type:"脾虚气陷", detail:"里寒虚", formula:"补中益气汤", herbs:"黄芪、炙甘草、人参、当归、橘皮、升麻、柴胡、白术"},
    {wuxing:"土", organ:"脾", type:"脾阳虚", detail:"里虚寒", formula:"附子理中汤", herbs:"附子、党参、白术、干姜、甘草"},
    {wuxing:"土", organ:"脾", type:"脾不统血", detail:"里虚", formula:"归脾汤", herbs:"黄芪、人参、白术、茯苓、当归、龙眼肉、远志、酸枣仁、木香、甘草"},
    {wuxing:"土", organ:"脾", type:"寒湿困脾", detail:"里实寒", formula:"藿香正气散", herbs:"大腹皮、白芷、紫苏叶、半夏、苍术、厚朴、茯苓、桔梗、甘草"},
    {wuxing:"土", organ:"脾", type:"寒湿困脾(水湿)", detail:"里实寒", formula:"胃苓汤", herbs:"苍术、厚朴、陈皮、炙甘草、桂枝、白术、茯苓、猪苓、泽泻、生姜、大枣"},
    {wuxing:"土", organ:"脾", type:"湿热蕴脾", detail:"里热实", formula:"茵陈蒿汤", herbs:"茵陈、栀子、大黄"},
    {wuxing:"土", organ:"脾", type:"湿热蕴脾(化浊)", detail:"里热实", formula:"甘露消毒丹", herbs:"滑石、茵陈、石菖蒲、木通、射干、豆蔻、连翘、黄芩、川贝母"},
    {wuxing:"土", organ:"脾", type:"脾肾阳虚", detail:"里寒虚", formula:"附子理中汤", herbs:"附子、干姜、人参、白术、甘草"},
    {wuxing:"土", organ:"脾", type:"脾肾阳虚(水气)", detail:"里寒虚", formula:"真武汤", herbs:"附子、茯苓、白术、白芍、干姜、甘草"}
];

const CORE_STRUCTURE = [
    { el: "火", organ: "心", angle: 270 },
    { el: "土", organ: "脾", angle: 342 },
    { el: "金", organ: "肺", angle: 54 },
    { el: "水", organ: "肾", angle: 126 },
    { el: "木", organ: "肝", angle: 198 }
];

const RADIUS_EL = 120;
const RADIUS_ORG = 320;
const ALLOWED_ORGANS = ["肺", "心", "脾", "肝", "肾", "金", "木", "水", "火", "土"];

const KnowledgeGraphModule: React.FC<KnowledgeGraphModuleProps> = ({ onBack }) => {
  const chartRef = useRef<ReactECharts>(null);
  const [data, setData] = useState<GraphNode[]>(INITIAL_DATA);
  const [viewState, setViewState] = useState<'landing' | 'graph'>('landing');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Admin State
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminStep, setAdminStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Inputs
  const [inputWuxing, setInputWuxing] = useState('金');
  const [inputOrgan, setInputOrgan] = useState('肺');
  const [inputType, setInputType] = useState('');
  const [inputDetail, setInputDetail] = useState('');
  const [inputFormula, setInputFormula] = useState('');
  const [inputHerbs, setInputHerbs] = useState('');
  const [licenseCode, setLicenseCode] = useState('');

  // Graph Logic State
  const [graphSearchState, setGraphSearchState] = useState({
      keyword: "",
      isOrgan: false,
      isHerb: false,
      isFormula: false,
      isFullView: false
  });

  // Helpers
  const getAllHerbs = () => {
      const set = new Set<string>();
      data.forEach(r => r.herbs.split(/、|，|,/).forEach(h => set.add(h.trim())));
      return set;
  };

  const showAllGraph = () => {
      setGraphSearchState({ keyword: "全景模式", isOrgan: false, isHerb: false, isFormula: false, isFullView: true });
      setViewState('graph');
      setSearchTerm('');
  };

  const performSearch = (val: string) => {
      if (!val.trim()) return alert("请输入内容");
      const kw = val.trim();

      const isOrgan = ALLOWED_ORGANS.includes(kw);
      const isHerb = getAllHerbs().has(kw);
      const isFormula = data.some(r => r.formula.includes(kw));

      if (!isOrgan && !isHerb && !isFormula) {
          alert(`⚠️ 搜索受限："${kw}" 不在数据库中。\n\n请点击【贡献数据】进行录入。`);
          return;
      }

      setGraphSearchState({ keyword: kw, isOrgan, isHerb, isFormula, isFullView: false });
      setViewState('graph');
      setSearchTerm(kw);
  };

  const resetLayout = () => {
      if (chartRef.current) {
          const instance = chartRef.current.getEchartsInstance();
          instance.showLoading({ text: '重置布局...', color: '#38bdf8', maskColor: 'rgba(15, 23, 42, 0.6)' });
          setTimeout(() => {
              instance.hideLoading();
          }, 500);
      }
  };

  const handleVerifyAndSubmit = () => {
      if (licenseCode.length < 6) return alert("无效的证件号");
      setLoading(true);
      setTimeout(() => {
          const newData: GraphNode = {
              wuxing: inputWuxing,
              organ: inputOrgan,
              type: inputType,
              detail: inputDetail,
              formula: inputFormula,
              herbs: inputHerbs
          };
          setData(prev => [...prev, newData]);
          alert(`✅ 认证成功！新数据【${newData.formula}】已入库。`);
          setShowAdmin(false);
          setLoading(false);
          setAdminStep(1);
          // Clear
          setInputType(''); setInputDetail(''); setInputFormula(''); setInputHerbs(''); setLicenseCode('');
      }, 1500);
  };

  const getOption = useCallback(() => {
      const { keyword, isOrgan, isHerb, isFormula, isFullView } = graphSearchState;
      
      const nodes: any[] = [];
      const links: any[] = [];
      const addedNodeIds = new Set<string>();
      const LIMIT = 5; // Strictly limit to 5 result chains

      // --- Filter Data First ---
      let filteredData: GraphNode[] = [];
      if (isFullView) {
          filteredData = data;
      } else {
          for (const row of data) {
              let isMatch = false;
              if (isOrgan && (row.organ === keyword || row.wuxing === keyword)) isMatch = true;
              else if (isHerb && row.herbs.includes(keyword)) isMatch = true;
              else if (isFormula && row.formula.includes(keyword)) isMatch = true;

              if (isMatch) {
                  filteredData.push(row);
                  // Strict limit check
                  if (filteredData.length >= LIMIT) break;
              }
          }
      }

      // === 1. Core Structure Logic (Fixed vs Floating) ===
      CORE_STRUCTURE.forEach(item => {
          let shouldRenderCore = isFullView;
          
          if (!isFullView) {
              // Check if this core node (Organ/Element) relates to the filtered data
              const dataMatch = filteredData.some(d => d.organ === item.organ);
              // Or direct keyword match
              const organMatch = keyword === item.organ || keyword === item.el;

              if (organMatch || dataMatch) shouldRenderCore = true;
          }

          if (shouldRenderCore) {
              const radEl = item.angle * (Math.PI / 180);
              const xEl = Math.cos(radEl) * RADIUS_EL;
              const yEl = Math.sin(radEl) * RADIUS_EL;
              
              const radOrg = item.angle * (Math.PI / 180);
              const xOrg = Math.cos(radOrg) * RADIUS_ORG;
              const yOrg = Math.sin(radOrg) * RADIUS_ORG;

              // If Full View -> Fixed Position. If Search -> Let them float (remove 'fixed') to center them.
              const fixedProp = isFullView ? { fixed: true, x: xEl, y: yEl } : { x: Math.random() * 200, y: Math.random() * 200 };
              const fixedPropOrg = isFullView ? { fixed: true, x: xOrg, y: yOrg } : { x: Math.random() * 200, y: Math.random() * 200 };

              nodes.push({
                  name: item.el,
                  ...fixedProp,
                  category: "五行", symbolSize: 60,
                  itemStyle: { color: '#eab308', borderColor: '#fff', borderWidth: 2, shadowBlur: 10, shadowColor: '#eab308' },
                  label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' },
                  z: 100
              });
              addedNodeIds.add(item.el);

              nodes.push({
                  name: item.organ,
                  ...fixedPropOrg,
                  category: "脏腑", symbolSize: 45,
                  itemStyle: { color: '#14b8a6', borderColor: '#fff', borderWidth: 1, shadowBlur: 8, shadowColor: '#14b8a6' },
                  label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' },
                  z: 90
              });
              addedNodeIds.add(item.organ);

              links.push({
                  source: item.el, target: item.organ,
                  lineStyle: { width: 4, color: '#fff', opacity: 0.15, curveness: 0 }
              });
          }
      });

      // Five Elements Cycle (Only in Full View)
      if (isFullView) {
          const cycle = ["木", "火", "土", "金", "水", "木"];
          for(let i=0; i<5; i++) {
              links.push({
                  source: cycle[i], target: cycle[i+1],
                  symbol: ['none', 'arrow'],
                  symbolSize: 10,
                  lineStyle: { width: 2, type: 'dashed', color: '#fbbf24', opacity: 0.3, curveness: 0.3 }
              });
          }
      }

      // === 2. Data Logic ===
      let activeNodeIds = new Set<string>();

      filteredData.forEach(row => {
          // Track active nodes for highlighting
          const herbList = row.herbs.split(/、|，|,/);
          const chain = [row.wuxing, row.organ, row.type, row.detail, row.formula, ...herbList];
          chain.forEach(n => activeNodeIds.add(n.trim()));

          // Add Dynamic Nodes
          const pushDynamicNode = (name: string, cat: string, size: number, color: string) => {
              if (!addedNodeIds.has(name)) {
                  nodes.push({
                      name: name, category: cat, symbolSize: size,
                      draggable: true,
                      // Random initial position to prevent blank screen force explosion
                      x: Math.random() * 800 - 400,
                      y: Math.random() * 600 - 300,
                      itemStyle: { color: color, borderColor: 'rgba(255,255,255,0.2)', borderWidth: 1 },
                      label: { 
                          // FIX: Force show labels if it's full view OR if node is active/large enough
                          show: size > 15 || isFullView, 
                          color: '#fff', 
                          fontSize: 10,
                          position: 'right'
                      },
                      z: 50
                  });
                  addedNodeIds.add(name);
              }
          };

          pushDynamicNode(row.type, "病机", 28, "#6366f1");
          pushDynamicNode(row.detail, "辨证", 22, "#f97316");
          pushDynamicNode(row.formula, "方剂", 18, "#10b981");
          
          herbList.forEach(h => pushDynamicNode(h.trim(), "药材", 10, "#94a3b8"));

          const pushLink = (s: string, t: string) => {
              links.push({ 
                  source: s, target: t, 
                  lineStyle: { opacity: 0.15, curveness: 0.2, width: 1 } 
              });
          };
          
          pushLink(row.organ, row.type);
          pushLink(row.type, row.detail);
          pushLink(row.detail, row.formula);
          herbList.forEach(h => pushLink(row.formula, h.trim()));
      });

      // 3. Highlight Logic
      nodes.forEach(node => {
          let isCore = ["五行", "脏腑"].includes(node.category);
          // In search view, everything visible is "active". In full view, core is dimmer.
          let opacity = isFullView && isCore ? 0.8 : 1; 
          node.itemStyle = { ...node.itemStyle, opacity: opacity };
          if(node.label) node.label.color = '#fff'; // Always show white labels for visibility
      });

      return {
          backgroundColor: 'transparent',
          tooltip: { 
              trigger: 'item', 
              formatter: '{b}',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderColor: '#38bdf8',
              textStyle: { color: '#fff' }
          },
          legend: {
              show: true,
              textStyle: { color: '#94a3b8' },
              bottom: 20,
              left: 20,
              orient: 'vertical',
              data: ["五行", "脏腑", "病机", "辨证", "方剂", "药材"]
          },
          series: [{
              type: 'graph',
              layout: 'force',
              data: nodes,
              links: links,
              categories: [{name:"五行"},{name:"脏腑"},{name:"病机"},{name:"辨证"},{name:"方剂"},{name:"药材"}],
              roam: true,
              zoom: isFullView ? 0.65 : 0.8, // Zoom in more on search results
              label: { 
                  position: 'right', 
                  formatter: '{b}' 
              },
              force: {
                  gravity: isFullView ? 0.05 : 0.1, // Stronger gravity for single branch to pull to center
                  friction: 0.6,
                  repulsion: 2500,
                  edgeLength: [30, 100],
                  layoutAnimation: true
              },
              lineStyle: { color: 'source', curveness: 0.2 },
              emphasis: {
                  focus: 'adjacency',
                  lineStyle: { width: 3, opacity: 1 },
                  label: { show: true }
              }
          }]
      };
  }, [data, graphSearchState]);

  return (
    <div className="relative w-full h-screen bg-[#0f172a] overflow-hidden flex flex-col font-sans">
        
        {/* Landing Page */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-30 bg-[#0f172a] transition-transform duration-700 ${viewState === 'graph' ? '-translate-y-full' : 'translate-y-0'}`}>
            <div className="absolute top-6 right-6 flex gap-3">
                <button onClick={showAllGraph} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full text-sm text-slate-300 transition hover:text-teal-400 hover:border-teal-500 shadow-lg">
                    <i className="fas fa-globe"></i> 全景模式
                </button>
                <button onClick={() => setShowAdmin(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full text-sm text-slate-300 transition hover:text-white hover:border-teal-500 shadow-lg">
                    <i className="fas fa-plus-circle text-teal-400"></i> 贡献数据
                </button>
            </div>

            <div className="mb-8 text-center">
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text">
                    五行知识图谱
                </h1>
                <p className="text-slate-400 text-lg tracking-widest">五行同心圆结构 · 动态发散</p>
            </div>
            
            <div className="relative w-[500px] mb-6">
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && performSearch(searchTerm)}
                    className="w-full h-14 pl-6 pr-12 rounded-full bg-slate-800 border border-slate-600 text-white text-xl focus:ring-2 focus:ring-teal-500 outline-none shadow-2xl transition-all hover:border-teal-500/50"
                    placeholder="试试搜索 '肺' 或 '脾'..." 
                />
                <button 
                    onClick={() => performSearch(searchTerm)} 
                    className="absolute right-2 top-2 w-10 h-10 bg-teal-600 rounded-full hover:bg-teal-500 transition shadow-lg flex items-center justify-center p-0"
                >
                    <i className="fas fa-search text-white text-lg"></i>
                </button>
            </div>

            <p className="text-slate-500 text-sm">
                <i className="fas fa-info-circle mr-1"></i> 核心结构：五行居中 -&gt; 五脏环绕 -&gt; 万物发散
            </p>
        </div>

        {/* Top Bar (Graph View) */}
        <div className={`absolute top-0 left-0 right-0 h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 z-20 shadow-md transition-transform duration-700 ${viewState === 'graph' ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="flex items-center gap-6 ml-12">
                <div className="text-xl font-bold text-teal-400 tracking-wider flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
                    <i className="fas fa-yin-yang fa-spin" style={{animationDuration: '10s'}}></i> 知识图谱
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performSearch(searchTerm)}
                        className="h-9 pl-9 pr-4 rounded-md bg-slate-900 border border-slate-600 text-sm focus:border-teal-500 outline-none w-64 transition-all focus:w-80 text-slate-200"
                        placeholder="搜索..."
                    />
                    <i className="fas fa-search absolute left-3 top-2.5 text-slate-500 text-xs"></i>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={showAllGraph} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 rounded text-sm transition">
                    <i className="fas fa-globe"></i> 全景
                </button>
                <button onClick={resetLayout} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 rounded text-sm transition">
                    <i className="fas fa-sync-alt"></i> 整理
                </button>
                <button onClick={() => setShowAdmin(true)} className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm transition shadow-lg shadow-teal-900/50 ml-2">
                    <i className="fas fa-plus-circle"></i> 贡献
                </button>
            </div>
        </div>

        {/* Back Button (Always available) */}
        <div className={`absolute left-6 z-50 transition-all duration-500 ${viewState === 'graph' ? 'top-3' : 'top-6'}`}>
            <button 
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center border border-slate-600 shadow-lg backdrop-blur-md group p-0"
                title="返回主菜单"
            >
                <i className="fas fa-arrow-left text-slate-300 group-hover:text-white text-lg"></i>
            </button>
        </div>

        {/* Chart Area */}
        <div className="flex-1 relative z-10 w-full h-full">
             <ReactECharts 
                ref={chartRef}
                option={getOption()} 
                style={{height: '100%', width: '100%' }} 
                notMerge={true}
             />
             
             {/* Legend Hint */}
             <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none opacity-70 bg-slate-800/50 p-3 rounded-lg backdrop-blur-sm border border-slate-700/50">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#eab308] shadow-[0_0_8px_#eab308]"></span><span className="text-xs text-slate-300">核心五行</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#14b8a6] shadow-[0_0_8px_#14b8a6]"></span><span className="text-xs text-slate-300">外围五脏</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#94a3b8]"></span><span className="text-xs text-slate-300">发散药材</span></div>
            </div>
        </div>

        {/* Admin Modal */}
        {showAdmin && (
            <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center">
                <div className="bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <i className="fas fa-user-md text-teal-400"></i> 医师工作台
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">请基于五行架构录入数据。</p>
                        </div>
                        <button onClick={() => setShowAdmin(false)} className="text-slate-400 hover:text-white transition">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1">
                        {adminStep === 1 ? (
                            <div>
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-l-4 border-teal-500 pl-2">Step 1: 数据录入</h3>
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">五行归属</label>
                                        <select value={inputWuxing} onChange={(e) => setInputWuxing(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-teal-500 outline-none">
                                            <option value="金">金 (肺)</option><option value="土">土 (脾)</option><option value="木">木 (肝)</option><option value="水">水 (肾)</option><option value="火">火 (心)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">所属脏腑</label>
                                        <select value={inputOrgan} onChange={(e) => setInputOrgan(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-teal-500 outline-none">
                                            <option value="肺">肺</option><option value="脾">脾</option><option value="肝">肝</option><option value="肾">肾</option><option value="心">心</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">病机</label>
                                        <input value={inputType} onChange={(e) => setInputType(e.target.value)} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-teal-500 outline-none" placeholder="如: 脾气虚" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">辨证</label>
                                        <input value={inputDetail} onChange={(e) => setInputDetail(e.target.value)} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-teal-500 outline-none" placeholder="如: 里虚寒" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs text-slate-400 mb-1">经典方剂</label>
                                    <input value={inputFormula} onChange={(e) => setInputFormula(e.target.value)} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-teal-500 outline-none" placeholder="如: 四君子汤" />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-xs text-slate-400 mb-1">组成药材 (逗号分隔)</label>
                                    <textarea value={inputHerbs} onChange={(e) => setInputHerbs(e.target.value)} rows={2} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-teal-500 outline-none" placeholder="如: 人参、白术、茯苓、甘草"></textarea>
                                </div>
                                <button 
                                    onClick={() => {
                                        if(!inputType || !inputFormula) return alert("请填写完整信息");
                                        setAdminStep(2);
                                    }} 
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold transition shadow-lg"
                                >
                                    下一步：资质认证
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-l-4 border-purple-500 pl-2">Step 2: 资质认证</h3>
                                <div className="bg-slate-900/50 p-4 rounded border border-slate-700 mb-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-2xl">👨‍⚕️</div>
                                        <div>
                                            <div className="text-sm font-bold text-white">实名身份核验</div>
                                            <div className="text-xs text-slate-400">系统将连接卫生专业技术资格数据库</div>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-xs text-slate-400 mb-1">资格证书编号</label>
                                        <input value={licenseCode} onChange={(e) => setLicenseCode(e.target.value)} type="text" className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white focus:border-purple-500 outline-none font-mono tracking-wider" placeholder="例如: 14111000000xxxx" />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setAdminStep(1)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm transition">返回修改</button>
                                    <button 
                                        onClick={handleVerifyAndSubmit} 
                                        disabled={loading}
                                        className="flex-[2] py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 rounded text-white font-bold transition shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>认证中...</span>
                                            </>
                                        ) : (
                                            <span>认证并提交数据</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default KnowledgeGraphModule;
