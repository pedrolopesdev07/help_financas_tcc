import { useState } from "react";
import { Plus, Target, X, Calendar, Wallet, Check, ChevronRight, Star, Shield } from "lucide-react";
import { formatBRL } from "./ui/formatters";
import type { Transaction } from "./Transactions";

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
}

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (g: Goal) => void;
  onUpdateGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
  transactions: Transaction[];
}

const goalTemplates = [
  { emoji: "🛡️", name: "Reserva de Emergência", color: "bg-primary" },
  { emoji: "✈️", name: "Viagem dos Sonhos", color: "bg-accent" },
  { emoji: "🏠", name: "Casa Própria", color: "bg-blue-500" },
  { emoji: "🚗", name: "Carro Novo", color: "bg-orange-500" },
  { emoji: "🎓", name: "Educação", color: "bg-indigo-500" },
  { emoji: "💰", name: "Investimentos", color: "bg-yellow-500" },
];

const colors = [
  { label: "Verde", value: "bg-primary" },
  { label: "Roxo", value: "bg-accent" },
  { label: "Azul", value: "bg-blue-500" },
  { label: "Laranja", value: "bg-orange-500" },
  { label: "Rosa", value: "bg-pink-500" },
];

const defaultForm = () => ({
  name: "",
  emoji: "🎯",
  target: "",
  current: "",
  deadline: "",
  color: "bg-primary",
});

