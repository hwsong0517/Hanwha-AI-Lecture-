/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Target, Info, Cpu } from 'lucide-react';
import { Part, PartType, Material, EnvironmentCondition, AISuggestion } from './types';
import { calculateWorstCase } from './utils/tolerance';
import PartList from './components/PartList';
import AnalysisDashboard from './components/AnalysisDashboard';
import AIGuide from './components/AIGuide';
import { motion } from 'motion/react';

export default function App() {
  const [parts, setParts] = useState<Part[]>([
    { id: '1', name: 'Housing (Outer)', nominal: 120.0, upperTolerance: 0.1, lowerTolerance: -0.1, type: PartType.MACHINED, material: Material.AL6061 },
    { id: '2', name: 'Bearing A', nominal: -15.0, upperTolerance: 0.01, lowerTolerance: 0, type: PartType.COTS, material: Material.STS440C },
    { id: '3', name: 'Bearing B', nominal: -15.0, upperTolerance: 0.01, lowerTolerance: 0, type: PartType.COTS, material: Material.STS440C },
    { id: '4', name: 'Main Shaft', nominal: -89.8, upperTolerance: 0.05, lowerTolerance: -0.05, type: PartType.MACHINED, material: Material.STS440C },
  ]);

  const [targetGap, setTargetGap] = useState({ min: 0.1, max: 0.3 });
  const [environment, setEnvironment] = useState<EnvironmentCondition>(EnvironmentCondition.STANDARD);

  const analysisResult = useMemo(() => 
    calculateWorstCase(parts, targetGap.min, targetGap.max, environment),
    [parts, targetGap, environment]
  );

  const addPart = () => {
    const newPart: Part = {
      id: crypto.randomUUID(),
      name: 'New Part',
      nominal: 0,
      upperTolerance: 0.05,
      lowerTolerance: -0.05,
      type: PartType.MACHINED,
      material: Material.NONE
    };
    setParts([...parts, newPart]);
  };

  const updatePart = (id: string, updates: Partial<Part>) => {
    setParts(parts.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
  };

  const handleApplySuggestions = (suggestions: AISuggestion[]) => {
    setParts(currentParts => {
      return currentParts.map(part => {
        const suggestion = suggestions.find(s => s.partName === part.name);
        if (suggestion) {
          return {
            ...part,
            upperTolerance: suggestion.suggestedUpper,
            lowerTolerance: suggestion.suggestedLower
          };
        }
        return part;
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation / Header */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">T-ACT</h1>
              <p className="text-[10px] text-slate-500 font-mono leading-none">PGM 구동장치 누적공차 해석 도구 v1.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400">연구원 인증됨</span>
            </div>
            <Info className="w-5 h-5 text-slate-500 cursor-help hover:text-slate-300 transition-colors" />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Target className="w-4 h-4" />
              <h2 className="text-xs font-semibold uppercase tracking-widest">설계 목표 사양</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] text-slate-500 font-medium uppercase">최소 목표 유격 (Min, mm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetGap.min}
                  onChange={(e) => setTargetGap({ ...targetGap, min: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-950 w-full text-slate-100 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] text-slate-500 font-medium uppercase">최대 목표 유격 (Max, mm)</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetGap.max}
                  onChange={(e) => setTargetGap({ ...targetGap, max: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-950 w-full text-slate-100 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:border-indigo-500 outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          <PartList 
            parts={parts} 
            onAddPart={addPart} 
            onUpdatePart={updatePart} 
            onRemovePart={removePart} 
          />
        </div>

        {/* Right Column: Analysis */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AnalysisDashboard 
              result={analysisResult} 
              targetGap={targetGap} 
              onEnvChange={setEnvironment}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AIGuide 
              analysisData={analysisResult} 
              targetGap={targetGap} 
              onApplySuggestions={handleApplySuggestions}
            />
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-slate-900 p-6 bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600 font-mono">
            &copy; 2024 HANWHA AEROSPACE PGM DIVISION. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] text-slate-500 font-mono uppercase">사내 R&D 실습 도구</span>
            <span className="text-[10px] text-slate-500 font-mono uppercase">MIL-STD-810H 규격 준수</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
