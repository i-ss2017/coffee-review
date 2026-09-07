import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, Check, AlertCircle, Copy, Download, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { CoffeeRecipe } from '../types';
import { parseDelimitedText, detectColumnMapping, convertRowToRecipe, getSampleSpreadsheetTSV } from '../utils/spreadsheetUtils';

interface SpreadsheetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (recipes: CoffeeRecipe[], replaceAll: boolean) => void;
  existingCount: number;
}

export const SpreadsheetImportModal: React.FC<SpreadsheetImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  existingCount,
}) => {
  const [inputText, setInputText] = useState('');
  const [replaceAll, setReplaceAll] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<CoffeeRecipe[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setErrorMsg(null);
    if (!text.trim()) {
      setParsedPreview([]);
      setHasParsed(false);
      return;
    }

    try {
      const rows = parseDelimitedText(text);
      if (rows.length === 0) {
        setErrorMsg('データが検出されませんでした。内容をご確認ください。');
        setParsedPreview([]);
        setHasParsed(true);
        return;
      }

      // Check if first row is header
      const headers = rows[0];
      const mapping = detectColumnMapping(headers);

      // Determine if the first row is actually a header or data
      const isFirstRowHeader =
        mapping.beanNameIdx !== -1 ||
        mapping.brewDateIdx !== -1 ||
        mapping.shopIdx !== -1 ||
        mapping.dripperIdx !== -1;

      const dataRows = isFirstRowHeader ? rows.slice(1) : rows;

      if (dataRows.length === 0) {
        setErrorMsg('見出し行しか検出されませんでした。データ行を含めてコピーしてください。');
        setParsedPreview([]);
        setHasParsed(true);
        return;
      }

      const generatedRecipes: CoffeeRecipe[] = dataRows.map((r, i) =>
        convertRowToRecipe(r, mapping, existingCount + i)
      );

      setParsedPreview(generatedRecipes);
      setHasParsed(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('解析中にエラーが発生しました。区切り文字（カンマまたはタブ）をご確認ください。');
      setParsedPreview([]);
      setHasParsed(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setInputText(content);
        handleParse(content);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleLoadSample = () => {
    const sample = getSampleSpreadsheetTSV();
    setInputText(sample);
    handleParse(sample);
  };

  const handleCopySample = () => {
    const sample = getSampleSpreadsheetTSV();
    navigator.clipboard.writeText(sample);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    onImport(parsedPreview, replaceAll);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                スプレッドシートからインポート
              </h2>
              <p className="text-xs text-stone-500">
                GoogleスプレッドシートやExcelのセルをコピー＆ペースト、またはCSVファイルを読み込みます
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Quick instructions & Sample Helper */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>かんたんインポート手順</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySample}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-medium hover:bg-emerald-200 transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSample ? 'コピー完了！' : '見本形式をコピー'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-medium hover:bg-emerald-100/50 transition"
                >
                  見本データを流し込む
                </button>
              </div>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Googleスプレッドシートで記録している範囲（見出し行 + データ行）を選択して「<strong>コピー (Ctrl+C / ⌘+C)</strong>」し、下の枠に「<strong>貼り付け (Ctrl+V / ⌘+V)</strong>」するだけで自動解析されます。
            </p>
          </div>

          {/* Paste or Upload Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-stone-700 text-xs">
                貼り付けエリア (TSV / CSV)
              </label>

              {/* CSV file select */}
              <label className="cursor-pointer text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>または CSVファイルを選択</span>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleParse(e.target.value);
              }}
              placeholder={`スプレッドシートのセルをコピーしてここに貼り付けてください。\n\n例:\n抽出日\t豆の品名\t購入店\t焙煎度\t焙煎日\tクリック数\t粉量(g)\t湯温(℃)\tドリッパー\t合計湯量\t評価\n2026-09-07\tエチオピア イルガチェフェ\t豆ラボ\t浅煎り\t2026-09-01\t18\t15\t92\tハリオ V60\t240\t5`}
              className="w-full p-3 font-mono text-xs bg-stone-50 focus:bg-white rounded-xl border border-stone-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview of parsed recipes */}
          {hasParsed && parsedPreview.length > 0 && (
            <div className="space-y-2 border-t border-stone-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>検出されたレシピ: {parsedPreview.length} 件</span>
                </span>
                <span className="text-[11px] text-stone-500">
                  ※以下の内容で登録されます
                </span>
              </div>

              {/* Preview table */}
              <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xl bg-stone-50/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100 text-stone-600 sticky top-0 border-b border-stone-200">
                    <tr>
                      <th className="py-1.5 px-2.5">抽出日</th>
                      <th className="py-1.5 px-2.5">豆の品名</th>
                      <th className="py-1.5 px-2.5">購入店</th>
                      <th className="py-1.5 px-2.5">焙煎度</th>
                      <th className="py-1.5 px-2.5">器具</th>
                      <th className="py-1.5 px-2.5">粉 / 湯</th>
                      <th className="py-1.5 px-2.5">評価</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {parsedPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white">
                        <td className="py-1.5 px-2.5 text-stone-600">{item.brewDate}</td>
                        <td className="py-1.5 px-2.5 font-semibold text-stone-900">
                          {item.beanName}
                        </td>
                        <td className="py-1.5 px-2.5 text-stone-600">{item.shop}</td>
                        <td className="py-1.5 px-2.5 text-stone-600">{item.roastLevel}</td>
                        <td className="py-1.5 px-2.5 text-stone-600">{item.dripper}</td>
                        <td className="py-1.5 px-2.5 text-stone-600">
                          {item.coffeeAmount}g / {item.totalWater}g
                        </td>
                        <td className="py-1.5 px-2.5 font-bold text-amber-600">★{item.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Options (Append vs Replace) */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={!replaceAll}
                    onChange={() => setReplaceAll(false)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    既存のデータ ({existingCount}件) に<strong>追加する</strong>
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    checked={replaceAll}
                    onChange={() => setReplaceAll(true)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-red-700">既存のデータをすべて置き換える</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3 bg-stone-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-medium text-xs transition"
          >
            キャンセル
          </button>
          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={handleConfirmImport}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition ${
              parsedPreview.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{parsedPreview.length} 件を取り込む</span>
          </button>
        </div>
      </div>
    </div>
  );
};
