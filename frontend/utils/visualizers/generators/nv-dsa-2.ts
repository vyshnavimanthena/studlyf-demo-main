export const matrixChainMultiplicationGenerator = (inputStr: string) => {
  let dims = [40, 20, 30, 10, 30];
  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      const parsed = match[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (parsed.length >= 2) dims = parsed;
    }
  } catch (e) {
    // fallback
  }

  const n = dims.length - 1;
  const steps: any[] = [];
  const dp: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    steps.push({
      row: i, col: i, val: true,
      desc: `Base Case: Matrix ${i} (dim ${dims[i]}x${dims[i+1]}) needs 0 multiplications. DP[${i}][${i}] = 0.`
    });
  }

  for (let length = 2; length <= n; length++) {
    for (let i = 0; i < n - length + 1; i++) {
      const j = i + length - 1;
      dp[i][j] = Infinity;
      steps.push({
        row: i, col: j, val: false,
        desc: `Computing DP[${i}][${j}] for chain of length ${length}. Initial cost is Infinity.`
      });

      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
        steps.push({
          row: i, col: j, val: false,
          desc: `Split at k=${k}: cost = DP[${i}][${k}] + DP[${k+1}][${j}] + ${dims[i]}*${dims[k+1]}*${dims[j+1]} = ${cost}`
        });
        if (cost < dp[i][j]) {
          dp[i][j] = cost;
          steps.push({
            row: i, col: j, val: true,
            desc: `Found new minimum cost ${cost} by splitting at k=${k}. DP[${i}][${j}] = ${cost}`
          });
        }
      }
      
      steps.push({
        row: i, col: j, val: true,
        desc: `Final minimum cost for DP[${i}][${j}] is ${dp[i][j]}.`
      });
    }
  }

  steps.push({
    row: 0, col: n - 1, val: true,
    desc: `Computation complete. The minimum cost to multiply the entire matrix chain is ${dp[0][n-1]}.`,
    finished: true
  });

  return { n, steps };
};
