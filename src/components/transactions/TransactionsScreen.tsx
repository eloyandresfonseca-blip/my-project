import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Trash2, 
  Plus, 
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { useFinance } from '../../store/FinanceContext';
import { formatCOP, formatDateDisplay } from '../../utils/formatters';
import type { PocketType } from '../../types';

interface TransactionsScreenProps {
  onOpenAddModal: () => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ onOpenAddModal }) => {
  const { state, deleteTransaction, antExpensesTotal, antExpensesCount, totalSpentThisMonth } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ant' | PocketType>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return state.transactions.filter((tx) => {
      // Search text filter
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Category / Pocket filter
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'ant') return tx.isAntExpense || tx.amount < 10000;
      return tx.pocket === selectedFilter;
    }).sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [state.transactions, searchQuery, selectedFilter, sortBy]);

  const categoryPillColors: Record<string, string> = {
    'Arriendo': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/50',
    'Servicios': 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/50',
    'Libranza': 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/50',
    'Tarjeta de Crédito': 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/50',
    'Mercado': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/50',
    'Transporte': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
    'Salidas y Ocio': 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/50',
    'Café y Snacks': 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/50',
    'Fondo de Emergencia': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/50',
    'Otros': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Flujo de Caja Real
          </span>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Movimientos y Gastos
          </h1>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo</span>
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Gastado
          </span>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {formatCOP(totalSpentThisMonth)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {state.transactions.length} registros en el mes
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <span>🐜 Gastos Hormiga</span>
          </span>
          <div className="text-lg font-black text-amber-900 dark:text-amber-200 mt-0.5">
            {formatCOP(antExpensesTotal)}
          </div>
          <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
            {antExpensesCount} compras menores a $10k
          </div>
        </div>
      </div>

      {/* Search Input & Sort Toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por concepto o categoría..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 hover:border-slate-300 cursor-pointer"
          title="Alternar ordenación"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>{sortBy === 'date' ? 'Fecha' : 'Monto'}</span>
        </button>
      </div>

      {/* Filters Pill Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'ant', label: '🐜 Solo Hormiga' },
          { id: 'libre', label: 'Libre / Ocio' },
          { id: 'mercado', label: 'Mercado' },
          { id: 'fijos', label: 'Fijos' },
          { id: 'ahorro', label: 'Ahorro' },
        ].map((filter) => {
          const isSelected = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No se encontraron movimientos con este criterio</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isSavings = tx.pocket === 'ahorro' || tx.category === 'Fondo de Emergencia';
              const pillStyle = categoryPillColors[tx.category] || 'bg-slate-100 text-slate-700';

              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="text-xl shrink-0">
                      {tx.isAntExpense
                        ? '🐜'
                        : isSavings
                        ? '🛡️'
                        : tx.pocket === 'mercado'
                        ? '🛒'
                        : tx.pocket === 'libre'
                        ? '☕'
                        : '🏠'}
                    </div>

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </span>
                        {tx.isAntExpense && (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                            Hormiga
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${pillStyle}`}>
                          {tx.category}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateDisplay(tx.date)}
                        </span>
                        <span className="text-[10px] text-slate-400">• Sem {tx.weekNumber}</span>
                      </div>

                      {tx.notes && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5 truncate">
                          "{tx.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-xs font-black ${
                          isSavings
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isSavings ? '+' : '-'}{formatCOP(tx.amount)}
                      </div>
                      <div className="text-[9px] text-slate-400 capitalize">
                        Bolsillo {tx.pocket}
                      </div>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                      title="Eliminar movimiento"
                      aria-label="Eliminar movimiento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
