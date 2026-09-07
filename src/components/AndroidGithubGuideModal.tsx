import React from 'react';
import { X, Smartphone, Github, CheckCircle2, ArrowRight, ExternalLink, Download, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidGithubGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGithubGuideModal: React.FC<AndroidGithubGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                GitHub連携 & Androidアプリ化ガイド
              </h2>
              <p className="text-xs text-stone-500">
                GitHubでコードを管理し、Androidスマホで使えるようにする手順
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Direct Install prompt if available */}
          {isInstallable && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>この端末に今すぐインストールできます</span>
                </span>
                <p className="text-xs text-amber-800 mt-0.5">
                  タップするだけでAndroidホーム画面にアプリアイコンが追加されます。
                </p>
              </div>
              <button
                onClick={install}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition active:scale-95 shrink-0"
              >
                インストール
              </button>
            </div>
          )}

          {/* Section 1: Android PWA (Fastest, zero-install APK needed) */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h3 className="font-bold text-stone-900 text-sm">
                Androidスマホで即座にアプリとして使う（PWA方式）
              </h3>
            </div>
            <p className="text-stone-600 leading-relaxed text-xs">
              当アプリはPWA（Progressive Web App）に対応しており、Google Playストアを経由せずに、Webから直接ネイティブアプリとしてインストール可能です。
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-700 text-xs bg-white p-3 rounded-xl border border-stone-200/80">
              <li>Androidスマホの<strong>Chromeブラウザ</strong>でこのアプリのURLを開きます</li>
              <li>画面右上のメニュー「<strong>︙</strong>」をタップします</li>
              <li>一覧にある「<strong>アプリをインストール</strong>」または「<strong>ホーム画面に追加</strong>」を選択します</li>
              <li>ホーム画面にコーヒーアイコンのアプリが作成され、全画面で動作します</li>
            </ol>
          </div>

          {/* Section 2: GitHub Repository Connection */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                <Github className="w-4 h-4 text-stone-900" />
                <span>GitHubでソースコードを管理する</span>
              </h3>
            </div>
            <p className="text-stone-600 leading-relaxed text-xs">
              AI Studioで作成したこのコード一式は、GitHubのリポジトリへ直接エクスポートできます。
            </p>
            <div className="space-y-2 text-stone-700 text-xs bg-white p-3 rounded-xl border border-stone-200/80">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>AI Studioからのエクスポート:</strong>
                  <br />
                  AI Studio画面右上のメニュー（または設定）から「<strong>Export to GitHub</strong>」を選択すると、ご自身のGitHubアカウントにリポジトリが自動作成されます。
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>ZIPダウンロード &amp; 手動プッシュ:</strong>
                  <br />
                  プロジェクトをZIPでダウンロードし、ローカルで <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-900">git init &amp;&amp; git push</code> することも可能です。
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Native Android APK packaging (Capacitor / TWA) */}
          <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h3 className="font-bold text-stone-900 text-sm">
                Google Play配布用 APK / AAB パッケージを作成したい場合
              </h3>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed">
              Google Playストアで配布するネイティブAndroidアプリ（.apk / .aab）をビルドする場合は、以下のツールを使うことでGitHub上のコードから数分でAndroid Studioプロジェクトに変換できます。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <div className="font-bold text-stone-900 mb-1">Capacitor (推奨)</div>
                <p className="text-stone-600 text-[11px]">
                  <code className="bg-stone-100 px-1 rounded">npm install @capacitor/core @capacitor/android</code>
                  を実行し、Android Studioで開くだけでネイティブアプリ化できます。
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <div className="font-bold text-stone-900 mb-1">PWABuilder (オンライン)</div>
                <p className="text-stone-600 text-[11px]">
                  公開URLを入力するだけで、Google Play用のAndroidパッケージ（APK）を自動生成してくれる無料サービスです。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
