/**
 * Date and Aging calculation utilities
 */

export function calculateAgingDays(roastDateStr: string, brewDateStr: string): number | null {
  if (!roastDateStr || !brewDateStr) return null;
  const roast = new Date(roastDateStr);
  const brew = new Date(brewDateStr);

  if (isNaN(roast.getTime()) || isNaN(brew.getTime())) return null;

  // Set to midnight UTC to compare full calendar days
  const utcRoast = Date.UTC(roast.getFullYear(), roast.getMonth(), roast.getDate());
  const utcBrew = Date.UTC(brew.getFullYear(), brew.getMonth(), brew.getDate());

  const diffMs = utcBrew - utcRoast;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatJapaneseDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[0]}年${parseInt(parts[1], 10)}月${parseInt(parts[2], 10)}日`;
  }
  return dateStr;
}

export function getAgingBadgeInfo(agingDays: number | null): { text: string; color: string; desc: string } {
  if (agingDays === null || isNaN(agingDays)) {
    return { text: '未設定', color: 'bg-stone-100 text-stone-600', desc: '焙煎日未設定' };
  }

  if (agingDays < 0) {
    return { text: `抽出日先行 (${agingDays}日)`, color: 'bg-red-100 text-red-700', desc: '焙煎日より前の日付です' };
  }
  if (agingDays === 0) {
    return { text: '焙煎当日 (0日目)', color: 'bg-amber-100 text-amber-800', desc: 'ガスが多めの状態' };
  }
  if (agingDays <= 3) {
    return { text: `焙煎後 ${agingDays}日目`, color: 'bg-orange-100 text-orange-800', desc: 'フレッシュ・少しガス抜き推奨' };
  }
  if (agingDays <= 14) {
    return { text: `エイジング ${agingDays}日目 (飲み頃✨)`, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: '香り立ちとバランスが最高のピーク時期' };
  }
  if (agingDays <= 30) {
    return { text: `エイジング ${agingDays}日目`, color: 'bg-blue-100 text-blue-800', desc: '落ち着いたまろやかな味わい' };
  }
  return { text: `エイジング ${agingDays}日目`, color: 'bg-stone-200 text-stone-700', desc: '長期経過' };
}
