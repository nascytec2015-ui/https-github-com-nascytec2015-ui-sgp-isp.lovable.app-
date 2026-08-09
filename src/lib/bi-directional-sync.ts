import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const { Pool } = pg;

/*** Tipo para registros sincronizáveis ***/
interface SyncRecord {
  id: string;
  updated_at?: string | null;
  created_at?: string | null;
  [key: string]: any;
}

/*** Configuração do sincronizador ***/
interface SyncConfig {
  postgresHost: string;
  postgresPort: number;
  postgresUser: string;
  postgresPassword: string;
  postgresDB: string;

  supabaseUrl: string;
  supabaseKey: string;

  syncInterval: number;

  /*** Mantido por compatibilidade com a configuração atual ***/
  syncPriority: "supabase" | "local";
}

class BiDirectionalSync {
  private pool: pg.Pool;

  private supabase: ReturnType<typeof createClient>;

  private config: SyncConfig;

  private syncTimer: NodeJS.Timeout | null = null;

  private isSyncing = false;

  private syncStartTime = 0;

  private syncStats = {
    tabelas: 0,
    ok: 0,
    conflitos: 0,
    erros: 0,
    logs: 0,
  };

  /*** Tabelas sincronizadas ***/
  private tables = [
    "users",
    "profiles",
    "user_roles",
    "planos",
    "clientes",
    "ordens_servico",
    "os_materiais",
    "os_evidencias",
    "projetos_ftth",
  ];

  constructor(config: SyncConfig) {
    this.config = config;

    /*** PostgreSQL local ***/
    this.pool = new Pool({
      host: config.postgresHost,
      port: config.postgresPort,
      user: config.postgresUser,
      password: config.postgresPassword,
      database: config.postgresDB,
    });

    /*** Supabase ***/
    this.supabase = createClient(
      config.supabaseUrl,
      config.supabaseKey,
    );
  }

  /*** Iniciar sincronização automática ***/
  async start() {
    console.log("[SYNC] Iniciando sincronização bidirecional...");

    await this.sync();

    this.syncTimer = setInterval(() => {
      this.sync().catch((err) => {
        console.error("[SYNC] Erro no ciclo:", err);
      });
    }, this.config.syncInterval);
  }

