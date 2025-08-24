# FG Vistos - Sistema de Gerenciamento de Vistos

Sistema completo para gerenciamento de vistos e processos de imigração, desenvolvido com Next.js, TypeScript e Supabase.

## 🚀 Funcionalidades

### Para Usuários Normais
- **Dashboard Personalizado**: Visualize seus pedidos e status
- **Formulários Inteligentes**: Preencha formulários baseados no seu plano
- **Acompanhamento**: Acompanhe o status dos seus pedidos de visto
- **Histórico**: Visualize histórico completo de solicitações

### Para Funcionários
- **Gestão Completa**: Gerencie pedidos, candidatos, planos e formulários
- **Controle de Status**: Atualize status de pedidos e candidatos
- **Criação de Formulários**: Crie formulários personalizados para cada plano
- **Gestão de Planos**: Crie, edite e gerencie planos de visto
- **Administração de Candidatos**: Adicione e gerencie candidatos aos pedidos

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
│   ├── auth-guard.tsx    # Guarda de autenticação
│   ├── dashboard-nav.tsx # Navegação do dashboard
│   ├── user-dashboard.tsx # Dashboard para usuários
│   ├── employee-dashboard.tsx # Dashboard para funcionários
│   ├── form-manager.tsx  # Gerenciador de formulários
│   ├── applicant-manager.tsx # Gerenciador de candidatos
│   ├── plan-manager.tsx  # Gerenciador de planos
│   └── order-manager.tsx # Gerenciador de pedidos
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

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `profiles`
- `id`: UUID (referência ao usuário)
- `role`: ENUM ('user', 'employee')
- `email`: TEXT

#### `plans`
- `id`: UUID
- `plan_name`: TEXT
- `description`: TEXT
- `price`: DECIMAL
- `active`: BOOLEAN
- `visa_type_id`: UUID (referência a visa_types)

#### `orders`
- `id`: UUID
- `responsible_user_id`: UUID (referência a profiles)
- `applicants_quantity`: INTEGER
- `plan_id`: UUID (referência a plans)
- `status`: ENUM ('pending', 'processing', 'approved', 'rejected')
- `payment_details`: JSONB
- `created_at`: TIMESTAMP

#### `applicants`
- `id`: UUID
- `name`: TEXT
- `email`: TEXT
- `order_id`: UUID (referência a orders)
- `status`: ENUM ('pending', 'processing', 'approved', 'rejected')
- `created_at`: TIMESTAMP

#### `form_questions`
- `id`: UUID
- `plan_id`: UUID (referência a plans)
- `questions`: JSONB (estrutura das perguntas)

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

## 🔧 Desenvolvimento

### Adicionando Novos Componentes
1. Crie o componente na pasta `components/`
2. Importe no componente pai
3. Adicione as funcionalidades necessárias

### Modificando APIs
1. Edite os arquivos em `app/api/`
2. Mantenha a estrutura REST
3. Use o cliente Supabase para operações no banco

### Estilização
- Use Tailwind CSS para estilos
- Componentes base em `components/ui/`
- Mantenha consistência visual

## 📝 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, entre em contato através de:
- Email: [seu-email@exemplo.com]
- Issues do GitHub: [link-do-repositorio/issues]
