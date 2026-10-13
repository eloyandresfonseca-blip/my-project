export type PocketType = 'fijos' | 'mercado' | 'libre' | 'ahorro';

export type Category = 
  | 'Arriendo'
  | 'Servicios'
  | 'Libranza'
  | 'Tarjeta de Crédito'
  | 'Mercado'
  | 'Transporte'
  | 'Salidas y Ocio'
  | 'Café y Snacks'
  | 'Fondo de Emergencia'
  | 'Otros';

export type TransportMode = 'hybrid' | 'presential';

export interface Transaction {
  id: string;
  description: string;
  amount: number; // En pesos colombianos (COP)
  date: string; // ISO string o YYYY-MM-DD
  pocket: PocketType;
  category: Category;
  isAntExpense?: boolean; // Gasto hormiga (< $10.000 COP)
  weekNumber: number; // 1, 2, 3, o 4 del mes
  notes?: string;
}

export interface PocketSummary {
  id: PocketType;
  name: string;
  budget: number;
  spent: number;
  remaining: number;
  color: string;
  iconName: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  actionPrompt?: {
    label: string;
    actionType: 'add_savings' | 'audit' | 'view_ant_expenses' | 'toggle_transport';
    payload?: any;
  };
}

export interface AuditReport {
  timestamp: string;
  healthScore: number; // 0 a 100
  critical: {
    title: string;
    description: string;
    metric: string;
    severity: 'high' | 'critical';
  };
  blindSpot: {
    title: string;
    description: string;
    metric: string;
    antExpenseSum: number;
  };
  tacticalAdvice: {
    title: string;
    description: string;
    actionLabel: string;
    actionType: 'transfer_emergency' | 'cut_ant' | 'adjust_groceries';
    suggestedAmount?: number;
  };
}

export interface RealTimeAlert {
  id: string;
  type: 'warning' | 'congrats' | 'tip' | 'danger';
  title: string;
  message: string;
  pocket?: PocketType;
  timestamp: string;
  dismissed?: boolean;
}

export interface FinanceState {
  // Ingresos
  baseSalary: number; // $1.954.000 COP
  transportAllowance: number; // $200.000 COP
  healthPensionDeductionRate: number; // 0.08 (8%)
  
  // Modo de transporte
  transportMode: TransportMode;
  transportHybridCost: number; // $133.200 COP
  transportPresentialCost: number; // $192.400 COP

  // Obligaciones Fijas
  rent: number; // $150.000 COP
  utilities: number; // $80.000 COP
  payrollLoan: number; // $380.000 COP (Libranza)
  creditCardInstallment: number; // $320.000 COP (Pendiente 1-2 cuotas)

  // Bolsillos Variables y Metas
  monthlyGroceriesBudget: number; // $350.000 COP ($87.500/semana)
  weeklyFreeBudget: number; // $30.000 COP ($120.000/mes)
  
  // Meta Fondo de Emergencia
  emergencyFundGoal: number; // $3.280.000 COP (3 meses gastos mínimos)
  emergencyFundCurrent: number; // Monto acumulado actual

  // Transacciones
  transactions: Transaction[];

  // Chat del Agente
  chatMessages: ChatMessage[];

  // Auditoría actual
  lastAudit: AuditReport | null;

  // Alertas activas
  activeAlerts: RealTimeAlert[];

  // Modo tema
  darkMode: boolean;
}
