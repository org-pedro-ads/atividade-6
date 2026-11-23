import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import express, { type NextFunction, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse as parseYaml } from 'yaml';
import { ZodError } from 'zod';

import { cifrar, decifrar, normalizarDeslocamento } from './cifra/cesar.js';
import { decifrarPorForcaBruta } from './cifra/forcaBruta.js';
import { cifrarSchema, decifrarForcaBrutaSchema, decifrarSchema } from './schemas.js';

const diretorioAtual = dirname(fileURLToPath(import.meta.url));
const caminhoEspecificacao = resolve(diretorioAtual, '..', 'openapi.yaml');

function requisicaoInvalida(res: Response, mensagens: string[]): void {
  res.status(400).json({ erro: 'Requisicao invalida', detalhes: mensagens });
}

export function criarApp() {
  const app = express();

  app.use(express.json({ limit: '64kb' }));

  const especificacao = parseYaml(readFileSync(caminhoEspecificacao, 'utf8'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(especificacao as never));

  app.get('/openapi.yaml', (_req, res) => {
    res.type('text/yaml').send(readFileSync(caminhoEspecificacao, 'utf8'));
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/', (_req, res) => {
    res.json({
      nome: 'API de Cifra de Cesar',
      documentacao: '/docs',
      endpoints: ['POST /cifrar', 'POST /decifrar', 'POST /decifrarForcaBruta'],
    });
  });

  app.post('/cifrar', (req, res) => {
    const resultado = cifrarSchema.safeParse(req.body);
    if (!resultado.success) {
      return requisicaoInvalida(res, resultado.error.issues.map((i) => i.message));
    }

    const { textoClaro, deslocamento } = resultado.data;
    return res.status(200).json({ textoCifrado: cifrar(textoClaro, deslocamento) });
  });

  app.post('/decifrar', (req, res) => {
    const resultado = decifrarSchema.safeParse(req.body);
    if (!resultado.success) {
      return requisicaoInvalida(res, resultado.error.issues.map((i) => i.message));
    }

    const { textoCifrado, deslocamento } = resultado.data;
    return res.status(200).json({ textoClaro: decifrar(textoCifrado, deslocamento) });
  });

  app.post('/decifrarForcaBruta', (req, res) => {
    const resultado = decifrarForcaBrutaSchema.safeParse(req.body);
    if (!resultado.success) {
      return requisicaoInvalida(res, resultado.error.issues.map((i) => i.message));
    }

    const analise = decifrarPorForcaBruta(resultado.data.textoCifrado);

    if (req.query.detalhado === 'true') {
      return res.status(200).json({
        textoClaro: analise.textoClaro,
        deslocamento: normalizarDeslocamento(analise.deslocamento),
        candidatos: analise.candidatos.map(({ deslocamento, texto, pontuacao }) => ({
          deslocamento,
          texto,
          pontuacao: Number(pontuacao.toFixed(2)),
        })),
      });
    }

    return res.status(200).json({ textoClaro: analise.textoClaro });
  });

  app.use((_req, res) => {
    res.status(404).json({ erro: 'Endpoint nao encontrado', documentacao: '/docs' });
  });

  app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (erro instanceof ZodError) {
      return requisicaoInvalida(res, erro.issues.map((i) => i.message));
    }
    if (erro instanceof SyntaxError && 'body' in erro) {
      return requisicaoInvalida(res, ['O corpo da requisicao nao e um JSON valido.']);
    }

    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  });

  return app;
}
