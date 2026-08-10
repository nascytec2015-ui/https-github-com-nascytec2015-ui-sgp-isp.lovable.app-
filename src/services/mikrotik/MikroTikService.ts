import { MikroTikClient } from "./MikroTikClient";

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
    [x: string]: any;
    private readonly client: MikroTikClient;
    private readonly config: MikroTikConfig;

    constructor(config?: Partial<MikroTikConfig>) {
        this.config = {
            host:
                config?.host ??
                process.env.MIKROTIK_HOST ??
                "",

            port:
                config?.port ??
                Number(
                    process.env.MIKROTIK_PORT ?? 8728,
                ),

            user:
                config?.user ??
                process.env.MIKROTIK_USER ??
                "",

            password:
                config?.password ??
                process.env.MIKROTIK_PASSWORD ??
                "",

            timeout:
                config?.timeout ??
                Number(
                    process.env.MIKROTIK_TIMEOUT ?? 10,
                ),

            tls:
                config?.tls ??
                process.env.MIKROTIK_TLS === "true",
        };

        this.validateConfig();

        this.client = new MikroTikClient({
            host: this.config.host,
            port: this.config.port,
            user: this.config.user,
            password: this.config.password,
            timeout: this.config.timeout,
            tls: this.config.tls,
        });
    }

    /**
     * Valida a configuração do MikroTik.
     */
    private validateConfig(): void {
        if (!this.config.host) {
            throw new Error(
                "MIKROTIK_HOST não foi configurado no arquivo .env",
            );
        }

        if (!this.config.user) {
            throw new Error(
                "MIKROTIK_USER não foi configurado no arquivo .env",
            );
        }

        if (!this.config.password) {
            throw new Error(
                "MIKROTIK_PASSWORD não foi configurado no arquivo .env",
            );
        }
    }

    /**
     * Conecta ao MikroTik.
     */
    async connect(): Promise<void> {
        await this.client.connect();
    }

    /**
     * Desconecta do MikroTik.
     */
    async disconnect(): Promise<void> {
        await this.client.disconnect();
    }

    /**
     * Retorna a identidade do equipamento.
     */
    async getIdentity(): Promise<unknown> {
        return this.client.getIdentity();
    }

    /**
     * Retorna os recursos do sistema.
     */
    async getSystemResources(): Promise<unknown> {
        return this.client.getSystemResources();
    }

    /**
     * Retorna as interfaces.
     */
    async getInterfaces(): Promise<unknown> {
        return this.client.getInterfaces();
    }

    /**
     * Retorna sessões PPP ativas.
     */
    async getActivePPPSessions(): Promise<
        Record<string, string>[]
    > {
        return this.client.write(
            "/ppp/active/print",
        );
    }

    /**
     * Retorna todos os usuários PPP.
     */
    async getPPPUsers(): Promise<PPPUser[]> {
        const secrets =
            await this.client.write(
                "/ppp/secret/print",
            );

        return secrets.map((secret) => ({
            id: secret[".id"] ?? "",
            username: secret["name"] ?? "",
            service: secret["service"] ?? "",
            profile: secret["profile"] ?? "",
            disabled:
                secret["disabled"] === "true",
        }));
    }

    /**
     * Localiza um usuário PPP pelo nome.
     */
    async findPPPUser(
        username: string,
    ): Promise<PPPUser | null> {
        const normalizedUsername =
            username.trim().toLowerCase();

        if (!normalizedUsername) {
            return null;
        }

        const users =
            await this.getPPPUsers();

        return (
            users.find(
                (user) =>
                    user.username
                        .toLowerCase() ===
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
        const normalizedUsername =
            username.trim();

        const normalizedProfile =
            profile.trim();

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

        await this.client.write(
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
     * Atualiza senha e/ou perfil PPP.
     */
    async updatePPPUser(
        username: string,
        data: {
            password?: string;
            profile?: string;
        },
    ): Promise<PPPUser> {
        const normalizedUsername =
            username.trim();

        const user =
            await this.findPPPUser(
                normalizedUsername,
            );

        if (!user) {
            throw new Error(
                `O usuário PPP "${normalizedUsername}" não foi encontrado no MikroTik.`,
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

        await this.client.write(
            ...commands,
        );

        const updatedUser =
            await this.findPPPUser(
                normalizedUsername,
            );

        if (!updatedUser) {
            throw new Error(
                `Não foi possível confirmar a atualização do usuário "${normalizedUsername}".`,
            );
        }

        return updatedUser;
    }

    /**
     * Bloqueia um usuário PPP.
     */
    async disablePPPUser(
        username: string,
    ): Promise<PPPUser> {
        const normalizedUsername =
            username.trim();

        const user =
            await this.findPPPUser(
                normalizedUsername,
            );

        if (!user) {
            throw new Error(
                `O usuário PPP "${normalizedUsername}" não foi encontrado no MikroTik.`,
            );
        }

        if (user.disabled) {
            return user;
        }

        await this.client.write(
            "/ppp/secret/set",
            `=.id=${user.id}`,
            "=disabled=yes",
        );

        const updatedUser =
            await this.findPPPUser(
                normalizedUsername,
            );

        if (!updatedUser) {
            throw new Error(
                `Não foi possível confirmar o bloqueio de "${normalizedUsername}".`,
            );
        }

        return updatedUser;
    }

    /**
     * Desbloqueia um usuário PPP.
     */
    async enablePPPUser(
        username: string,
    ): Promise<PPPUser> {
        const normalizedUsername =
            username.trim();

        const user =
            await this.findPPPUser(
                normalizedUsername,
            );

        if (!user) {
            throw new Error(
                `O usuário PPP "${normalizedUsername}" não foi encontrado no MikroTik.`,
            );
        }

        if (!user.disabled) {
            return user;
        }

        await this.client.write(
            "/ppp/secret/set",
            `=.id=${user.id}`,
            "=disabled=no",
        );

        const updatedUser =
            await this.findPPPUser(
                normalizedUsername,
            );

        if (!updatedUser) {
            throw new Error(
                `Não foi possível confirmar o desbloqueio de "${normalizedUsername}".`,
            );
        }

        return updatedUser;
    }

    /**
     * Remove um usuário PPP.
     */
    async deletePPPUser(
        username: string,
    ): Promise<void> {
        const normalizedUsername =
            username.trim();

        const user =
            await this.findPPPUser(
                normalizedUsername,
            );

        if (!user) {
            throw new Error(
                `O usuário PPP "${normalizedUsername}" não foi encontrado no MikroTik.`,
            );
        }

        await this.client.write(
            "/ppp/secret/remove",
            `=.id=${user.id}`,
        );

        const deletedUser =
            await this.findPPPUser(
                normalizedUsername,
            );

        if (deletedUser) {
            throw new Error(
                `Não foi possível confirmar a remoção de "${normalizedUsername}".`,
            );
        }
    }

    /**
     * Executa um comando RouterOS diretamente.
     *
     * Mantido para compatibilidade e
     * diagnósticos administrativos.
     */
    async command(
        ...commands: string[]
    ): Promise<Record<string, string>[]> {
        return this.client.write(
            ...commands,
        );
    }
}

export default MikroTikService;