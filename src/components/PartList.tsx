/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Trash2, Settings2, Package } from 'lucide-react';
import { Part, PartType, Material } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PartListProps {
  parts: Part[];
  onAddPart: () => void;
  onUpdatePart: (id: string, updates: Partial<Part>) => void;
  onRemovePart: (id: string) => void;
}

export default function PartList({ parts, onAddPart, onUpdatePart, onRemovePart }: PartListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          부품 구성 (Parts Config)
        </h2>
        <button
          onClick={onAddPart}
          className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          부품 추가
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {parts.map((part) => (
            <motion.div
              key={part.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg group hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3">
                    <input
                      value={part.name}
                      onChange={(e) => onUpdatePart(part.id, { name: e.target.value })}
                      placeholder="부품명"
                      className="bg-transparent text-slate-100 border-b border-slate-700 focus:border-indigo-500 outline-none flex-1 py-1 text-sm font-medium"
                    />
                    <select
                      value={part.type}
                      onChange={(e) => onUpdatePart(part.id, { type: e.target.value as PartType })}
                      className="bg-slate-900 text-slate-300 text-xs border border-slate-700 rounded px-2 py-1 outline-none focus:border-indigo-500"
                    >
                      <option value={PartType.MACHINED}>가공품</option>
                      <option value={PartType.COTS}>구매품 (COTS)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono">설계치수 (mm)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={part.nominal}
                        onChange={(e) => onUpdatePart(part.id, { nominal: parseFloat(e.target.value) || 0 })}
                        className="bg-slate-900 w-full text-slate-100 border border-slate-700 rounded px-2 py-1.5 text-xs focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono">상한공차 (+)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={part.upperTolerance}
                        onChange={(e) => onUpdatePart(part.id, { upperTolerance: parseFloat(e.target.value) || 0 })}
                        className="bg-slate-900 w-full text-slate-100 border border-slate-700 rounded px-2 py-1.5 text-xs focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-mono">하한공차 (-)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={part.lowerTolerance}
                        onChange={(e) => onUpdatePart(part.id, { lowerTolerance: parseFloat(e.target.value) || 0 })}
                        className="bg-slate-900 w-full text-slate-100 border border-slate-700 rounded px-2 py-1.5 text-xs focus:border-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={part.material}
                        onChange={(e) => onUpdatePart(part.id, { material: e.target.value as Material })}
                        className="bg-transparent text-slate-400 text-xs outline-none focus:text-indigo-400 cursor-pointer"
                      >
                        <option value={Material.NONE}>재질 선택</option>
                        <option value={Material.AL6061}>AL6061 (알루미늄)</option>
                        <option value={Material.STS440C}>STS440C (강재)</option>
                      </select>
                    </div>
                    
                    {(Math.abs(part.upperTolerance) < 0.03 || Math.abs(part.lowerTolerance) < 0.03) && part.type === PartType.MACHINED && (
                      <span className="text-[10px] bg-amber-900/30 text-amber-500 px-2 py-0.5 rounded border border-amber-800/50">
                        정밀 가공 주의 ({"<"} 0.03mm)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onRemovePart(part.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
