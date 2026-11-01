export const maximumProfitInKTransactionsGenerator = (inputStr: string) => {
  // Parse input
  let prices = [3, 3, 5, 0, 0, 3, 1, 4];
  let k = 2;
  try {
    const pricesMatch = inputStr.match(/prices\s*=\s*\[(.*?)\]/);
    if (pricesMatch) {
      prices = pricesMatch[1].split(',').map(s => parseInt(s.trim()));
    }
    const kMatch = inputStr.match(/k\s*=\s*(\d+)/);
    if (kMatch) {
      k = parseInt(kMatch[1]);
    }
  } catch (e) {
    // fallback to defaults
  }

  const n = prices.length;
  const steps: any[] = [];

  if (n === 0 || k === 0) {
    return { rows: k + 1, cols: n || 1, steps: [] };
  }

  const rows = k + 1;
  const cols = n;

  const dp = Array(k + 1).fill(0).map(() => Array(n).fill(0));

  // Base cases
  for (let t = 0; t <= k; t++) {
    steps.push({
      row: t, col: 0, val: 0,
      desc: `Day 0 (price: ${prices[0]}). Max profit is 0 for any number of transactions.`
    });
  }
  for (let i = 1; i < n; i++) {
    steps.push({
      row: 0, col: i, val: 0,
      desc: `0 transactions allowed. Max profit on day ${i} (price: ${prices[i]}) is 0.`
    });
  }

  for (let t = 1; t <= k; t++) {
    let maxSoFar = -prices[0];
    steps.push({
      row: t, col: 0, val: 0,
      desc: `Starting t = ${t} transactions. Initialize maxSoFar = -prices[0] = ${maxSoFar}.`
    });

    for (let i = 1; i < n; i++) {
      const skip = dp[t][i - 1];
      const sell = prices[i] + maxSoFar;
      dp[t][i] = Math.max(skip, sell);

      steps.push({
        row: t, col: i, val: dp[t][i],
        desc: `t=${t}, Day ${i} (price: ${prices[i]}). Skip = ${skip}, Sell = ${sell}. DP[${t}][${i}] = max(${skip}, ${sell}) = ${dp[t][i]}.`
      });

      const oldMaxSoFar = maxSoFar;
      const profitIfBuy = dp[t - 1][i] - prices[i];
      maxSoFar = Math.max(maxSoFar, profitIfBuy);

      if (maxSoFar !== oldMaxSoFar) {
        steps.push({
          row: t, col: i, val: dp[t][i],
          desc: `Update maxSoFar: max(${oldMaxSoFar}, DP[${t - 1}][${i}] - prices[${i}]) = max(${oldMaxSoFar}, ${profitIfBuy}) = ${maxSoFar}.`
        });
      }
    }
  }

  steps.push({
    row: k, col: n - 1, val: dp[k][n - 1],
    desc: `DP complete! Max profit for ${k} transactions is ${dp[k][n - 1]}.`,
    finished: true
  });

  return { rows, cols, steps };
};
