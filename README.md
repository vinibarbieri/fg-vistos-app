# FG Vistos - Sistema de Gerenciamento de Vistos

Sistema completo para gerenciamento de vistos e processos de imigração, desenvolvido com Next.js, TypeScript e Supabase.

## 🚀 Funcionalidades

### Para Usuários Clientes
- **Dashboard Personalizado**: Visualize seus pedidos e status
- **Formulários Inteligentes**: Preencha formulários baseados no seu plano
- **Acompanhamento**: Acompanhe o status dos seus pedidos de visto
- **Histórico**: Visualize histórico completo de solicitações

### Para Funcionários
- **Gestão Completa**: Gerencie pedidos, clientes, planos e formulários
- **Controle de Status**: Atualize status de pedidos e clientes
- **Criação de Formulários**: Crie formulários personalizados para cada plano
- **Gestão de Planos**: Crie, edite e gerencie planos de visto
- **Administração de clientes**: Adicione e gerencie clientes aos pedidos

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: Shadcn/ui
- **Estado**: React Hooks
- **Autenticação**: Supabase Auth

## 📁 Estrutura do Projeto

```
fg-vistos-app/
├── app/                    # App Router do Next.js
│   ├── api/               # APIs REST
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard principal
│   └── protected/         # Rotas protegidas
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI base
├── lib/                  # Utilitários e configurações
│   └── supabase/        # Cliente e configurações do Supabase
└── public/              # Arquivos estáticos
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd fg-vistos-app
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Execute o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 🔐 Sistema de Autenticação

O sistema utiliza Supabase Auth com dois tipos de usuários:

1. **Usuários Normais** (`role: 'user'`)
   - Acesso limitado ao próprio dashboard
   - Visualização de pedidos pessoais
   - Preenchimento de formulários

2. **Funcionários** (`role: 'employee'`)
   - Acesso completo ao sistema
   - Gestão de todos os pedidos
   - Administração de candidatos, planos e formulários

## 📱 Interface do Usuário

### Dashboard do Usuário
- Visualização de pedidos pessoais
- Status em tempo real
- Acesso a formulários baseados no plano
- Histórico de solicitações

### Dashboard do Funcionário
- **Aba Pedidos**: Gestão completa de pedidos
- **Aba Candidatos**: Administração de candidatos
- **Aba Planos**: Criação e edição de planos
- **Aba Formulários**: Gerenciamento de formulários


## 📞 Contato

Entre em contato através de:
- Email: [vinibarbieri.dev@gmail.com]
