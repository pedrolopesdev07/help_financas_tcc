import { useState } from "react";
import { User, Mail, Lock, Wallet, AlertTriangle, ChevronRight, Check, Shield, Bell, Eye, EyeOff, LogOut } from "lucide-react";
import type { OnboardingData } from "./OnboardingScreen";

interface SettingsProps {
  userData: OnboardingData;
  onUpdateUser: (data: Partial<OnboardingData>) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const incomeRanges = [
  "Até R$ 1.500",
  "R$ 1.500 a R$ 3.000",
  "R$ 3.000 a R$ 6.000",
  "R$ 6.000 a R$ 12.000",
  "Acima de R$ 12.000",
];

export function SettingsScreen({ userData, onUpdateUser, onLogout, onDeleteAccount }: SettingsProps) {
  const [name, setName] = useState(userData.name);
  const [income, setIncome] = useState(userData.income);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const handleSave = () => {
    onUpdateUser({ name, income });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggles = [
    { label: "Notificações de limite", desc: "Alertas quando atingir 80% de uma categoria", enabled: true },
    { label: "Dica diária", desc: "Receba uma dica financeira personalizada por dia", enabled: true },
    { label: "Relatório semanal", desc: "Resumo semanal dos seus gastos", enabled: false },
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Gerencie seu perfil e preferências</p>
      </div>

      {/* Profile section */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold">
            {name.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-foreground">{name || "Usuário"}</p>
            <p className="text-sm text-muted-foreground">Conta Help Finanças</p>
          </div>
        </div>

        <h2 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <User size={15} className="text-muted-foreground" /> Informações Pessoais
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Mail size={14} className="inline mr-1" />E-mail
            </label>
            <input
              type="email"
              defaultValue="usuario@helpfinancas.com.br"
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Lock size={14} className="inline mr-1" />Nova senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Digite para alterar..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 pr-10 py-3 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Wallet size={14} className="inline mr-1" />Renda Mensal Líquida
            </label>
            <div className="grid grid-cols-1 gap-2">
              {incomeRanges.map(range => (
                <button
                  key={range}
                  onClick={() => setIncome(range)}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-medium text-left transition-all min-h-[44px] ${income === range ? "border-primary bg-primary/5 text-primary" : "border-border bg-muted/30 text-foreground hover:border-primary/40"}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all min-h-[44px] flex items-center justify-center gap-2 ${saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"}`}
          >
            {saved ? <><Check size={16} /> Salvo!</> : "Salvar alterações"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <h2 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Bell size={15} className="text-muted-foreground" /> Notificações
        </h2>
        <div className="space-y-3">
          {toggles.map((toggle, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                <p className="text-xs text-muted-foreground">{toggle.desc}</p>
              </div>
              <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-all ${toggle.enabled ? "bg-primary" : "bg-muted"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${toggle.enabled ? "left-5.5" : "left-0.5"}`} style={{ left: toggle.enabled ? "22px" : "2px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & LGPD */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <h2 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
          <Shield size={15} className="text-muted-foreground" /> Privacidade & LGPD
        </h2>
        <div className="space-y-2">
          {[
            { label: "Política de Privacidade", icon: ChevronRight },
            { label: "Termos de Uso", icon: ChevronRight },
            { label: "Gerenciar cookies", icon: ChevronRight },
            { label: "Exportar meus dados", icon: ChevronRight },
          ].map(item => (
            <button key={item.label} className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-muted transition-all min-h-[44px] text-left">
              <span className="text-sm text-foreground">{item.label}</span>
              <item.icon size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Account actions */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-4">
        <h2 className="font-semibold text-foreground text-sm mb-4">Conta</h2>
        <div className="space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted transition-all min-h-[44px] text-left"
          >
            <LogOut size={16} className="text-muted-foreground" />
            <span className="text-sm text-foreground">Sair da conta</span>
          </button>

          <button
            onClick={() => setShowDelete(true)}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-red-50 transition-all min-h-[44px] text-left border border-transparent hover:border-red-200"
          >
            <AlertTriangle size={16} className="text-destructive" />
            <span className="text-sm text-destructive font-medium">Excluir conta e dados associados</span>
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-4">Help Finanças v1.0 · © 2026</p>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-foreground text-center mb-2">Excluir conta permanentemente</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Esta ação é <strong className="text-foreground">irreversível</strong>. Todos os seus dados, transações, metas e histórico serão deletados permanentemente.
            </p>
            <p className="text-sm font-medium text-foreground mb-2 text-center">Digite <strong>"EXCLUIR"</strong> para confirmar</p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="EXCLUIR"
              className="w-full px-4 py-3 rounded-xl bg-input-background border border-destructive/30 text-foreground text-center focus:outline-none focus:ring-2 focus:ring-destructive/40 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-all min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                onClick={() => { if (deleteConfirm === "EXCLUIR") onDeleteAccount(); }}
                disabled={deleteConfirm !== "EXCLUIR"}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all min-h-[44px] ${deleteConfirm === "EXCLUIR" ? "bg-destructive text-white hover:bg-destructive/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
              >
                Excluir tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
