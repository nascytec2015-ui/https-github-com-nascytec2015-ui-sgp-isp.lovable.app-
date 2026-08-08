import { MikrotikAPI, type IRosOptions } from "@fibercom/routeros-api";

export interface MikroTikConfig {
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

export class MikroTikService {
    private api: MikrotikAPI | null = null;
    private readonly config: MikroTikConfig;

    constructor(config?: Partial<MikroTikConfig>) {
        this.config = {
            host: config?.host ?? process.env.MIKROTIK_HOST ?? "",
            port: config?.port ?? Number(process.env.MIKROTIK_PORT ?? 8728),
            user: config?.user ?? process.env.MIKROTIK_USER ?? "",
            password: config?.password ?? process.env.MIKROTIK_PASSWORD ?? "",
            timeout:
                config?.timeout ??
                Number(process.env.MIKROTIK_TIMEOUT ?? 10),
            tls:
                config?.tls ??
                process.env.MIKROTIK_TLS === "true",
        };

        this.validateConfig();
    }

    private validateConfig(): void {
        if (!this.config.host) {
            throw new Error(
                "MIKROTIK_HOST não foi configurado no arquivo .env"
            );
        }

        if (!this.config.user) {
            throw new Error(
                "MIKROTIK_USER não foi configurado no arquivo .env"
            );
        }

        if (!this.config.password) {
            throw new Error(
                "MIKROTIK_PASSWORD não foi configurado no arquivo .env"
            );
        }
    }

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
                "[MikroTikService] Erro RouterOS:",
                error.message
            );
        });

        api.on("timeout", (error) => {
            console.error(
                "[MikroTikService] Timeout RouterOS:",
                error.message
            );
        });

        return api;
    }

    async connect(): Promise<void> {
        if (this.api?.connected) {
            return;
        }

        console.log(
            `[MikroTikService] Conectando ao MikroTik ${this.config.host}:${this.config.port}...`
        );

        this.api = this.createApi();

        await this.api.connect();

        console.log(
            "[MikroTikService] Conexão estabelecida com sucesso."
        );
    }

    async disconnect(): Promise<void> {
        if (!this.api) {
            return;
        }

        if (this.api.connected) {
            await this.api.close();
        }

        this.api = null;

        console.log("[MikroTikService] Conexão encerrada.");
    }

    private async getApi(): Promise<MikrotikAPI> {
        if (!this.api?.connected) {
            await this.connect();
        }

        if (!this.api) {
            throw new Error(
                "Não foi possível inicializar a conexão com o MikroTik."
            );
        }

        return this.api;
    }

    async getIdentity(): Promise<unknown> {
        const api = await this.getApi();

        return api.getSystemIdentity();
    }

    async getSystemResources(): Promise<unknown> {
        const api = await this.getApi();

        return api.getSystemResources();
    }

    async getInterfaces(): Promise<unknown> {
        const api = await this.getApi();

        return api.getInterfaces();
    }

    async getActivePPPSessions(): Promise<unknown> {
        const api = await this.getApi();

        return api.write("/ppp/active/print");
    }

    async getPPPUsers(): Promise<PPPUser[]> {
        const api = await this.getApi();

        const secrets = await api.write("/ppp/secret/print");

        return secrets.map((secret) => ({
            id: secret[".id"] ?? "",
            username: secret["name"] ?? "",
            service: secret["service"] ?? "",
            profile: secret["profile"] ?? "",
            disabled: secret["disabled"] === "true",
        }));
    }

    async findPPPUser(username: string): Promise<PPPUser | null> {
        const users = await this.getPPPUsers();

        return (
            users.find(
                (user) =>
                    user.username.toLowerCase() === username.toLowerCase()
            ) ?? null
        );
    }

    async createPPPUser(
        username: string,
        password: string,
        profile: string
    ): Promise<PPPUser> {
        const api = await this.getApi();

        const normalizedUsername = username.trim();
        const normalizedProfile = profile.trim();

        if (!normalizedUsername) {
            throw new Error("O usuário PPP é obrigatório.");
        }

        if (!password) {
            throw new Error("A senha PPP é obrigatória.");
        }

        if (!normalizedProfile) {
            throw new Error("O perfil PPP é obrigatório.");
        }

        const existingUser = await this.findPPPUser(normalizedUsername);

        if (existingUser) {
            throw new Error(
                `O usuário PPP "${normalizedUsername}" já existe no MikroTik.`
            );
        }

        await api.write(
            "/ppp/secret/add",
            `=name=${normalizedUsername}`,
            `=password=${password}`,
            "=service=pppoe",
            `=profile=${normalizedProfile}`
        );

        const createdUser = await this.findPPPUser(normalizedUsername);

        if (!createdUser) {
            throw new Error(
                `O usuário PPP "${normalizedUsername}" não foi encontrado após a criação.`
            );
        }

        return createdUser;
    }

    async updatePPPUser(
        username: string,
        data: {
            password?: string;
            profile?: string;
        }
    ): Promise<PPPUser> {
        const api = await this.getApi();

        const user = await this.findPPPUser(username);

        if (!user) {
            throw new Error(
                `O usuário PPP "${username}" não foi encontrado no MikroTik.`
            );
        }

        const commands: string[] = [
            "/ppp/secret/set",
            `=.id=${user.id}`,
        ];

        if (data.password !== undefined) {
            if (!data.password) {
                throw new Error("A nova senha PPP não pode ser vazia.");
            }

            commands.push(`=password=${data.password}`);
        }

        if (data.profile !== undefined) {
            const profile = data.profile.trim();

            if (!profile) {
                throw new Error("O perfil PPP não pode ser vazio.");
            }

            commands.push(`=profile=${profile}`);
        }

        if (commands.length === 2) {
            throw new Error(
                "Informe password ou profile para alterar o usuário PPP."
            );
        }

        await api.write(commands);

        const updatedUser = await this.findPPPUser(username);

        if (!updatedUser) {
            throw new Error(
                `Não foi possível confirmar a atualização do usuário "${username}".`
            );
        }

        return updatedUser;
    }

    async disablePPPUser(username: string): Promise<PPPUser> {
        const api = await this.getApi();

        const user = await this.findPPPUser(username);

        if (!user) {
            throw new Error(
                `O usuário PPP "${username}" não foi encontrado no MikroTik.`
            );
        }

        if (user.disabled) {
            return user;
        }

        await api.write(
            "/ppp/secret/set",
            `=.id=${user.id}`,
            "=disabled=yes"
        );

        const updatedUser = await this.findPPPUser(username);

        if (!updatedUser) {
            throw new Error(
                `Não foi possível confirmar o bloqueio de "${username}".`
            );
        }

        return updatedUser;
    }

    async enablePPPUser(username: string): Promise<PPPUser> {
        const api = await this.getApi();

        const user = await this.findPPPUser(username);

        if (!user) {
            throw new Error(
                `O usuário PPP "${username}" não foi encontrado no MikroTik.`
            );
        }

        if (!user.disabled) {
            return user;
        }

        await api.write(
            "/ppp/secret/set",
            `=.id=${user.id}`,
            "=disabled=no"
        );

        const updatedUser = await this.findPPPUser(username);

        if (!updatedUser) {
            throw new Error(
                `Não foi possível confirmar o desbloqueio de "${username}".`
            );
        }

        return updatedUser;
    }

    async deletePPPUser(username: string): Promise<void> {
        const api = await this.getApi();

        const user = await this.findPPPUser(username);

        if (!user) {
            throw new Error(
                `O usuário PPP "${username}" não foi encontrado no MikroTik.`
            );
        }

        await api.write(
            "/ppp/secret/remove",
            `=.id=${user.id}`
        );

        const deletedUser = await this.findPPPUser(username);

        if (deletedUser) {
            throw new Error(
                `Não foi possível confirmar a remoção de "${username}".`
            );
        }
    }

    async command(
        ...commands: string[]
    ): Promise<Record<string, string>[]> {
        const api = await this.getApi();

        const result = await api.write(commands);

        return result;
    }
}