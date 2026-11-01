export const basicCalculatorIIGenerator = (inputStr: string) => {
  let s = "3+2*2";
  
  try {
    const match = inputStr.match(/"([^"]+)"/);
    if (match) {
      s = match[1];
    } else {
        const sMatch = inputStr.match(/s\s*=\s*"([^"]+)"/);
        if (sMatch) s = sMatch[1];
        else if (inputStr.trim().length > 0 && !inputStr.includes('[')) {
            s = inputStr.replace(/["']/g, '').trim();
        }
    }
  } catch (e) {
      // fallback
  }

  const chars = s.split('');
  const steps: any[] = [];
  const stack: number[] = [];
  let num = 0;
  let sign = '+';

  steps.push({
    left: 0,
    right: 0,
    conflictIdx: -1,
    statLabel: 'Stack',
    statValue: '[]',
    desc: `Initialize stack = [], num = 0, sign = '+'`,
  });

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const isDigit = c >= '0' && c <= '9';
    const isOp = c === '+' || c === '-' || c === '*' || c === '/';

    steps.push({
      left: i,
      right: i,
      conflictIdx: -1,
      statLabel: 'Stack',
      statValue: `[${stack.join(', ')}]`,
      desc: `Processing char '${c}' at index ${i}. num = ${num}, sign = '${sign}'`,
    });

    if (isDigit) {
      num = num * 10 + parseInt(c, 10);
      steps.push({
        left: i,
        right: i,
        conflictIdx: -1,
        statLabel: 'Stack',
        statValue: `[${stack.join(', ')}]`,
        desc: `Char '${c}' is a digit. Updated num = ${num}`,
      });
    }

    // Python condition: if c in '+-*/' or i == len(s) - 1:
    if (isOp || i === s.length - 1) {
        let desc = '';
        
        if (sign === '+') {
            stack.push(num);
            desc = `Current sign is '+'. Pushed ${num} to stack.`;
        } else if (sign === '-') {
            stack.push(-num);
            desc = `Current sign is '-'. Pushed ${-num} to stack.`;
        } else if (sign === '*') {
            const pop = stack.pop()!;
            const val = pop * num;
            stack.push(val);
            desc = `Current sign is '*'. Popped ${pop}, multiplied by ${num}. Pushed ${val}.`;
        } else if (sign === '/') {
            const pop = stack.pop()!;
            const val = Math.trunc(pop / num); // Python's int(pop / num) truncates towards zero
            stack.push(val);
            desc = `Current sign is '/'. Popped ${pop}, divided by ${num}. Pushed ${val}.`;
        }
        
        let nextSign = isOp ? c : sign; 
        
        steps.push({
          left: i,
          right: i,
          conflictIdx: -1,
          statLabel: 'Stack',
          statValue: `[${stack.join(', ')}]`,
          desc: `${desc} Reset num = 0, sign = '${nextSign}'.`,
        });
        
        if (isOp) {
            sign = c;
        }
        num = 0;
    }
  }
  
  const total = stack.reduce((a,b) => a+b, 0);
  steps.push({
      left: Math.max(0, s.length - 1),
      right: Math.max(0, s.length - 1),
      conflictIdx: -1,
      statLabel: 'Result',
      statValue: total.toString(),
      desc: `Reached end of string. Summing stack elements: [${stack.join(', ')}] = ${total}.`,
      finished: true
  });
  
  return { chars, steps };
};
