/**
 * Cifra de Cesar - nucleo do algoritmo.
 *
 * Alfabeto: as 26 letras de 'a' a 'z' (conforme a especificacao OpenAPI da
 * atividade). Caracteres fora desse alfabeto (espacos, pontuacao, digitos,
 * letras acentuadas) sao preservados na mesma posicao, de modo que a operacao
 * seja sempre reversivel e os espacos aparecam na resposta.
 */

export const TAMANHO_ALFABETO = 26;

const COD_A_MINUSCULO = 'a'.charCodeAt(0);
const COD_Z_MINUSCULO = 'z'.charCodeAt(0);
const COD_A_MAIUSCULO = 'A'.charCodeAt(0);
const COD_Z_MAIUSCULO = 'Z'.charCodeAt(0);

/**
 * Reduz qualquer deslocamento inteiro (negativo ou maior que 26) ao
 * intervalo [0, 25], que e o unico que importa para a cifra.
 */
export function normalizarDeslocamento(deslocamento: number): number {
  return ((deslocamento % TAMANHO_ALFABETO) + TAMANHO_ALFABETO) % TAMANHO_ALFABETO;
}

/**
 * Aplica um deslocamento ao texto, preservando a caixa das letras e todos os
 * caracteres que nao pertencem ao alfabeto a-z.
 */
function deslocar(texto: string, deslocamento: number): string {
  const passo = normalizarDeslocamento(deslocamento);
  if (passo === 0) return texto;

  let resultado = '';

  for (const caractere of texto) {
    const codigo = caractere.charCodeAt(0);

    if (codigo >= COD_A_MINUSCULO && codigo <= COD_Z_MINUSCULO) {
      const posicao = (codigo - COD_A_MINUSCULO + passo) % TAMANHO_ALFABETO;
      resultado += String.fromCharCode(COD_A_MINUSCULO + posicao);
    } else if (codigo >= COD_A_MAIUSCULO && codigo <= COD_Z_MAIUSCULO) {
      const posicao = (codigo - COD_A_MAIUSCULO + passo) % TAMANHO_ALFABETO;
      resultado += String.fromCharCode(COD_A_MAIUSCULO + posicao);
    } else {
      resultado += caractere;
    }
  }

  return resultado;
}

/** Cifra o texto claro deslocando cada letra para a frente no alfabeto. */
export function cifrar(textoClaro: string, deslocamento: number): string {
  return deslocar(textoClaro, deslocamento);
}

/** Decifra o texto cifrado deslocando cada letra para tras no alfabeto. */
export function decifrar(textoCifrado: string, deslocamento: number): string {
  return deslocar(textoCifrado, -deslocamento);
}

/**
 * Gera os 26 textos candidatos (um por deslocamento possivel), base do
 * ataque de forca bruta.
 */
export function gerarTodosOsDeslocamentos(
  textoCifrado: string,
): Array<{ deslocamento: number; texto: string }> {
  const candidatos: Array<{ deslocamento: number; texto: string }> = [];

  for (let deslocamento = 0; deslocamento < TAMANHO_ALFABETO; deslocamento += 1) {
    candidatos.push({ deslocamento, texto: decifrar(textoCifrado, deslocamento) });
  }

  return candidatos;
}
