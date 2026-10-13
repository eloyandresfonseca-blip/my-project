import type { FinanceState, Transaction, RealTimeAlert, AuditReport } from '../types';
import { formatCOP, calculateNetSalary, getCurrentWeekOfMonth } from './formatters';

/**
 * Motor de Inteligencia Financiera para FinCoach AI
 * Especializado en finanzas personales colombianas y flujo de caja quincenal/mensual
 */

export interface RuleEvaluationResult {
  alerts: RealTimeAlert[];
  shouldTriggerConfetti: boolean;
}

export const evaluateTransactionRules = (
  newTx: Transaction,
  currentState: FinanceState
): RuleEvaluationResult => {
  const alerts: RealTimeAlert[] = [];
  let shouldTriggerConfetti = false;

  const currentWeek = newTx.weekNumber || getCurrentWeekOfMonth(new Date(newTx.date));
  
  // Transacciones existentes de la misma semana
  const weekTransactions = currentState.transactions.filter(
    (tx) => tx.weekNumber === currentWeek
  );

  // 1. Regla de Fondo de Emergencia / Ahorro
  if (newTx.pocket === 'ahorro' || newTx.category === 'Fondo de Emergencia') {
    shouldTriggerConfetti = true;
    const newTotalSavings = currentState.emergencyFundCurrent + newTx.amount;
    const percentCompleted = ((newTotalSavings / currentState.emergencyFundGoal) * 100).toFixed(1);
    
    alerts.push({
      id: `alert-savings-${Date.now()}`,
      type: 'congrats',
      title: '🎉 ¡Excelente decisión de ahorro!',
      message: `Sumaste ${formatCOP(newTx.amount)} a tu Fondo de Emergencia. Ya alcanzaste el ${percentCompleted}% de tu meta total de ${formatCOP(currentState.emergencyFundGoal)}.`,
      pocket: 'ahorro',
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Regla de Bolsillo Libre / Ocio ($30.000 COP / semana)
  if (newTx.pocket === 'libre' || newTx.category === 'Salidas y Ocio' || newTx.category === 'Café y Snacks') {
    const previousWeeklySpent = weekTransactions
      .filter((tx) => tx.pocket === 'libre' || tx.category === 'Salidas y Ocio' || tx.category === 'Café y Snacks')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalWeeklyFree = previousWeeklySpent + newTx.amount;
    const weeklyFreeLimit = currentState.weeklyFreeBudget; // $30.000 COP

    if (totalWeeklyFree > weeklyFreeLimit) {
      const overspent = totalWeeklyFree - weeklyFreeLimit;
      alerts.push({
        id: `alert-free-${Date.now()}`,
        type: 'warning',
        title: '⚠️ Sobrepasando cupo de ocio',
        message: `Estás sobrepasando tu cupo semanal de ocio de ${formatCOP(weeklyFreeLimit)} por ${formatCOP(overspent)}. Modera tus salidas el resto de la semana.`,
        pocket: 'libre',
        timestamp: new Date().toISOString(),
      });
    } else if (totalWeeklyFree >= weeklyFreeLimit * 0.8) {
      const remaining = weeklyFreeLimit - totalWeeklyFree;
      alerts.push({
        id: `alert-free-warn-${Date.now()}`,
        type: 'tip',
        title: '👀 Bolsillo libre al 80%',
        message: `Has consumido el 80% de tu cupo libre de la semana. Te quedan solo ${formatCOP(remaining)}.`,
        pocket: 'libre',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 3. Regla de Mercado Semanal ($87.500 COP / semana)
  if (newTx.pocket === 'mercado' || newTx.category === 'Mercado') {
    const weeklyGroceriesLimit = currentState.monthlyGroceriesBudget / 4; // $87.500 COP
    const previousWeeklyGroceries = weekTransactions
      .filter((tx) => tx.pocket === 'mercado' || tx.category === 'Mercado')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalWeeklyGroceries = previousWeeklyGroceries + newTx.amount;

    if (totalWeeklyGroceries > weeklyGroceriesLimit) {
      const excess = totalWeeklyGroceries - weeklyGroceriesLimit;
      alerts.push({
        id: `alert-groceries-${Date.now()}`,
        type: 'warning',
        title: '🛒 Mercado superó el tope semanal',
        message: `Superaste los ${formatCOP(weeklyGroceriesLimit)} semanales en mercado por ${formatCOP(excess)}. Te sugiero ajustar el menú de la quincena o compensar en compras de plaza D1/Ara.`,
        pocket: 'mercado',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 4. Regla de Detección de Gastos Hormiga (< $10.000 COP)
  if (newTx.amount < 10000 && (newTx.isAntExpense || newTx.category === 'Café y Snacks' || newTx.pocket === 'libre')) {
    const antExpensesThisMonth = [...currentState.transactions, newTx].filter(
      (tx) => tx.amount < 10000 && (tx.isAntExpense || tx.category === 'Café y Snacks')
    );
    const sumAnt = antExpensesThisMonth.reduce((acc, t) => acc + t.amount, 0);

    if (sumAnt >= 25000) {
      alerts.push({
        id: `alert-ant-${Date.now()}`,
        type: 'tip',
        title: '🐜 Alerta de Gastos Hormiga',
        message: `Este gasto menor a $10.000 COP se suma a otros pequeños consumos. Ya acumulas ${formatCOP(sumAnt)} este mes en micro-gastos.`,
        pocket: 'libre',
        timestamp: new Date().toISOString(),
      });
    }
  }

  return { alerts, shouldTriggerConfetti };
};

/**
 * Genera el reporte dinámico de diagnóstico en 3 tarjetas:
 * 🔴 Lo Crítico | 🟡 El Punto Ciego | 🟢 Consejo Táctico Inmediato
 */
export const generateAuditReport = (state: FinanceState): AuditReport => {
  const netSalary = calculateNetSalary(state.baseSalary, state.transportAllowance, state.healthPensionDeductionRate);
  
  // Cálculo de compromisos de deuda / fijos
  const debtFixedSum = state.payrollLoan + state.creditCardInstallment; // Libranza ($380.000) + Tarjeta ($320.000) = $700.000
  const debtRatio = (debtFixedSum / netSalary) * 100; // ~35.04%

  // Cálculo de gastos hormiga
  const antExpenses = state.transactions.filter(
    (tx) => tx.amount < 10000 || tx.isAntExpense || tx.category === 'Café y Snacks'
  );
  const antTotal = antExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  const projectedAntMonth = antTotal > 0 ? antTotal * 1.3 : 45000;

  // Cálculo de ahorros
  const savingsProgress = (state.emergencyFundCurrent / state.emergencyFundGoal) * 100;

  // Gastos de libre vs presupuesto
  const freeSpent = state.transactions
    .filter((tx) => tx.pocket === 'libre')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Score de salud financiera (0 a 100)
  let healthScore = 75;
  if (debtRatio > 35) healthScore -= 15;
  if (savingsProgress < 20) healthScore -= 10;
  if (freeSpent > state.weeklyFreeBudget * 4) healthScore -= 15;
  if (antTotal > 50000) healthScore -= 5;
  if (savingsProgress >= 40) healthScore += 10;
  healthScore = Math.max(20, Math.min(95, Math.round(healthScore)));

  return {
    timestamp: new Date().toISOString(),
    healthScore,
    critical: {
      title: '🔴 Lo Crítico: Alto compromiso de Deuda y Libranza',
      description: `Tu cuota de tarjeta (${formatCOP(state.creditCardInstallment)}) y libranza (${formatCOP(state.payrollLoan)}) suman ${formatCOP(debtFixedSum)}, consumiendo el ${debtRatio.toFixed(1)}% de tu ingreso neto mensual (${formatCOP(netSalary)}).`,
      metric: `${debtRatio.toFixed(1)}% del ingreso neto`,
      severity: debtRatio > 35 ? 'critical' : 'high',
    },
    blindSpot: {
      title: '🟡 El Punto Ciego: Fuga en Gastos Hormiga y Snacks',
      description: `Tienes ${antExpenses.length} micro-gastos registrados de menos de $10.000 COP (tintos, empanadas, snacks) que ya suman ${formatCOP(antTotal)}. Proyectas fugar ${formatCOP(projectedAntMonth)} en el mes si no pones un freno diario.`,
      metric: `${formatCOP(antTotal)} acumulados`,
      antExpenseSum: antTotal,
    },
    tacticalAdvice: {
      title: '🟢 Consejo Táctico Inmediato para Hoy',
      description: `Para blindar tu mes antes del fin de semana, separa $50.000 o $100.000 de tu excedente de flujo y transfiérelos directamente a tu Fondo de Emergencia. Esto te acerca a tus 3 meses de tranquilidad (${formatCOP(state.emergencyFundGoal)}).`,
      actionLabel: 'Transferir $100.000 a Emergencia',
      actionType: 'transfer_emergency',
      suggestedAmount: 100000,
    },
  };
};

/**
 * Motor conversacional de FinCoach AI con respuestas dinámicas basadas en los datos en vivo
 */
export const answerUserPrompt = (prompt: string, state: FinanceState): string => {
  const p = prompt.toLowerCase().trim();
  const netSalary = calculateNetSalary(state.baseSalary, state.transportAllowance, state.healthPensionDeductionRate);
  
  const currentWeek = getCurrentWeekOfMonth();
  const weekFreeTransactions = state.transactions.filter(
    (tx) => tx.weekNumber === currentWeek && (tx.pocket === 'libre' || tx.category === 'Salidas y Ocio' || tx.category === 'Café y Snacks')
  );
  const weekFreeSpent = weekFreeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const weeklyFreeRemaining = Math.max(0, state.weeklyFreeBudget - weekFreeSpent);
  
  // Días que quedan en la semana (asumiendo domingo fin de semana)
  const todayDayOfWeek = new Date().getDay(); // 0 es domingo
  const daysLeftInWeek = todayDayOfWeek === 0 ? 1 : 7 - todayDayOfWeek + 1;
  const dailyFreeBudget = Math.max(0, Math.round(weeklyFreeRemaining / Math.max(1, daysLeftInWeek)));

  const savingsProgress = ((state.emergencyFundCurrent / state.emergencyFundGoal) * 100).toFixed(1);
  const debtTotalMonthly = state.payrollLoan + state.creditCardInstallment;

  // 1. Chip: "¿Cuánto puedo gastar hoy?"
  if (p.includes('cuánto puedo gastar hoy') || p.includes('cuanto puedo gastar') || p.includes('gasto diario') || p.includes('cupo hoy')) {
    if (weeklyFreeRemaining <= 0) {
      return `⚠️ **Atención:** Ya agotaste tu cupo de ocio de esta semana ($30.000 COP). Te recomiendo gastar **$0 COP** en salidas hoy y esperar al inicio de la siguiente semana, o compensar cocinando en casa.`;
    }
    return `💡 Para hoy tienes un presupuesto sugerido de **${formatCOP(dailyFreeBudget)} COP** en tu bolsillo libre (te quedan **${formatCOP(weeklyFreeRemaining)} COP** para los próximos ${daysLeftInWeek} días de la semana). Si te mantienes en esa cifra, cerrarás la semana con éxito sin tocar el mercado ni tus ahorros.`;
  }

  // 2. Chip: "¿Cómo va mi meta del fondo de emergencia?"
  if (p.includes('fondo de emergencia') || p.includes('meta de ahorro') || p.includes('como va mi meta') || p.includes('cómo va mi meta')) {
    const remainingToGoal = state.emergencyFundGoal - state.emergencyFundCurrent;
    const monthsCovered = (state.emergencyFundCurrent / (state.rent + state.utilities + state.monthlyGroceriesBudget)).toFixed(1);

    return `🛡️ **Estado de tu Fondo de Emergencia:**\n\n• Acumulado actual: **${formatCOP(state.emergencyFundCurrent)} COP**\n• Meta total (3 meses de gastos mínimos): **${formatCOP(state.emergencyFundGoal)} COP**\n• Avance: **${savingsProgress}%** 🎯\n• Te faltan: **${formatCOP(remainingToGoal)} COP**.\n\nActualmente tienes cubiertos aproximadamente **${monthsCovered} meses** de gastos básicos (arriendo, servicios y mercado). ¡Vas por muy buen camino!`;
  }

  // 3. Chip: "¿Qué pasa si me gasto $50.000 hoy en una salida?"
  if (p.includes('50.000') || p.includes('50000') || p.includes('salida') || p.includes('que pasa si me gasto')) {
    const simulatedOverspend = (weekFreeSpent + 50000) - state.weeklyFreeBudget;
    return `🚨 **Simulación de Impacto:**\n\nSi gastas **$50.000 COP** hoy:\n1. Superarás tu tope semanal libre de $30.000 COP por **${formatCOP(simulatedOverspend)} COP** en exceso.\n2. Para absorber ese gasto sin endeudarte, tendrías que recortar el mercado de la próxima semana o postergar tu abono mensual de ahorro.\n\n👉 **Mi recomendación de Coach:** Fija tu límite para hoy en **${formatCOP(weeklyFreeRemaining > 0 ? weeklyFreeRemaining : 20000)} COP** o busca un plan de parche económico. ¡Protege tu tranquilidad de fin de mes!`;
  }

  // 4. Chip: "Simular pago total de la tarjeta con la prima"
  if (p.includes('prima') || p.includes('tarjeta con la prima') || p.includes('simular pago total') || p.includes('pagar tarjeta')) {
    const estimatedPrima = Math.round(state.baseSalary / 2); // Prima legal de mitad de año o diciembre
    const creditCardBalanceEstimated = state.creditCardInstallment * 2; // 1-2 cuotas pendientes ($640.000 aprox)
    const surplusAfterPrima = estimatedPrima - creditCardBalanceEstimated;

    return `💳 **Estrategia Magistral con la Prima:**\n\n• Prima legal estimada (1/2 salario base): **${formatCOP(estimatedPrima)} COP**\n• Saldo total pendiente de tu tarjeta (~2 cuotas): **${formatCOP(creditCardBalanceEstimated)} COP**\n\n🔥 **Si liquidas la tarjeta con la prima:**\n• Te sobran **${formatCOP(surplusAfterPrima)} COP** de la prima para meter directo al Fondo de Emergencia.\n• **Liberas ${formatCOP(state.creditCardInstallment)} COP cada mes** en tu flujo de caja neto.\n• Tu capacidad de ahorro mensual subirá un 68%. ¡Es la jugada financiera más rentable que puedes hacer!`;
  }

  // 5. Consultas sobre Transporte Híbrido vs Presencial
  if (p.includes('transporte') || p.includes('híbrido') || p.includes('presencial')) {
    const diff = state.transportPresentialCost - state.transportHybridCost; // $59.200 COP
    return `🚌 **Análisis de Transporte:**\n\n• Costo Híbrido actual: **${formatCOP(state.transportHybridCost)} COP/mes**\n• Costo 100% Presencial: **${formatCOP(state.transportPresentialCost)} COP/mes**\n\nEl esquema híbrido te ahorra **${formatCOP(diff)} COP al mes**. Esa diferencia representa casi 2 semanas completas de tu bolsillo libre de ocio. Puedes alternar este modo desde el Dashboard con el interruptor rápido.`;
  }

  // 6. Gastos hormiga
  if (p.includes('hormiga') || p.includes('snack') || p.includes('tinto') || p.includes('empanada')) {
    const antList = state.transactions.filter(t => t.amount < 10000 || t.isAntExpense);
    const antSum = antList.reduce((acc, t) => acc + t.amount, 0);
    return `🐜 **Detección de Gastos Hormiga:**\n\nHas registrado ${antList.length} micro-gastos que suman **${formatCOP(antSum)} COP** este mes. Los más comunes en Colombia son el tinto de $2.000, la empanada de $3.500 y las gaseosas. Si reduces a la mitad estos consumos y llevas termo de café, ahorrarías cerca de **$40.000 COP al mes** para tu fondo de emergencia.`;
  }

  // 7. Salario neto o deducciones
  if (p.includes('salario') || p.includes('ingreso') || p.includes('nomina') || p.includes('cuanto gano')) {
    return `💵 **Desglose de tu Nómina Mensual en Colombia:**\n\n• Salario Base: **${formatCOP(state.baseSalary)} COP**\n• Auxilio de Transporte: **${formatCOP(state.transportAllowance)} COP**\n• Descuento Salud (4%) y Pensión (4%): **-${formatCOP(state.baseSalary * 0.08)} COP**\n• **Ingreso Neto Real:** **${formatCOP(netSalary)} COP**\n\nTus compromisos fijos (Arriendo, Servicios, Libranza y Tarjeta) suman **${formatCOP(state.rent + state.utilities + debtTotalMonthly)} COP**.`;
  }

  // Respuesta general inteligente
  return `🤖 **Análisis de FinCoach AI:**\n\nTienes un ingreso neto de **${formatCOP(netSalary)} COP**. Tu bolsillo semanal libre cuenta con **${formatCOP(weeklyFreeRemaining)} COP** disponibles para terminar la semana ${currentWeek}. Recuerda que tus deudas (libranza + tarjeta) ocupan el 35% de tu ingreso; mantener a raya los gastos hormiga es la clave para llegar sin estrés a la próxima quincena.\n\n¿Quieres que simulemos un gasto específico o auditemos tus finanzas hoy?`;
};

/**
 * Mensaje breve de saludo dinámico en el Dashboard
 */
export const getDashboardAgentGreeting = (state: FinanceState): { headline: string; subtext: string; mood: 'good' | 'warning' | 'alert' } => {
  const currentWeek = getCurrentWeekOfMonth();
  const weekFreeTransactions = state.transactions.filter(
    (tx) => tx.weekNumber === currentWeek && (tx.pocket === 'libre' || tx.category === 'Salidas y Ocio' || tx.category === 'Café y Snacks')
  );
  const weekFreeSpent = weekFreeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const remaining = state.weeklyFreeBudget - weekFreeSpent;

  if (remaining < 0) {
    return {
      headline: '⚠️ Ojo con el bolsillo libre',
      subtext: `Te pasaste por ${formatCOP(Math.abs(remaining))} en ocio esta semana. Ajusta los próximos días.`,
      mood: 'warning',
    };
  }

  if (remaining <= 10000) {
    return {
      headline: '⚡ Cupo semanal casi al límite',
      subtext: `Te quedan solo ${formatCOP(remaining)} para ocio de la semana ${currentWeek}.`,
      mood: 'alert',
    };
  }

  return {
    headline: '¡Vas dentro del presupuesto!',
    subtext: `Te quedan ${formatCOP(remaining)} en tu cupo libre de esta semana. Vas impecable.`,
    mood: 'good',
  };
};
