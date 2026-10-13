# 🇨🇴 FinCoach AI — Finanzas Personales & Flujo de Caja Colombia

Aplicación móvil PWA de élite con enfoque **Mobile-First** (diseñada para viewports de 390px - 430px) y un **Mini-Agente Financiero Inteligente ("FinCoach AI")** integrado en el núcleo de la experiencia.

---

## 🚀 Características Principales

### 1. 🤖 Núcleo Central: Mini-Agente Financiero ("FinCoach AI")
- **Widget Interactivo Persistente en Dashboard**:
  - Saludo dinámico con cálculo en vivo del cupo disponible para el día.
  - Monitor de salud financiera y detección en tiempo real de **Gastos Hormiga** (< $10.000 COP).
  - Botón táctil destacado: **`🔍 Auditar mis Finanzas Hoy`**.
- **Tarjeta de Diagnóstico Dinámico (3 Tarjetas)**:
  - 🔴 **Lo Crítico**: Desviaciones graves del presupuesto (ej. cuota de tarjeta y libranza superando el 35% del ingreso neto).
  - 🟡 **El Punto Ciego**: Fugas acumuladas de micro-gastos (snacks, café, domicilios pequeños).
  - 🟢 **Consejo Táctico Inmediato**: Acción concreta para hoy con botón de ejecución directa (ej. transferencia automática al fondo de emergencia).
- **Asistente Conversacional Inteligente**:
  - Chat consultivo con chips de preguntas rápidas:
    - *"¿Cuánto puedo gastar hoy?"*
    - *"¿Cómo va mi meta del fondo de emergencia?"*
    - *"¿Qué pasa si me gasto $50.000 hoy en una salida?"*
    - *"Simular pago total de la tarjeta con la prima"*.
  - Motor de respuestas contextualmente conscientes del saldo, sobregiros y deducciones de ley en Colombia.

---

### 2. 📊 Datos Base Preconfigurados (Colombia)
- **Ingreso Neto Mensual:** `$1.997.680 COP`
  - Salario base: `$1.954.000 COP`
  - Auxilio de transporte legal: `$200.000 COP`
  - Deducción de ley: 8% (4% Salud + 4% Pensión = `-$156.320 COP`).
- **Obligaciones Fijas:**
  - Arriendo: `$150.000 COP`
  - Servicios Públicos: `$80.000 COP`
  - Libranza / Descuento de nómina: `$380.000 COP`
  - Cuota Tarjeta de Crédito: `$320.000 COP` (pendiente 1-2 cuotas).
- **Gastos Operativos & Variables:**
  - Mercado Mensual: `$350.000 COP` ($87.500 COP semanales).
  - Transporte Híbrido: `$133.200 COP` (selector interactivo con transporte 100% presencial: `$192.400 COP`).
  - Bolsillo Libre Semanal: `$120.000 COP/mes` ($30.000 COP semanales).
- **Meta Principal de Ahorro:**
  - Fondo de Emergencia: Meta de `$3.280.000 COP` (3 meses de gastos mínimos).

---

### 3. 🎯 Navegación & Pantallas
1. 🏠 **Dashboard**:
   - Saludo dinámico de FinCoach AI con estado del día.
   - Saldo disponible en efectivo del mes con desglose de nómina colombiana.
   - Widget radial del Fondo de Emergencia con abonos rápidos (+ $50.000 / + $100.000 COP).
   - Selector en tiempo real de esquema de transporte (Híbrido vs Presencial).
   - Los 4 Bolsillos (Fijos, Mercado, Libre, Ahorro) con barras de progreso de color.
2. 💸 **Movimientos**:
   - Historial de transacciones con etiquetas por categoría y badge de "🐜 Gasto Hormiga".
   - Filtros instantáneos por bolsillo y búsqueda en tiempo real.
   - Modal de nuevo movimiento con teclado de incrementos rápidos y advertencias preventivas de FinCoach.
3. 🎯 **Metas & Bolsillos**:
   - Regla de los sobres semanales ($117.500 COP/semana entre mercado y ocio).
   - Termómetro visual del Fondo de Emergencia con hitos mensuales y confeti.
   - Simulador de pago total de la tarjeta de crédito usando la prima de servicios.
4. 🤖 **FinCoach (Hub de Inteligencia)**:
   - Diagnóstico en 3 tarjetas (Lo Crítico, El Punto Ciego, Consejo Táctico).
   - Asistente conversacional interactivo.

---

### 4. 🛠️ Stack Tecnológico
- **React 19 + TypeScript**
- **Vite 6** + `@tailwindcss/vite` (Tailwind CSS v4)
- **Framer Motion**: Animaciones fluidas, modales y layout transitions
- **Canvas Confetti**: Celebración táctil de metas de ahorro
- **Lucide React**: Iconografía moderna
- **Persistencia en `localStorage`**: Todos los datos, transacciones y mensajes persisten al recargar.
- **Marco de teléfono interactivo**: Simula un iPhone 15/16 Pro con barra de estado iOS y toggle para pantalla completa.

---

### 5. 💻 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar compilación
npm run preview
```
