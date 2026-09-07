import { CoffeeRecipe } from '../types';

const STORAGE_KEY = 'coffee_recipes_v1';

export const INITIAL_RECIPES: CoffeeRecipe[] = [
  {
    id: 'recipe-sample-1',
    brewDate: '2026-09-07',
    beanName: 'エチオピア イルガチェフェ G1',
    shop: '豆ラボ',
    roastLevel: '浅煎り',
    roastDate: '2026-08-31',
    clicks: '18',
    coffeeAmount: 15.0,
    waterTemp: 92,
    dripper: 'ハリオ V60',
    totalWater: 240,
    ratio: '1:16.0',
    pours: [
      { time: '0:00', water: 40 },
      { time: '0:45', water: 60 },
      { time: '1:15', water: 50 },
      { time: '1:45', water: 50 },
      { time: '2:15', water: 40 },
    ],
    finishTime: '02:45',
    rating: 5,
    isFavorite: true,
    taste: { acidity: 4, sweetness: 5, bitterness: 2 },
    notes: '豆ラボさんのおすすめ焙煎。華やかなジャスミン香とピーチのような甘みが素晴らしい。エイジング7日目でピーク！',
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
  {
    id: 'recipe-sample-2',
    brewDate: '2026-09-05',
    beanName: 'グアテマラ アンティグア',
    shop: '豆ラボ',
    roastLevel: '中深煎り',
    roastDate: '2026-08-28',
    clicks: '17',
    coffeeAmount: 16.0,
    waterTemp: 88,
    dripper: 'ハリオ V60',
    totalWater: 240,
    ratio: '1:15.0',
    pours: [
      { time: '0:00', water: 40 },
      { time: '0:40', water: 60 },
      { time: '1:10', water: 50 },
      { time: '1:40', water: 50 },
      { time: '2:10', water: 40 },
    ],
    finishTime: '02:35',
    rating: 4,
    isFavorite: false,
    taste: { acidity: 2, sweetness: 4, bitterness: 4 },
    notes: 'ミルクチョコレートのようなコク。少し湯温を下げて角を取るとマイルドになった。',
    createdAt: 1725500000000,
    updatedAt: 1725500000000,
  },
  {
    id: 'recipe-sample-3',
    brewDate: '2026-09-02',
    beanName: 'ケニア キアンブ AA',
    shop: '豆ラボ',
    roastLevel: '中煎り',
    roastDate: '2026-08-25',
    clicks: '19',
    coffeeAmount: 15.0,
    waterTemp: 90,
    dripper: 'ハリオ V60',
    totalWater: 250,
    ratio: '1:16.7',
    pours: [
      { time: '0:00', water: 45 },
      { time: '0:45', water: 65 },
      { time: '1:15', water: 50 },
      { time: '1:45', water: 50 },
      { time: '2:15', water: 40 },
    ],
    finishTime: '02:50',
    rating: 5,
    isFavorite: true,
    taste: { acidity: 4, sweetness: 4, bitterness: 3 },
    notes: 'ブラックベリーのような濃厚な果実感と透明感。冷めてからの甘みが格別。',
    createdAt: 1725300000000,
    updatedAt: 1725300000000,
  },
];

export function loadStoredRecipes(): CoffeeRecipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECIPES));
      return INITIAL_RECIPES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_RECIPES;
  } catch (err) {
    console.warn('Failed to load recipes from localStorage:', err);
    return INITIAL_RECIPES;
  }
}

export function saveStoredRecipes(recipes: CoffeeRecipe[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (err) {
    console.error('Failed to save recipes to localStorage:', err);
  }
}

/**
 * Requirement: 豆の品名が同じであれば、購入店、焙煎度、焙煎日を事前入力
 * Finds the latest matching recipe with the same bean name (case/whitespace insensitive).
 */
export function findPreviousBeanInfo(
  beanName: string,
  recipes: CoffeeRecipe[]
): { shop: string; roastLevel: string; roastDate: string } | null {
  if (!beanName || !beanName.trim()) return null;
  const target = beanName.trim().toLowerCase();

  // Find the most recent matching recipe (sorted by brewDate or updatedAt)
  const matching = recipes
    .filter((r) => r.beanName && r.beanName.trim().toLowerCase() === target)
    .sort((a, b) => (b.brewDate || '').localeCompare(a.brewDate || '') || (b.updatedAt || 0) - (a.updatedAt || 0));

  if (matching.length > 0) {
    const latest = matching[0];
    return {
      shop: latest.shop || '',
      roastLevel: latest.roastLevel || '',
      roastDate: latest.roastDate || '',
    };
  }
  return null;
}

/**
 * Extract unique bean names for auto-complete and filter dropdown
 */
export function getUniqueBeanNames(recipes: CoffeeRecipe[]): string[] {
  const set = new Set<string>();
  recipes.forEach((r) => {
    if (r.beanName && r.beanName.trim()) {
      set.add(r.beanName.trim());
    }
  });
  return Array.from(set);
}

/**
 * Extract unique shops
 */
export function getUniqueShops(recipes: CoffeeRecipe[]): string[] {
  const set = new Set<string>(['豆ラボ']); // Always ensure "豆ラボ" is present
  recipes.forEach((r) => {
    if (r.shop && r.shop.trim()) {
      set.add(r.shop.trim());
    }
  });
  return Array.from(set);
}

/**
 * Extract unique drippers
 */
export function getUniqueDrippers(recipes: CoffeeRecipe[]): string[] {
  const set = new Set<string>(['ハリオ V60', 'カリタ ウェーブ', 'ORIGAMI', 'コーノ (KONO)', 'エアロプレス']);
  recipes.forEach((r) => {
    if (r.dripper && r.dripper.trim()) {
      set.add(r.dripper.trim());
    }
  });
  return Array.from(set);
}
