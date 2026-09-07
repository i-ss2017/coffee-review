import { CoffeeRecipe, PourStep } from '../types';
import { getTodayDateString } from './dateUtils';

// Helper to parse CSV / TSV taking quotes into account
export function parseDelimitedText(text: string): string[][] {
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!cleanText) return [];

  // Determine delimiter: if there are tabs in the first line, it's TSV (Google Sheets copy-paste), otherwise comma
  const firstLine = cleanText.split('\n')[0] || '';
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  // Filter out empty rows
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

export interface ColumnMapping {
  brewDateIdx: number;
  beanNameIdx: number;
  shopIdx: number;
  roastLevelIdx: number;
  roastDateIdx: number;
  clicksIdx: number;
  coffeeAmountIdx: number;
  waterTempIdx: number;
  dripperIdx: number;
  totalWaterIdx: number;
  ratioIdx: number;
  pour1Idx: number;
  pour2Idx: number;
  pour3Idx: number;
  pour4Idx: number;
  pour5Idx: number;
  finishTimeIdx: number;
  ratingIdx: number;
  acidityIdx: number;
  sweetnessIdx: number;
  bitternessIdx: number;
  notesIdx: number;
}

// Auto-detect header index
export function detectColumnMapping(headers: string[]): ColumnMapping {
  const norm = headers.map((h) => h.toLowerCase().replace(/[\s_()（）/]/g, ''));

  const findIdx = (keywords: string[]): number => {
    for (let i = 0; i < norm.length; i++) {
      const val = norm[i];
      for (const kw of keywords) {
        if (val.includes(kw.toLowerCase())) {
          return i;
        }
      }
    }
    return -1;
  };

  return {
    brewDateIdx: findIdx(['抽出日', '抽出日付', '日付', 'brewdate', 'date']),
    beanNameIdx: findIdx(['豆の品名', '豆名', '品名', '銘柄', 'bean', 'coffee']),
    shopIdx: findIdx(['購入店', '店名', 'ショップ', 'shop', 'store']),
    roastLevelIdx: findIdx(['焙煎度', 'ロースト', '煎り度', 'roastlevel', 'roast']),
    roastDateIdx: findIdx(['焙煎日', '焙煎日付', 'roastdate']),
    clicksIdx: findIdx(['クリック数', 'クリック', '挽き目', '粒度', 'click', 'clicks', 'grind']),
    coffeeAmountIdx: findIdx(['粉量', '粉', '豆量', 'g', 'dose', 'coffeeamount']),
    waterTempIdx: findIdx(['湯温', '温度', 'お湯温度', '℃', 'temp', 'watertemp']),
    dripperIdx: findIdx(['ドリッパー', '器具', 'dripper']),
    totalWaterIdx: findIdx(['合計湯量', '湯量', '合計', 'water', 'totalwater']),
    ratioIdx: findIdx(['抽出比率', '比率', 'レシオ', 'ratio']),
    pour1Idx: findIdx(['1投目', '一投目', '1stpour', 'pour1']),
    pour2Idx: findIdx(['2投目', '二投目', '2ndpour', 'pour2']),
    pour3Idx: findIdx(['3投目', '三投目', '3rdpour', 'pour3']),
    pour4Idx: findIdx(['4投目', '四投目', '4thpour', 'pour4']),
    pour5Idx: findIdx(['5投目', '五投目', '5thpour', 'pour5']),
    finishTimeIdx: findIdx(['落切時間', '落切', '落ちきり', '抽出時間', 'finishtime', 'totaltime', 'time']),
    ratingIdx: findIdx(['評価', '星', 'rating', 'score']),
    acidityIdx: findIdx(['酸味', 'acidity', '酸']),
    sweetnessIdx: findIdx(['甘み', '甘味', 'sweetness', '甘']),
    bitternessIdx: findIdx(['苦み', '苦味', 'bitterness', '苦']),
    notesIdx: findIdx(['備考', 'メモ', '感想', 'ノート', 'notes', 'comment', 'memo']),
  };
}

