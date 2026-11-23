import { gerarTodosOsDeslocamentos } from './cesar.js';
import {
  BIGRAMAS_PORTUGUES,
  FREQUENCIA_PORTUGUES,
  PALAVRAS_PORTUGUES,
} from './portugues.js';

const PESO_DICIONARIO = 1000;
const PESO_BIGRAMAS = 50;
const PESO_QUI_QUADRADO = 1;

export interface Candidato {
  deslocamento: number;
  texto: string;
  pontuacao: number;
}

export interface ResultadoForcaBruta {
  textoClaro: string;
  deslocamento: number;
  candidatos: Candidato[];
}

function somenteLetras(texto: string): string {
  return texto.toLowerCase().replace(/[^a-z]/g, '');
}

function coberturaDicionario(texto: string): number {
  const palavras = texto.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (palavras.length === 0) return 0;

  let pesoTotal = 0;
  let pesoReconhecido = 0;

  for (const palavra of palavras) {
    const peso = palavra.length * palavra.length;
    pesoTotal += peso;
    if (PALAVRAS_PORTUGUES.has(palavra)) {
      pesoReconhecido += peso;
    }
  }

  return pesoTotal === 0 ? 0 : pesoReconhecido / pesoTotal;
}

function proporcaoBigramas(letras: string): number {
  if (letras.length < 2) return 0;

  let comuns = 0;
  for (let i = 0; i < letras.length - 1; i += 1) {
    if (BIGRAMAS_PORTUGUES.has(letras.slice(i, i + 2))) {
      comuns += 1;
    }
  }

  return comuns / (letras.length - 1);
}

function quiQuadrado(letras: string): number {
  if (letras.length === 0) return Number.POSITIVE_INFINITY;

  const observado = new Map<string, number>();
  for (const letra of letras) {
    observado.set(letra, (observado.get(letra) ?? 0) + 1);
  }

  let total = 0;
  for (const [letra, esperadoPercentual] of Object.entries(FREQUENCIA_PORTUGUES)) {
    const esperado = Math.max((esperadoPercentual / 100) * letras.length, 0.1);
    const contagem = observado.get(letra) ?? 0;
    const diferenca = contagem - esperado;
    total += (diferenca * diferenca) / esperado;
  }

  return total;
}

export function pontuarPortugues(texto: string): number {
  const letras = somenteLetras(texto);
  if (letras.length === 0) return Number.NEGATIVE_INFINITY;

  return (
    PESO_DICIONARIO * coberturaDicionario(texto) +
    PESO_BIGRAMAS * proporcaoBigramas(letras) -
    PESO_QUI_QUADRADO * quiQuadrado(letras)
  );
}

export function decifrarPorForcaBruta(textoCifrado: string): ResultadoForcaBruta {
  const candidatos: Candidato[] = gerarTodosOsDeslocamentos(textoCifrado)
    .map(({ deslocamento, texto }) => ({
      deslocamento,
      texto,
      pontuacao: pontuarPortugues(texto),
    }))
    .sort((a, b) => b.pontuacao - a.pontuacao);

  const melhor = candidatos[0]!;

  return {
    textoClaro: melhor.texto,
    deslocamento: melhor.deslocamento,
    candidatos,
  };
}
