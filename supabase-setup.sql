-- FG Vistos - Estrutura do Banco de Dados
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tipos ENUM
CREATE TYPE user_role AS ENUM ('user', 'funcionario');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'approved', 'rejected');

-- Tabela de tipos de visto
CREATE TABLE IF NOT EXISTS visa_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'user',
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de planos
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    visa_type_id UUID REFERENCES visa_types(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    responsible_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    applicants_quantity INTEGER NOT NULL DEFAULT 1,
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
    status order_status DEFAULT 'pending',
    payment_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de candidatos
CREATE TABLE IF NOT EXISTS applicants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    status order_status DEFAULT 'pending',
    personal_info JSONB DEFAULT '{}',
    documents JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de questões de formulário
CREATE TABLE IF NOT EXISTS form_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
    questions JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de respostas de formulário
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE NOT NULL,
    form_id UUID REFERENCES form_questions(id) ON DELETE CASCADE NOT NULL,
    responses JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anexos
CREATE TABLE IF NOT EXISTS attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_plan_id ON orders(plan_id);
CREATE INDEX IF NOT EXISTS idx_applicants_order_id ON applicants(order_id);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);
CREATE INDEX IF NOT EXISTS idx_form_questions_plan_id ON form_questions(plan_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_applicant_id ON form_responses(applicant_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON applicants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_questions_updated_at BEFORE UPDATE ON form_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Política para profiles: usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para profiles: usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para plans: todos podem ver planos ativos
CREATE POLICY "Anyone can view active plans" ON plans
    FOR SELECT USING (active = true);

-- Política para plans: apenas funcionários podem gerenciar
CREATE POLICY "Funcionarios can manage plans" ON plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'funcionario'
        )
    );

-- Política para orders: usuários podem ver apenas seus próprios pedidos
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (responsible_user_id = auth.uid());

-- Política para orders: funcionários podem ver todos os pedidos
CREATE POLICY "Funcionarios can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'funcionario'
        )
    );

-- Política para orders: funcionários podem gerenciar todos os pedidos
CREATE POLICY "Funcionarios can manage all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'funcionario'
        )
    );

-- Política para applicants: funcionários podem ver todos os candidatos
CREATE POLICY "Funcionarios can view all applicants" ON applicants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'funcionario'
        )
    );

-- Política para applicants: funcionários podem gerenciar todos os candidatos
CREATE POLICY "Funcionarios can manage all applicants" ON applicants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'funcionario'
        )
    );

-- Política para form_questions: todos podem ver formulários ativos
CREATE POLICY "Anyone can view active forms" ON form_questions
    FOR SELECT USING (active = true);

-- Política para form_questions: apenas funcionários podem gerenciar
CREATE POLICY "Funcionarios can manage forms" ON form_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'funcionario'
        )
    );

-- Política para form_responses: candidatos podem ver suas próprias respostas
CREATE POLICY "Applicants can view own responses" ON form_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applicants 
            WHERE applicants.id = form_responses.applicant_id
            AND EXISTS (
                SELECT 1 FROM orders 
                WHERE orders.id = applicants.order_id
                AND orders.responsible_user_id = auth.uid()
            )
        )
    );

-- Política para form_responses: funcionários podem ver todas as respostas
CREATE POLICY "Funcionarios can view all responses" ON form_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'funcionario'
        )
    );

-- Política para attachments: candidatos podem ver seus próprios anexos
CREATE POLICY "Applicants can view own attachments" ON attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applicants 
            WHERE applicants.id = attachments.applicant_id
            AND EXISTS (
                SELECT 1 FROM orders 
                WHERE orders.id = applicants.order_id
                AND orders.responsible_user_id = auth.uid()
            )
        )
    );

-- Política para attachments: funcionários podem ver todos os anexos
CREATE POLICY "Funcionarios can view all attachments" ON attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'funcionario'
        )
    );

-- Inserir dados de exemplo
INSERT INTO visa_types (name, description) VALUES
    ('Turismo', 'Visto para turismo e lazer'),
    ('Estudo', 'Visto para estudos acadêmicos'),
    ('Trabalho', 'Visto para trabalho temporário'),
    ('Residência', 'Visto para residência permanente'),
    ('Negócios', 'Visto para viagens de negócios')
ON CONFLICT (name) DO NOTHING;

-- Inserir planos de exemplo
INSERT INTO plans (plan_name, description, price, visa_type_id) VALUES
    ('Plano Básico Turismo', 'Processamento básico para visto de turismo', 299.99, (SELECT id FROM visa_types WHERE name = 'Turismo')),
    ('Plano Premium Turismo', 'Processamento premium com suporte prioritário', 499.99, (SELECT id FROM visa_types WHERE name = 'Turismo')),
    ('Plano Estudo Padrão', 'Processamento para visto de estudo', 399.99, (SELECT id FROM visa_types WHERE name = 'Estudo')),
    ('Plano Trabalho Completo', 'Processamento completo para visto de trabalho', 599.99, (SELECT id FROM visa_types WHERE name = 'Trabalho'))
ON CONFLICT DO NOTHING;

-- Inserir formulário de exemplo
INSERT INTO form_questions (plan_id, questions) VALUES
    ((SELECT id FROM plans WHERE plan_name = 'Plano Básico Turismo'), '{
        "personal_info": {
            "label": "Informações Pessoais",
            "type": "section",
            "fields": {
                "full_name": {
                    "label": "Nome Completo",
                    "type": "text",
                    "required": true
                },
                "birth_date": {
                    "label": "Data de Nascimento",
                    "type": "date",
                    "required": true
                },
                "passport_number": {
                    "label": "Número do Passaporte",
                    "type": "text",
                    "required": true
                }
            }
        },
        "travel_info": {
            "label": "Informações da Viagem",
            "type": "section",
            "fields": {
                "travel_dates": {
                    "label": "Datas da Viagem",
                    "type": "text",
                    "required": true
                },
                "purpose": {
                    "label": "Propósito da Viagem",
                    "type": "textarea",
                    "required": true
                }
            }
        }
    }')
ON CONFLICT DO NOTHING;

-- Comentários sobre as tabelas
COMMENT ON TABLE profiles IS 'Perfis de usuários do sistema com diferentes níveis de acesso';
COMMENT ON TABLE plans IS 'Planos de visto disponíveis com preços e tipos';
COMMENT ON TABLE orders IS 'Pedidos de visto feitos pelos usuários';
COMMENT ON TABLE applicants IS 'Candidatos aos vistos com informações pessoais';
COMMENT ON TABLE form_questions IS 'Formulários personalizados para cada plano';
COMMENT ON TABLE form_responses IS 'Respostas dos candidatos aos formulários';
COMMENT ON TABLE attachments IS 'Anexos e documentos dos candidatos';
COMMENT ON TABLE visa_types IS 'Tipos de visto disponíveis no sistema';
