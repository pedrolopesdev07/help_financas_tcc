import { useState } from "react";
import { BookOpen, Clock, Trophy, Lock, ChevronRight, X, Star, CheckCircle } from "lucide-react";
import type { Transaction } from "./Transactions";

interface EducationProps {
  transactions: Transaction[];
}

const articles = [
  {
    id: "1",
    title: "O que é a Regra 50-30-20?",
    category: "Orçamento",
    emoji: "📊",
    readTime: "3 min",
    difficulty: "Iniciante",
    color: "bg-green-50 border-green-200",
    tag: "bg-green-100 text-green-700",
    content: `A Regra 50-30-20 é uma das estratégias de orçamento mais populares e eficazes. Criada pela senadora americana Elizabeth Warren, ela divide sua renda líquida em três categorias:\n\n**50% — Necessidades Essenciais**\nAluguel, alimentação, transporte, contas básicas, saúde. São gastos que você não pode eliminar.\n\n**30% — Desejos**\nLazer, restaurantes, streaming, roupas, hobbies. São importantes para sua qualidade de vida, mas podem ser reduzidos.\n\n**20% — Prioridades Financeiras**\nPoupança, investimentos, quitação de dívidas, metas. Este é o percentual que constrói seu futuro.\n\n**Como aplicar:**\n1. Calcule sua renda líquida mensal\n2. Multiplique pelos percentuais\n3. Acompanhe seus gastos por categoria\n4. Ajuste quando necessário`,
  },
  {
    id: "2",
    title: "Como sair das dívidas em 2026",
    category: "Dívidas",
    emoji: "💳",
    readTime: "5 min",
    difficulty: "Intermediário",
    color: "bg-red-50 border-red-200",
    tag: "bg-red-100 text-red-600",
    content: `Sair das dívidas exige disciplina e estratégia. Aqui estão os métodos mais eficazes:\n\n**Método Bola de Neve**\nPague as menores dívidas primeiro para ganhar motivação e liberar recursos progressivamente.\n\n**Método Avalanche**\nPague as dívidas com maior juros primeiro. Economiza mais dinheiro no longo prazo.\n\n**Passo a passo:**\n1. Liste todas as dívidas (valor, taxa de juros, prazo)\n2. Negocie taxas com os credores\n3. Crie um orçamento de emergência (R$ 500 a R$ 1.000)\n4. Use o método escolhido consistentemente\n5. Evite novas dívidas durante o processo\n\nLembre-se: cada real pago em dívida é um retorno garantido na taxa de juros.`,
  },
  {
    id: "3",
    title: "Reserva de Emergência: por onde começar",
    category: "Poupança",
    emoji: "🏦",
    readTime: "4 min",
    difficulty: "Iniciante",
    color: "bg-blue-50 border-blue-200",
    tag: "bg-blue-100 text-blue-700",
    content: `A reserva de emergência é a base da saúde financeira. Ela protege você de imprevistos sem precisar recorrer a dívidas.\n\n**Quanto guardar:**\n- Empregado CLT: 3 a 6 meses de despesas\n- Autônomo/Freelancer: 6 a 12 meses de despesas\n\n**Onde guardar:**\n- Tesouro Selic (seguro e rende mais que a poupança)\n- CDB com liquidez diária de bancos digitais\n- Conta remunerada (Nubank, Inter, etc.)\n\n**Como construir:**\n1. Calcule suas despesas mensais totais\n2. Defina a meta (ex: 6x as despesas)\n3. Reserve um valor fixo por mês\n4. Automatize a transferência no dia do pagamento\n5. Não use para gastos não-emergenciais`,
  },
  {
    id: "4",
    title: "Tesouro Direto para iniciantes",
    category: "Investimentos",
    emoji: "📈",
    readTime: "6 min",
    difficulty: "Intermediário",
    color: "bg-purple-50 border-purple-200",
    tag: "bg-purple-100 text-purple-700",
    content: `O Tesouro Direto é o investimento mais seguro do Brasil, pois é garantido pelo governo federal.\n\n**Tipos principais:**\n- **Tesouro Selic**: ideal para reserva de emergência. Acompanha a taxa Selic.\n- **Tesouro IPCA+**: protege da inflação. Ideal para longo prazo.\n- **Tesouro Prefixado**: você sabe exatamente quanto vai receber.\n\n**Como investir:**\n1. Abra conta em uma corretora (XP, Rico, Inter, etc.)\n2. Acesse o site do Tesouro Direto\n3. Escolha o título adequado ao seu objetivo\n4. Invista a partir de R$ 30,00\n\n**Dica:** Comece pelo Tesouro Selic e diversifique conforme ganha experiência.`,
  },
  {
    id: "5",
    title: "Juros compostos: o 8º maravilha",
    category: "Conceitos",
    emoji: "🧮",
    readTime: "3 min",
    difficulty: "Iniciante",
    color: "bg-yellow-50 border-yellow-200",
    tag: "bg-yellow-100 text-yellow-700",
    content: `Albert Einstein teria chamado os juros compostos de "a oitava maravilha do mundo". Mas o que são?\n\n**Juros simples vs. compostos:**\n- Simples: R$ 1.000 a 10% ao ano = sempre R$ 100/ano\n- Compostos: R$ 1.000 a 10% ao ano = R$ 100 no 1º, R$ 110 no 2º, R$ 121 no 3º...\n\n**Exemplo prático:**\nR$ 200/mês investidos a 1% ao mês:\n- Em 10 anos: ~R$ 46.000\n- Em 20 anos: ~R$ 197.000\n- Em 30 anos: ~R$ 700.000\n\n**A lição:** Comece cedo. O tempo é seu maior aliado quando se trata de juros compostos.`,
  },
  {
    id: "6",
    title: "Cartão de crédito: amigo ou inimigo?",
    category: "Dívidas",
    emoji: "💳",
    readTime: "4 min",
    difficulty: "Iniciante",
    color: "bg-orange-50 border-orange-200",
    tag: "bg-orange-100 text-orange-700",
    content: `O cartão de crédito pode ser uma ferramenta poderosa — ou uma armadilha perigosa. Depende do uso.\n\n**Vantagens quando usado corretamente:**\n- Cashback e pontos/milhas\n- Prazo de pagamento de até 40 dias\n- Proteção contra fraudes\n- Conveniência\n\n**Os perigos:**\n- Juros rotativos: podem chegar a 400% ao ano!\n- Facilidade de gastar além do orçamento\n- Parcelamentos que comprometem renda futura\n\n**Regras de ouro:**\n1. Nunca gaste mais do que pode pagar\n2. Pague SEMPRE o total, nunca o mínimo\n3. Limit = ferramenta, não renda extra\n4. Monitore os gastos semanalmente`,
  },
];

