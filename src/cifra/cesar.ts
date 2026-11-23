export const TAMANHO_ALFABETO = 26;

const COD_A_MINUSCULO = 'a'.charCodeAt(0);
const COD_Z_MINUSCULO = 'z'.charCodeAt(0);
const COD_A_MAIUSCULO = 'A'.charCodeAt(0);
const COD_Z_MAIUSCULO = 'Z'.charCodeAt(0);

export function normalizarDeslocamento(deslocamento: number): number {
  return ((deslocamento % TAMANHO_ALFABETO) + TAMANHO_ALFABETO) % TAMANHO_ALFABETO;
}

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

export function cifrar(textoClaro: string, deslocamento: number): string {
  return deslocar(textoClaro, deslocamento);
}

export function decifrar(textoCifrado: string, deslocamento: number): string {
  return deslocar(textoCifrado, -deslocamento);
}

export function gerarTodosOsDeslocamentos(
  textoCifrado: string,
): Array<{ deslocamento: number; texto: string }> {
  const candidatos: Array<{ deslocamento: number; texto: string }> = [];

  for (let deslocamento = 0; deslocamento < TAMANHO_ALFABETO; deslocamento += 1) {
    candidatos.push({ deslocamento, texto: decifrar(textoCifrado, deslocamento) });
  }

  return candidatos;
}
