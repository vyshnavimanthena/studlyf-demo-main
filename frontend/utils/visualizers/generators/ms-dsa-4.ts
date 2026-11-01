export const msDsa4Generator = (inputStr: string) => {
  let courses: [number, number][] = [[100, 200], [200, 1300], [1000, 1250], [2000, 3200]];
  try {
    const match = inputStr.match(/\[\[(.*?)\]\]/);
    if (match) {
      const parts = inputStr.substring(inputStr.indexOf('[[') + 2, inputStr.lastIndexOf(']]')).split('],[');
      courses = parts.map(p => {
        const [d, l] = p.replace(/[\[\]]/g, '').split(',').map(s => parseInt(s.trim(), 10));
        return [d, l];
      });
    }
  } catch (e) {
    console.error(e);
  }

  const steps: any[] = [];
  const initialArr: number[] = [];

  // Sort courses by last_day
  courses.sort((a, b) => a[1] - b[1]);

  steps.push({
    desc: `Sorted courses by deadline: ${courses.map(c => `[${c[0]},${c[1]}]`).join(', ')}. Initializing empty max-heap.`,
    arr: [],
    active: [],
    pivot: -1
  });

  const heap: number[] = [];
  let totalTime = 0;

  for (let i = 0; i < courses.length; i++) {
    const [duration, lastDay] = courses[i];

    steps.push({
      desc: `Evaluating course ${i + 1}: Duration ${duration}, Deadline ${lastDay}. Current total time: ${totalTime}.`,
      arr: [...heap],
      active: [],
      pivot: -1
    });

    if (totalTime + duration <= lastDay) {
      heap.push(duration);
      heap.sort((a, b) => b - a); // simulate max-heap by keeping it sorted descending
      totalTime += duration;
      
      steps.push({
        desc: `Time ${totalTime - duration} + ${duration} <= ${lastDay}. Added duration ${duration} to heap. New total time: ${totalTime}.`,
        arr: [...heap],
        active: [heap.indexOf(duration)],
        pivot: -1
      });
    } else {
      steps.push({
        desc: `Time ${totalTime} + ${duration} > ${lastDay}. Course cannot be taken normally. Checking if we can replace a longer course.`,
        arr: [...heap],
        active: [],
        pivot: -1
      });

      if (heap.length > 0 && heap[0] > duration) {
        const removed = heap[0];
        totalTime = totalTime - removed + duration;
        heap[0] = duration;
        heap.sort((a, b) => b - a);

        steps.push({
          desc: `Max duration in heap is ${removed} > ${duration}. Replaced ${removed} with ${duration}. New total time: ${totalTime}.`,
          arr: [...heap],
          active: [heap.indexOf(duration)],
          pivot: -1
        });
      } else {
        steps.push({
          desc: `Heap is empty or max duration <= ${duration}. Cannot replace. Skipping this course.`,
          arr: [...heap],
          active: [],
          pivot: -1
        });
      }
    }
  }

  steps.push({
    desc: `Finished processing all courses. Maximum courses we can take is ${heap.length}.`,
    arr: [...heap],
    active: [],
    pivot: -1,
    finished: true
  });

  return {
    initialArr,
    steps,
    unsupported: false
  };
};
