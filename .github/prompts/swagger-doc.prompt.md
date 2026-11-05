---
description: Cria documentação Swagger para todas as rotas de API.
name: gerar-doc
argument-hint: nome do recurso (ex. documents)
agent: agent
---

# Documentação Swagger para API

Atue como um especialista em arquitetura de APIs. Analise o código do arquivo ativo e crie a documentação técnica correspondente no formato Swagger OpenAPI 3.0 usando a sintaxe YAML.

Instruções específicas:
- Baseie-se estritamente nas rotas, métodos, parâmetros de entrada (query, path, body) e retornos definidos no código.
- Inclua as seções estruturais obrigatórias: `info`, `paths`, `responses` e `components/schemas`.
- Mapeie corretamente os tipos de dados (string, integer, object, array) e formatos (uuid, date-time, email).
- Adicione exemplos práticos (`example`) nos schemas de entrada e saída.
- Se o código indicar o uso de middlewares de autenticação (como JWT), configure a seção `security` e `securitySchemes` (Bearer Auth).

Gere apenas o bloco de código YAML válido, sem textos introdutórios ou explicações.