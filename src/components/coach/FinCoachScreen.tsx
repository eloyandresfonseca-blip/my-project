import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Search, 
  Send, 
  AlertOctagon, 
  HelpCircle, 
  Lightbulb, 
  ArrowRight, 
  Zap,
  Activity
} from 'lucide-react';
import { useFinance } from '../../store/FinanceContext';
import { formatDateDisplay } from '../../utils/formatters';

interface FinCoachScreenProps {
  initialAuditPrompt?: boolean;
}

export const FinCoachScreen: React.FC<FinCoachScreenProps> = ({ initialAuditPrompt }) => {
  const { state, runAudit, sendChatMessage, addSavings } = useFinance();

  const [inputMessage, setInputMessage] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatMessages]);

  // Si se solicita auditoría desde fuera o si no existe una aún
  useEffect(() => {
    if (initialAuditPrompt && !state.lastAudit) {
      handleTriggerAudit();
    }
  }, [initialAuditPrompt]);

  const handleTriggerAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      runAudit();
      setIsAuditing(false);
    }, 700);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;
    sendChatMessage(text.trim());
    setInputMessage('');
  };

  const handleTacticalAction = () => {
    if (state.lastAudit?.tacticalAdvice.suggestedAmount) {
      addSavings(
        state.lastAudit.tacticalAdvice.suggestedAmount,
        'Acción recomendada por FinCoach: Transferencia de blindaje'
      );
    }
  };

  const quickChips = [
    '¿Cuánto puedo gastar hoy?',
    '¿Cómo va mi meta del fondo de emergencia?',
    '¿Qué pasa si me gasto $50.000 hoy en una salida?',
    'Simular pago total de la tarjeta con la prima',
  ];

  const audit = state.lastAudit;

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-indigo-400">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>

          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              FinCoach AI
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Auditor Financiero & Consultor Inteligente
            </p>
          </div>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          <div className="text-right">
            <div className="text-[9px] uppercase font-bold tracking-wider leading-none">Salud</div>
            <div className="text-xs font-black leading-none mt-0.5">
              {audit ? `${audit.healthScore}/100` : '78/100'}
            </div>
          </div>
        </div>
      </div>

      {/* 1. SECCIÓN: AUDITORÍA EN TIEMPO REAL ("¿Qué está mal? / ¿Qué puedo mejorar?") */}
      <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Diagnóstico Dinámico de Finanzas
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Evaluación instantánea de desviaciones, fugas y tácticas
            </p>
          </div>
        </div>

        {/* Botón táctil destacado: "🔍 Auditar mis Finanzas Hoy" */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTriggerAudit}
          disabled={isAuditing}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all border border-emerald-400/30 disabled:opacity-70"
        >
          {isAuditing ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Escaneando transacciones y sobres...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>🔍 Auditar mis Finanzas Hoy</span>
            </>
          )}
        </motion.button>

        {/* Las 3 Tarjetas de Diagnóstico */}
        <AnimatePresence>
          {audit ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-2"
            >
              {/* 🔴 Lo Crítico */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-200">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wide">
                    {audit.critical.title}
                  </h3>
                </div>
                <p className="text-xs text-rose-900/90 dark:text-rose-200/90 leading-relaxed font-normal">
                  {audit.critical.description}
                </p>
                <div className="mt-2 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-lg inline-block">
                  Métrica: {audit.critical.metric}
                </div>
              </div>

              {/* 🟡 El Punto Ciego */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wide">
                    {audit.blindSpot.title}
                  </h3>
                </div>
                <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-normal">
                  {audit.blindSpot.description}
                </p>
                <div className="mt-2 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-lg inline-block">
                  Fuga detectada: {audit.blindSpot.metric}
                </div>
              </div>

              {/* 🟢 Consejo Táctico Inmediato */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wide">
                    {audit.tacticalAdvice.title}
                  </h3>
                </div>
                <p className="text-xs text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed font-normal">
                  {audit.tacticalAdvice.description}
                </p>

                {/* Tactical execution button */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleTacticalAction}
                  className="mt-3 w-full py-2.5 px-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/30 hover:bg-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{audit.tacticalAdvice.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
              Presiona "Auditar mis Finanzas Hoy" para generar el informe de Lo Crítico, El Punto Ciego y el Consejo Táctico.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. SECCIÓN: ASISTENTE CONVERSACIONAL INTEGRADO */}
      <div className="p-4.5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            Chat Consultivo con FinCoach
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
          </h2>
          <span className="text-[10px] text-slate-400">Contexto Real 🇨🇴</span>
        </div>

        {/* Quick Question Chips */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Preguntas Rápidas Sugeridas:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/70 dark:hover:text-indigo-400 whitespace-nowrap transition-all border border-slate-200 dark:border-slate-600 cursor-pointer active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {state.chatMessages.map((msg) => {
            const isAgent = msg.sender === 'agent';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${isAgent ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {isAgent ? (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    Tú
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isAgent
                      ? 'bg-slate-100 dark:bg-slate-700/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600/60 whitespace-pre-line'
                      : 'bg-indigo-600 text-white rounded-tr-sm font-medium'
                  }`}
                >
                  <div>{msg.text}</div>
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      isAgent ? 'text-slate-400' : 'text-indigo-200'
                    }`}
                  >
                    {formatDateDisplay(msg.timestamp)}
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pregúntale a FinCoach sobre tu presupuesto..."
            className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white cursor-pointer shadow-md transition-all shrink-0"
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