export function Goals({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, transactions }: GoalsProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [depositGoal, setDepositGoal] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [activeStrategy, setActiveStrategy] = useState<"50-30-20" | "zero" | "80-20">("50-30-20");

  const totalExpenses = transactions
    .filter(t => t.type === "despesa")
    .reduce((s, t) => s + t.amount, 0);
  const emergencyTarget = totalExpenses * 6 || 18000;

  const hasEmergency = goals.some(g => g.name.toLowerCase().includes("reserva") || g.name.toLowerCase().includes("emergência"));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.target) return;
    onAddGoal({
      id: crypto.randomUUID(),
      name: form.name,
      emoji: form.emoji,
      target: parseFloat(form.target),
      current: parseFloat(form.current || "0"),
      deadline: form.deadline,
      color: form.color,
    });
    setForm(defaultForm());
    setShowForm(false);
  };

  const handleDeposit = (goalId: string) => {
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      onUpdateGoal(goalId, amount);
      setDepositGoal(null);
      setDepositAmount("");
    }
  };

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const strategies = [
    {
      id: "50-30-20" as const,
      label: "Regra 50-30-20",
      icon: "📊",
      description: "50% Essenciais · 30% Desejos · 20% Prioridades",
      active: activeStrategy === "50-30-20",
      visual: (
        <div className="flex h-4 rounded-full overflow-hidden mt-3 gap-0.5">
          <div className="bg-primary flex items-center justify-center" style={{ width: "50%" }}>
            <span className="text-[8px] text-white font-bold">50%</span>
          </div>
          <div className="bg-accent flex items-center justify-center" style={{ width: "30%" }}>
            <span className="text-[8px] text-white font-bold">30%</span>
          </div>
          <div className="bg-blue-400 flex items-center justify-center" style={{ width: "20%" }}>
            <span className="text-[8px] text-white font-bold">20%</span>
          </div>
        </div>
      ),
    },
    {
      id: "zero" as const,
      label: "Orçamento Base Zero",
      icon: "🎯",
      description: "Cada centavo tem um destino específico",
      active: activeStrategy === "zero",
      visual: (
        <div className="flex gap-1.5 mt-3">
          {["Aluguel", "Comida", "Lazer", "Meta"].map((env, i) => (
            <div key={env} className={`flex-1 rounded-lg p-1.5 border text-center ${i < 3 ? "border-muted bg-muted/50" : "border-primary/30 bg-primary/5"}`}>
              <div className="text-[8px] font-medium text-muted-foreground">{env}</div>
              <div className="text-[8px] text-muted-foreground">{i < 3 ? "✓" : "→"}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "80-20" as const,
      label: "Regra 80/20",
      icon: "⚡",
      description: "Poupe 20% primeiro, gaste os 80% restantes",
      active: activeStrategy === "80-20",
      visual: (
        <div className="flex h-4 rounded-full overflow-hidden mt-3 gap-0.5">
          <div className="bg-muted flex items-center justify-center" style={{ width: "80%" }}>
            <span className="text-[8px] text-muted-foreground font-bold">80% Livre</span>
          </div>
          <div className="bg-primary flex items-center justify-center" style={{ width: "20%" }}>
            <span className="text-[8px] text-white font-bold">20%</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Metas & Estratégias</h1>
          <p className="text-sm text-muted-foreground">{goals.length} metas ativas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-all min-h-[44px]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nova Meta</span>
        </button>
      </div>

      {/* Emergency fund suggestion */}
      {!hasEmergency && (
        <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl border border-primary/20 p-5 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-foreground text-sm">Reserva de Emergência</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Sugerido</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Especialistas recomendam guardar 6 meses de despesas. Seu alvo seria de {formatBRL(emergencyTarget)}.
              </p>
              <button
                onClick={() => {
                  setForm({ name: "Reserva de Emergência", emoji: "🛡️", target: String(emergencyTarget), current: "", deadline: "", color: "bg-primary" });
                  setShowForm(true);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Criar agora <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {goals.length === 0 ? (
          <div className="sm:col-span-2 bg-card rounded-2xl border border-border p-10 text-center">
            <Target size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Nenhuma meta criada ainda</p>
            <p className="text-xs text-muted-foreground mt-1">Defina seus objetivos financeiros e acompanhe o progresso.</p>
          </div>
        ) : (
          goals.map(goal => {
            const pct = Math.min((goal.current / goal.target) * 100, 100);
            const daysLeft = getDaysLeft(goal.deadline);
            const completed = pct >= 100;
            return (
              <div key={goal.id} className={`bg-card rounded-2xl border p-5 transition-all ${completed ? "border-green-200" : "border-border"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{goal.name}</p>
                      {daysLeft !== null && (
                        <p className={`text-xs ${daysLeft < 30 ? "text-orange-500" : "text-muted-foreground"}`}>
                          {daysLeft > 0 ? `${daysLeft} dias restantes` : "Prazo encerrado"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {completed && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                    <button onClick={() => onDeleteGoal(goal.id)} className="w-6 h-6 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold text-foreground">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${completed ? "bg-green-500" : goal.color || "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground text-sm">{formatBRL(goal.current)}</span> / {formatBRL(goal.target)}
                  </div>
                  <span className="text-xs text-muted-foreground">Falta {formatBRL(Math.max(0, goal.target - goal.current))}</span>
                </div>

                {!completed && (
                  depositGoal === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="R$ valor"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-input-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button onClick={() => handleDeposit(goal.id)} className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary/90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setDepositGoal(null)} className="px-3 py-2 bg-muted text-muted-foreground rounded-xl text-xs hover:bg-muted/80 transition-all min-h-[44px] flex items-center justify-center">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setDepositGoal(goal.id)} className="w-full py-2.5 rounded-xl border border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 transition-all min-h-[44px]">
                      + Depositar
                    </button>
                  )
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Strategy section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Estratégias de Orçamento</h2>
        <div className="space-y-3">
          {strategies.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStrategy(s.id)}
              className={`w-full p-4 rounded-2xl border text-left transition-all ${s.active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${s.active ? "text-primary" : "text-foreground"}`}>{s.label}</span>
                      {s.active && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">Ativa</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                </div>
                {s.active && <Check size={16} className="text-primary shrink-0" />}
              </div>
              {s.visual}
            </button>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold text-foreground">Nova Meta</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-4">
              {/* Templates */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Modelos rápidos</label>
                <div className="grid grid-cols-2 gap-2">
                  {goalTemplates.map(t => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, name: t.name, emoji: t.emoji, color: t.color }))}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all min-h-[44px] ${form.name === t.name ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted/30 text-foreground hover:border-primary/30"}`}
                    >
                      {t.emoji} {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nome da meta</label>
                <input
                  type="text"
                  placeholder="Ex: Viagem para Europa"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <Wallet size={14} className="inline mr-1" />Valor alvo (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={form.target}
                    onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Já economizei (R$)</label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={form.current}
                    onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  <Calendar size={14} className="inline mr-1" />Prazo
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cor</label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color: c.value }))}
                      className={`w-8 h-8 rounded-full ${c.value} transition-all ${form.color === c.value ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all min-h-[44px]"
              >
                Criar Meta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
