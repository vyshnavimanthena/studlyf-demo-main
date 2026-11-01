export const msDsa3Generator = (inputStr: string) => {
  let s = "ADOBECODEBANC";
  let t = "ABC";

  try {
    const sMatch = inputStr.match(/s\s*=\s*"([^"]*)"/);
    const tMatch = inputStr.match(/t\s*=\s*"([^"]*)"/);
    if (sMatch) s = sMatch[1];
    if (tMatch) t = tMatch[1];
  } catch (e) {
    // fallback
  }

  const chars = s.split('');
  const steps: any[] = [];
  
  const tCount: { [key: string]: number } = {};
  for (const char of t) {
    tCount[char] = (tCount[char] || 0) + 1;
  }
  const required = Object.keys(tCount).length;

  let l = 0;
  let r = 0;
  let formed = 0;
  const windowCounts: { [key: string]: number } = {};
  let ans: [number, number, number] = [Infinity, 0, 0]; // [length, left, right]

  steps.push({
    left: l,
    right: r,
    conflictIdx: -1,
    desc: `Initialize pointers left=0, right=0. Target string t="${t}".`,
    statLabel: 'Min Window Length',
    statValue: 'Infinity',
  });

  while (r < s.length) {
    const ch = s[r];
    windowCounts[ch] = (windowCounts[ch] || 0) + 1;

    if (tCount[ch] !== undefined && windowCounts[ch] === tCount[ch]) {
      formed++;
    }

    steps.push({
      left: l,
      right: r,
      conflictIdx: -1,
      desc: `Expand right pointer: Added "${ch}". Unique characters formed: ${formed}/${required}.`,
      statLabel: 'Min Window Length',
      statValue: ans[0] === Infinity ? 'Infinity' : ans[0],
    });

    while (l <= r && formed === required) {
      const currentLen = r - l + 1;
      let updatedAns = false;
      if (currentLen < ans[0]) {
        ans = [currentLen, l, r];
        updatedAns = true;
      }

      steps.push({
        left: l,
        right: r,
        conflictIdx: -1,
        desc: `Valid window found from index ${l} to ${r} (Length: ${currentLen}). ${updatedAns ? 'Update minimum window!' : 'Current minimum is smaller.'} Shrinking from left...`,
        statLabel: 'Min Window Length',
        statValue: ans[0] === Infinity ? 'Infinity' : ans[0],
      });

      const leftChar = s[l];
      windowCounts[leftChar] -= 1;
      if (tCount[leftChar] !== undefined && windowCounts[leftChar] < tCount[leftChar]) {
        formed--;
      }
      l++;

      if (formed < required) {
        steps.push({
          left: l,
          right: r,
          conflictIdx: -1,
          desc: `Removed "${leftChar}" from left. Window is no longer valid (formed: ${formed}/${required}).`,
          statLabel: 'Min Window Length',
          statValue: ans[0] === Infinity ? 'Infinity' : ans[0],
        });
      }
    }
    r++;
  }

  const finalString = ans[0] === Infinity ? "" : s.substring(ans[1], ans[2] + 1);
  steps.push({
    left: ans[1] !== undefined ? ans[1] : 0,
    right: ans[2] !== undefined ? ans[2] : 0,
    conflictIdx: -1,
    desc: `Algorithm complete. Minimum window substring is "${finalString}".`,
    statLabel: 'Min Window Length',
    statValue: ans[0] === Infinity ? 'Infinity' : ans[0],
    finished: true,
  });

  return { chars, steps };
};
