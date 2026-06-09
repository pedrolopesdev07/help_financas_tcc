import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, Plus, Bell, AlertTriangle, Lightbulb, Coffee, ShoppingBag, Car, Home, Zap, Smartphone, UtensilsCrossed, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatBRL } from "./ui/formatters";
import type { OnboardingData } from "./OnboardingScreen";
import type { Transaction } from "./Transactions";

interface DashboardProps {
  userData: OnboardingData;
  transactions: Transaction[];
  onNewTransaction: () => void;
  onNavigate: (page: string) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  alimentacao: <UtensilsCrossed size={16} />,
  moradia: <Home size={16} />,
  transporte: <Car size={16} />,
  lazer: <Coffee size={16} />,
  compras: <ShoppingBag size={16} />,
  energia: <Zap size={16} />,
  celular: <Smartphone size={16} />,
  outros: <Wallet size={16} />,
};

const categoryLabels: Record<string, string> = {
  alimentacao: "Alimentação",
  moradia: "Moradia",
  transporte: "Transporte",
  lazer: "Lazer",
  compras: "Compras",
  energia: "Energia/Água",
  celular: "Celular/Internet",
  outros: "Outros",
};

const categoryColors: Record<string, string> = {
  alimentacao: "#1a7f5a",
  moradia: "#7c3aed",
  transporte: "#f59e0b",
  lazer: "#3b82f6",
  compras: "#ec4899",
  energia: "#14b8a6",
  celular: "#f97316",
  outros: "#94a3b8",
};

function getHealthStatus(balance: number, income: number): { label: string; color: string; bg: string } {
  if (balance >= income * 0.2) return { label: "Saudável 💚", color: "text-green-700", bg: "bg-green-100" };
  if (balance >= 0) return { label: "Atenção ⚠️", color: "text-yellow-700", bg: "bg-yellow-100" };
  return { label: "Crítico 🔴", color: "text-red-700", bg: "bg-red-100" };
}

