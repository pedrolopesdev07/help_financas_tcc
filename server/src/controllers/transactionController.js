import prisma from '../models/prismaClient.js';
import { parsePositiveNumber } from '../utils/format.js';
import { calculateMonthlySummary } from '../services/transactionService.js';

function parseMonthYear(queryMonth, queryYear) {
  const now = new Date();
  const month = queryMonth ? Number(queryMonth) : now.getMonth() + 1;
  const year = queryYear ? Number(queryYear) : now.getFullYear();
  return { month, year };
}

export async function listTransactions(req, res) {
  const { month, year } = parseMonthYear(req.query.month, req.query.year);
  const filters = {
    usuario_id: req.userId,
    data: {
      gte: new Date(Date.UTC(year, month - 1, 1)),
      lt: new Date(Date.UTC(year, month, 1))
    }
  };

  if (req.query.tipo) filters.tipo = req.query.tipo;
  if (req.query.categoria_id) filters.categoria_id = req.query.categoria_id;

  const transacoes = await prisma.transacoes.findMany({
    where: filters,
    orderBy: { data: 'desc' },
    include: { categoria: true }
  });

  return res.json(transacoes);
}

export async function createTransaction(req, res) {
  const { tipo, valor, descricao, data, categoria_id, recorrencia } = req.body;
  const numericValor = parsePositiveNumber(valor);

  if (!['receita', 'despesa'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo deve ser receita ou despesa.' });
  }

  const created = await prisma.transacoes.create({
    data: {
      usuario_id: req.userId,
      tipo,
      valor: numericValor,
      descricao,
      data: new Date(data),
      categoria_id: categoria_id || null,
      recorrencia: recorrencia || 'nenhuma'
    }
  });

  const summary = await calculateMonthlySummary(req.userId, new Date(data).getMonth() + 1, new Date(data).getFullYear());
  return res.status(201).json({ transacao: created, resumo: summary });
}

export async function updateTransaction(req, res) {
  const { id } = req.params;
  const { tipo, valor, descricao, data, categoria_id, recorrencia } = req.body;

  const transaction = await prisma.transacoes.findFirst({ where: { id, usuario_id: req.userId } });
  if (!transaction) {
    return res.status(404).json({ error: 'Transação não encontrada.' });
  }

  const updates = {};
  if (tipo) {
    if (!['receita', 'despesa'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo deve ser receita ou despesa.' });
    }
    updates.tipo = tipo;
  }
  if (valor !== undefined) updates.valor = parsePositiveNumber(valor);
  if (descricao !== undefined) updates.descricao = descricao;
  if (data) updates.data = new Date(data);
  updates.categoria_id = categoria_id || null;
  if (recorrencia) updates.recorrencia = recorrencia;

  const updated = await prisma.transacoes.update({ where: { id }, data: updates });
  return res.json(updated);
}

export async function deleteTransaction(req, res) {
  const { id } = req.params;
  const transaction = await prisma.transacoes.findFirst({ where: { id, usuario_id: req.userId } });
  if (!transaction) {
    return res.status(404).json({ error: 'Transação não encontrada.' });
  }

  await prisma.transacoes.delete({ where: { id } });
  return res.status(204).send();
}

export async function getSummary(req, res) {
  const { month, year } = parseMonthYear(req.query.month, req.query.year);
  const summary = await calculateMonthlySummary(req.userId, month, year);
  return res.json(summary);
}
