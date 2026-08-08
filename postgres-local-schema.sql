-- ============================================================
-- SGP ISP - PostgreSQL LOCAL
-- Servidor: 192.168.2.3
-- Banco: sgp_isp
-- ============================================================

BEGIN;

-- ============================================================
-- EXTENSÃO PARA UUID
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- ENUMS
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'app_role'
    ) THEN
        CREATE TYPE public.app_role AS ENUM (
            'admin',
            'tecnico',
            'comercial',
            'atendente'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'cliente_status'
    ) THEN
        CREATE TYPE public.cliente_status AS ENUM (
            'ativo',
            'inativo',
            'bloqueado'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'os_tipo'
    ) THEN
        CREATE TYPE public.os_tipo AS ENUM (
            'instalacao',
            'reparo',
            'mudanca_endereco',
            'desativacao',
            'outros'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type
        WHERE typname = 'os_status'
    ) THEN
        CREATE TYPE public.os_status AS ENUM (
            'aberta',
            'em_atendimento',
            'concluida',
            'cancelada'
        );
    END IF;
END $$;

-- ============================================================
-- USERS
-- Substitui a dependência do Supabase auth.users
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nome TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    full_name TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USER ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    role public.app_role NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
ON public.user_roles(user_id);

-- ============================================================
-- PLANOS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome TEXT NOT NULL,

    velocidade_down INT NOT NULL DEFAULT 0,
    velocidade_up INT NOT NULL DEFAULT 0,

    valor NUMERIC(10,2) NOT NULL DEFAULT 0,

    ativo BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CLIENTES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome TEXT NOT NULL,

    cpf_cnpj TEXT,
    email TEXT,
    telefone TEXT,

    endereco TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,

    plano_id UUID
        REFERENCES public.planos(id)
        ON DELETE SET NULL,

    ppoe_user TEXT,
    ppoe_pass TEXT,
    ip_fixo TEXT,

    observacoes TEXT,

    status public.cliente_status NOT NULL
        DEFAULT 'ativo',

    data_ativacao DATE DEFAULT CURRENT_DATE,
    data_cancelamento DATE,

    created_by UUID
        REFERENCES public.users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clientes_plano
ON public.clientes(plano_id);

CREATE INDEX IF NOT EXISTS idx_clientes_status
ON public.clientes(status);

CREATE INDEX IF NOT EXISTS idx_clientes_created_by
ON public.clientes(created_by);

-- ============================================================
-- PROJETOS FTTH
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projetos_ftth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nome TEXT NOT NULL,

    descricao TEXT,

    olt_tx_dbm NUMERIC NOT NULL DEFAULT 3,

    data JSONB NOT NULL
        DEFAULT '{"nodes":[],"edges":[]}'::jsonb,

    created_by UUID
        REFERENCES public.users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projetos_ftth_created_by
ON public.projetos_ftth(created_by);

-- ============================================================
-- ORDENS DE SERVIÇO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ordens_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    numero SERIAL UNIQUE NOT NULL,

    cliente_id UUID NOT NULL
        REFERENCES public.clientes(id)
        ON DELETE RESTRICT,

    tipo public.os_tipo NOT NULL,

    status public.os_status NOT NULL
        DEFAULT 'aberta',

    descricao TEXT NOT NULL,

    tecnico_id UUID
        REFERENCES public.users(id)
        ON DELETE SET NULL,

    projeto_ftth_id UUID
        REFERENCES public.projetos_ftth(id)
        ON DELETE SET NULL,

    cto_ref TEXT,
    porta_cto INTEGER,

    endereco_atendimento TEXT,

    data_agendada TIMESTAMPTZ,
    data_inicio TIMESTAMPTZ,
    data_conclusao TIMESTAMPTZ,

    valor NUMERIC(10,2) DEFAULT 0,

    forma_pagamento TEXT,

    assinatura_cliente TEXT,

    observacoes_cliente TEXT,
    observacoes_internas TEXT,

    created_by UUID
        REFERENCES public.users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_os_cliente
ON public.ordens_servico(cliente_id);

CREATE INDEX IF NOT EXISTS idx_os_tecnico
ON public.ordens_servico(tecnico_id);

CREATE INDEX IF NOT EXISTS idx_os_status
ON public.ordens_servico(status);

CREATE INDEX IF NOT EXISTS idx_os_projeto_ftth
ON public.ordens_servico(projeto_ftth_id);

-- ============================================================
-- MATERIAIS DA OS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.os_materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    os_id UUID NOT NULL
        REFERENCES public.ordens_servico(id)
        ON DELETE CASCADE,

    descricao TEXT NOT NULL,

    quantidade NUMERIC(10,2) NOT NULL DEFAULT 1,

    unidade TEXT DEFAULT 'un',

    valor_unitario NUMERIC(10,2) DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_os_materiais_os
ON public.os_materiais(os_id);

-- ============================================================
-- EVIDÊNCIAS DA OS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.os_evidencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    os_id UUID NOT NULL
        REFERENCES public.ordens_servico(id)
        ON DELETE CASCADE,

    tipo TEXT NOT NULL
        CHECK (
            tipo IN (
                'foto',
                'video',
                'documento'
            )
        ),

    url TEXT NOT NULL,

    descricao TEXT,

    tamanho_bytes INTEGER,

    mime_type TEXT,

    criado_por UUID
        REFERENCES public.users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_os_evidencias_os
ON public.os_evidencias(os_id);

CREATE INDEX IF NOT EXISTS idx_os_evidencias_tipo
ON public.os_evidencias(tipo);

