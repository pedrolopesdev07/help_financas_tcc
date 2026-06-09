/* MARKER-MAKE-KIT-INVOKED */
import { useEffect, useState } from "react";
import "../styles/fonts.css";
import { AuthScreen } from "./components/AuthScreen";
import { OnboardingScreen, type OnboardingData } from "./components/OnboardingScreen";
import { AppLayout } from "./components/AppLayout";
import { Dashboard } from "./components/Dashboard";
import { Transactions, type Transaction } from "./components/Transactions";
import { Goals, type Goal } from "./components/Goals";
import { Reports } from "./components/Reports";
import { Education } from "./components/Education";
import { SettingsScreen } from "./components/SettingsScreen";
import * as api from "./api";

type AppState = "auth" | "onboarding" | "app";

const defaultUserData: OnboardingData = {
  name: "",
  income: "",
  goal: "reserve",
  profile: "balanced",
  strategy: "50-30-20",
};

const CATEGORY_NAME_TO_ALIAS: Record<string, string> = {
  "Alimentação": "alimentacao",
  "Moradia": "moradia",
  "Transporte": "transporte",
  "Lazer": "lazer",
  "Compras": "compras",
  "Energia/Água": "energia",
  "Celular/Internet": "celular",
  "Salário": "salario",
  "Freelance": "freelance",
  "Investimento": "investimento",
  "Outros": "outros",
};

const mapTransaction = (item: any): Transaction => ({
  id: item.id,
  type: item.tipo,
  amount: Number(item.valor),
  category: CATEGORY_NAME_TO_ALIAS[item.categoria?.nome] ?? item.categoria?.nome ?? "outros",
  description: item.descricao ?? "",
  date: new Date(item.data).toISOString().split("T")[0],
  recurrence: item.recorrencia === "nenhuma" ? "unica" : item.recorrencia as Transaction["recurrence"]
});

const mapGoal = (item: any): Goal => ({
  id: item.id,
  name: item.nome,
  emoji: item.nome.toLowerCase().includes("reserva") ? "🛡️" : "🎯",
  target: Number(item.valor_total),
  current: Number(item.valor_atual),
  deadline: new Date(item.data_limite).toISOString().split("T")[0],
  color: item.nome.toLowerCase().includes("reserva") ? "bg-primary" : "bg-accent"
});

const goalLabelMap: Record<string, string> = {
  reserve: "Reserva de Emergência",
  debts: "Quitar Dívidas",
  invest: "Investimento",
  goals: "Objetivo Pessoal",
};

const profileLabelMap: Record<string, string> = {
  overspend: "Gasto mais do que ganho",
  balanced: "Sou equilibrado",
  saver: "Poupo regularmente",
};

