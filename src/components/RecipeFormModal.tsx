import React, { useState, useEffect, useId } from 'react';
import { X, Star, Heart, Clock, Sparkles, Store, Flame, Droplet, Coffee, Timer, Info, Check } from 'lucide-react';
import { CoffeeRecipe, PourStep, TasteProfile } from '../types';
import { calculateAgingDays, getAgingBadgeInfo, getTodayDateString } from '../utils/dateUtils';
import { findPreviousBeanInfo, getUniqueBeanNames, getUniqueShops, getUniqueDrippers } from '../utils/storage';
import { BrewTimerModal } from './BrewTimerModal';

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: CoffeeRecipe) => void;
  initialRecipe?: CoffeeRecipe | null;
  existingRecipes: CoffeeRecipe[];
}

const COMMON_ROAST_LEVELS = ['浅煎り', '中浅煎り', '中煎り', '中深煎り', '深煎り'];
const COMMON_DRIPPERS = ['ハリオ V60', 'カリタ ウェーブ', 'ORIGAMI', 'コーノ (KONO)', 'エアロプレス'];
const COMMON_SHOPS = ['豆ラボ', 'カルディ', '丸山珈琲', '堀口珈琲', '自家焙煎店'];

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecipe,
  existingRecipes,
}) => {
  const beanDatalistId = useId();

  // Form states
  const [brewDate, setBrewDate] = useState(getTodayDateString());
  const [beanName, setBeanName] = useState('');
  const [shop, setShop] = useState('豆ラボ');
  const [roastLevel, setRoastLevel] = useState('浅煎り');
  const [roastDate, setRoastDate] = useState('');
  const [clicks, setClicks] = useState('18');
  const [coffeeAmount, setCoffeeAmount] = useState(15.0);
  const [waterTemp, setWaterTemp] = useState(90);
  const [dripper, setDripper] = useState('ハリオ V60');
  const [totalWater, setTotalWater] = useState(240);
  const [ratio, setRatio] = useState('1:16.0');
  const [finishTime, setFinishTime] = useState('02:40');
  const [rating, setRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState(true);
  const [taste, setTaste] = useState<TasteProfile>({ acidity: 4, sweetness: 4, bitterness: 2 });
  const [notes, setNotes] = useState('');

  const [pours, setPours] = useState<PourStep[]>([
    { time: '0:00', water: 40 },
    { time: '0:45', water: 60 },
    { time: '1:15', water: 50 },
    { time: '1:45', water: 50 },
    { time: '2:15', water: 40 },
  ]);

  // Notice when auto-filled from past bean
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (initialRecipe) {
      setBrewDate(initialRecipe.brewDate || getTodayDateString());
      setBeanName(initialRecipe.beanName || '');
      setShop(initialRecipe.shop || '豆ラボ');
      setRoastLevel(initialRecipe.roastLevel || '浅煎り');
      setRoastDate(initialRecipe.roastDate || '');
      setClicks(initialRecipe.clicks || '18');
      setCoffeeAmount(initialRecipe.coffeeAmount || 15);
      setWaterTemp(initialRecipe.waterTemp || 90);
      setDripper(initialRecipe.dripper || 'ハリオ V60');
      setTotalWater(initialRecipe.totalWater || 240);
      setRatio(initialRecipe.ratio || '1:16.0');
      setFinishTime(initialRecipe.finishTime || '02:40');
      setRating(initialRecipe.rating || 4);
      setIsFavorite(initialRecipe.isFavorite || false);
      setTaste(initialRecipe.taste || { acidity: 3, sweetness: 3, bitterness: 3 });
      setNotes(initialRecipe.notes || '');
      setPours(
        initialRecipe.pours && initialRecipe.pours.length === 5
          ? initialRecipe.pours
          : [
              { time: '0:00', water: 40 },
              { time: '0:45', water: 60 },
              { time: '1:15', water: 50 },
              { time: '1:45', water: 50 },
              { time: '2:15', water: 40 },
            ]
      );
      setAutoFilledNotice(null);
    } else {
      // Default new recipe
      const today = getTodayDateString();
      setBrewDate(today);
      setBeanName('');
      setShop('豆ラボ');
      setRoastLevel('浅煎り');
      // Default roast date ~7 days before today
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setRoastDate(`${d.getFullYear()}-${m}-${day}`);

      setClicks('18');
      setCoffeeAmount(15.0);
      setWaterTemp(90);
      setDripper('ハリオ V60');
      setTotalWater(240);
      setRatio('1:16.0');
      setFinishTime('02:40');
      setRating(5);
      setIsFavorite(true);
      setTaste({ acidity: 4, sweetness: 4, bitterness: 2 });
      setNotes('');
      setPours([
        { time: '0:00', water: 40 },
        { time: '0:45', water: 60 },
        { time: '1:15', water: 50 },
        { time: '1:45', water: 50 },
        { time: '2:15', water: 40 },
      ]);
      setAutoFilledNotice(null);
    }
  }, [isOpen, initialRecipe]);

  // Recalculate ratio when coffeeAmount or totalWater changes
  useEffect(() => {
    if (coffeeAmount > 0 && totalWater > 0) {
      const r = (totalWater / coffeeAmount).toFixed(1);
      setRatio(`1:${r}`);
    }
  }, [coffeeAmount, totalWater]);

  // Recalculate totalWater when pours change
  const handlePourChange = (index: number, field: 'time' | 'water', value: string | number) => {
    const updated = [...pours];
    if (field === 'water') {
      updated[index] = { ...updated[index], water: Number(value) || 0 };
      const sum = updated.reduce((acc, p) => acc + (p.water || 0), 0);
      setTotalWater(sum);
    } else {
      updated[index] = { ...updated[index], time: String(value) };
    }
    setPours(updated);
  };

  /**
   * Requirement: 豆の品名が同じであれば、購入店、焙煎度、焙煎日を事前入力して
   */
  const handleBeanNameChange = (name: string) => {
    setBeanName(name);

    if (!name || !name.trim()) {
      setAutoFilledNotice(null);
      return;
    }

    const previousInfo = findPreviousBeanInfo(name, existingRecipes);
    if (previousInfo) {
      if (previousInfo.shop) setShop(previousInfo.shop);
      if (previousInfo.roastLevel) setRoastLevel(previousInfo.roastLevel);
      if (previousInfo.roastDate) setRoastDate(previousInfo.roastDate);
      setAutoFilledNotice(
        `過去の同一銘柄から「購入店: ${previousInfo.shop}」「焙煎度: ${previousInfo.roastLevel}」「焙煎日: ${previousInfo.roastDate}」を自動入力しました`
      );
    } else {
      setAutoFilledNotice(null);
    }
  };

  // Aging calculation
  const agingDays = calculateAgingDays(roastDate, brewDate);
  const agingBadge = getAgingBadgeInfo(agingDays);

  const availableBeanNames = getUniqueBeanNames(existingRecipes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beanName.trim()) {
      alert('豆の品名を入力してください');
      return;
    }

    const recipeToSave: CoffeeRecipe = {
      id: initialRecipe?.id || `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      brewDate,
      beanName: beanName.trim(),
      shop: shop.trim() || '豆ラボ',
      roastLevel: roastLevel.trim() || '中煎り',
      roastDate,
      clicks: clicks.trim() || '18',
      coffeeAmount: Number(coffeeAmount) || 15,
      waterTemp: Number(waterTemp) || 90,
      dripper: dripper.trim() || 'ハリオ V60',
      totalWater: Number(totalWater) || 240,
      ratio: ratio.trim() || '1:16.0',
      pours,
      finishTime: finishTime.trim() || '02:40',
      rating,
      isFavorite,
      taste,
      notes: notes.trim(),
      createdAt: initialRecipe?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSave(recipeToSave);
    onClose();
  };

  const handleApplyTimer = (newPours: { time: string }[], newFinishTime: string) => {
    const updated = pours.map((p, i) => ({
      ...p,
      time: newPours[i]?.time || p.time,
    }));
    setPours(updated);
    if (newFinishTime) {
      setFinishTime(newFinishTime);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white text-stone-900 rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in">
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  {initialRecipe ? 'レシピの編集' : '新しいコーヒーレシピを記録'}
                </h2>
                <p className="text-[11px] text-stone-500">
                  豆の品名、エイジング、注湯ステップなどを細かく保存できます
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTimerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold border border-amber-300 transition"
                title="抽出タイマーを開く"
              >
                <Timer className="w-3.5 h-3.5 text-amber-700" />
                <span>抽出タイマー</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Scroll Body */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Auto-fill notification if matched */}
            {autoFilledNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-900 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-medium leading-tight">{autoFilledNotice}</span>
              </div>
            )}

            {/* Section 1: Bean & Shop & Dates */}
            <div className="space-y-3.5 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70">
              <div className="font-semibold text-stone-700 flex items-center gap-1.5 text-xs">
                <Coffee className="w-3.5 h-3.5 text-amber-700" />
                <span>豆情報 & 日付</span>
              </div>

              {/* Bean Name (with auto-complete and past detection) */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  豆の品名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list={beanDatalistId}
                  value={beanName}
                  onChange={(e) => handleBeanNameChange(e.target.value)}
                  placeholder="例: エチオピア イルガチェフェ G1, コロンビア など"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden font-medium text-stone-900"
                />
                <datalist id={beanDatalistId}>
                  {availableBeanNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <p className="mt-1 text-[11px] text-stone-500">
                  ※過去に記録した豆名を入力・選択すると、購入店・焙煎度・焙煎日が自動入力されます。
                </p>
              </div>

              {/* Shop (Quick "豆ラボ" + custom) */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  購入店
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setShop('豆ラボ')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                      shop === '豆ラボ'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    ★ 豆ラボ
                  </button>
                  {COMMON_SHOPS.filter((s) => s !== '豆ラボ').map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShop(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                        shop === s
                          ? 'bg-stone-800 text-white border-stone-800'
                          : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                  placeholder="購入店名を入力 (豆ラボ、他)"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden"
                />
              </div>

              {/* Roast Level */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">焙煎度</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COMMON_ROAST_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setRoastLevel(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                        roastLevel === lvl
                          ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={roastLevel}
                  onChange={(e) => setRoastLevel(e.target.value)}
                  placeholder="浅煎り、中煎り、深煎り、または自由記入"
                  className="w-full px-3 py-1.5 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden text-xs"
                />
              </div>

              {/* Dates & Aging Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Brew Date */}
                <div>
                  <label className="block font-medium text-stone-700 mb-1">抽出日</label>
                  <input
                    type="date"
                    value={brewDate}
                    onChange={(e) => setBrewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                {/* Roast Date */}
                <div>
                  <label className="block font-medium text-stone-700 mb-1">焙煎日</label>
                  <input
                    type="date"
                    value={roastDate}
                    onChange={(e) => setRoastDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Aging Dynamic Calculation Display */}
              <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="font-semibold text-stone-800">エイジングの経過日数:</span>
                    <span className="ml-2 font-bold text-amber-900 text-sm">
                      {agingDays !== null ? `${agingDays} 日` : '焙煎日を入力してください'}
                    </span>
                  </div>
                </div>
                {agingDays !== null && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${agingBadge.color}`}>
                    {agingBadge.text}
                  </span>
                )}
              </div>
            </div>

            {/* Section 2: Extraction Parameters (Dripper, Coffee Dose, Water, Ratio, Grind) */}
            <div className="space-y-3.5 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70">
              <div className="font-semibold text-stone-700 flex items-center gap-1.5 text-xs">
                <Flame className="w-3.5 h-3.5 text-amber-700" />
                <span>抽出パラメータ</span>
              </div>

              {/* Dripper (Quick "ハリオ V60" + custom) */}
              <div>
                <label className="block font-medium text-stone-700 mb-1">ドリッパー</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setDripper('ハリオ V60')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                      dripper === 'ハリオ V60'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    ★ ハリオ V60
                  </button>
                  {COMMON_DRIPPERS.filter((d) => d !== 'ハリオ V60').map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDripper(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                        dripper === d
                          ? 'bg-stone-800 text-white border-stone-800'
                          : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={dripper}
                  onChange={(e) => setDripper(e.target.value)}
                  placeholder="ドリッパー名を入力 (ハリオ V60、他)"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden"
                />
              </div>

              {/* Clicks, Coffee Dose, Temp */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">クリック数</label>
                  <input
                    type="text"
                    value={clicks}
                    onChange={(e) => setClicks(e.target.value)}
                    placeholder="例: 18"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">粉量 (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={coffeeAmount}
                    onChange={(e) => setCoffeeAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">湯温 (℃)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={waterTemp}
                    onChange={(e) => setWaterTemp(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden font-semibold"
                  />
                </div>
              </div>

              {/* Total Water & Ratio & Finish Time */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">合計湯量 (g/ml)</label>
                  <input
                    type="number"
                    step="1"
                    value={totalWater}
                    onChange={(e) => setTotalWater(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden font-bold text-amber-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">抽出比率</label>
                  <input
                    type="text"
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">落切時間</label>
                  <input
                    type="text"
                    value={finishTime}
                    onChange={(e) => setFinishTime(e.target.value)}
                    placeholder="例: 02:45"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: 5 Pour Steps (1投目〜5投目 時間/湯量) */}
            <div className="space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-stone-700 flex items-center gap-1.5 text-xs">
                  <Droplet className="w-3.5 h-3.5 text-amber-700" />
                  <span>注湯ステップ (1投目〜5投目 時間/湯量)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTimerOpen(true)}
                  className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>タイマーで測る</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {pours.map((step, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-stone-200 space-y-1.5">
                    <div className="font-bold text-[11px] text-stone-700 flex items-center justify-between">
                      <span>{idx + 1}投目 {idx === 0 && '(蒸らし)'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">時間</span>
                      <input
                        type="text"
                        value={step.time}
                        onChange={(e) => handlePourChange(idx, 'time', e.target.value)}
                        placeholder="0:00"
                        className="w-full px-2 py-1 text-xs bg-stone-50 rounded-lg border border-stone-200 outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">湯量 (g)</span>
                      <input
                        type="number"
                        step="1"
                        value={step.water}
                        onChange={(e) => handlePourChange(idx, 'water', e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-stone-50 rounded-lg border border-stone-200 outline-hidden font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
                <span>注湯合計: {pours.reduce((acc, p) => acc + (p.water || 0), 0)}g</span>
                <span className="text-stone-400">※ステップの湯量を変更すると合計湯量に自動反映されます</span>
              </div>
            </div>

            {/* Section 4: Rating, Favorites & Taste Profile */}
            <div className="space-y-3.5 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-stone-700 flex items-center gap-1.5 text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                  <span>評価 & 味わい (５段階)</span>
                </div>

                {/* Favorite Toggle */}
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
                    isFavorite
                      ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                      : 'bg-white border-stone-300 text-stone-500 hover:text-stone-700'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isFavorite ? 'お気に入り登録中' : 'お気に入りに追加'}</span>
                </button>
              </div>

              {/* 5-Star Rating */}
              <div className="flex items-center gap-3 py-1">
                <span className="font-medium text-stone-700">総合評価:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setRating(s);
                        if (s === 5) setIsFavorite(true);
                      }}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="font-bold text-sm text-stone-900 ml-2">★{rating}</span>
                {rating === 5 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-semibold">
                    最高レシピ！
                  </span>
                )}
              </div>

              {/* Taste: Acidity, Sweetness, Bitterness */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Acidity */}
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-stone-700">酸味</span>
                    <span className="font-bold text-amber-700">{taste.acidity} / 5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTaste({ ...taste, acidity: val })}
                        className={`flex-1 py-1 rounded-md font-bold text-[11px] border transition ${
                          taste.acidity === val
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sweetness */}
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-stone-700">甘み</span>
                    <span className="font-bold text-orange-700">{taste.sweetness} / 5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTaste({ ...taste, sweetness: val })}
                        className={`flex-1 py-1 rounded-md font-bold text-[11px] border transition ${
                          taste.sweetness === val
                            ? 'bg-orange-500 text-white border-orange-600'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bitterness */}
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-stone-700">苦み</span>
                    <span className="font-bold text-stone-800">{taste.bitterness} / 5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTaste({ ...taste, bitterness: val })}
                        className={`flex-1 py-1 rounded-md font-bold text-[11px] border transition ${
                          taste.bitterness === val
                            ? 'bg-stone-800 text-white border-stone-900'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Notes */}
            <div>
              <label className="block font-medium text-stone-700 mb-1">備考 / 感想メモ</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="挽き目や注ぎ方のコツ、フレーバーのニュアンス、次回調整したい点など自由に入力"
                className="w-full px-3 py-2 bg-stone-50 focus:bg-white rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
            </div>

            {/* Footer Form Action Buttons */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-stone-950 shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{initialRecipe ? '変更を保存' : 'レシピを保存する'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Brew Timer Modal */}
      <BrewTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onApplyTimes={handleApplyTimer}
        initialPours={pours}
      />
    </>
  );
};
