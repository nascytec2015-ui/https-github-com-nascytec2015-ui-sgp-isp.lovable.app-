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

export interface PPPUser {
  id: string;
  username: string;
  service: string;
  profile: string;
  disabled: boolean;
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
      `${this.config.host}:${this.config.port}...`,
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
   * client.write("/ppp/secret/print");
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
   * Lista todos os usuários PPP/PPPoE.
   */
  async getPPPUsers(): Promise<PPPUser[]> {
    const result = await this.write(
      "/ppp/secret/print",
    );

    return result.map((secret) => ({
      id: secret[".id"] ?? "",
      username: secret["name"] ?? "",
      service: secret["service"] ?? "",
      profile: secret["profile"] ?? "",
      disabled: secret["disabled"] === "true",
    }));
  }

  /**
   * Procura um usuário PPP pelo nome.
   */
  async findPPPUser(
    username: string,
  ): Promise<PPPUser | null> {
    const normalizedUsername = username
      .trim()
      .toLowerCase();

    if (!normalizedUsername) {
      throw new Error(
        "O usuário PPP é obrigatório.",
      );
    }

    const users = await this.getPPPUsers();

    return (
      users.find(
        (user) =>
          user.username.toLowerCase() ===
          normalizedUsername,
      ) ?? null
    );
  }

  /**
   * Cria um usuário PPPoE.
   */
  async createPPPUser(
    username: string,
    password: string,
    profile: string,
  ): Promise<PPPUser> {
    const normalizedUsername = username.trim();
    const normalizedProfile = profile.trim();

    if (!normalizedUsername) {
      throw new Error(
        "O usuário PPP é obrigatório.",
      );
    }

    if (!password) {
      throw new Error(
        "A senha PPP é obrigatória.",
      );
    }

    if (!normalizedProfile) {
      throw new Error(
        "O perfil PPP é obrigatório.",
      );
    }

    const existingUser =
      await this.findPPPUser(
        normalizedUsername,
      );

    if (existingUser) {
      throw new Error(
        `O usuário PPP "${normalizedUsername}" já existe no MikroTik.`,
      );
    }

    await this.write(
      "/ppp/secret/add",
      `=name=${normalizedUsername}`,
      `=password=${password}`,
      "=service=pppoe",
      `=profile=${normalizedProfile}`,
    );

    const createdUser =
      await this.findPPPUser(
        normalizedUsername,
      );

    if (!createdUser) {
      throw new Error(
        `O usuário PPP "${normalizedUsername}" não foi encontrado após a criação.`,
      );
    }

    return createdUser;
  }

  /**
   * Altera senha e/ou perfil do PPPoE.
   */
  async updatePPPUser(
    username: string,
    data: {
      password?: string;
      profile?: string;
    },
  ): Promise<PPPUser> {
    const user =
      await this.findPPPUser(username);

    if (!user) {
      throw new Error(
        `O usuário PPP "${username}" não foi encontrado no MikroTik.`,
      );
    }

    const commands: string[] = [
      "/ppp/secret/set",
      `=.id=${user.id}`,
    ];

    if (data.password !== undefined) {
      if (!data.password) {
        throw new Error(
          "A nova senha PPP não pode ser vazia.",
        );
      }

      commands.push(
        `=password=${data.password}`,
      );
    }

    if (data.profile !== undefined) {
      const profile =
        data.profile.trim();

      if (!profile) {
        throw new Error(
          "O perfil PPP não pode ser vazio.",
        );
      }

      commands.push(
        `=profile=${profile}`,
      );
    }

    if (commands.length === 2) {
      throw new Error(
        "Informe password ou profile para alterar o usuário PPP.",
      );
    }

    await this.write(...commands);

    const updatedUser =
      await this.findPPPUser(username);

    if (!updatedUser) {
      throw new Error(
        `Não foi possível confirmar a atualização do usuário "${username}".`,
      );
    }

    return updatedUser;
  }

  /**
   * Bloqueia um usuário PPPoE.
   */
  async disablePPPUser(
    username: string,
  ): Promise<PPPUser> {
    const user =
      await this.findPPPUser(username);

    if (!user) {
      throw new Error(
        `O usuário PPP "${username}" não foi encontrado no MikroTik.`,
      );
    }

    if (user.disabled) {
      return user;
    }

    await this.write(
      "/ppp/secret/set",
      `=.id=${user.id}`,
      "=disabled=yes",
    );

    const updatedUser =
      await this.findPPPUser(username);

    if (!updatedUser) {
      throw new Error(
        `Não foi possível confirmar o bloqueio de "${username}".`,
      );
    }

    return updatedUser;
  }

  /**
   * Desbloqueia um usuário PPPoE.
   */
  async enablePPPUser(
    username: string,
  ): Promise<PPPUser> {
    const user =
      await this.findPPPUser(username);

    if (!user) {
      throw new Error(
        `O usuário PPP "${username}" não foi encontrado no MikroTik.`,
      );
    }

    if (!user.disabled) {
      return user;
    }

    await this.write(
      "/ppp/secret/set",
      `=.id=${user.id}`,
      "=disabled=no",
    );

    const updatedUser =
      await this.findPPPUser(username);

    if (!updatedUser) {
      throw new Error(
        `Não foi possível confirmar o desbloqueio de "${username}".`,
      );
    }

    return updatedUser;
  }

  /**
   * Remove um usuário PPPoE.
   */
  async deletePPPUser(
    username: string,
  ): Promise<void> {
    const user =
      await this.findPPPUser(username);

    if (!user) {
      throw new Error(
        `O usuário PPP "${username}" não foi encontrado no MikroTik.`,
      );
    }

    await this.write(
      "/ppp/secret/remove",
      `=.id=${user.id}`,
    );

    const deletedUser =
      await this.findPPPUser(username);

    if (deletedUser) {
      throw new Error(
        `Não foi possível confirmar a remoção de "${username}".`,
      );
    }
  }

  /**
   * Verifica se está conectado.
   */
  get connected(): boolean {
    return this.api?.connected ?? false;
  }
}