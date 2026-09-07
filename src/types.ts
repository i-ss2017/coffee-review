/**
 * Coffee Recipe Data Types
 */

export interface PourStep {
  time: string; // e.g., "0:00", "0:45"
  water: number; // e.g., 40, 100
}

export interface TasteProfile {
  acidity: number; // 1 to 5 (酸味)
  sweetness: number; // 1 to 5 (甘み)
  bitterness: number; // 1 to 5 (苦み)
}

export interface CoffeeRecipe {
  id: string;
  brewDate: string; // 抽出日 (YYYY-MM-DD)
  beanName: string; // 豆の品名
  shop: string; // 購入店 (e.g. "豆ラボ")
  roastLevel: string; // 焙煎度 (e.g. "浅煎り", "中浅煎り", "中煎り", "中深煎り", "深煎り")
  roastDate: string; // 焙煎日 (YYYY-MM-DD)
  clicks: string; // クリック数 (挽き目, e.g. "18 clicks")
  coffeeAmount: number; // 粉量(g), e.g. 15.0
  waterTemp: number; // 湯温(℃), e.g. 90
  dripper: string; // ドリッパー (e.g. "ハリオ V60")
  totalWater: number; // 合計 湯量(ml/g), e.g. 240
  ratio: string; // 抽出比率, e.g. "1:16.0"
  pours: PourStep[]; // 1投目〜5投目時間/湯量
  finishTime: string; // 落切時間, e.g. "2:30"
  rating: number; // 評価 (1〜5)
  isFavorite: boolean; // お気に入り
  taste: TasteProfile; // 味わい (酸味、甘み、苦み)
  notes: string; // 備考
  createdAt: number;
  updatedAt: number;
}

export type FilterMode = 'all' | 'rating5' | 'favorite';

export type SortOrder = 'brewDateDesc' | 'brewDateAsc' | 'ratingDesc' | 'agingDaysDesc';
