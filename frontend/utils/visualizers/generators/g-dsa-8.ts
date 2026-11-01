export const gDsa8Generator = (inputStr: string) => {
  let k = 2;
  let prices = [3, 2, 6, 5, 0, 3];

  try {
    const kMatch = inputStr.match(/k\s*=\s*(\d+)/);
    if (kMatch) {
      k = parseInt(kMatch[1], 10);
    }
    const pMatch = inputStr.match(/prices\s*=\s*\[(.*?)\]/);
    if (pMatch) {
      prices = pMatch[1].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    }
  } catch (e) {
    // fallback
  }

  if (prices.length === 0) prices = [3, 2, 6, 5, 0, 3];
  if (k <= 0) k = 1;

  const n = prices.length;
  // Cap k for the visualizer grid size to prevent browser crashes
  k = Math.min(k, n);

  const steps: any[] = [];
  const rows = 2; // row 0: buy, row 1: sell
  const cols = k + 1; // 0 to k

  const buy = new Array(cols).fill(-Infinity);
  const sell = new Array(cols).fill(0);

  // Initialize
  for (let j = 0; j <= k; j++) {
    steps.push({
      row: 0,
      col: j,
      val: '-∞',
      desc: `Initialize buy[${j}] = -∞`
    });
    steps.push({
      row: 1,
      col: j,
      val: 0,
      desc: `Initialize sell[${j}] = 0`
    });
  }

  for (let i = 0; i < n; i++) {
    const price = prices[i];
    steps.push({
      row: -1,
      col: -1,
      val: null,
      desc: `\n--- Day ${i}, Price = ${price} ---`
    });

    for (let j = 1; j <= k; j++) {
      const prevBuy = buy[j];
      const prevSell = sell[j - 1];
      
      const newBuy = Math.max(prevBuy, prevSell - price);
      buy[j] = newBuy;
      steps.push({
        row: 0,
        col: j,
        val: newBuy,
        desc: `buy[${j}] = max(buy[${j}] (${prevBuy === -Infinity ? '-∞' : prevBuy}), sell[${j-1}] - price (${prevSell} - ${price})) = ${newBuy}`
      });

      const oldSell = sell[j];
      const newSell = Math.max(oldSell, buy[j] + price);
      sell[j] = newSell;
      steps.push({
        row: 1,
        col: j,
        val: newSell,
        desc: `sell[${j}] = max(sell[${j}] (${oldSell}), buy[${j}] + price (${buy[j]} + ${price})) = ${newSell}`
      });
    }
  }

  steps.push({
    row: -1,
    col: -1,
    val: null,
    desc: `Final max profit is sell[${k}] = ${sell[k]}.`,
    finished: true
  });

  return { rows, cols, steps };
};
