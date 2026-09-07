import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeFormModal } from './components/RecipeFormModal';
import { SpreadsheetImportModal } from './components/SpreadsheetImportModal';
import { AndroidGithubGuideModal } from './components/AndroidGithubGuideModal';
import { CoffeeRecipe, FilterMode, SortOrder } from './types';
import { loadStoredRecipes, saveStoredRecipes, getUniqueBeanNames } from './utils/storage';
import { calculateAgingDays } from './utils/dateUtils';
import { exportRecipesToCSV } from './utils/spreadsheetUtils';
import { Coffee, Plus, Sparkles, Filter, FileSpreadsheet, Heart, Star, Smartphone } from 'lucide-react';

export default function App() {
  const [recipes, setRecipes] = useState<CoffeeRecipe[]>(() => loadStoredRecipes());

  // Filter & Search states
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBean, setSelectedBean] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('brewDateDesc');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<CoffeeRecipe | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Success toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Recipe modifications with persistence
  const handleSaveRecipe = (recipeToSave: CoffeeRecipe) => {
    let updated: CoffeeRecipe[];
    const exists = recipes.some((r) => r.id === recipeToSave.id);
    if (exists) {
      updated = recipes.map((r) => (r.id === recipeToSave.id ? recipeToSave : r));
      showToast('レシピを更新しました');
    } else {
      updated = [recipeToSave, ...recipes];
      showToast('新しいレシピを記録しました');
    }
    setRecipes(updated);
    saveStoredRecipes(updated);
  };

  const handleDuplicateRecipe = (sourceRecipe: CoffeeRecipe) => {
    const duplicated: CoffeeRecipe = {
      ...sourceRecipe,
      id: `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setEditingRecipe(duplicated);
    setIsFormOpen(true);
  };

  const handleDeleteRecipe = (id: string) => {
    if (window.confirm('このレシピを削除してもよろしいですか？')) {
      const updated = recipes.filter((r) => r.id !== id);
      setRecipes(updated);
      saveStoredRecipes(updated);
      showToast('レシピを削除しました');
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = recipes.map((r) =>
      r.id === id ? { ...r, isFavorite: !r.isFavorite, updatedAt: Date.now() } : r
    );
    setRecipes(updated);
    saveStoredRecipes(updated);
  };

  const handleImportRecipes = (imported: CoffeeRecipe[], replaceAll: boolean) => {
    let updated: CoffeeRecipe[];
    if (replaceAll) {
      updated = imported;
    } else {
      updated = [...imported, ...recipes];
    }
    setRecipes(updated);
    saveStoredRecipes(updated);
    showToast(`${imported.length} 件のレシピを取り込みました！`);
  };

  const handleExportCSV = () => {
    const csvContent = exportRecipesToCSV(recipes);
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `coffee_recipes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSVファイルを書き出しました');
  };

  // Unique bean names
  const availableBeans = useMemo(() => getUniqueBeanNames(recipes), [recipes]);

  // Counts
  const totalCount = recipes.length;
  const star5Count = useMemo(() => recipes.filter((r) => r.rating === 5).length, [recipes]);
  const favCount = useMemo(() => recipes.filter((r) => r.isFavorite).length, [recipes]);

  // Filtered and sorted recipes
  const filteredRecipes = useMemo(() => {
    let list = [...recipes];

    // 1. Filter mode
    if (filterMode === 'rating5') {
      list = list.filter((r) => r.rating === 5);
    } else if (filterMode === 'favorite') {
      list = list.filter((r) => r.isFavorite);
    }

    // 2. Bean filter
    if (selectedBean) {
      list = list.filter((r) => r.beanName === selectedBean);
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.beanName?.toLowerCase().includes(q) ||
          r.shop?.toLowerCase().includes(q) ||
          r.dripper?.toLowerCase().includes(q) ||
          r.roastLevel?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q)
      );
    }

    // 4. Sort
    list.sort((a, b) => {
      if (sortOrder === 'brewDateDesc') {
        return (b.brewDate || '').localeCompare(a.brewDate || '') || (b.createdAt || 0) - (a.createdAt || 0);
      }
      if (sortOrder === 'brewDateAsc') {
        return (a.brewDate || '').localeCompare(b.brewDate || '') || (a.createdAt || 0) - (b.createdAt || 0);
      }
      if (sortOrder === 'ratingDesc') {
        return (b.rating || 0) - (a.rating || 0) || (b.brewDate || '').localeCompare(a.brewDate || '');
      }
      if (sortOrder === 'agingDaysDesc') {
        const agingA = calculateAgingDays(a.roastDate, a.brewDate) ?? -999;
        const agingB = calculateAgingDays(b.roastDate, b.brewDate) ?? -999;
        return agingB - agingA;
      }
      return 0;
    });

    return list;
  }, [recipes, filterMode, selectedBean, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-800 pb-20">
      {/* Header / Navbar */}
      <Navbar
        onNewRecipe={() => {
          setEditingRecipe(null);
          setIsFormOpen(true);
        }}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        recipeCount={totalCount}
        star5Count={star5Count}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        {/* Filter & Controls Bar */}
        <FilterBar
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedBean={selectedBean}
          setSelectedBean={setSelectedBean}
          availableBeans={availableBeans}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          totalCount={totalCount}
          star5Count={star5Count}
          favCount={favCount}
          onExportCSV={handleExportCSV}
        />

        {/* Current Active Filter Indicator (if any) */}
        {(filterMode !== 'all' || selectedBean || searchQuery) && (
          <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200/80 rounded-xl px-4 py-2 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber-700" />
              <span>
                絞り込み中:
                {filterMode === 'rating5' && '「★5 のみ」'}
                {filterMode === 'favorite' && '「お気に入り」'}
                {selectedBean && `「豆: ${selectedBean}」`}
                {searchQuery && `「検索: ${searchQuery}」`}
                （該当 {filteredRecipes.length} 件）
              </span>
            </div>
            <button
              onClick={() => {
                setFilterMode('all');
                setSelectedBean('');
                setSearchQuery('');
              }}
              className="text-amber-800 hover:text-amber-950 font-semibold underline text-xs"
            >
              条件を解除
            </button>
          </div>
        )}

        {/* Recipe Cards Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={(r) => {
                  setEditingRecipe(r);
                  setIsFormOpen(true);
                }}
                onDuplicate={handleDuplicateRecipe}
                onDelete={handleDeleteRecipe}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-stone-200 p-10 sm:p-14 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-800 mb-4 shadow-inner">
              <Coffee className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-stone-900 mb-1">
              該当するレシピがありません
            </h3>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              {filterMode !== 'all' || selectedBean || searchQuery
                ? '絞り込み条件や検索キーワードを変更してみてください。'
                : '日々のコーヒー抽出のこだわりを記録してみましょう。'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => {
                  setEditingRecipe(null);
                  setIsFormOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 font-bold text-stone-950 text-xs rounded-xl shadow transition"
              >
                新規レシピを記録
              </button>
              <button
                onClick={() => setIsImportOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 font-medium text-stone-700 text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>スプレッドシート取込</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile Thumb (Easy Add Recipe) */}
      <button
        onClick={() => {
          setEditingRecipe(null);
          setIsFormOpen(true);
        }}
        className="fixed bottom-5 right-5 z-20 sm:hidden w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xl flex items-center justify-center transition active:scale-95 border-2 border-amber-300"
        title="新規レシピを記録"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Toast message popup */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-stone-100 px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <RecipeFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecipe(null);
        }}
        onSave={handleSaveRecipe}
        initialRecipe={editingRecipe}
        existingRecipes={recipes}
      />

      <SpreadsheetImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportRecipes}
        existingCount={recipes.length}
      />

      <AndroidGithubGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