// Convert a row of strings into a recipe
export function convertRowToRecipe(
  row: string[],
  mapping: ColumnMapping,
  existingCount: number
): CoffeeRecipe {
  const getVal = (idx: number, fallback = '') => (idx >= 0 && idx < row.length ? row[idx].trim() : fallback);
  const getNum = (idx: number, fallback = 0) => {
    if (idx < 0 || idx >= row.length) return fallback;
    const num = parseFloat(row[idx].replace(/[^0-9.]/g, ''));
    return isNaN(num) ? fallback : num;
  };

  const beanName = getVal(mapping.beanNameIdx, '未設定の豆');
  const brewDate = getVal(mapping.brewDateIdx, getTodayDateString());
  const shop = getVal(mapping.shopIdx, '豆ラボ');
  const roastLevel = getVal(mapping.roastLevelIdx, '中煎り');
  const roastDate = getVal(mapping.roastDateIdx, '');
  const clicks = getVal(mapping.clicksIdx, '18');
  const coffeeAmount = getNum(mapping.coffeeAmountIdx, 15);
  const waterTemp = getNum(mapping.waterTempIdx, 90);
  const dripper = getVal(mapping.dripperIdx, 'ハリオ V60');
  let totalWater = getNum(mapping.totalWaterIdx, 240);

  // Parse pour steps (support formats like "0:00/40g", "40g", or "0:00 40")
  const parsePour = (val: string, defaultTime: string, defaultWater: number): PourStep => {
    if (!val) return { time: defaultTime, water: defaultWater };
    const parts = val.split(/[/,]/);
    if (parts.length >= 2) {
      const time = parts[0].trim();
      const w = parseFloat(parts[1].replace(/[^0-9.]/g, '')) || defaultWater;
      return { time, water: w };
    }
    const pureWater = parseFloat(val.replace(/[^0-9.]/g, ''));
    if (!isNaN(pureWater) && pureWater > 0) {
      return { time: defaultTime, water: pureWater };
    }
    return { time: val.trim() || defaultTime, water: defaultWater };
  };

  const pours: PourStep[] = [
    parsePour(getVal(mapping.pour1Idx), '0:00', 40),
    parsePour(getVal(mapping.pour2Idx), '0:45', 60),
    parsePour(getVal(mapping.pour3Idx), '1:15', 50),
    parsePour(getVal(mapping.pour4Idx), '1:45', 50),
    parsePour(getVal(mapping.pour5Idx), '2:15', 40),
  ];

  // If total water wasn't specified, calculate sum of pours
  const sumWater = pours.reduce((acc, p) => acc + (p.water || 0), 0);
  if (totalWater <= 0 && sumWater > 0) {
    totalWater = sumWater;
  }

  // Calculate ratio
  let ratio = getVal(mapping.ratioIdx);
  if (!ratio && coffeeAmount > 0 && totalWater > 0) {
    ratio = `1:${(totalWater / coffeeAmount).toFixed(1)}`;
  }

  const finishTime = getVal(mapping.finishTimeIdx, '2:30');

  // Rating (1-5)
  let rawRating = getVal(mapping.ratingIdx);
  let rating = 3;
  if (rawRating.includes('★') || rawRating.includes('☆')) {
    rating = (rawRating.match(/★/g) || []).length || 3;
  } else {
    const rNum = parseInt(rawRating.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(rNum) && rNum >= 1 && rNum <= 5) rating = rNum;
  }

  const acidity = Math.min(5, Math.max(1, Math.round(getNum(mapping.acidityIdx, 3))));
  const sweetness = Math.min(5, Math.max(1, Math.round(getNum(mapping.sweetnessIdx, 3))));
  const bitterness = Math.min(5, Math.max(1, Math.round(getNum(mapping.bitternessIdx, 3))));

  const notes = getVal(mapping.notesIdx, '');

  return {
    id: `recipe_${Date.now()}_${existingCount}_${Math.random().toString(36).substring(2, 7)}`,
    brewDate,
    beanName,
    shop,
    roastLevel,
    roastDate,
    clicks,
    coffeeAmount,
    waterTemp,
    dripper,
    totalWater,
    ratio: ratio || '1:16.0',
    pours,
    finishTime,
    rating,
    isFavorite: rating === 5,
    taste: {
      acidity,
      sweetness,
      bitterness,
    },
    notes,
    createdAt: Date.now() - existingCount * 1000,
    updatedAt: Date.now(),
  };
}

