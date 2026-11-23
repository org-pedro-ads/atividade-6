import { z } from 'zod';

const TAMANHO_MAXIMO = 255;

const texto = (campo: string) =>
  z
    .string({
      required_error: `O campo "${campo}" e obrigatorio.`,
      invalid_type_error: `O campo "${campo}" deve ser uma string.`,
    })
    .max(TAMANHO_MAXIMO, `O campo "${campo}" deve ter no maximo ${TAMANHO_MAXIMO} caracteres.`);

const deslocamento = z.preprocess(
  (valor) => {
    if (typeof valor === 'string' && valor.trim() !== '' && Number.isInteger(Number(valor))) {
      return Number(valor);
    }
    return valor;
  },
  z
    .number({
      required_error: 'O campo "deslocamento" e obrigatorio.',
      invalid_type_error: 'O campo "deslocamento" deve ser um numero inteiro.',
    })
    .int('O campo "deslocamento" deve ser um numero inteiro.'),
);

export const cifrarSchema = z
  .object({
    textoClaro: texto('textoClaro'),
    deslocamento,
  })
  .strip();

export const decifrarSchema = z
  .object({
    textoCifrado: texto('textoCifrado'),
    deslocamento,
  })
  .strip();

export const decifrarForcaBrutaSchema = z
  .object({
    textoCifrado: texto('textoCifrado'),
  })
  .strip();

export type CifrarRequest = z.infer<typeof cifrarSchema>;
export type DecifrarRequest = z.infer<typeof decifrarSchema>;
export type DecifrarForcaBrutaRequest = z.infer<typeof decifrarForcaBrutaSchema>;
