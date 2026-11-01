import { LayoutEngine } from '../layoutEngine';

export const decodeWaysGenerator = (inputStr: string) => {
  // Parse input
  // Default: 's = "226"'
  let s = "226";
  try {
    const match = inputStr.match(/"(.*?)"/);
    if (match) {
      s = match[1];
    } else if (!inputStr.includes("=")) {
        s = inputStr.trim().replace(/['"]/g, '');
    }
  } catch (e) {
    // fallback
  }

  const steps: any[] = [];
  const n = s.length;
  const dp = Array(n + 1).fill(0);

  // Initialize DP
  dp[0] = 1;
  steps.push({
    row: 0, col: 0, val: 1,
    desc: `Base Case: Empty string has 1 way to decode. DP[0] = 1.`
  });

  if (n === 0) {
      steps.push({
          row: 0, col: 0, val: 1,
          desc: `String is empty. Result is 0.`,
          finished: true
      });
      return { s, rows: 1, cols: n + 1, steps };
  }

  if (s[0] === '0') {
    dp[1] = 0;
    steps.push({
      row: 0, col: 1, val: 0,
      desc: `First character is '0', cannot decode. DP[1] = 0.`
    });
    steps.push({
        row: 0, col: 1, val: 0,
        desc: `Cannot decode string starting with '0'. Result is 0.`,
        finished: true
    });
    return { s, rows: 1, cols: n + 1, steps };
  } else {
    dp[1] = 1;
    steps.push({
      row: 0, col: 1, val: 1,
      desc: `First character '${s[0]}' is valid (1-9). DP[1] = 1.`
    });
  }

  for (let i = 2; i <= n; i++) {
    const oneDigitStr = s.substring(i - 1, i);
    const twoDigitStr = s.substring(i - 2, i);
    const oneDigit = parseInt(oneDigitStr, 10);
    const twoDigit = parseInt(twoDigitStr, 10);

    let curr = 0;
    let descParts = [];

    if (oneDigit >= 1 && oneDigit <= 9) {
      curr += dp[i - 1];
      descParts.push(`'${oneDigitStr}' valid (+${dp[i - 1]})`);
    } else {
      descParts.push(`'${oneDigitStr}' invalid`);
    }

    if (twoDigit >= 10 && twoDigit <= 26) {
      curr += dp[i - 2];
      descParts.push(`'${twoDigitStr}' valid (+${dp[i - 2]})`);
    } else {
      descParts.push(`'${twoDigitStr}' invalid`);
    }

    dp[i] = curr;
    steps.push({
      row: 0, col: i, val: curr,
      desc: `At index ${i} (char '${s[i-1]}'): ${descParts.join(', ')}. DP[${i}] = ${curr}.`
    });
  }

  steps.push({
      row: 0, col: n, val: dp[n],
      desc: `Finished processing. Total ways to decode "${s}" is ${dp[n]}.`,
      finished: true
  });

  return { s, rows: 1, cols: n + 1, steps };
};
