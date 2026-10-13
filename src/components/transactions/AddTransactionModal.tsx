import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle, ShoppingCart, Coffee, ShieldCheck, Building, Plus } from 'lucide-react';
import { useFinance } from '../../store/FinanceContext';
import { formatCOP, getCurrentWeekOfMonth } from '../../utils/formatters';
import type { Category, PocketType } from '../../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction, state } = useFinance();

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [pocket, setPocket] = useState<PocketType>('libre');
  const [category, setCategory] = useState<Category>('Café y Snacks');
  const [isAntExpense, setIsAntExpense] = useState(true);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const numericAmount = parseFloat(amountStr.replace(/[^0-9]/g, '')) || 0;

  // Auto-detect ant expense
  const handleAmountChange = (val: string) => {
    const rawVal = val.replace(/[^0-9]/g, '');
    setAmountStr(rawVal);
    const num = parseFloat(rawVal) || 0;
    if (num > 0 && num < 10000 && (pocket === 'libre' || pocket === 'fijos')) {
      setIsAntExpense(true);
    } else if (num >= 10000) {
      setIsAntExpense(false);
    }
  };

  const handlePocketChange = (p: PocketType) => {
    setPocket(p);
    if (p === 'libre') {
      setCategory('Café y Snacks');
      setIsAntExpense(numericAmount > 0 && numericAmount < 10000);
    } else if (p === 'mercado') {
      setCategory('Mercado');
      setIsAntExpense(false);
    } else if (p === 'ahorro') {
      setCategory('Fondo de Emergencia');
      setIsAntExpense(false);
    } else if (p === 'fijos') {
      setCategory('Servicios');
      setIsAntExpense(false);
    }
  };

  const handleAddPreset = (addon: number) => {
    const current = parseFloat(amountStr.replace(/[^0-9]/g, '')) || 0;
    const next = current + addon;
    setAmountStr(next.toString());
    if (next < 10000 && pocket === 'libre') {
      setIsAntExpense(true);
    } else {
      setIsAntExpense(false);
    }
  };

  // Pre-evaluación en vivo de FinCoach
  const currentWeek = getCurrentWeekOfMonth();
  const currentWeekFreeSpent = state.transactions
    .filter((tx) => tx.weekNumber === currentWeek && (tx.pocket === 'libre' || tx.category === 'Salidas y Ocio' || tx.category === 'Café y Snacks'))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const willOverspendFree = pocket === 'libre' && (currentWeekFreeSpent + numericAmount > state.weeklyFreeBudget);
  const freeOverspendAmount = (currentWeekFreeSpent + numericAmount) - state.weeklyFreeBudget;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || numericAmount <= 0) return;

    addTransaction({
      description: description.trim(),
      amount: numericAmount,
      date: new Date().toISOString(),
      pocket,
      category,
      isAntExpense,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setDescription('');
    setAmountStr('');
    setNotes('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-[430px] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Registrar Movimiento</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Control de flujo de caja en Colombia</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Monto Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Monto en Pesos Colombianos (COP)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={numericAmount > 0 ? numericAmount.toLocaleString('es-CO') : amountStr}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 text-xl font-bold rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Botones de incremento rápido */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[5000, 10000, 20000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700/60 active:scale-95"
                  >
                    +{formatCOP(preset, false)}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Concepto / Descripción
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Tinto y pan, Mercado D1, Taxi..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            {/* Selector de Bolsillo */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Bolsillo de Destino
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'libre' as PocketType, label: 'Libre / Ocio', icon: Coffee, desc: '$30.000/sem' },
                  { id: 'mercado' as PocketType, label: 'Mercado', icon: ShoppingCart, desc: '$87.500/sem' },
                  { id: 'ahorro' as PocketType, label: 'Fondo Emergencia', icon: ShieldCheck, desc: 'Meta 3 meses' },
                  { id: 'fijos' as PocketType, label: 'Fijos / Servicios', icon: Building, desc: 'Obligaciones' },
                ].map((item) => {
                  const isSelected = pocket === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePocketChange(item.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs truncate">{item.label}</div>
                        <div className="text-[10px] opacity-70 truncate">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Categoría Específica
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="Café y Snacks">Café y Snacks (Antojo al paso)</option>
                <option value="Salidas y Ocio">Salidas y Ocio (Restaurantes / Amigos)</option>
                <option value="Mercado">Mercado (D1, Ara, Fruver, Éxito)</option>
                <option value="Transporte">Transporte (TuLlave, SITP, Taxis)</option>
                <option value="Fondo de Emergencia">Fondo de Emergencia (Ahorro)</option>
                <option value="Servicios">Servicios Públicos (Luz, Agua, Gas, Celular)</option>
                <option value="Arriendo">Arriendo</option>
                <option value="Libranza">Libranza / Descuento Nómina</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            {/* Detección Gasto Hormiga Badge & Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="text-base">🐜</span>
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Gasto Hormiga Recurrente (&lt; $10.000 COP)
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-300">
                    FinCoach acumula estos gastos para auditar fugas
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isAntExpense}
                onChange={(e) => setIsAntExpense(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            {/* FinCoach Live Preview Alert */}
            {willOverspendFree && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">⚠️ Advertencia en vivo de FinCoach AI:</span> Con este gasto superarás tu cupo semanal de ocio ($30.000) por{' '}
                  <span className="font-bold underline">{formatCOP(freeOverspendAmount)}</span>.
                </div>
              </motion.div>
            )}

            {pocket === 'ahorro' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">🎉 Impulso a tu meta:</span> Este monto se sumará a tus 3 meses de tranquilidad ($3.280.000 COP) y activará confeti.
                </div>
              </motion.div>
            )}

            {/* Notas opcionales */}
            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales (opcional)..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={numericAmount <= 0 || !description.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Guardar y Analizar con FinCoach</span>
              <Sparkles className="w-4 h-4" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
