# 🚀 Configuração do Sistema FG Vistos

Este guia irá te ajudar a configurar completamente o sistema FG Vistos em seu ambiente.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Editor de código (VS Code recomendado)
- Git instalado

## 🗄️ 1. Configuração do Supabase

### 1.1 Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Digite um nome para o projeto (ex: "fg-vistos-app")
6. Escolha uma senha forte para o banco
7. Escolha uma região próxima
8. Clique em "Create new project"

### 1.2 Configurar Banco de Dados

1. No painel do projeto, vá para "SQL Editor"
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase-setup.sql`
4. Clique em "Run" para executar o script
5. Aguarde a execução completa

### 1.3 Configurar Autenticação

1. No painel, vá para "Authentication" > "Settings"
2. Em "Site URL", adicione: `http://localhost:3000`
3. Em "Redirect URLs", adicione:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`
4. Clique em "Save"

### 1.4 Obter Credenciais

1. No painel, vá para "Settings" > "API"
2. Copie:
   - **Project URL** (ex: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 🖥️ 2. Configuração Local

### 2.1 Clone o Repositório

```bash
git clone <url-do-seu-repositorio>
cd fg-vistos-app
```

### 2.2 Instalar Dependências

```bash
npm install
```

### 2.3 Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

**Exemplo:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.4 Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 👥 3. Criar Usuários de Teste

### 3.1 Usuário Normal

1. Acesse `http://localhost:3000/auth/sign-up`
2. Crie uma conta com email e senha
3. Faça login
4. O sistema irá redirecionar para criar um perfil
5. Escolha o papel "user"

### 3.2 Usuário Funcionário

1. No painel do Supabase, vá para "Authentication" > "Users"
2. Clique em "Add user"
3. Digite email e senha
4. Clique em "Create user"
5. No SQL Editor, execute:

```sql
INSERT INTO profiles (id, role, email)
VALUES ('id-do-usuario-criado', 'funcionario', 'email@exemplo.com');
```

## 🔧 4. Configurações Adicionais

### 4.1 Configurar Email (Opcional)

1. No painel do Supabase, vá para "Authentication" > "Settings"
2. Em "SMTP Settings", configure seu servidor de email
3. Isso permitirá envio de emails de confirmação

### 4.2 Configurar Storage (Opcional)

1. No painel, vá para "Storage"
2. Crie um bucket chamado "documents"
3. Configure as políticas de acesso conforme necessário

## 🧪 5. Testando o Sistema

### 5.1 Teste de Usuário Normal

1. Faça login como usuário normal
2. Verifique se consegue acessar o dashboard
3. Teste a visualização de pedidos (vazios inicialmente)
4. Teste o acesso aos formulários

### 5.2 Teste de Funcionário

1. Faça login como funcionário
2. Verifique se consegue acessar todas as abas:
   - Pedidos
   - Candidatos
   - Planos
   - Formulários
3. Teste a criação de um plano
4. Teste a criação de um formulário

### 5.3 Teste de Fluxo Completo

1. Como funcionário, crie um plano
2. Crie um formulário para esse plano
3. Como usuário normal, faça login
4. Verifique se o formulário aparece disponível

## 🚨 6. Solução de Problemas

### 6.1 Erro de Conexão com Supabase

- Verifique se as variáveis de ambiente estão corretas
- Confirme se o projeto Supabase está ativo
- Verifique se não há bloqueios de firewall

### 6.2 Erro de Autenticação

- Verifique as configurações de URL no Supabase
- Confirme se as políticas RLS estão configuradas
- Verifique se o usuário tem um perfil criado

### 6.3 Erro de Banco de Dados

- Execute novamente o script SQL
- Verifique se todas as tabelas foram criadas
- Confirme se os índices foram criados

### 6.4 Erro de Build

- Limpe o cache: `npm run build -- --clean`
- Delete a pasta `.next` e `node_modules`
- Reinstale as dependências: `npm install`

## 📱 7. Personalizações

### 7.1 Alterar Cores e Tema

1. Edite `tailwind.config.ts`
2. Modifique as cores primárias e secundárias
3. Ajuste o tema escuro/claro

### 7.2 Adicionar Novos Campos

1. Modifique o script SQL para adicionar colunas
2. Atualize os componentes correspondentes
3. Ajuste as políticas RLS se necessário

### 7.3 Adicionar Novos Tipos de Visto

1. Insira novos registros na tabela `visa_types`
2. Crie planos correspondentes
3. Crie formulários específicos

## 🚀 8. Deploy

### 8.1 Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### 8.2 Outras Plataformas

- **Netlify**: Similar ao Vercel
- **Railway**: Para aplicações full-stack
- **DigitalOcean**: Para controle total

## 📞 9. Suporte

Se encontrar problemas:

1. **Verifique os logs** do console do navegador
2. **Consulte a documentação** do Supabase
3. **Abra uma issue** no repositório
4. **Entre em contato** com a equipe de desenvolvimento

## 🔄 10. Atualizações

Para manter o sistema atualizado:

1. **Pull regular** das mudanças: `git pull origin main`
2. **Atualizar dependências**: `npm update`
3. **Verificar compatibilidade** com novas versões
4. **Testar** todas as funcionalidades após atualizações

---

🎉 **Parabéns!** Seu sistema FG Vistos está configurado e funcionando!

Agora você pode começar a usar todas as funcionalidades e personalizar conforme suas necessidades.
