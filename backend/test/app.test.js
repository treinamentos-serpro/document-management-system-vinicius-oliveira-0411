const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('a documentação OpenAPI e a interface Swagger são servidas', async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const docsResponse = await fetch(`${baseUrl}/api-docs/`);
    assert.strictEqual(docsResponse.status, 200);
    assert.match(await docsResponse.text(), /swagger-ui/);

    const specResponse = await fetch(`${baseUrl}/openapi.yaml`);
    assert.strictEqual(specResponse.status, 200);
    const spec = await specResponse.text();
    assert.match(spec, /^openapi: 3\.0\.3/m);
    assert.match(spec, /\/documents\/\{id\}\/download:/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
