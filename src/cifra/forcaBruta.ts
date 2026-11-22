/**
 * Quebra da Cifra de Cesar por forca bruta.
 *
 * O espaco de chaves tem apenas 26 possibilidades, entao geramos todas e
 * escolhemos a mais provavel de ser portugues. A pontuacao combina tres
 * sinais, em ordem de confiabilidade:
 *
 *   1. Cobertura de dicionario: fracao das letras que pertencem a palavras
 *      reconhecidas do portugues. E o sinal mais forte e, por isso, domina.
 *   2. Bigramas comuns: fracao dos pares de letras que sao frequentes em
 *      portugues. Ajuda quando o texto nao tem palavras do dicionario.
 *   3. Qui-quadrado de frequencia de letras: mede o quanto a distribuicao de
 *      letras do candidato se afasta da do portugues (menor e melhor).
 *      Serve como critério de desempate.
 */

import { gerarTodosOsDeslocamentos } from './cesar.js';
import {
  BIGRAMAS_PORTUGUES,
  FREQUENCIA_PORTUGUES,
  PALAVRAS_PORTUGUES,
} from './portugues.js';

/** Pesos de cada sinal na pontuacao final. */
const PESO_DICIONARIO = 1000;
const PESO_BIGRAMAS = 50;
const PESO_QUI_QUADRADO = 1;

export interface Candidato {
  deslocamento: number;
  texto: string;
  pontuacao: number;
}

export interface ResultadoForcaBruta {
  /** Texto claro mais provavel. */
  textoClaro: string;
  /** Deslocamento que produziu o texto claro mais provavel. */
  deslocamento: number;
  /** Os 26 candidatos, ordenados do mais provavel para o menos provavel. */
  candidatos: Candidato[];
}

/** Extrai apenas as letras a-z de um texto, em caixa baixa. */
function somenteLetras(texto: string): string {
  return texto.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Fracao das letras do texto que pertencem a palavras reconhecidas.
 * Palavras maiores pesam mais, pois casar "mensagem" por acidente e muito
 * menos provavel do que casar "a".
 */
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

/** Fracao dos bigramas do texto que sao comuns em portugues. */
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

/**
 * Qui-quadrado entre a distribuicao de letras observada e a esperada para o
 * portugues. Quanto menor, mais parecido com portugues.
 */
function quiQuadrado(letras: string): number {
  if (letras.length === 0) return Number.POSITIVE_INFINITY;

  const observado = new Map<string, number>();
  for (const letra of letras) {
    observado.set(letra, (observado.get(letra) ?? 0) + 1);
  }

  let total = 0;
  for (const [letra, esperadoPercentual] of Object.entries(FREQUENCIA_PORTUGUES)) {
    // Piso para evitar divisao por zero nas letras raras (k, w, y).
    const esperado = Math.max((esperadoPercentual / 100) * letras.length, 0.1);
    const contagem = observado.get(letra) ?? 0;
    const diferenca = contagem - esperado;
    total += (diferenca * diferenca) / esperado;
  }

  return total;
}

/** Pontua um texto candidato: quanto maior, mais provavel ser portugues. */
export function pontuarPortugues(texto: string): number {
  const letras = somenteLetras(texto);
  if (letras.length === 0) return Number.NEGATIVE_INFINITY;

  return (
    PESO_DICIONARIO * coberturaDicionario(texto) +
    PESO_BIGRAMAS * proporcaoBigramas(letras) -
    PESO_QUI_QUADRADO * quiQuadrado(letras)
  );
}

/**
 * Testa os 26 deslocamentos possiveis e retorna o candidato mais provavel de
 * ser um texto em portugues, junto com a lista completa ordenada.
 */
export function decifrarPorForcaBruta(textoCifrado: string): ResultadoForcaBruta {
  const candidatos: Candidato[] = gerarTodosOsDeslocamentos(textoCifrado)
    .map(({ deslocamento, texto }) => ({
      deslocamento,
      texto,
      pontuacao: pontuarPortugues(texto),
    }))
    .sort((a, b) => b.pontuacao - a.pontuacao);

  // gerarTodosOsDeslocamentos sempre devolve 26 itens, logo o indice 0 existe.
  const melhor = candidatos[0]!;

  return {
    textoClaro: melhor.texto,
    deslocamento: melhor.deslocamento,
    candidatos,
  };
}
