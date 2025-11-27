const DAILY_LIMIT = 20;
const STORAGE_KEY = 'gratitude_rate_limit';

interface RateLimitData {
  date: string;
  count: number;
}

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getData = (): RateLimitData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Ignore
  }
  return { date: getTodayDate(), count: 0 };
};

const saveData = (data: RateLimitData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Ignore
  }
};

export const checkRateLimit = (): { allowed: boolean; remaining: number } => {
  const data = getData();
  const today = getTodayDate();

  // Reset if new day
  if (data.date !== today) {
    return { allowed: true, remaining: DAILY_LIMIT };
  }

  const remaining = DAILY_LIMIT - data.count;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
};

export const incrementCount = (): void => {
  const data = getData();
  const today = getTodayDate();

  if (data.date !== today) {
    saveData({ date: today, count: 1 });
  } else {
    saveData({ date: today, count: data.count + 1 });
  }
};

export const getRemainingCount = (): number => {
  return checkRateLimit().remaining;
};