export default function App() {
  const [appState, setAppState] = useState<AppState>("auth");
  const [activePage, setActivePage] = useState("dashboard");
  const [userData, setUserData] = useState<OnboardingData>(defaultUserData);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [openNewTransaction, setOpenNewTransaction] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    const response = await api.fetchTransactions();
    if (Array.isArray(response)) {
      setTransactions(response.map(mapTransaction));
    }
  };

  const loadGoals = async () => {
    const response = await api.fetchGoals();
    if (Array.isArray(response)) {
      setGoals(response.map(mapGoal));
    }
  };

  const loadSession = async () => {
    setLoading(true);
    try {
      const me = await api.getMe();
      const reverseGoalLabelMap: Record<string, string> = {
        "Quitar Dívidas": "debts",
        "Reserva de Emergência": "reserve",
        "Investimento": "invest",
        "Objetivo Pessoal": "goals",
      };

      const reverseProfileLabelMap: Record<string, string> = {
        "Gasto mais do que ganho": "overspend",
        "Sou equilibrado": "balanced",
        "Poupo regularmente": "saver",
      };

      setUserData({
        name: me.nome || "",
        income: me.renda_mensal ? `R$ ${Number(me.renda_mensal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "",
        goal: reverseGoalLabelMap[me.perfis_financeiros?.objetivo_principal ?? ""] ?? "reserve",
        profile: reverseProfileLabelMap[me.perfis_financeiros?.perfil_consumidor ?? ""] ?? "balanced",
        strategy: me.perfis_financeiros?.config_estrategia?.strategy || me.estrategia_financeira || "50-30-20",
      });
      setAppState(me.onboarding_concluido ? "app" : "onboarding");
      await Promise.all([loadTransactions(), loadGoals()]);
    } catch (error) {
      api.clearTokens();
      setAppState("auth");
      setTransactions([]);
      setGoals([]);
      setUserData(defaultUserData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("helpfinance_accessToken");
    if (accessToken) {
      void loadSession();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthSubmit = async (mode: "login" | "signup", data: { name: string; email: string; password: string }) => {
    try {
      if (mode === "signup") {
        await api.register(data.name, data.email, data.password);
      }

      const result = await api.login(data.email, data.password);
      api.saveTokens(result.accessToken, result.refreshToken);
      await loadSession();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro de autenticação.";
      throw new Error(message);
    }
  };

  const handleLogout = async () => {
    const refreshToken = api.getRefreshToken();
    try {
      if (refreshToken) await api.logout(refreshToken);
    } catch (error) {
      // ignore logout errors and clear session anyway
    }
    api.clearTokens();
    setAppState("auth");
    setActivePage("dashboard");
    setUserData(defaultUserData);
    setTransactions([]);
    setGoals([]);
  };

  const handleNewTransaction = () => {
    setActivePage("transactions");
    setOpenNewTransaction(true);
    setTimeout(() => setOpenNewTransaction(false), 100);
  };

  const handleOnboardingComplete = async (data: OnboardingData) => {
    const payload = {
      objetivo_principal: goalLabelMap[data.goal] ?? data.goal,
      perfil_consumidor: profileLabelMap[data.profile] ?? data.profile,
      dependentes: 0,
      config_estrategia: { strategy: data.strategy }
    };

    await api.onboarding(payload);
    setUserData(data);
    setAppState("app");
    await Promise.all([loadTransactions(), loadGoals()]);
  };

  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      const response = await api.createTransaction({
        tipo: transaction.type,
        valor: transaction.amount,
        descricao: transaction.description,
        data: transaction.date,
        categoria_key: transaction.category,
        recorrencia: transaction.recurrence,
      });
      const created = mapTransaction(response.transacao ?? response);
      setTransactions(prev => [created, ...prev]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddGoal = async (goal: Goal) => {
    try {
      const response = await api.createGoal({
        nome: goal.name,
        tipo_meta: "objetivo_compra",
        valor_total: goal.target,
        valor_atual: goal.current,
        data_limite: goal.deadline,
      });
      setGoals(prev => [mapGoal(response), ...prev]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateGoal = async (id: string, amount: number) => {
    const existing = goals.find(goal => goal.id === id);
    if (!existing) return;

    try {
      const response = await api.updateGoal(id, { valor_atual: existing.current + amount });
      setGoals(prev => prev.map(goal => (goal.id === id ? mapGoal(response) : goal)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      setGoals(prev => prev.filter(goal => goal.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateUser = async (data: Partial<OnboardingData>) => {
    try {
      const payload: any = {};
      if (data.name) payload.nome = data.name;
      if (data.income) {
        const cleaned = Number(data.income.replace(/[^0-9]/g, ""));
        if (cleaned > 0) {
          payload.renda_mensal = cleaned / 100;
        }
      }
      if (Object.keys(payload).length > 0) {
        await api.updateMe(payload);
      }
      setUserData(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteMe();
    } catch (error) {
      console.error(error);
    }
    handleLogout();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (appState === "auth") {
    return <AuthScreen onSubmit={handleAuthSubmit} />;
  }

  if (appState === "onboarding") {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard userData={userData} transactions={transactions} onNewTransaction={handleNewTransaction} onNavigate={setActivePage} />;
      case "transactions":
        return <Transactions transactions={transactions} onAdd={handleAddTransaction} onDelete={handleDeleteTransaction} initialOpenForm={openNewTransaction} />;
      case "goals":
        return <Goals goals={goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} transactions={transactions} />;
      case "reports":
        return <Reports transactions={transactions} />;
      case "education":
        return <Education transactions={transactions} />;
      case "settings":
        return <SettingsScreen userData={userData} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout activePage={activePage} onNavigate={setActivePage} userData={userData} onLogout={handleLogout}>
      {renderPage()}
    </AppLayout>
  );
}
