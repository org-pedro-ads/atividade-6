import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cifrar, decifrar, normalizarDeslocamento } from './cesar.js';
import { decifrarPorForcaBruta } from './forcaBruta.js';

test('cifra o exemplo oficial da especificacao', () => {
  assert.equal(cifrar('ola mundo', 3), 'rod pxqgr');
});

test('decifra o exemplo oficial da especificacao', () => {
  assert.equal(decifrar('rod pxqgr', 3), 'ola mundo');
});

test('preserva espacos, pontuacao e digitos', () => {
  assert.equal(cifrar('abc, xyz! 123', 3), 'def, abc! 123');
});

test('da a volta no fim do alfabeto', () => {
  assert.equal(cifrar('xyz', 3), 'abc');
  assert.equal(decifrar('abc', 3), 'xyz');
});

test('preserva a caixa das letras', () => {
  assert.equal(cifrar('Ola Mundo', 3), 'Rod Pxqgr');
  assert.equal(decifrar('Rod Pxqgr', 3), 'Ola Mundo');
});

test('deslocamento 0 e deslocamento 26 nao alteram o texto', () => {
  assert.equal(cifrar('ola mundo', 0), 'ola mundo');
  assert.equal(cifrar('ola mundo', 26), 'ola mundo');
});

test('aceita deslocamentos negativos e maiores que 26', () => {
  assert.equal(cifrar('ola mundo', 29), 'rod pxqgr');
  assert.equal(cifrar('ola mundo', -23), 'rod pxqgr');
  assert.equal(normalizarDeslocamento(-3), 23);
});

test('decifrar e o inverso de cifrar para todo deslocamento', () => {
  const original = 'a seguranca da informacao protege os dados do sistema';
  for (let deslocamento = 0; deslocamento < 26; deslocamento += 1) {
    assert.equal(decifrar(cifrar(original, deslocamento), deslocamento), original);
  }
});

test('forca bruta recupera o exemplo oficial', () => {
  const resultado = decifrarPorForcaBruta('rod pxqgr');
  assert.equal(resultado.textoClaro, 'ola mundo');
  assert.equal(resultado.deslocamento, 3);
});

test('forca bruta retorna sempre os 26 candidatos ordenados', () => {
  const resultado = decifrarPorForcaBruta('rod pxqgr');
  assert.equal(resultado.candidatos.length, 26);
  for (let i = 1; i < resultado.candidatos.length; i += 1) {
    assert.ok(resultado.candidatos[i - 1]!.pontuacao >= resultado.candidatos[i]!.pontuacao);
  }
});

test('forca bruta acerta frases em portugues para qualquer deslocamento', () => {
  const frases = [
    'a seguranca da informacao protege os dados',
    'ola mundo',
    'este e um trabalho da escola sobre criptografia',
    'nao sabemos qual foi o deslocamento usado na mensagem',
    'o professor vai enviar requests para testar a api',
  ];

  for (const frase of frases) {
    for (let deslocamento = 1; deslocamento < 26; deslocamento += 1) {
      const resultado = decifrarPorForcaBruta(cifrar(frase, deslocamento));
      assert.equal(
        resultado.textoClaro,
        frase,
        `falhou para "${frase}" com deslocamento ${deslocamento}`,
      );
    }
  }
});