export function Dashboard({ userData, transactions, onNewTransaction, onNavigate }: DashboardProps) {
  const currentMonth = new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" });

  const now = new Date();
  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalIncome = monthTransactions.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthTransactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  // 50-30-20 calculations
  const incomeValue = (() => {
    const map: Record<string, number> = {
      "Até R$ 1.500": 1500,
      "R$ 1.500 a R$ 3.000": 2250,
      "R$ 3.000 a R$ 6.000": 4500,
      "R$ 6.000 a R$ 12.000": 9000,
      "Acima de R$ 12.000": 15000,
    };
    return map[userData.income] || 3000;
  })();

  const essential = incomeValue * 0.5;
  const desire = incomeValue * 0.3;
  const priority = incomeValue * 0.2;

  const expensesByType = (type: "essential" | "desire" | "priority") => {
    const essentialCats = ["moradia", "energia", "celular", "transporte", "alimentacao"];
    const desireCats = ["lazer", "compras"];
    const priorityCats = ["outros"];
    const filter = type === "essential" ? essentialCats : type === "desire" ? desireCats : priorityCats;
    return monthTransactions.filter(t => t.type === "despesa" && filter.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  };

  const essentialSpent = expensesByType("essential");
  const desireSpent = expensesByType("desire");
  const prioritySpent = expensesByType("priority");

  const getBarWidth = (spent: number, limit: number) => Math.min((spent / limit) * 100, 100);
  const getBarColor = (spent: number, limit: number) => {
    const pct = spent / limit;
    if (pct >= 1) return "bg-red-500";
    if (pct >= 0.8) return "bg-yellow-500";
    return "bg-primary";
  };

  // Pie chart data
  const catSpend = monthTransactions
    .filter(t => t.type === "despesa")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);
  const pieData = Object.entries(catSpend).map(([id, value]) => ({ id, name: categoryLabels[id] ?? id, value }));

  const strategyConfig: Record<string, { title: string; subtitle: string; items: Array<{ label: string; pct: string; spent: number; limit: number; color: string }> }> = {
    "50-30-20": {
      title: "Estratégia 50-30-20",
      subtitle: "Baseado na renda de",
      items: [
        { label: "Essenciais", pct: "50%", spent: essentialSpent, limit: essential, color: "bg-primary" },
        { label: "Desejos", pct: "30%", spent: desireSpent, limit: desire, color: "bg-accent" },
        { label: "Prioridades", pct: "20%", spent: prioritySpent, limit: priority, color: "bg-blue-500" },
      ],
    },
    "80-20": {
      title: "Estratégia 80-20",
      subtitle: "Baseado na renda de",
      items: [
        { label: "Gastos", pct: "80%", spent: totalExpenses, limit: incomeValue * 0.8, color: "bg-accent" },
        { label: "Poupança", pct: "20%", spent: Math.max(0, totalIncome - totalExpenses), limit: incomeValue * 0.2, color: "bg-blue-500" },
      ],
    },
    zero: {
      title: "Orçamento Base Zero",
      subtitle: "Baseado na renda de",
      items: [
        { label: "Planejamento", pct: "100%", spent: totalExpenses, limit: incomeValue, color: "bg-primary" },
      ],
    },
  };
  const strategy = strategyConfig[userData.strategy] ?? strategyConfig["50-30-20"];
  const health = getHealthStatus(balance, incomeValue);
  const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const tips = [
    { condition: desireSpent / desire >= 0.8, msg: `Você atingiu ${Math.round((desireSpent / desire) * 100)}% do limite de Desejos. Que tal poupar o restante?` },
    { condition: essentialSpent / essential >= 0.8, msg: `Seus gastos essenciais estão em ${Math.round((essentialSpent / essential) * 100)}%. Verifique despesas fixas.` },
    { condition: balance < 0, msg: "Suas despesas ultrapassaram a receita este mês. Revise seus gastos agora." },
    { condition: true, msg: "Dica: Anote cada gasto assim que acontecer. Pequenos hábitos fazem grande diferença!" },
  ];
  const activeTip = tips.find(t => t.condition)!;

  const strategyLabel = userData.strategy || "50-30-20";
  const balanceColor = balance >= 0 ? "text-emerald-500" : "text-red-500";
  const balanceBg = balance >= 0 ? "bg-emerald-100" : "bg-red-100";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm">Olá, {userData.name || "Usuário"} 👋</p>
          <h1 className="text-xl font-bold text-foreground capitalize">{currentMonth}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Bell size={18} />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
            {userData.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className={`sm:col-span-1 rounded-2xl p-5 ${balanceBg} border ${balance >= 0 ? "border-emerald-200" : "border-red-200"}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-foreground font-medium">Saldo Atual</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${health.bg} ${health.color}`}>{health.label}</span>
          </div>
          <div className={`text-2xl font-bold mb-1 ${balanceColor}`}>{formatBRL(balance)}</div>
          <div className="text-xs text-muted-foreground">Receitas − Despesas do mês</div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Receitas</span>
          </div>
          <div className="text-xl font-bold text-green-600">{formatBRL(totalIncome)}</div>
          <div className="text-xs text-muted-foreground mt-1">Mês atual</div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown size={16} className="text-red-500" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Despesas</span>
          </div>
          <div className="text-xl font-bold text-red-500">{formatBRL(totalExpenses)}</div>
          <div className="text-xs text-muted-foreground mt-1">Mês atual</div>
        </div>
      </div>

      {/* 50-30-20 Strategy */}
      <div className="bg-card rounded-2xl p-5 border border-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{strategy.title}</h3>
            <p className="text-xs text-muted-foreground">{strategy.subtitle} {formatBRL(incomeValue)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {strategy.items.map(item => {
            const barPct = getBarWidth(item.spent, item.limit);
            const barColor = getBarColor(item.spent, item.limit);
            const isOver = item.limit > 0 && item.spent >= item.limit;
            const isNear = item.limit > 0 && item.spent / item.limit >= 0.8 && !isOver;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.pct}</span>
                    {isOver && <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full"><AlertTriangle size={10} /> Excedeu</span>}
                    {isNear && <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full"><AlertTriangle size={10} /> 80%+</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatBRL(item.spent)} / {formatBRL(item.limit)}</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${barPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Donut chart */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-semibold text-foreground mb-4">Despesas por Categoria</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name">
                  {pieData.map((entry) => (
                    <Cell key={entry.id} fill={categoryColors[entry.id] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatBRL(value)} />
                <Legend formatter={(value) => value} iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <Wallet size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma despesa ainda.</p>
                <p className="text-xs text-muted-foreground">Adicione transações para ver o gráfico.</p>
              </div>
            </div>
          )}
        </div>

        {/* Tip of the day */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Dica do Dia 💡</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{activeTip.msg}</p>
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm">Últimas Transações</h3>
              <button onClick={() => onNavigate("transactions")} className="text-xs text-primary hover:underline">Ver todas</button>
            </div>
            {recent.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma transação registrada.</p>
            ) : (
              <div className="space-y-2">
                {recent.map(t => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t.type === "receita" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                      {t.type === "receita" ? <ArrowUpCircle size={16} /> : (categoryIcons[t.category] || <ArrowDownCircle size={16} />)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{t.description || t.category}</div>
                      <div className="text-[10px] text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <span className={`text-xs font-semibold ${t.type === "receita" ? "text-green-600" : "text-red-500"}`}>
                      {t.type === "receita" ? "+" : "-"}{formatBRL(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onNewTransaction}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-lg hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center z-40"
        aria-label="Nova Transação"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
