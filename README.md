# API de Cifra de César

API REST em TypeScript para **cifrar**, **decifrar** e **quebrar por força bruta** mensagens usando a Cifra de César, implementada conforme a especificação OpenAPI da disciplina de Segurança da Informação (IFSP).

Especificação de referência: <https://danielcugler.github.io/ifsp-seguranca-informacao/cifra-cesar-api-spec/>

## Integrantes do grupo

- Vitor Alves
- Davi Celso

## Requisitos

- [Node.js](https://nodejs.org) 20 ou superior (testado em 24)
- npm (já vem com o Node)

## Como executar a API

### 1. Instalar as dependências

```bash
npm install
```

### 2. Opção A — modo desenvolvimento (recarrega ao salvar)

```bash
npm run dev
```

### 2. Opção B — modo produção (compila e executa)

```bash
npm run build
npm start
```

A API sobe em **<http://localhost:3000>**. Para usar outra porta:

```bash
# Linux / macOS
PORT=8080 npm start

# Windows (PowerShell)
$env:PORT=8080; npm start
```

### 3. Documentação interativa (Swagger UI)

Com a API em execução, abra:

- **<http://localhost:3000/docs>** — Swagger UI, permite testar os endpoints pelo navegador
- <http://localhost:3000/openapi.yaml> — especificação OpenAPI em YAML

### 4. Rodar os testes automatizados

```bash
npm test
```

Cobrem o exemplo oficial da especificação, o "dá a volta" no fim do alfabeto, preservação de espaços/pontuação/caixa, deslocamentos negativos e maiores que 26, e a quebra por força bruta de várias frases em português nos 25 deslocamentos possíveis.

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/cifrar` | Cifra uma mensagem com o deslocamento informado |
| `POST` | `/decifrar` | Decifra uma mensagem com o deslocamento informado |
| `POST` | `/decifrarForcaBruta` | Descobre o texto claro sem saber o deslocamento |
| `GET` | `/health` | Verificação de disponibilidade |
| `GET` | `/docs` | Documentação Swagger UI |

### `POST /cifrar`

Requisição:

```json
{ "textoClaro": "ola mundo", "deslocamento": 3 }
```

Resposta `200`:

```json
{ "textoCifrado": "rod pxqgr" }
```

### `POST /decifrar`

Requisição:

```json
{ "textoCifrado": "rod pxqgr", "deslocamento": 3 }
```

Resposta `200`:

```json
{ "textoClaro": "ola mundo" }
```

### `POST /decifrarForcaBruta`

Requisição (sem deslocamento):

```json
{ "textoCifrado": "rod pxqgr" }
```

Resposta `200`:

```json
{ "textoClaro": "ola mundo" }
```

Opcionalmente, com `?detalhado=true` a resposta também traz o deslocamento descoberto e os 26 candidatos ordenados por pontuação:

```json
{
  "textoClaro": "ola mundo",
  "deslocamento": 3,
  "candidatos": [
    { "deslocamento": 3, "texto": "ola mundo", "pontuacao": 985.42 },
    { "deslocamento": 15, "texto": "czy bexdz", "pontuacao": -141.8 }
  ]
}
```

### Erros

Requisições inválidas retornam `400` com os detalhes:

```json
{
  "erro": "Requisicao invalida",
  "detalhes": ["O campo \"deslocamento\" e obrigatorio."]
}
```

## Exemplos com curl

```bash
# Cifrar
curl -X POST http://localhost:3000/cifrar \
  -H "Content-Type: application/json" \
  -d '{"textoClaro":"ola mundo","deslocamento":3}'

# Decifrar
curl -X POST http://localhost:3000/decifrar \
  -H "Content-Type: application/json" \
  -d '{"textoCifrado":"rod pxqgr","deslocamento":3}'

# Força bruta
curl -X POST http://localhost:3000/decifrarForcaBruta \
  -H "Content-Type: application/json" \
  -d '{"textoCifrado":"rod pxqgr"}'
```

No PowerShell do Windows, use `Invoke-RestMethod`:

```powershell
Invoke-RestMethod -Uri http://localhost:3000/cifrar -Method Post `
  -ContentType "application/json" `
  -Body '{"textoClaro":"ola mundo","deslocamento":3}'
```

## Decisões de implementação

- **Alfabeto.** A descrição da especificação lista o alfabeto como `... u, v, x, w, y, z` (com `x` e `w` invertidos), mas o próprio exemplo oficial da especificação (`"ola mundo"` + deslocamento 3 = `"rod pxqgr"`) só é válido com o alfabeto padrão, pois `u + 3 = x`. Portanto foi adotado o alfabeto padrão de 26 letras, `a` a `z`.
- **Espaços e demais caracteres.** Conforme a especificação ("os espaços devem aparecer nas respostas"), apenas as letras `a`–`z` são deslocadas. Espaços, pontuação, dígitos e letras acentuadas são preservados na mesma posição, o que mantém a operação totalmente reversível.
- **Caixa das letras.** É preservada: `A` cifra para `D`, `a` cifra para `d`.
- **Deslocamento.** Qualquer inteiro é aceito e reduzido ao intervalo `[0, 25]`, de modo que `29`, `3` e `-23` produzem o mesmo resultado.
- **Força bruta.** Os 26 deslocamentos são gerados e pontuados por um modelo do português que combina, em ordem de peso: (1) cobertura de um dicionário de palavras frequentes, com palavras longas pesando mais; (2) proporção de bigramas comuns; (3) qui-quadrado da frequência de letras, usado como desempate. O candidato de maior pontuação é retornado.
- **Validação.** Campos obrigatórios, tipos e o `maxLength` de 255 da especificação são validados com [Zod](https://zod.dev); qualquer violação retorna `400`.

## Estrutura do projeto

```
.
├── openapi.yaml              # Especificação OpenAPI servida pelo Swagger UI
├── render.yaml               # Configuração de deploy no Render
├── src
│   ├── app.ts                # Rotas, Swagger e tratamento de erros
│   ├── server.ts             # Ponto de entrada HTTP
│   ├── schemas.ts            # Validação das requisições (Zod)
│   └── cifra
│       ├── cesar.ts          # Algoritmo da Cifra de César
│       ├── forcaBruta.ts     # Quebra da cifra por força bruta
│       ├── portugues.ts      # Modelo estatístico do português
│       └── cesar.test.ts     # Testes automatizados
└── README.md
```

## Hospedagem

A API está preparada para deploy no [Render](https://render.com) através do arquivo `render.yaml`:

1. Faça o push do projeto para o GitHub.
2. No Render, escolha **New → Blueprint** e aponte para este repositório.
3. O Render usa `npm ci && npm run build` para construir e `npm start` para executar, lendo a porta da variável de ambiente `PORT`.

Observação sobre o plano gratuito do Render: o serviço hiberna após cerca de 15 minutos sem requisições, e a primeira requisição seguinte pode levar até ~50 segundos para responder. Vale "acordar" a API chamando `/health` antes dos testes do professor.

## Gerar o pacote de entrega (.zip)

O script abaixo empacota apenas os arquivos versionados no Git, garantindo que **`node_modules/` e os compilados em `dist/` não sejam enviados**:

```bash
npm run zip
```

O arquivo `atividade-6.zip` é criado na raiz do projeto.
