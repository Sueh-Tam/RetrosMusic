# Regra de Gestão e Consulta de Tarefas (AgenteDeTarefas)

Esta regra orienta o fluxo de trabalho do Agente com o painel Kanban e a API REST do **AgenteDeTarefas**.
O Agente utiliza esta integração para registrar entregas com testes guiados e consultar o estado geral das tarefas por categoria via API Key.

---

## 📌 1. Configuração do Projeto Atual

- **Nome do Projeto:** Projeto Rest musics (RetrosMusic)
- **ID do Projeto:** `21edcd45-681d-4568-9aaa-b5a8d6a2a314`
- **Chave de API:** `at_live_02f731ebd26661c2220a1ea789aa95f132932532dd7ee53c`
- **URL Base da API:** `http://localhost:3001`
- **Interface Kanban:** `http://localhost:5173`

As configurações ficam salvas no arquivo `.agents/agente_tarefas.json`.

---

## 🚀 2. Envio de Tarefas para o Kanban

Sempre que concluir o desenvolvimento de uma funcionalidade, correção ou refatoração:

1. **Registrar a tarefa no Kanban com instruções de teste detalhadas:**
   ```bash
   python E:\Projetos\AgenteDeTarefas\integrations\agent_client.py create-task \
     --api-key "at_live_02f731ebd26661c2220a1ea789aa95f132932532dd7ee53c" \
     --title "<TÍTULO DA ENTREGA>" \
     --description "<RESUMO DAS ALTERAÇÕES>" \
     --instructions "1. Acessar o app\n2. Testar ação X\n3. Validar resultado Y"
   ```

2. As instruções de teste devem ser passo a passo, claras e numeradas (1, 2, 3), permitindo ao revisor testar e aprovar ou reportar feedback facilmente no Kanban.

---

## 📊 3. Consulta Geral do Projeto e Categorias (API Key)

Quando solicitado ou para verificar o panorama do projeto:

- **Rota:** `GET /api/project` ou `GET /api/project/overview`
- **Autenticação:** Header `X-API-Key: <api_key>` ou Query Param `?api_key=<api_key>`
- **Via CLI:**
  ```bash
  python E:\Projetos\AgenteDeTarefas\integrations\agent_client.py get-project --api-key "at_live_02f731ebd26661c2220a1ea789aa95f132932532dd7ee53c"
  ```
- **Via cURL / HTTP:**
  ```bash
  curl "http://localhost:3001/api/project?api_key=at_live_02f731ebd26661c2220a1ea789aa95f132932532dd7ee53c"
  ```
- **Retorno:** Retorna metadados do projeto, totais por status (`stats`) e tarefas agrupadas por categoria (`categories.pendente`, `categories.em_teste`, `categories.finalizado`, `categories.erro`).

---

## 📂 4. Consulta de Categoria Específica

Para consultar apenas as tarefas de um status específico (por exemplo, tarefas com erro ou pendentes):

- **Rota:** `GET /api/project/category/:category`
  - Categorias válidas: `pendente`, `em_teste`, `finalizado`, `erro`
- **Via CLI:**
  ```bash
  # Consultar tarefas com erro:
  python E:\Projetos\AgenteDeTarefas\integrations\agent_client.py get-category --api-key "at_live_02f731ebd26661c2220a1ea789aa95f132932532dd7ee53c" --category erro

  # Consultar tarefas pendentes:
  python E:\Projetos\AgenteDeTarefas\integrations\agent_client.py get-category --api-key "at_live_02f731ebd26661c2220a1ea789aa95f132932532dd7ee53c" --category pendente
  ```
- **Via HTTP:**
  ```bash
  curl "http://localhost:3001/api/project/category/erro?api_key=at_live_02f731ebd26661c2220a1ea789aa95f132932532dd7ee53c"
  ```
