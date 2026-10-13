import type { FinanceState, Transaction, ChatMessage } from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Arriendo habitación / cuota mensual',
    amount: 150000,
    date: '2026-10-02T10:00:00.000Z',
    pocket: 'fijos',
    category: 'Arriendo',
    weekNumber: 1,
    notes: 'Transferencia bancaria acordada',
  },
  {
    id: 'tx-2',
    description: 'Servicios públicos (Enel / Acueducto / Gas)',
    amount: 80000,
    date: '2026-10-04T15:30:00.000Z',
    pocket: 'fijos',
    category: 'Servicios',
    weekNumber: 1,
    notes: 'Pago por PSE en línea',
  },
  {
    id: 'tx-3',
    description: 'Mercado básico quincena en Tiendas D1',
    amount: 78000,
    date: '2026-10-05T18:20:00.000Z',
    pocket: 'mercado',
    category: 'Mercado',
    weekNumber: 1,
    notes: 'Granos, huevos, aseo y lácteos',
  },
  {
    id: 'tx-4',
    description: 'Fruver de barrio y plaza de mercado',
    amount: 42000,
    date: '2026-10-09T11:00:00.000Z',
    pocket: 'mercado',
    category: 'Mercado',
    weekNumber: 2,
    notes: 'Frutas, verduras frescas y pechuga',
  },
  {
    id: 'tx-5',
    description: 'Tinto campesino y buñuelo panadería',
    amount: 4500,
    date: '2026-10-10T08:30:00.000Z',
    pocket: 'libre',
    category: 'Café y Snacks',
    isAntExpense: true,
    weekNumber: 2,
    notes: 'Desayuno al paso cerca a la oficina',
  },
  {
    id: 'tx-6',
    description: 'Café latte y galleta con compañero',
    amount: 8500,
    date: '2026-10-11T16:15:00.000Z',
    pocket: 'libre',
    category: 'Café y Snacks',
    isAntExpense: true,
    weekNumber: 2,
    notes: 'Cafetería de la esquina',
  },
  {
    id: 'tx-7',
    description: 'Empanada con ají y gaseosa personal',
    amount: 5200,
    date: '2026-10-12T17:40:00.000Z',
    pocket: 'libre',
    category: 'Café y Snacks',
    isAntExpense: true,
    weekNumber: 2,
    notes: 'Antojo de la tarde',
  },
  {
    id: 'tx-8',
    description: 'Aporte extraordinario al Fondo de Emergencia',
    amount: 150000,
    date: '2026-10-06T09:00:00.000Z',
    pocket: 'ahorro',
    category: 'Fondo de Emergencia',
    weekNumber: 1,
    notes: 'Meta 3 meses de tranquilidad',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'agent',
    text: `¡Hola! Soy **FinCoach AI**, tu mini-agente financiero personal en Colombia 🇨🇴.\n\nHe cargado tu perfil con tu salario neto de **$1.997.680 COP**, tus obligaciones fijas y tu meta del **Fondo de Emergencia ($3.280.000 COP)**.\n\nEstoy vigilando en tiempo real tus sobres semanales de mercado ($87.500/sem) y ocio ($30.000/sem) para que nunca te falte liquidez en la quincena. ¿En qué te puedo asesorar hoy?`,
    timestamp: '2026-10-13T08:00:00.000Z',
  },
];

export const DEFAULT_FINANCE_STATE: FinanceState = {
  // Salario e Ingresos
  baseSalary: 1954000,
  transportAllowance: 200000,
  healthPensionDeductionRate: 0.08,

  // Transporte
  transportMode: 'hybrid',
  transportHybridCost: 133200,
  transportPresentialCost: 192400,

  // Obligaciones Fijas
  rent: 150000,
  utilities: 80000,
  payrollLoan: 380000,
  creditCardInstallment: 320000,

  // Bolsillos Variables
  monthlyGroceriesBudget: 350000, // $87.500 / semana
  weeklyFreeBudget: 30000, // $30.000 / semana ($120.000 / mes)

  // Meta Fondo de Emergencia
  emergencyFundGoal: 3280000, // 3 meses de gastos mínimos
  emergencyFundCurrent: 920000, // Acumulado actual inicial (28% meta)

  // Transacciones
  transactions: INITIAL_TRANSACTIONS,

  // Chat
  chatMessages: INITIAL_CHAT_MESSAGES,

  // Auditoría inicial nula (se generará con el botón)
  lastAudit: null,

  // Alertas iniciales
  activeAlerts: [
    {
      id: 'init-alert-1',
      type: 'tip',
      title: '🐜 Gastos Hormiga bajo observación',
      message: 'Tienes $18.200 COP registrados en tintos y empanadas esta semana. Mantenlos vigilados.',
      pocket: 'libre',
      timestamp: new Date().toISOString(),
    },
  ],

  darkMode: false,
};
