export const rotateImageGenerator = (inputStr: string) => {
  let matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  try {
    const match = inputStr.match(/\[\[.*?\]\]/);
    if (match) {
      const parsed = JSON.parse(match[0].replace(/'/g, '"'));
      if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
        matrix = parsed;
      }
    }
  } catch (e) {
    // fallback
  }

  const n = matrix.length;
  // Create a flattened array of strings for the chars property
  const chars: string[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      chars.push(String(matrix[i][j]));
    }
  }

  const steps: any[] = [];
  
  steps.push({
    left: 0,
    right: 0,
    conflictIdx: -1,
    statLabel: 'Phase',
    statValue: 'Init',
    desc: `Loaded ${n}x${n} matrix as a flattened 1D array.`,
    maxLen: 0
  });

  // Phase 1: Transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const idx1 = i * n + j;
      const idx2 = j * n + i;
      steps.push({
        left: idx1,
        right: idx1,
        conflictIdx: idx2,
        statLabel: 'Transpose',
        statValue: `Swap (${i},${j}) with (${j},${i})`,
        desc: `Transposing: swapping matrix[${i}][${j}] and matrix[${j}][${i}] (indices ${idx1} and ${idx2} in 1D array).`,
        maxLen: n
      });
      // Perform the swap in the working array to keep track if needed,
      // but the visualizer char array remains static in UI (we just highlight).
      // If we wanted we could re-render the final string but sliding-window expects fixed chars.
      const temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;
    }
  }

  // Phase 2: Reverse each row
  for (let i = 0; i < n; i++) {
    let l = 0;
    let r = n - 1;
    while (l < r) {
      const idx1 = i * n + l;
      const idx2 = i * n + r;
      steps.push({
        left: idx1,
        right: idx1,
        conflictIdx: idx2,
        statLabel: 'Reverse',
        statValue: `Row ${i}`,
        desc: `Reversing row ${i}: swapping matrix[${i}][${l}] and matrix[${i}][${r}] (indices ${idx1} and ${idx2}).`,
        maxLen: n
      });
      const temp = matrix[i][l];
      matrix[i][l] = matrix[i][r];
      matrix[i][r] = temp;
      l++;
      r--;
    }
  }

  // Construct final matrix string for description
  const finalStr = matrix.map(row => '[' + row.join(',') + ']').join(', ');

  steps.push({
    left: n * n - 1,
    right: n * n - 1,
    conflictIdx: -1,
    statLabel: 'Done',
    statValue: 'Complete',
    desc: `Rotation complete! Final matrix: [${finalStr}].`,
    maxLen: n,
    finished: true
  });

  return { chars, steps };
};
