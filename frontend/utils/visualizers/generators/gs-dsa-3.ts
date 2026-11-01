import { LayoutEngine } from '../layoutEngine';

export const bestTimeToBuyAndSellStockWithCooldownGenerator = (inputStr: string) => {
  let prices = [1, 2, 3, 0, 2];
  try {
    const match = inputStr.match(/\[(.*?)\]/);
    if (match) {
      const parsed = match[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
      if (parsed.length > 0) {
        prices = parsed;
      }
    }
  } catch (e) {}

  const steps: any[] = [];
  const n = prices.length;
  const rows = 3; // 0: Hold, 1: Sold, 2: Rest
  const cols = n;
  
  if (n < 2) {
    steps.push({ desc: `Prices length < 2. Max profit is 0.`, finished: true });
    return { rows, cols, steps };
  }

  const dpHold = Array(n).fill(0);
  const dpSold = Array(n).fill(0);
  const dpRest = Array(n).fill(0);

  dpHold[0] = -prices[0];
  dpSold[0] = 0;
  dpRest[0] = 0;

  steps.push({
    row: 0, col: 0, val: dpHold[0],
    desc: `Day 0: Buy stock. Hold state = -prices[0] = ${dpHold[0]}.`
  });
  steps.push({
    row: 1, col: 0, val: 0,
    desc: `Day 0: Cannot sell stock on day 0. Sold state = 0.`
  });
  steps.push({
    row: 2, col: 0, val: 0,
    desc: `Day 0: Do nothing. Rest state = 0.`
  });

  for (let i = 1; i < n; i++) {
    const price = prices[i];
    
    dpHold[i] = Math.max(dpHold[i-1], dpRest[i-1] - price);
    steps.push({
      row: 0, col: i, val: dpHold[i],
      desc: `Day ${i} (Price = ${price}): Hold = max(prevHold[${dpHold[i-1]}], prevRest[${dpRest[i-1]}] - price) = ${dpHold[i]}.`
    });

    dpRest[i] = Math.max(dpRest[i-1], dpSold[i-1]);
    steps.push({
      row: 2, col: i, val: dpRest[i],
      desc: `Day ${i} (Price = ${price}): Rest = max(prevRest[${dpRest[i-1]}], prevSold[${dpSold[i-1]}]) = ${dpRest[i]}.`
    });

    dpSold[i] = dpHold[i-1] + price;
    steps.push({
      row: 1, col: i, val: dpSold[i],
      desc: `Day ${i} (Price = ${price}): Sold = prevHold[${dpHold[i-1]}] + price = ${dpSold[i]}.`
    });
  }

  const maxProfit = Math.max(dpSold[n-1], dpRest[n-1]);
  steps.push({
    row: 1, col: n-1, val: maxProfit,
    desc: `Final Result: max(Sold=${dpSold[n-1]}, Rest=${dpRest[n-1]}) = ${maxProfit}.`,
    finished: true
  });

  return { rows, cols, steps };
};
