import React, { useState } from 'react';
import { Coffee, Plus, FileSpreadsheet, Sparkles, Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  onNewRecipe: () => void;
  onOpenImport: () => void;
  onOpenGuide: () => void;
  recipeCount: number;
  star5Count: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewRecipe,
  onOpenImport,
  onOpenGuide,
  recipeCount,
  star5Count,
}) => {
  const { isInstallable, isInstalled, install, isIOS, isAndroid } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 text-stone-100 backdrop-blur-md border-b border-stone-800 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shadow-inner border border-amber-500/30">
            <Coffee className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-amber-50">
                コーヒーレシピノート
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium bg-amber-950/80 text-amber-300 rounded border border-amber-800/60">
                Android & PWA対応
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              全 {recipeCount} 件 (★5: {star5Count} 件)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Spreadsheet Import Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
            title="GoogleスプレッドシートやCSVからインポート"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">スプレッドシート</span>
            <span>取込</span>
          </button>

          {/* Android / GitHub Guide Button */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
            title="Androidアプリ化 & GitHub連携ガイド"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">スマホ化</span>
          </button>

          {/* In-App PWA Install Button */}
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg bg-amber-700 hover:bg-amber-600 text-white shadow transition animate-pulse"
              title="Androidスマホにアプリをインストール"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">アプリ</span>
              <span>追加</span>
            </button>
          )}

          {isIOS && !isInstalled && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-stone-400 hover:text-stone-200"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iOS</span>
            </button>
          )}

          {/* New Recipe Button */}
          <button
            onClick={onNewRecipe}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>記録する</span>
          </button>
        </div>
      </div>

      {/* iOS Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-stone-900 border border-stone-700 p-6 text-stone-100 shadow-xl">
            <h3 className="text-base font-bold text-amber-400">iPhone / iPad でのアプリ化</h3>
            <p className="mt-2 text-xs text-stone-300 leading-relaxed">
              Safariの下部メニューにある「共有ボタン」をタップし、一覧から「<strong>ホーム画面に追加</strong>」を選ぶと、スマホのネイティブアプリアイコンとして登録されます。
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full rounded-lg bg-stone-800 hover:bg-stone-700 py-2 text-xs font-semibold text-stone-200"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
