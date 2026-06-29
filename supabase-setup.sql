-- =============================================
-- FRAN NUNES TERAPIAS — SUPABASE DATABASE SETUP
-- Execute este SQL no painel do Supabase
-- SQL Editor > New Query > Cole e Execute
-- =============================================

-- 1. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  data_nascimento DATE,
  cidade TEXT,
  profissao TEXT,
  motivo TEXT,
  dores TEXT,
  sonhos TEXT,
  historico_terapeutico TEXT,
  saude TEXT,
  espiritualidade TEXT,
  origem TEXT,
  servicos TEXT,
  observacoes TEXT,
  status TEXT DEFAULT 'ativo',
  data_cadastro TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE EVOLUÇÕES
CREATE TABLE IF NOT EXISTS evolucoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  data TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE SESSÕES
CREATE TABLE IF NOT EXISTS sessoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo TEXT DEFAULT 'individual',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  servico TEXT,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  status TEXT DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'parcelado')),
  metodo TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE KPIs SEMANAIS
CREATE TABLE IF NOT EXISTS kpis_semanais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  semana DATE NOT NULL,
  contatos INTEGER DEFAULT 0,
  posts INTEGER DEFAULT 0,
  sessoes_realizadas INTEGER DEFAULT 0,
  depoimentos INTEGER DEFAULT 0,
  indicacoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis_semanais ENABLE ROW LEVEL SECURITY;

-- Política: apenas usuários autenticados podem ver/editar (área admin)
-- Mas clientes podem INSERIR seus próprios dados (formulário público)

-- Permitir insert público para clientes (formulário de cadastro)
CREATE POLICY "Allow public insert clientes" ON clientes
  FOR INSERT WITH CHECK (true);

-- Permitir leitura apenas para authenticated (Fran logada)
CREATE POLICY "Allow authenticated read clientes" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all evolucoes" ON evolucoes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all sessoes" ON sessoes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all pagamentos" ON pagamentos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated all kpis" ON kpis_semanais
  FOR ALL USING (auth.role() = 'authenticated');

-- 7. ÍNDICES para performance
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_data ON clientes(data_cadastro);
CREATE INDEX IF NOT EXISTS idx_evolucoes_cliente ON evolucoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_cliente ON sessoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);

-- =============================================
-- INSTRUÇÕES DE CONFIGURAÇÃO NO SUPABASE:
-- 
-- 1. Crie uma conta em https://supabase.com
-- 2. Crie um novo projeto
-- 3. Vá em "SQL Editor" e execute este script
-- 4. Vá em "Settings > API" e copie:
--    - Project URL (SUPABASE_URL)
--    - anon/public key (SUPABASE_KEY)
-- 5. Atualize essas variáveis no app.js
-- 6. Para login da Fran: vá em Authentication > Users
--    e crie um usuário com email/senha para Fran
-- =============================================
