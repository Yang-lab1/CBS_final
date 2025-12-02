export interface LinkData {
  source: string;
  target: string;
  value: number;
}

export interface NodeData {
  name: string;
  symbolSize: number;
  category?: number;
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    shadowBlur?: number;
  };
}

export interface DiagnosisRule {
  organ: string;
  wuxing: string;
  name: string;
  type: string;
  symptoms: string;
  reason: string;
  method: string;
  formula: string;
  herbs: string;
  source: string;
  score?: number;
}

export interface ChartGraphData {
  nodes: NodeData[];
  links: any[]; // ECharts link structure
  categories: { name: string }[];
}
