export const insertIntervalGenerator = (inputStr: string) => {
  let intervals = [[1,3],[6,9]];
  let newInterval = [2,5];

  try {
    const intervalsMatch = inputStr.match(/intervals\s*=\s*(\[\[.*?\]\])/);
    if (intervalsMatch) {
      intervals = JSON.parse(intervalsMatch[1]);
    }
    const newMatch = inputStr.match(/newInterval\s*=\s*(\[.*?\])/);
    if (newMatch) {
      newInterval = JSON.parse(newMatch[1]);
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const chars = intervals.map(inter => `[${inter.join(',')}]`);
  
  steps.push({
    left: 0,
    right: 0,
    conflictIdx: -1,
    statLabel: 'New Interval',
    statValue: `[${newInterval.join(',')}]`,
    desc: `Initial intervals. We want to insert new interval [${newInterval.join(',')}].`,
  });

  const result: number[][] = [];
  let i = 0;

  // Phase 1
  while (i < intervals.length && intervals[i][1] < newInterval[0]) {
    result.push(intervals[i]);
    steps.push({
      left: i,
      right: i,
      conflictIdx: -1,
      statLabel: 'Result',
      statValue: JSON.stringify(result),
      desc: `Phase 1: Interval ${JSON.stringify(intervals[i])} ends before new interval starts. Append to result.`,
    });
    i++;
  }

  // Phase 2
  let mergedStart = newInterval[0];
  let mergedEnd = newInterval[1];
  
  while (i < intervals.length && intervals[i][0] <= mergedEnd) {
    mergedStart = Math.min(mergedStart, intervals[i][0]);
    mergedEnd = Math.max(mergedEnd, intervals[i][1]);
    
    steps.push({
      left: i,
      right: i,
      conflictIdx: -1,
      statLabel: 'Merged Interval',
      statValue: `[${mergedStart},${mergedEnd}]`,
      desc: `Phase 2: Interval ${JSON.stringify(intervals[i])} overlaps. Update merged interval to [${mergedStart},${mergedEnd}].`,
    });
    i++;
  }
  
  result.push([mergedStart, mergedEnd]);
  steps.push({
    left: Math.max(0, i - 1),
    right: Math.max(0, i - 1),
    conflictIdx: -1,
    statLabel: 'Result',
    statValue: JSON.stringify(result),
    desc: `Phase 2 Complete: Append merged interval [${mergedStart},${mergedEnd}] to result.`,
  });

  // Phase 3
  while (i < intervals.length) {
    result.push(intervals[i]);
    steps.push({
      left: i,
      right: i,
      conflictIdx: -1,
      statLabel: 'Result',
      statValue: JSON.stringify(result),
      desc: `Phase 3: Interval ${JSON.stringify(intervals[i])} is after new interval. Append to result.`,
    });
    i++;
  }

  steps.push({
    left: intervals.length > 0 ? intervals.length - 1 : 0,
    right: intervals.length > 0 ? intervals.length - 1 : 0,
    conflictIdx: -1,
    statLabel: 'Final Result',
    statValue: JSON.stringify(result),
    desc: `All phases complete. Final result: ${JSON.stringify(result)}.`,
    finished: true
  });

  return { chars, steps };
};