const badges = [
  { id: "first", emoji: "🌱", title: "Primeira Transação", desc: "Registrou sua primeira transação", condition: (txs: Transaction[]) => txs.length >= 1 },
  { id: "ten", emoji: "🔟", title: "10 Transações", desc: "10 transações registradas este mês", condition: (txs: Transaction[]) => txs.length >= 10 },
  { id: "twenty", emoji: "🏆", title: "20 Transações", desc: "20 transações! Você é consistente!", condition: (txs: Transaction[]) => txs.length >= 20 },
  { id: "income", emoji: "💰", title: "Primeira Receita", desc: "Registrou sua primeira receita", condition: (txs: Transaction[]) => txs.some(t => t.type === "receita") },
  { id: "saver", emoji: "🦸", title: "Poupador Iniciante", desc: "Manteve saldo positivo no mês", condition: (txs: Transaction[]) => {
    const now = new Date();
    const m = txs.filter(t => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const inc = m.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const exp = m.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    return inc > exp;
  }},
  { id: "categories", emoji: "🗂️", title: "Organizador", desc: "Usou 3+ categorias diferentes", condition: (txs: Transaction[]) => new Set(txs.map(t => t.category)).size >= 3 },
  { id: "streak", emoji: "🔥", title: "Na Sequência", desc: "Registrou transações em 3 dias seguidos", condition: (txs: Transaction[]) => txs.length >= 3 },
  { id: "fifty", emoji: "⭐", title: "50 Transações", desc: "Você é um mestre das finanças!", condition: (txs: Transaction[]) => txs.length >= 50 },
];

export function Education({ transactions }: EducationProps) {
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());

  const unlockedBadges = badges.filter(b => b.condition(transactions));
  const lockedBadges = badges.filter(b => !b.condition(transactions));

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Hub de Educação</h1>
        <p className="text-sm text-muted-foreground">Aprenda e evolua sua vida financeira</p>
      </div>

      {/* Badges section */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            <h2 className="font-semibold text-foreground">Minhas Conquistas</h2>
          </div>
          <span className="text-sm text-muted-foreground">{unlockedBadges.length}/{badges.length} desbloqueadas</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {badges.map(badge => {
            const unlocked = unlockedBadges.some(b => b.id === badge.id);
            return (
              <div key={badge.id} title={`${badge.title}: ${badge.desc}`} className={`flex flex-col items-center gap-1 cursor-help`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${unlocked ? "bg-yellow-50 border-2 border-yellow-300 shadow-sm" : "bg-muted border-2 border-border grayscale opacity-40"}`}>
                  {unlocked ? badge.emoji : <Lock size={16} className="text-muted-foreground" />}
                </div>
                <span className="text-[9px] text-center text-muted-foreground leading-tight line-clamp-2">{badge.title}</span>
              </div>
            );
          })}
        </div>

        {unlockedBadges.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-yellow-500 fill-yellow-500 shrink-0" />
              <p className="text-xs text-yellow-700 font-medium">
                🎉 {unlockedBadges[unlockedBadges.length - 1].desc}! Continue assim!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Articles */}
      <div className="mb-4">
        <h2 className="font-semibold text-foreground mb-3">Artigos Educativos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {articles.map(article => (
            <button
              key={article.id}
              onClick={() => { setSelectedArticle(article); setReadArticles(prev => new Set([...prev, article.id])); }}
              className={`p-4 rounded-2xl border text-left transition-all hover:shadow-sm hover:-translate-y-0.5 duration-200 ${article.color} min-h-[44px]`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{article.emoji}</span>
                <div className="flex items-center gap-1.5">
                  {readArticles.has(article.id) && <CheckCircle size={14} className="text-green-500" />}
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1.5">{article.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${article.tag}`}>{article.category}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock size={10} />{article.readTime}
                </span>
                <span className={`text-[10px] text-muted-foreground`}>{article.difficulty}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Progresso de leitura</span>
          </div>
          <span className="text-xs text-muted-foreground">{readArticles.size}/{articles.length} artigos</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${(readArticles.size / articles.length) * 100}%` }} />
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedArticle.emoji}</span>
                <div>
                  <h2 className="font-bold text-foreground text-sm">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${selectedArticle.tag}`}>{selectedArticle.category}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} />{selectedArticle.readTime}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              <div className="prose prose-sm max-w-none text-foreground">
                {selectedArticle.content.split("\n\n").map((paragraph, i) => (
                  <div key={i} className="mb-4">
                    {paragraph.split("\n").map((line, j) => {
                      const isBold = line.startsWith("**") && line.includes("**:");
                      if (isBold) {
                        const [boldPart, ...rest] = line.split("**:");
                        return (
                          <p key={j} className="mb-1 text-sm">
                            <strong className="text-foreground">{boldPart.replace("**", "")}</strong>
                            {rest.length > 0 ? `: ${rest.join("**:")}` : ""}
                          </p>
                        );
                      }
                      return <p key={j} className="text-sm text-muted-foreground leading-relaxed mb-1">{line}</p>;
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle size={16} />
                  <span className="text-sm font-semibold">Artigo lido!</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Continue aprendendo — o conhecimento é o melhor investimento.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
