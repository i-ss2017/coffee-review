import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, X, Clock, Flame, Droplet } from 'lucide-react';
import { PourStep } from '../types';

interface BrewTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTimes: (pours: { time: string }[], finishTime: string) => void;
  initialPours?: PourStep[];
}

export const BrewTimerModal: React.FC<BrewTimerModalProps> = ({
  isOpen,
  onClose,
  onApplyTimes,
  initialPours,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [pourTimes, setPourTimes] = useState<string[]>(['', '', '', '', '']);
  const [finishTime, setFinishTime] = useState('');
  const [currentPourIdx, setCurrentPourIdx] = useState(0);

  const startTimestampRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setElapsedMs(0);
      accumulatedMsRef.current = 0;
      startTimestampRef.current = null;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      // Set initial values if provided
      if (initialPours && initialPours.length === 5) {
        setPourTimes(initialPours.map((p) => p.time));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRunning) {
      startTimestampRef.current = performance.now();

      const loop = (now: number) => {
        if (startTimestampRef.current !== null) {
          const delta = now - startTimestampRef.current;
          setElapsedMs(accumulatedMsRef.current + delta);
        }
        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      accumulatedMsRef.current = elapsedMs;
      startTimestampRef.current = null;
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning]);

  if (!isOpen) return null;

  const formatTimer = (totalMs: number) => {
    const totalSec = Math.floor(totalMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const tenths = Math.floor((totalMs % 1000) / 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  const formatMinutesSeconds = (totalMs: number) => {
    const totalSec = Math.floor(totalMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
    accumulatedMsRef.current = 0;
    startTimestampRef.current = null;
    setPourTimes(['', '', '', '', '']);
    setFinishTime('');
    setCurrentPourIdx(0);
  };

  const recordPourTime = (index: number) => {
    const formatted = formatMinutesSeconds(elapsedMs);
    const updated = [...pourTimes];
    updated[index] = formatted;
    setPourTimes(updated);
    if (index < 4) {
      setCurrentPourIdx(index + 1);
    }
  };

  const recordFinishTime = () => {
    const formatted = formatMinutesSeconds(elapsedMs);
    setFinishTime(formatted);
    setIsRunning(false);
  };

  const handleApply = () => {
    const formattedPours = pourTimes.map((t) => ({ time: t || '' }));
    onApplyTimes(formattedPours, finishTime || formatMinutesSeconds(elapsedMs));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-stone-900 text-stone-100 rounded-3xl border border-stone-800 shadow-2xl max-w-md w-full p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-stone-100">抽出タイマー</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stopwatch Display */}
        <div className="py-6 text-center">
          <div className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-amber-400 select-none">
            {formatTimer(elapsedMs)}
          </div>
          <div className="text-xs text-stone-400 mt-2">
            {isRunning ? '抽出中… 注湯ボタンをタップしてラップを記録' : '一時停止中'}
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handleStartPause}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-lg transition active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>一時停止</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>スタート</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>リセット</span>
          </button>
        </div>

        {/* Pour Lap Buttons (1st to 5th + Finish) */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-semibold text-stone-400">注湯タイム記録 (タップで記録)</div>
          <div className="grid grid-cols-5 gap-1.5">
            {[0, 1, 2, 3, 4].map((idx) => {
              const recorded = pourTimes[idx];
              const isNext = currentPourIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => recordPourTime(idx)}
                  className={`p-2 rounded-xl text-center border transition ${
                    recorded
                      ? 'bg-amber-950/70 border-amber-500/80 text-amber-300'
                      : isNext
                      ? 'bg-stone-800 border-amber-400/80 text-stone-100 ring-2 ring-amber-400/40'
                      : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <div className="text-[10px] text-stone-400">{idx + 1}投目</div>
                  <div className="font-mono text-xs font-bold mt-0.5">
                    {recorded || (isNext ? '記録' : '—')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Finish Time Lap */}
          <div className="pt-2">
            <button
              onClick={recordFinishTime}
              className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between text-xs font-bold transition ${
                finishTime
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-emerald-400" />
                <span>落切時間 (抽出完了)</span>
              </span>
              <span className="font-mono text-sm">{finishTime || '現在時間で落切'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-3 border-t border-stone-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-300 transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-stone-950 flex items-center justify-center gap-1.5 shadow transition"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>レシピに反映</span>
          </button>
        </div>
      </div>
    </div>
  );
};
