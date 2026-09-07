import React, { useState } from 'react';
import { Star, Heart, Calendar, Store, Flame, Clock, Thermometer, Droplet, Scale, MoreVertical, Copy, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { CoffeeRecipe } from '../types';
import { calculateAgingDays, getAgingBadgeInfo, formatJapaneseDate } from '../utils/dateUtils';

interface RecipeCardProps {
  recipe: CoffeeRecipe;
  onEdit: (recipe: CoffeeRecipe) => void;
  onDuplicate: (recipe: CoffeeRecipe) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}) => {
  const [showPours, setShowPours] = useState(false);
  const agingDays = calculateAgingDays(recipe.roastDate, recipe.brewDate);
  const agingBadge = getAgingBadgeInfo(agingDays);

  const taste = recipe.taste || { acidity: 0, sweetness: 0, bitterness: 0 };
  const pours = Array.isArray(recipe.pours) ? recipe.pours : [];
  const rating = typeof recipe.rating === 'number' ? recipe.rating : 0;
  const isV60 = typeof recipe.dripper === 'string' && recipe.dripper.includes('V60');

  return (
    <div
      id={`recipe-card-${recipe.id}`}
      className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Header Bar: Bean Name & Favorite */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Badges: Shop, Roast level, Aging */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              {/* Shop Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  recipe.shop === '豆ラボ'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                <Store className="w-3 h-3 text-amber-700" />
                {recipe.shop || '購入店未設定'}
              </span>

              {/* Roast Level */}
              {recipe.roastLevel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                  <Flame className="w-3 h-3 text-amber-600" />
                  {recipe.roastLevel}
                </span>
              )}

              {/* Aging Days Badge */}
              {recipe.roastDate && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${agingBadge.color}`}
                  title={`焙煎日: ${recipe.roastDate} → 抽出日: ${recipe.brewDate}`}
                >
                  <Clock className="w-3 h-3" />
                  {agingBadge.text}
                </span>
              )}
            </div>

            {/* Bean Name */}
            <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-snug">
              {recipe.beanName}
            </h3>
          </div>

          {/* Favorite & Rating */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <button
              onClick={() => onToggleFavorite(recipe.id)}
              className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
              title={recipe.isFavorite ? 'お気に入り解除' : 'お気に入りに追加'}
            >
              <Heart
                className={`w-5 h-5 transition ${
                  recipe.isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-stone-300'
                }`}
              />
            </button>

            {/* Rating Stars */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Date Row */}
        <div className="mt-2 flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            抽出: {formatJapaneseDate(recipe.brewDate || '')}
          </span>
          {recipe.roastDate && (
            <span className="text-[11px] text-stone-400">
              (焙煎: {formatJapaneseDate(recipe.roastDate || '')})
            </span>
          )}
        </div>
      </div>

      {/* Main Parameters Grid */}
      <div className="px-4 sm:px-5 py-3 bg-stone-50/70 border-y border-stone-200/70 grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
        {/* Dripper */}
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-medium">ドリッパー</span>
          <span
            className={`font-semibold truncate ${
              isV60 ? 'text-amber-900' : 'text-stone-800'
            }`}
          >
            {recipe.dripper || '—'}
          </span>
        </div>

        {/* Coffee Dose */}
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-medium">粉量 / クリック</span>
          <span className="font-semibold text-stone-800">
            {recipe.coffeeAmount || 0}g / {recipe.clicks || '—'}
          </span>
        </div>

        {/* Total Water */}
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-medium">合計湯量</span>
          <span className="font-semibold text-stone-800">{recipe.totalWater || 0}g</span>
        </div>

        {/* Temp */}
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-medium">湯温</span>
          <span className="font-semibold text-stone-800">{recipe.waterTemp || '—'}℃</span>
        </div>

        {/* Ratio */}
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-medium">抽出比率</span>
          <span className="font-semibold text-stone-800">{recipe.ratio || '—'}</span>
        </div>

        {/* Finish Time */}
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-medium">落切時間</span>
          <span className="font-semibold text-amber-800">{recipe.finishTime || '—'}</span>
        </div>
      </div>

      {/* Pour Steps Details (Expandable or Quick View) */}
      <div className="px-4 sm:px-5 py-2.5">
        <button
          onClick={() => setShowPours(!showPours)}
          className="w-full flex items-center justify-between text-xs font-medium text-stone-600 hover:text-stone-900 py-1"
        >
          <span className="flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-amber-600" />
            <span>注湯ステップ (1〜5投目)</span>
            <span className="text-[11px] text-stone-400">
              合計 {pours.reduce((sum, p) => sum + (p.water || 0), 0)}g
            </span>
          </span>
          {showPours ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Pour Step Chips */}
        <div className="mt-1.5 grid grid-cols-5 gap-1 text-[11px]">
          {pours.map((step, idx) => (
            <div
              key={idx}
              className={`p-1.5 rounded-lg border text-center ${
                step.water > 0
                  ? 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                  : 'bg-stone-50 border-stone-200 text-stone-400'
              }`}
            >
              <div className="font-semibold text-[10px] text-stone-500">{idx + 1}投目</div>
              <div className="font-bold text-xs">{step.water || 0}g</div>
              <div className="text-[10px] text-stone-500">{step.time || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Taste Profile Bars (Acidity, Sweetness, Bitterness) */}
      <div className="px-4 sm:px-5 py-2.5 bg-stone-50/40 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4 text-xs font-medium text-stone-700">
          <span className="text-stone-400 text-[11px]">味わい:</span>
          {/* Acidity */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-500">酸味</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-2.5 h-2.5 rounded-full ${
                    lvl <= (taste.acidity || 0) ? 'bg-amber-500' : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sweetness */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-500">甘み</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-2.5 h-2.5 rounded-full ${
                    lvl <= (taste.sweetness || 0) ? 'bg-orange-500' : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bitterness */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-stone-500">苦み</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-2.5 h-2.5 rounded-full ${
                    lvl <= (taste.bitterness || 0) ? 'bg-stone-700' : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notes / Remarks (if present) */}
      {recipe.notes && (
        <div className="px-4 sm:px-5 py-2 text-xs text-stone-600 bg-amber-50/20 border-t border-stone-100">
          <p className="line-clamp-2 italic">“{recipe.notes}”</p>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div className="mt-auto px-4 sm:px-5 py-2.5 border-t border-stone-100 flex items-center justify-end gap-1.5">
        <button
          onClick={() => onDuplicate(recipe)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
          title="このレシピを複製して新しい抽出を記録"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>複製</span>
        </button>
        <button
          onClick={() => onEdit(recipe)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50 rounded-lg transition"
          title="編集"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>編集</span>
        </button>
        <button
          onClick={() => onDelete(recipe.id)}
          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="削除"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
