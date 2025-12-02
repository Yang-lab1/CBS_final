import { RAW_CSV_DATA } from '../constants';
import { LinkData } from '../types';

export const parseCSVData = (): LinkData[] => {
  const rows = RAW_CSV_DATA.trim().split('\n');
  if (rows.length < 2) return [];

  // Row 0 is headers. row[0] is usually "Unnamed: 0" or empty, so headers start from index 1.
  // Example: Unnamed: 0, HerbA, HerbB, ...
  const headerRow = rows[0].split(',');
  const herbNames = headerRow.slice(1); // ['肉桂', '鹿茸', ...]

  const links: LinkData[] = [];

  // Iterate from row 1 (data rows)
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(',');
    const sourceHerb = cols[0]; // e.g. "肉桂"
    
    // Iterate columns. Note: matrix is symmetric. 
    // We only need upper triangle (or lower) to avoid duplicates, 
    // unless the graph is directed (but co-occurrence is usually undirected).
    // Here we iterate j from 1 to cols.length.
    // herbNames[j-1] matches cols[j].
    for (let j = 1; j < cols.length; j++) {
      const targetHerb = herbNames[j - 1];
      const weight = parseInt(cols[j], 10);

      // Only add link if weight > 0
      // To avoid duplicates (A-B and B-A) and self-loops (A-A),
      // we can strictly check if source index < target index based on original header order
      // OR just check names to be lexically smaller to enforce one direction.
      // However, row index i corresponds to herbNames[i-1].
      // Column index j corresponds to herbNames[j-1].
      // We process if j > i (upper triangle excluding diagonal).
      
      // Let's use the row index logic. 
      // i starts at 1. The herb for row i is herbNames[i-1].
      // j starts at 1. The herb for col j is herbNames[j-1].
      // We want j > i to avoid duplicates and self loops.
      
      // Note: The CSV provided has data where row 1 is "肉桂", and col 1 is "肉桂" (self).
      if (j > i && weight > 0) {
        links.push({
          source: sourceHerb,
          target: targetHerb,
          value: weight
        });
      }
    }
  }

  // Sort by weight descending for easier filtering later
  return links.sort((a, b) => b.value - a.value);
};
