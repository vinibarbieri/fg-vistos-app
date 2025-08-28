# Integração com Banco de Dados - FG Vistos App

## Resumo das Mudanças

A página estava completamente mockada e foi integrada com o banco de dados Supabase para buscar dados reais.

## Estrutura do Banco

### Tabelas Utilizadas

1. **`profiles`** - Perfis dos usuários
   - `id` - ID único do usuário
   - `name` - Nome do responsável
   - `email` - Email do responsável

2. **`applicants`** - Aplicantes dos processos de visto
   - `id` - ID único do aplicante
   - `resposible_user_id` - ID do usuário responsável (FK para profiles.id)
   - `order_id` - ID do pedido (FK para orders.id)
   - `name` - Nome do aplicante
   - `status` - Status geral do aplicante
   - `form_status` - Status do preenchimento do formulário
   - `created_at` - Data de criação
   - `updated_at` - Data de última atualização

## Funções Implementadas

### `lib/responsible.ts`

- **`getResponsibleData(userId)`** - Busca nome e email do responsável
- **`getResponsibleApplications(userId)`** - Busca todas as aplicações onde o usuário é responsável
- **`getApplicantData(applicantId)`** - Busca dados de um aplicante específico
- **`updateApplicantName(applicantId, newName)`** - Atualiza nome do aplicante
- **`updateApplicantFormStatus(applicantId, formStatus)`** - Atualiza status do formulário
- **`updateApplicantStatus(applicantId, status)`** - Atualiza status geral

### `lib/process.ts`

- **`getProcessStatus(userId)`** - Determina status geral do processo baseado nos aplicantes
- **`getProcessDetails(userId)`** - Busca informações detalhadas do processo
- **`getProcessStats(userId)`** - Busca estatísticas do processo

### `lib/hooks/useAuth.ts`

- **`useAuth()`** - Hook personalizado para obter dados de autenticação do usuário atual

## Como Funciona

### 1. Autenticação
- O hook `useAuth()` detecta automaticamente o usuário logado
- Fornece `userId` para todas as consultas ao banco

### 2. Dados do Responsável
- **Nome**: `profiles.name`
- **Email**: `profiles.email`

### 3. Status do Processo
- Calculado dinamicamente baseado no `applicants.status` de todos os aplicantes
- Lógica de prioridade: `approved` > `rejected` > `reviewing` > `submitted` > `in_progress` > `pending`

### 4. Minhas Aplicações de Visto
- Busca todos os `applicants` onde `resposible_user_id == profiles.id`
- **Nome**: `applicants.name`
- **Progresso do Form**: `applicants.form_status` mapeado para progresso numérico
- **Somente visualização**: Não permite adicionar novos aplicantes (gerenciamento feito por interface administrativa)

## Mapeamento de Status

### Form Status → Progresso
- `not_started` → 0%
- `in_progress` → 50%
- `completed` → 100%

### Process Status → Passos Completados
- `pending` → Passo 1 completo
- `in_progress` → Passos 1-2 completos
- `submitted` → Passos 1-3 completos
- `reviewing` → Passos 1-4 completos
- `completed` → Todos os passos completos

## Componentes Atualizados

### `app/protected/user/page.tsx`
- Integrado com `useAuth()` para obter ID do usuário
- Usa funções reais do banco em vez de dados mockados
- Atualiza passos do processo baseado no status real
- Converte `ApplicantT` para `Person` (interface esperada pelos componentes)

## Próximos Passos

1. **Implementar atualização de nome do responsável** no banco
2. **Implementar navegação para formulários** de cada aplicante
3. **Adicionar tratamento de erros** mais robusto
4. **Implementar cache** para melhorar performance
5. **Gerenciar aplicantes** através de interface administrativa separada

## Teste

Para testar a integração:

1. Certifique-se de que as variáveis de ambiente do Supabase estão configuradas
2. Faça login na aplicação
3. Navegue para `/protected/user`
4. Verifique se os dados são carregados do banco

## Estrutura de Dados Esperada

```sql
-- Exemplo de dados esperados
INSERT INTO profiles (id, name, email) VALUES 
('user-123', 'João Silva', 'joao@email.com');

INSERT INTO applicants (id, resposible_user_id, order_id, name, status, form_status) VALUES 
('app-1', 'user-123', 'order-1', 'Maria Silva', 'pending', 'not_started'),
('app-2', 'user-123', 'order-1', 'Pedro Silva', 'submitted', 'completed');
```
