import React, { useEffect, useRef, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { LinkData, NodeData } from '../types';

interface MatrixChartProps {
  links: LinkData[];
  focusNode?: string | null;
}

// Apple System Colors (Dark Mode)
const COLORS = {
  RED: '#FF453A',   // System Red
  BLUE: '#0A84FF',  // System Blue
  GREEN: '#30D158', // System Green
  YELLOW: '#FFD60A', // System Yellow (Focus)
  GRAY: '#8E8E93',   // System Gray (Default Node)
  TEXT: '#E5E5EA',   // System Gray 6 (Text)
};

const MatrixChart: React.FC<MatrixChartProps> = ({ links, focusNode }) => {
  const chartRef = useRef<ReactECharts>(null);

  const option = useMemo(() => {
    // 1. Extract all unique nodes from the links
    const nodeSet = new Set<string>();
    links.forEach((l) => {
      nodeSet.add(l.source);
      nodeSet.add(l.target);
    });

    // 2. Map to ECharts Node format
    const nodes: NodeData[] = Array.from(nodeSet).map((name) => {
      const isFocused = name === focusNode;
      return {
        name: name,
        symbolSize: isFocused ? 60 : 25, // Slightly larger nodes
        itemStyle: {
          color: isFocused ? COLORS.YELLOW : COLORS.GRAY,
          borderColor: isFocused ? '#fff' : 'rgba(255,255,255,0.1)',
          borderWidth: isFocused ? 3 : 1,
          shadowBlur: isFocused ? 30 : 5,
          shadowColor: isFocused ? COLORS.YELLOW : 'rgba(0,0,0,0.5)',
        },
        label: {
          show: true,
          position: 'right',
          color: COLORS.TEXT,
          fontSize: isFocused ? 14 : 11,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontWeight: isFocused ? 'bold' : 'normal',
        },
        z: isFocused ? 10 : 1
      };
    });

    // 3. Map to ECharts Edge format with Apple color coding rules
    const edges = links.map((l) => {
      let color = COLORS.GREEN; 
      let width = 1;
      let z = 1;
      let opacity = 0.4;

      if (l.value > 100) {
        color = COLORS.RED;
        width = 3.5;
        z = 3;
        opacity = 0.8;
      } else if (l.value > 10) {
        color = COLORS.BLUE;
        width = 1.8;
        z = 2;
        opacity = 0.6;
      } else {
        // Low frequency
        width = 0.8;
      }

      return {
        source: l.source,
        target: l.target,
        value: l.value,
        lineStyle: {
          color: color,
          width: width,
          opacity: opacity,
          curveness: 0.15, // Subtle curve, natural look
        },
        z: z, // Ensure red lines are drawn on top
      };
    });

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            return `
              <div style="font-family: -apple-system; font-size: 12px;">
                <span style="font-weight:600; color: #fff">${params.data.source}</span>
                <span style="color: #8E8E93; margin: 0 4px;">↔</span>
                <span style="font-weight:600; color: #fff">${params.data.target}</span>
                <br/>
                <span style="color: #8E8E93">关联权重:</span> 
                <span style="font-weight:bold; color:${params.data.lineStyle.color}; font-size: 14px; margin-left: 4px;">
                  ${params.data.value}
                </span>
              </div>
            `;
          }
          return `
            <div style="font-family: -apple-system; font-size: 12px; font-weight: 600;">
              ${params.name}
            </div>
          `;
        },
        backgroundColor: 'rgba(28, 28, 30, 0.8)', // Apple Dark Gray
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 12,
        textStyle: { color: '#F2F2F7' },
        backdropFilter: 'blur(20px)', // Native tooltip blur support
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: edges,
          roam: true,
          label: {
            show: true,
            color: '#D1D1D6',
          },
          zoom: 0.7, // Start slightly zoomed out
          force: {
            // Significantly increased repulsion to spread nodes out (Fixing "Too dense" issue)
            repulsion: focusNode ? 3000 : 2000, 
            gravity: 0.05, // Lower gravity to let them float further apart
            edgeLength: [80, 450], // Allow longer edges
            friction: 0.6,
          },
          lineStyle: {
            curveness: 0.15,
          },
          emphasis: {
            focus: 'adjacency',
            scale: true,
            itemStyle: {
               shadowBlur: 20,
               shadowColor: 'rgba(255, 255, 255, 0.4)'
            },
            lineStyle: {
              width: 4,
              opacity: 1
            },
          },
        },
      ],
    };
  }, [links, focusNode]);

  return (
    <div className="w-full h-full min-h-[500px]">
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
      />
    </div>
  );
};

export default MatrixChart;