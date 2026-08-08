-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "app_role" AS ENUM ('admin', 'tecnico', 'comercial', 'atendente');

-- CreateEnum
CREATE TYPE "cliente_status" AS ENUM ('ativo', 'inativo', 'bloqueado');

-- CreateEnum
CREATE TYPE "os_status" AS ENUM ('aberta', 'em_atendimento', 'concluida', 'cancelada');

-- CreateEnum
CREATE TYPE "os_tipo" AS ENUM ('instalacao', 'reparo', 'mudanca_endereco', 'desativacao', 'outros');

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "cpf_cnpj" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "plano_id" UUID,
    "ppoe_user" TEXT,
    "ppoe_pass" TEXT,
    "ip_fixo" TEXT,
    "observacoes" TEXT,
    "status" "cliente_status" NOT NULL DEFAULT 'ativo',
    "data_ativacao" DATE DEFAULT CURRENT_DATE,
    "data_cancelamento" DATE,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "numero" SERIAL NOT NULL,
    "cliente_id" UUID NOT NULL,
    "tipo" "os_tipo" NOT NULL,
    "status" "os_status" NOT NULL DEFAULT 'aberta',
    "descricao" TEXT NOT NULL,
    "tecnico_id" UUID,
    "projeto_ftth_id" UUID,
    "cto_ref" TEXT,
    "porta_cto" INTEGER,
    "endereco_atendimento" TEXT,
    "data_agendada" TIMESTAMPTZ(6),
    "data_inicio" TIMESTAMPTZ(6),
    "data_conclusao" TIMESTAMPTZ(6),
    "valor" DECIMAL(10,2) DEFAULT 0,
    "forma_pagamento" TEXT,
    "assinatura_cliente" TEXT,
    "observacoes_cliente" TEXT,
    "observacoes_internas" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordens_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os_evidencias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "os_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descricao" TEXT,
    "tamanho_bytes" INTEGER,
    "mime_type" TEXT,
    "criado_por" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "os_evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os_materiais" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "os_id" UUID NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unidade" TEXT DEFAULT 'un',
    "valor_unitario" DECIMAL(10,2) DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "os_materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "velocidade_down" INTEGER NOT NULL DEFAULT 0,
    "velocidade_up" INTEGER NOT NULL DEFAULT 0,
    "valor" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos_ftth" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "olt_tx_dbm" DECIMAL NOT NULL DEFAULT 3,
    "data" JSONB NOT NULL DEFAULT '{"edges": [], "nodes": []}',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projetos_ftth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_conflicts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tabela" TEXT NOT NULL,
    "registro_id" UUID NOT NULL,
    "supabase_data" JSONB,
    "local_data" JSONB,
    "resolucao" TEXT,
    "resolvido_em" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tabela" TEXT NOT NULL,
    "operacao" TEXT NOT NULL,
    "pk" UUID,
    "dados" JSONB,
    "origem" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sincronizado" BOOLEAN DEFAULT false,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_versions" (
    "tabela" TEXT NOT NULL,
    "ultima_sincronizacao" TIMESTAMPTZ(6),
    "versao_local" INTEGER DEFAULT 0,
    "versao_supabase" INTEGER DEFAULT 0,

    CONSTRAINT "sync_versions_pkey" PRIMARY KEY ("tabela")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role" "app_role" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_clientes_created_by" ON "clientes"("created_by");

-- CreateIndex
CREATE INDEX "idx_clientes_plano" ON "clientes"("plano_id");

-- CreateIndex
CREATE INDEX "idx_clientes_status" ON "clientes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_servico_numero_key" ON "ordens_servico"("numero");

-- CreateIndex
CREATE INDEX "idx_os_cliente" ON "ordens_servico"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_os_projeto_ftth" ON "ordens_servico"("projeto_ftth_id");

-- CreateIndex
CREATE INDEX "idx_os_status" ON "ordens_servico"("status");

-- CreateIndex
CREATE INDEX "idx_os_tecnico" ON "ordens_servico"("tecnico_id");

-- CreateIndex
CREATE INDEX "idx_os_evidencias_criado_por" ON "os_evidencias"("criado_por");

-- CreateIndex
CREATE INDEX "idx_os_evidencias_os" ON "os_evidencias"("os_id");

-- CreateIndex
CREATE INDEX "idx_os_evidencias_tipo" ON "os_evidencias"("tipo");

-- CreateIndex
CREATE INDEX "idx_os_materiais_os" ON "os_materiais"("os_id");

-- CreateIndex
CREATE INDEX "idx_projetos_ftth_created_by" ON "projetos_ftth"("created_by");

-- CreateIndex
CREATE INDEX "idx_sync_conflicts_resolvido" ON "sync_conflicts"("resolvido_em");

-- CreateIndex
CREATE INDEX "idx_sync_conflicts_tabela" ON "sync_conflicts"("tabela");

-- CreateIndex
CREATE INDEX "idx_sync_logs_sincronizado" ON "sync_logs"("sincronizado");

-- CreateIndex
CREATE INDEX "idx_sync_logs_tabela" ON "sync_logs"("tabela");

-- CreateIndex
CREATE INDEX "idx_sync_logs_timestamp" ON "sync_logs"("timestamp");

-- CreateIndex
CREATE INDEX "idx_user_roles_user_id" ON "user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles"("user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "planos"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_projeto_ftth_id_fkey" FOREIGN KEY ("projeto_ftth_id") REFERENCES "projetos_ftth"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "os_evidencias" ADD CONSTRAINT "os_evidencias_criado_por_fkey" FOREIGN KEY ("criado_por") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "os_evidencias" ADD CONSTRAINT "os_evidencias_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordens_servico"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "os_materiais" ADD CONSTRAINT "os_materiais_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "ordens_servico"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projetos_ftth" ADD CONSTRAINT "projetos_ftth_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

