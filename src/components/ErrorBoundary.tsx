import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-xl max-w-md w-full text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto text-amber-800 mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-stone-900 mb-2">
              画面の読み込み中にエラーが発生しました
            </h2>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              ブラウザのキャッシュや一時データにより表示が中断された可能性があります。下のボタンから再読み込みをお試しください。
            </p>
            {this.state.error && (
              <div className="p-3 bg-stone-100 rounded-xl text-[11px] font-mono text-stone-700 text-left overflow-auto max-h-24 mb-6">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition"
              >
                再読み込み
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium text-xs rounded-xl transition"
              >
                データを初期化して再読込
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
