import { StarData } from '../types';

const API_BASE = '/api/stars';

export const fetchStars = async (): Promise<StarData[]> => {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Failed to fetch stars');
    }
    const data = await response.json();
    return data.stars || [];
  } catch (error) {
    console.error('Error fetching stars:', error);
    return [];
  }
};

export const saveStar = async (star: StarData): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(star),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving star:', error);
    return false;
  }
};