// Generate CSV export string
export function exportRecipesToCSV(recipes: CoffeeRecipe[]): string {
  const headers = [
    '抽出日',
    '豆の品名',
    '購入店',
    '焙煎度',
    '焙煎日',
    'クリック数',
    '粉量(g)',
    '湯温(℃)',
    'ドリッパー',
    '合計湯量(g)',
    '抽出比率',
    '1投目時間/湯量',
    '2投目時間/湯量',
    '3投目時間/湯量',
    '4投目時間/湯量',
    '5投目時間/湯量',
    '落切時間',
    '評価(1-5)',
    '酸味(1-5)',
    '甘み(1-5)',
    '苦み(1-5)',
    '備考',
    'お気に入り',
  ];

  const escapeCell = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = recipes.map((r) => {
    const p1 = `${r.pours[0]?.time || ''}/${r.pours[0]?.water || 0}g`;
    const p2 = `${r.pours[1]?.time || ''}/${r.pours[1]?.water || 0}g`;
    const p3 = `${r.pours[2]?.time || ''}/${r.pours[2]?.water || 0}g`;
    const p4 = `${r.pours[3]?.time || ''}/${r.pours[3]?.water || 0}g`;
    const p5 = `${r.pours[4]?.time || ''}/${r.pours[4]?.water || 0}g`;

    return [
      escapeCell(r.brewDate),
      escapeCell(r.beanName),
      escapeCell(r.shop),
      escapeCell(r.roastLevel),
      escapeCell(r.roastDate),
      escapeCell(r.clicks),
      escapeCell(r.coffeeAmount),
      escapeCell(r.waterTemp),
      escapeCell(r.dripper),
      escapeCell(r.totalWater),
      escapeCell(r.ratio),
      escapeCell(p1),
      escapeCell(p2),
      escapeCell(p3),
      escapeCell(p4),
      escapeCell(p5),
      escapeCell(r.finishTime),
      escapeCell(r.rating),
      escapeCell(r.taste.acidity),
      escapeCell(r.taste.sweetness),
      escapeCell(r.taste.bitterness),
      escapeCell(r.notes),
      escapeCell(r.isFavorite ? 'TRUE' : 'FALSE'),
    ].join(',');
  });

  return [headers.map(escapeCell).join(','), ...rows].join('\n');
}

export function getSampleSpreadsheetTSV(): string {
  return [
    [
      '抽出日',
      '豆の品名',
      '購入店',
      '焙煎度',
      '焙煎日',
      'クリック数',
      '粉量(g)',
      '湯温(℃)',
      'ドリッパー',
      '合計湯量',
      '抽出比率',
      '1投目時間/湯量',
      '2投目時間/湯量',
      '3投目時間/湯量',
      '4投目時間/湯量',
      '5投目時間/湯量',
      '落切時間',
      '評価',
      '酸味',
      '甘み',
      '苦み',
      '備考',
    ].join('\t'),
    [
      '2026-09-07',
      'エチオピア イルガチェフェ G1',
      '豆ラボ',
      '浅煎り',
      '2026-09-01',
      '18',
      '15.0',
      '92',
      'ハリオ V60',
      '240',
      '1:16.0',
      '0:00/40g',
      '0:45/60g',
      '1:15/50g',
      '1:45/50g',
      '2:15/40g',
      '02:40',
      '5',
      '4',
      '5',
      '2',
      '華やかなジャスミンの香りと上品な甘みが抜群',
    ].join('\t'),
    [
      '2026-09-06',
      'コロンビア ピンクブルボン',
      '豆ラボ',
      '中浅煎り',
      '2026-08-30',
      '19',
      '16.0',
      '90',
      'ハリオ V60',
      '250',
      '1:15.6',
      '0:00/45g',
      '0:40/65g',
      '1:10/50g',
      '1:40/50g',
      '2:10/40g',
      '02:35',
      '4',
      '3',
      '4',
      '2',
      'ピーチのような果実感で後味がとても綺麗',
    ].join('\t'),
    [
      '2026-09-04',
      'ケニア キアンブ AA',
      '豆ラボ',
      '中煎り',
      '2026-08-26',
      '18',
      '15.0',
      '89',
      'ハリオ V60',
      '240',
      '1:16.0',
      '0:00/40g',
      '0:45/60g',
      '1:15/50g',
      '1:45/50g',
      '2:15/40g',
      '02:45',
      '5',
      '4',
      '4',
      '3',
      'カシスのようなジューシーな酸としっかりしたコク',
    ].join('\t'),
  ].join('\n');
}
