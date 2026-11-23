import { criarApp } from './app.js';

const porta = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

criarApp().listen(porta, host, () => {
  console.log(`API de Cifra de Cesar ouvindo em http://localhost:${porta}`);
  console.log(`Documentacao Swagger em http://localhost:${porta}/docs`);
});