  /*** Parar sincronização ***/
  stop() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    console.log("[SYNC] Sincronização parada");
  }

  /*** Executa ciclo completo ***/
  private async sync() {
    if (this.isSyncing) {
      console.warn("[SYNC] Ciclo já está em execução. Ignorando novo ciclo.");
      return;
    }

    this.isSyncing = true;
    this.syncStartTime = Date.now();

    this.syncStats = {
      tabelas: 0,
      ok: 0,
      conflitos: 0,
      erros: 0,
      logs: 0,
    };

    try {
      await this.updateSyncStatus("running");

      console.log(
        `[SYNC] Iniciando ciclo - ${new Date().toISOString()}`,
      );

      for (const table of this.tables) {
        try {
          await this.syncTable(table);

          this.syncStats.tabelas++;
          this.syncStats.ok++;
        } catch (err) {
          this.syncStats.tabelas++;
          this.syncStats.erros++;

          console.error(
            `[SYNC] Erro tabela ${table}:`,
            err,
          );
        }
      }

      const finalStatus =
        this.syncStats.erros > 0 ? "online_with_errors" : "online";

      await this.updateSyncStatus(finalStatus);

      console.log(
        `[SYNC] Ciclo concluído - ${new Date().toISOString()}`,
      );

      console.log(
        `[SYNC] Estatísticas: tabelas=${this.syncStats.tabelas}, ` +
        `ok=${this.syncStats.ok}, ` +
        `conflitos=${this.syncStats.conflitos}, ` +
        `erros=${this.syncStats.erros}, ` +
        `logs=${this.syncStats.logs}`,
      );
    } catch (err) {
      this.syncStats.erros++;

      console.error(
        "[SYNC] Erro geral no ciclo:",
        err,
      );

      await this.updateSyncStatus("error");
    } finally {
      this.isSyncing = false;
      this.syncStartTime = 0;
    }
  }

  /*** Sincronizar uma tabela específica ***/
  private async syncTable(tableName: string) {
    /*** Buscar dados Supabase ***/
    const { data: supabaseData, error: supabaseError } =
      await this.supabase
        .from(tableName)
        .select("*");

    if (supabaseError) {
      throw supabaseError;
    }

    /*** Buscar dados PostgreSQL ***/
    const localResult = await this.pool.query(
      `SELECT * FROM public."${tableName}"`,
    );

    const localData = localResult.rows;

    /*** Supabase → PostgreSQL ***/
    await this.syncDirection(
      tableName,
      supabaseData || [],
      localData,
      "supabase-to-local",
    );

    /*** PostgreSQL → Supabase ***/
    await this.syncDirection(
      tableName,
      localData,
      supabaseData || [],
      "local-to-supabase",
    );

    console.log(
      `[SYNC] Tabela ${tableName} sincronizada`,
    );
  }

  /**
 * Normaliza registros antes da comparação.
 *
 * Objetivo:
 * - Normalizar Date do PostgreSQL.
 * - Considerar timestamps equivalentes:
 *   2026-07-13T00:49:44.289Z
 *   2026-07-13T00:49:44.289+00:00
 *
 * - Normalizar objetos independentemente
 *   da ordem das propriedades.
 *
 * - Não alterar os dados reais armazenados no banco.
 */
  private normalizeForComparison(
    record: SyncRecord,
  ): string {
    const normalizeValue = (
      value: any,
      key?: string,
    ): any => {
      if (value === null || value === undefined) {
        return value;
      }

      /**
       * PostgreSQL retorna campos timestamp
       * como objetos Date.
       *
       * IMPORTANTE:
       * precisa vir ANTES do typeof === "object".
       */
      if (value instanceof Date) {
        if (!Number.isNaN(value.getTime())) {
          return value.toISOString();
        }

        return value;
      }

      /**
       * Strings que representam datas.
       */
      if (
        typeof value === "string" &&
        key &&
        (
          key === "created_at" ||
          key === "updated_at" ||
          key === "data_ativacao" ||
          key === "data_cancelamento"
        )
      ) {
        const date = new Date(value);

        if (!Number.isNaN(date.getTime())) {
          return date.toISOString();
        }
      }

      /**
       * Arrays.
       */
      if (Array.isArray(value)) {
        return value.map((item) =>
          normalizeValue(item),
        );
      }

      /**
       * Objetos.
       *
       * As propriedades são ordenadas para que
       * a ordem não provoque falso conflito.
       */
      if (typeof value === "object") {
        return Object.keys(value)
          .sort()
          .reduce(
            (
              result,
              objectKey,
            ) => {
              result[objectKey] =
                normalizeValue(
                  value[objectKey],
                  objectKey,
                );

              return result;
            },
            {} as Record<string, any>,
          );
      }

      return value;
    };

    return JSON.stringify(
      normalizeValue(record),
    );
  }
  
  /**
   * Sincronização origem → destino
   *
   * Regras:
   * 1. Registro inexistente no destino = INSERT
   * 2. Origem mais nova = UPDATE
   * 3. Destino mais novo = nenhuma ação
   * 4. Mesmo timestamp + dados diferentes = conflito
   * 5. Em conflito, PostgreSQL local sempre vence
   */
  private async syncDirection(
    tableName: string,
    source: SyncRecord[],
    destination: SyncRecord[],
    direction: string,
  ) {

    const destMap = new Map(
      destination.map((record) => [record.id, record]),
    );

    for (const sourceRecord of source) {
      const destRecord = destMap.get(sourceRecord.id);

      /*** Registro novo ***/
      if (!destRecord) {
        await this.insertRecord(
          tableName,
          sourceRecord,
          direction,
        );

        continue;
      }

      const sourceTimestamp =
        sourceRecord.updated_at ??
        sourceRecord.created_at;

      const destinationTimestamp =
        destRecord.updated_at ??
        destRecord.created_at;

      /***
       * Sem timestamp confiável:
       * não tentar decidir qual registro é mais recente.
       ***/
      if (!sourceTimestamp || !destinationTimestamp) {
        continue;
      }

      const sourceDate = new Date(sourceTimestamp);
      const destinationDate = new Date(destinationTimestamp);

      if (
        Number.isNaN(sourceDate.getTime()) ||
        Number.isNaN(destinationDate.getTime())
      ) {
        console.warn(
          `[SYNC] Timestamp inválido em ${tableName}:${sourceRecord.id}`,
        );

        continue;
      }

      const diff =
        Math.abs(
          sourceDate.getTime() -
          destinationDate.getTime(),
        );

      /***
       * Diferenças menores que 1 segundo
       * são consideradas o mesmo timestamp.
       ***/
      if (diff < 1000) {

        console.log(
          `[SYNC-COMPARE] ${tableName}:${sourceRecord.id}`,
          {
            source: this.normalizeForComparison(sourceRecord),
            destination: this.normalizeForComparison(destRecord),
            iguais:
              this.normalizeForComparison(sourceRecord) ===
              this.normalizeForComparison(destRecord),
          },
        );

        const sourceJson =
          this.normalizeForComparison(sourceRecord);

        const destinationJson =
          this.normalizeForComparison(destRecord);

        /**
         * Mesmo timestamp e mesmo conteúdo:
         * nenhuma sincronização necessária.
         */
        if (sourceJson === destinationJson) {
          continue;
        }

        /**
         * Se os dados realmente forem diferentes,
         * só precisamos resolver o conflito uma vez.
         *
         * A direção SUPABASE → LOCAL registra/resol­ve
         * o conflito. A segunda direção não deve repetir.
         */
        if (direction === "supabase-to-local") {
          await this.resolveConflict(
            tableName,
            sourceRecord.id,
            sourceRecord,
            destRecord,
            direction,
          );
        }

        continue;
      }

      /*** Origem mais atual ***/
      if (sourceDate > destinationDate) {
        await this.updateRecord(
          tableName,
          sourceRecord,
          direction,
        );

        continue;
      }

      /***
       * Destino mais atual:
       * nada para fazer.
       ***/
      if (destinationDate > sourceDate) {
        continue;
      }
    }
  }

  /*** Inserir registro ***/
  private async insertRecord(
    tableName: string,
    record: SyncRecord,
    direction: string,
  ) {
    try {
      if (direction === "supabase-to-local") {
        const columns = Object.keys(record)
          .map((column) => `"${column}"`)
          .join(", ");

        const values = Object.keys(record)
          .map((_, index) => `$${index + 1}`)
          .join(", ");

        /*** Garantir dependência de profiles ***/
        if (tableName === "profiles") {
          const check = await this.pool.query(
            `
            SELECT 1
            FROM public.users
            WHERE id = $1
            `,
            [record.id],
          );

          if (check.rowCount === 0) {
            console.warn(
              `[SYNC] Pulando profile ${record.id}: usuário não existe`,
            );

            return;
          }
        }

        /*** Garantir dependência de user_roles ***/
        if (tableName === "user_roles") {
          const check = await this.pool.query(
            `
            SELECT 1
            FROM public.users
            WHERE id = $1
            `,
            [record.user_id],
          );

          if (check.rowCount === 0) {
            console.warn(
              `[SYNC] Pulando user_role ${record.user_id}: usuário não existe`,
            );

            return;
          }
        }

        await this.pool.query(
          `
          INSERT INTO public."${tableName}"
          (${columns})
          VALUES (${values})
          ON CONFLICT(id) DO NOTHING
          `,
          Object.values(record),
        );
      } else {
        const { error } = await (this.supabase as any)
          .from(tableName)
          .insert([record]);

        if (error) {
          throw error;
        }
      }

      await this.logSync(
        tableName,
        "INSERT",
        record.id,
        "success",
        direction,
      );
    } catch (err) {
      console.error(
        `[SYNC] Erro insert ${tableName}:`,
        err,
      );

      await this.logSync(
        tableName,
        "INSERT",
        record.id,
        "error",
        direction,
      );

      throw err;
    }
  }

  /*** Atualizar registro no destino correto ***/
  private async updateRecord(
    tableName: string,
    record: SyncRecord,
    direction: string,
  ) {
    try {
      if (direction === "supabase-to-local") {
        /***
         * SUPABASE → POSTGRESQL
         *
         * O destino é o PostgreSQL local.
         ***/

        const columns = Object.keys(record).filter(
          (column) => column !== "id",
        );

        if (columns.length === 0) {
          return;
        }

        const setClause = columns
          .map(
            (column, index) =>
              `"${column}" = $${index + 1}`,
          )
          .join(", ");

        const values = columns.map(
          (column) => record[column],
        );

        values.push(record.id);

        const idParameter = `$${values.length}`;

        await this.pool.query(
          `
          UPDATE public."${tableName}"
          SET ${setClause}
          WHERE id = ${idParameter}
          `,
          values,
        );
      } else if (direction === "local-to-supabase") {
        /***
         * POSTGRESQL → SUPABASE
         *
         * O destino é o Supabase.
         ***/

        const { id, ...updateData } = record;

        const { error } = await (this.supabase as any)
          .from(tableName)
          .update(updateData)
          .eq("id", id);

        if (error) {
          throw error;
        }
      } else {
        throw new Error(
          `Direção de sincronização inválida: ${direction}`,
        );
      }

      await this.logSync(
        tableName,
        "UPDATE",
        record.id,
        "success",
        direction,
      );
    } catch (err) {
      console.error(
        `[SYNC] Erro update ${tableName}:`,
        err,
      );

      await this.logSync(
        tableName,
        "UPDATE",
        record.id,
        "error",
        direction,
      );

      throw err;
    }
  }

  /*** Resolver conflito automaticamente ***/
  private async resolveConflict(
    tableName: string,
    recordId: string,
    source: SyncRecord,
    destination: SyncRecord,
    direction: string,
  ) {
    /***
     * Mantemos a regra existente para users:
     * não sobrescrever automaticamente conflitos de usuários.
     ***/
    if (tableName === "users") {
      console.warn(
        `[SYNC] Conflito em users:${recordId} não sobrescrito automaticamente`,
      );

      return;
    }

    try {
      console.warn(
        `[SYNC] Conflito detectado ${tableName}:${recordId}`,
      );

      /***
       * REGRA DEFINIDA:
       *
       * PostgreSQL local sempre vence.
       *
       * Se a direção atual for:
       *
       * SUPABASE → LOCAL
       *   source      = Supabase
       *   destination = Local
       *
       * Portanto o destino local já é o vencedor,
       * e precisamos sobrescrever o Supabase.
       *
       * LOCAL → SUPABASE
       *   source      = Local
       *   destination = Supabase
       *
       * Portanto o source é o vencedor,
       * e precisamos sobrescrever o Supabase.
       ***/

      if (direction === "supabase-to-local") {
        /***
         * Local venceu.
         * Sobrescreve o Supabase com o registro local.
         ***/

        await this.updateRecord(
          tableName,
          destination,
          "local-to-supabase",
        );
      } else if (direction === "local-to-supabase") {
        /***
         * Local venceu.
         * Sobrescreve o Supabase com o registro local.
         ***/

        await this.updateRecord(
          tableName,
          source,
          "local-to-supabase",
        );
      } else {
        throw new Error(
          `Direção inválida ao resolver conflito: ${direction}`,
        );
      }

      /*** Registrar histórico do conflito ***/
      await this.recordConflict(
        tableName,
        recordId,
        source,
        destination,
      );

      /*** Incrementar contador somente após resolução bem-sucedida ***/
      this.syncStats.conflitos++;

      console.log(
        `[SYNC] Conflito resolvido ${tableName}:${recordId} ` +
        `vencedor=PostgreSQL-local`,
      );
    } catch (err) {
      console.error(
        `[SYNC] Erro resolver conflito ${tableName}:${recordId}:`,
        err,
      );

      throw err;
    }
  }

  /*** Registrar conflito para auditoria ***/
  private async recordConflict(
    tableName: string,
    recordId: string,
    source: SyncRecord,
    destination: SyncRecord,
  ) {
    try {
      await this.pool.query(
        `
        INSERT INTO public.sync_conflicts
        (
          tabela,
          registro_id,
          supabase_data,
          local_data
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          tableName,
          recordId,
          JSON.stringify(
            source,
          ),
          JSON.stringify(
            destination,
          ),
        ],
      );

      console.warn(
        `[SYNC] Conflito registrado ${tableName}:${recordId}`,
      );
    } catch (err) {
      console.error(
        `[SYNC] Erro registrar conflito:`,
        err,
      );

      throw err;
    }
  }

  /*** Log de sincronização ***/
  private async logSync(
    tableName: string,
    operacao: string,
    pk: string,
    status: string,
    direction: string,
  ) {
    try {
      await this.pool.query(
        `
        INSERT INTO public.sync_logs
        (
          tabela,
          operacao,
          pk,
          origem
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
          tableName,
          `${operacao}:${status}`,
          pk,
          direction,
        ],
      );

      /***
       * Contador interno de logs.
       *
       * Não depende da quantidade existente na tabela.
       ***/
      this.syncStats.logs++;
    } catch (err) {
      console.error(
        "[SYNC] Erro log:",
        err,
      );

      /***
       * Erro de auditoria não deve apagar
       * o resultado da operação principal.
       ***/
    }
  }

  /*** Saúde do sincronizador ***/
  async checkHealth() {
    const health = {
      postgres: false,
      supabase: false,
      lastSync: null as Date | null,
    };

    /*** PostgreSQL ***/
    try {
      const result =
        await this.pool.query(
          "SELECT NOW()",
        );

      health.postgres =
        !!result.rows[0];
    } catch {
      console.error(
        "[SYNC] PostgreSQL offline",
      );
    }

    /*** Supabase ***/
    try {
      const { data, error } =
        await this.supabase
          .from("sync_versions")
          .select("ultima_sincronizacao")
          .limit(1);

      if (error) {
        throw error;
      }

      health.supabase =
        !!data;

      if (data?.[0]) {
        const row =
          data[0] as {
            ultima_sincronizacao?:
            string | null;
          };

        if (
          row.ultima_sincronizacao
        ) {
          health.lastSync =
            new Date(
              row.ultima_sincronizacao,
            );
        }
      }
    } catch {
      console.error(
        "[SYNC] Supabase offline",
      );
    }

    return health;
  }

  /*** Atualizar status do sincronizador ***/
  private async updateSyncStatus(
    status: string,
  ) {
    try {
      const tempo =
        this.syncStartTime > 0
          ? Date.now() -
          this.syncStartTime
          : 0;

      /***
       * Garantir que exista o registro principal.
       *
       * Caso id=1 não exista, criamos.
       ***/
      await this.pool.query(
        `
        INSERT INTO public.sync_status
        (
          id,
          status,
          tabelas_processadas,
          tabelas_ok,
          conflitos_resolvidos,
          erros,
          tempo_execucao
        )
        VALUES
        (
          1,
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        ON CONFLICT (id)
        DO UPDATE SET
          ultima_execucao = NOW(),
          status = EXCLUDED.status,
          tabelas_processadas = EXCLUDED.tabelas_processadas,
          tabelas_ok = EXCLUDED.tabelas_ok,
          conflitos_resolvidos = EXCLUDED.conflitos_resolvidos,
          erros = EXCLUDED.erros,
          tempo_execucao = EXCLUDED.tempo_execucao
        `,
        [
          status,
          this.syncStats.tabelas,
          this.syncStats.ok,
          this.syncStats.conflitos,
          this.syncStats.erros,
          tempo,
        ],
      );

      console.log(
        `[SYNC-STATUS] status=${status} ` +
        `tabelas=${this.syncStats.tabelas} ` +
        `ok=${this.syncStats.ok} ` +
        `conflitos=${this.syncStats.conflitos} ` +
        `erros=${this.syncStats.erros} ` +
        `logs=${this.syncStats.logs} ` +
        `tempo=${tempo}ms`,
      );
    } catch (err) {
      console.error(
        "[SYNC] Erro atualizando status:",
        err,
      );
    }
  }

  /*** Fechar conexões ***/
  async close() {
    this.stop();

    await this.pool.end();

    console.log(
      "[SYNC] Conexão PostgreSQL encerrada",
    );
  }
}

export default BiDirectionalSync;

export type {
  SyncConfig,
  SyncRecord,
};