import {
  MikrotikAPI,
  type IRosOptions,
} from "@fibercom/routeros-api";

export interface MikroTikClientConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  timeout: number;
  tls: boolean;
}

/**
 * Cliente responsável exclusivamente
 * pela comunicação com o RouterOS.
 *
 * Não contém regras de negócio do SGP.
 */
export class MikroTikClient {
  private api: MikrotikAPI | null = null;
  private readonly config: MikroTikClientConfig;

  constructor(config: MikroTikClientConfig) {
    this.config = config;
  }

  /**
   * Cria uma nova instância da API RouterOS.
   */
  private createApi(): MikrotikAPI {
    const options: IRosOptions = {
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      timeout: this.config.timeout,
      tls: this.config.tls,
    };

    const api = new MikrotikAPI(options);

    api.on("error", (error) => {
      console.error(
        "[MikroTikClient] Erro RouterOS:",
        error.message,
      );
    });

    api.on("timeout", (error) => {
      console.error(
        "[MikroTikClient] Timeout RouterOS:",
        error.message,
      );
    });

    return api;
  }

  /**
   * Conecta ao RouterOS.
   */
  async connect(): Promise<void> {
    if (this.api?.connected) {
      return;
    }

    console.log(
      `[MikroTikClient] Conectando ao MikroTik ` +
        `${ this.config.host }:${ this.config.port }...`,
    );

    this.api = this.createApi();

    await this.api.connect();

    console.log(
      "[MikroTikClient] Conexão estabelecida.",
    );
  }

  /**
   * Desconecta do RouterOS.
   */
  async disconnect(): Promise<void> {
    if (!this.api) {
      return;
    }

    if (this.api.connected) {
      await this.api.close();
    }

    this.api = null;

    console.log(
      "[MikroTikClient] Conexão encerrada.",
    );
  }

  /**
   * Retorna a conexão ativa.
   */
  private async getApi(): Promise<MikrotikAPI> {
    if (!this.api?.connected) {
      await this.connect();
    }

    if (!this.api) {
      throw new Error(
        "Não foi possível inicializar a conexão com o MikroTik.",
      );
    }

    return this.api;
  }

  /**
   * Executa um comando RouterOS.
   *
   * Exemplo:
   *
   * client.write(
   *   "/ppp/secret/print"
   * );
   */
  async write(
    ...commands: string[]
  ): Promise<Record<string, string>[]> {
    const api = await this.getApi();

    return api.write(commands);
  }

  /**
   * Identidade do equipamento.
   */
  async getIdentity(): Promise<unknown> {
    const api = await this.getApi();

    return api.getSystemIdentity();
  }

  /**
   * Recursos do sistema.
   */
  async getSystemResources(): Promise<unknown> {
    const api = await this.getApi();

    return api.getSystemResources();
  }

  /**
   * Interfaces do MikroTik.
   */
  async getInterfaces(): Promise<unknown> {
    const api = await this.getApi();

    return api.getInterfaces();
  }

  /**
   * Verifica se está conectado.
   */
  get connected(): boolean {
    return this.api?.connected ?? false;
  }
}

export default MikroTikClient;