CREATE INDEX IF NOT EXISTS idx_os_evidencias_criado_por
ON public.os_evidencias(criado_por);

-- ============================================================
-- SINCRONIZAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tabela TEXT NOT NULL,

    operacao TEXT NOT NULL,

    pk UUID,

    dados JSONB,

    origem TEXT NOT NULL,

    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

    sincronizado BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_tabela
ON public.sync_logs(tabela);

CREATE INDEX IF NOT EXISTS idx_sync_logs_sincronizado
ON public.sync_logs(sincronizado);

CREATE INDEX IF NOT EXISTS idx_sync_logs_timestamp
ON public.sync_logs(timestamp);

-- ============================================================
-- CONFLITOS DE SINCRONIZAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sync_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tabela TEXT NOT NULL,

    registro_id UUID NOT NULL,

    supabase_data JSONB,

    local_data JSONB,

    resolucao TEXT,

    resolvido_em TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_tabela
ON public.sync_conflicts(tabela);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_resolvido
ON public.sync_conflicts(resolvido_em);

-- ============================================================
-- VERSÕES DE SINCRONIZAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sync_versions (
    tabela TEXT PRIMARY KEY,

    ultima_sincronizacao TIMESTAMPTZ,

    versao_local INT DEFAULT 0,

    versao_supabase INT DEFAULT 0
);

-- ============================================================
-- TABELAS CONTROLADAS PELA SINCRONIZAÇÃO
-- ============================================================

INSERT INTO public.sync_versions (
    tabela,
    ultima_sincronizacao,
    versao_local,
    versao_supabase
)
VALUES
    ('profiles', now(), 0, 0),
    ('user_roles', now(), 0, 0),
    ('planos', now(), 0, 0),
    ('clientes', now(), 0, 0),
    ('ordens_servico', now(), 0, 0),
    ('os_materiais', now(), 0, 0),
    ('os_evidencias', now(), 0, 0),
    ('projetos_ftth', now(), 0, 0)
ON CONFLICT (tabela) DO NOTHING;

-- ============================================================
-- FUNÇÃO UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGERS UPDATED_AT
-- ============================================================

DROP TRIGGER IF EXISTS update_users_updated_at
ON public.users;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_profiles_updated_at
ON public.profiles;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_planos_updated_at
ON public.planos;

CREATE TRIGGER update_planos_updated_at
BEFORE UPDATE ON public.planos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_clientes_updated_at
ON public.clientes;

CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_projetos_ftth_updated_at
ON public.projetos_ftth;

CREATE TRIGGER update_projetos_ftth_updated_at
BEFORE UPDATE ON public.projetos_ftth
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


DROP TRIGGER IF EXISTS update_ordens_servico_updated_at
ON public.ordens_servico;

CREATE TRIGGER update_ordens_servico_updated_at
BEFORE UPDATE ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FUNÇÕES DE PERFIL / ROLE
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(
    _user_id UUID,
    _role TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role::TEXT = _role
    );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(
    _user_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(
    _user_id UUID,
    _role TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role::TEXT = _role
    );
$$;

-- ============================================================
-- LOG DE ALTERAÇÕES PARA SINCRONIZAÇÃO
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_sync_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.sync_logs (
        tabela,
        operacao,
        pk,
        dados,
        origem
    )
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE
            WHEN TG_OP = 'DELETE'
                THEN row_to_json(OLD)::jsonb
            ELSE
                row_to_json(NEW)::jsonb
        END,
        'local'
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================
-- TRIGGERS DE SINCRONIZAÇÃO
-- ============================================================

DROP TRIGGER IF EXISTS sync_profiles
ON public.profiles;

CREATE TRIGGER sync_profiles
AFTER INSERT OR UPDATE OR DELETE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_sync_change();


DROP TRIGGER IF EXISTS sync_user_roles
ON public.user_roles;

CREATE TRIGGER sync_user_roles
AFTER INSERT OR UPDATE OR DELETE
ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.log_sync_change();


DROP TRIGGER IF EXISTS sync_planos
ON public.planos;

CREATE TRIGGER sync_planos
AFTER INSERT OR UPDATE OR DELETE
ON public.planos
FOR EACH ROW
EXECUTE FUNCTION public.log_sync_change();


DROP TRIGGER IF EXISTS sync_clientes
ON public.clientes;

CREATE TRIGGER sync_clientes
AFTER INSERT OR UPDATE OR DELETE
ON public.clientes
FOR EACH ROW
EXECUTE FUNCTION public.log_sync_change();


DROP TRIGGER IF EXISTS sync_ordens_servico
ON public.ordens_servico;

CREATE TRIGGER sync_ordens_servico
AFTER INSERT OR UPDATE OR DELETE
ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.log_sync_change();


DROP TRIGGER IF EXISTS sync_os_materiais
ON public.os_materiais;

CREATE TRIGGER sync_os_materiais
AFTER INSERT OR UPDATE OR DELETE
ON public.os_materiais
FOR EACH ROW
EXECUTE FUNCTION public.log_sync_change();


DROP TRIGGER IF EXISTS sync_os_evidencias
ON public.os_evidencias;

CREATE TRIGGER sync_os_evidencias
AFTER INSERT OR UPDATE OR DELETE
ON public.os_evidencias
FOR EACH ROW
EXECUTE FUNCTION public.log_sync_change();


DROP TRIGGER IF EXISTS sync_projetos_ftth
ON public.projetos_ftth;

CREATE TRIGGER sync_projetos_ftth
AFTER INSERT OR UPDATE OR DELETE
ON public.projetos_ftth
FOR EACH ROW
EXECUTE FUNCTION public.log_sync_change();

COMMIT;
