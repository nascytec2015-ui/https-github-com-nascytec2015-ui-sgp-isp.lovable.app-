import { Router, type Request, type Response } from "express";
import {
    MikroTikService,
    type MikroTikConfig,
} from "../services/mikrotik/MikroTikService";

const router = Router();

/**
 * Instância do serviço MikroTik.
 *
 * A configuração é carregada pelo MikroTikService
 * através das variáveis do .env.
 */
const mikrotik = new MikroTikService();

/**
 * Tratamento padronizado de erros.
 */
function handleError(
    res: Response,
    error: unknown,
    defaultMessage = "Erro ao executar operação no MikroTik."
) {
    console.error("[API MikroTik]", error);

    const message =
        error instanceof Error
            ? error.message
            : defaultMessage;

    return res.status(500).json({
        success: false,
        error: message,
    });
}

/**
 * GET /api/mikrotik/pppoe
 *
 * Lista todos os usuários PPP/PPPoE
 * cadastrados no MikroTik.
 */
router.get(
    "/api/mikrotik/pppoe",
    async (_req: Request, res: Response) => {
        try {
            const users = await mikrotik.getPPPUsers();

            return res.json({
                success: true,
                total: users.length,
                data: users,
            });
        } catch (error) {
            return handleError(
                res,
                error,
                "Não foi possível listar os usuários PPPoE."
            );
        }
    }
);

/**
 * GET /api/mikrotik/pppoe/:username
 *
 * Consulta um usuário PPPoE específico.
 */
router.get(
    "/api/mikrotik/pppoe/:username",
    async (req: Request, res: Response) => {
        try {
            const username = String(req.params.username).trim();

            if (!username) {
                return res.status(400).json({
                    success: false,
                    error: "Usuário PPPoE é obrigatório.",
                });
            }

            const user = await mikrotik.findPPPUser(username);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: `Usuário PPPoE "${username}" não encontrado.`,
                });
            }

            return res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            return handleError(
                res,
                error,
                "Não foi possível consultar o usuário PPPoE."
            );
        }
    }
);

/**
 * POST /api/mikrotik/pppoe
 *
 * Cria um novo usuário PPPoE.
 *
 * Body:
 * {
 *   "username": "cliente001",
 *   "password": "123456",
 *   "profile": "plano-30mb"
 * }
 */
router.post(
    "/api/mikrotik/pppoe",
    async (req: Request, res: Response) => {
        try {
            const {
                username,
                password,
                profile,
            } = req.body ?? {};

            if (
                typeof username !== "string" ||
                !username.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    error: "O campo username é obrigatório.",
                });
            }

            if (
                typeof password !== "string" ||
                !password
            ) {
                return res.status(400).json({
                    success: false,
                    error: "O campo password é obrigatório.",
                });
            }

            if (
                typeof profile !== "string" ||
                !profile.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    error: "O campo profile é obrigatório.",
                });
            }

            const user =
                await mikrotik.createPPPUser(
                    username,
                    password,
                    profile
                );

            return res.status(201).json({
                success: true,
                message: "Usuário PPPoE criado com sucesso.",
                data: user,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Erro ao criar usuário PPPoE.";

            /**
             * Usuário já existente.
             */
            if (
                message
                    .toLowerCase()
                    .includes("já existe")
            ) {
                return res.status(409).json({
                    success: false,
                    error: message,
                });
            }

            return handleError(res, error);
        }
    }
);

/**
 * PUT /api/mikrotik/pppoe/:username
 *
 * Altera senha e/ou perfil.
 *
 * Body:
 * {
 *   "password": "novaSenha",
 *   "profile": "plano-80mb"
 * }
 */
router.put(
    "/api/mikrotik/pppoe/:username",
    async (req: Request, res: Response) => {
        try {
            const username = String(req.params.username).trim();

            if (!username) {
                return res.status(400).json({
                    success: false,
                    error: "Usuário PPPoE é obrigatório.",
                });
            }

            const {
                password,
                profile,
            } = req.body ?? {};

            const data: {
                password?: string;
                profile?: string;
            } = {};

            if (password !== undefined) {
                if (
                    typeof password !== "string" ||
                    !password
                ) {
                    return res.status(400).json({
                        success: false,
                        error: "A senha informada é inválida.",
                    });
                }

                data.password = password;
            }

            if (profile !== undefined) {
                if (
                    typeof profile !== "string" ||
                    !profile.trim()
                ) {
                    return res.status(400).json({
                        success: false,
                        error: "O perfil informado é inválido.",
                    });
                }

                data.profile = profile;
            }

            if (
                data.password === undefined &&
                data.profile === undefined
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        "Informe password ou profile para alterar o usuário.",
                });
            }

            const user =
                await mikrotik.updatePPPUser(
                    username,
                    data
                );

            return res.json({
                success: true,
                message: "Usuário PPPoE atualizado com sucesso.",
                data: user,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Erro ao atualizar usuário PPPoE.";

            if (
                message
                    .toLowerCase()
                    .includes("não foi encontrado")
            ) {
                return res.status(404).json({
                    success: false,
                    error: message,
                });
            }

            return handleError(res, error);
        }
    }
);

/**
 * PATCH /api/mikrotik/pppoe/:username/bloquear
 *
 * Bloqueia o usuário PPPoE.
 */
router.patch(
    "/api/mikrotik/pppoe/:username/bloquear",
    async (req: Request, res: Response) => {
        try {
            const username = String(req.params.username).trim();

            if (!username) {
                return res.status(400).json({
                    success: false,
                    error: "Usuário PPPoE é obrigatório.",
                });
            }

            const user =
                await mikrotik.disablePPPUser(
                    username
                );

            return res.json({
                success: true,
                message: "Usuário PPPoE bloqueado com sucesso.",
                data: user,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Erro ao bloquear usuário PPPoE.";

            if (
                message
                    .toLowerCase()
                    .includes("não foi encontrado")
            ) {
                return res.status(404).json({
                    success: false,
                    error: message,
                });
            }

            return handleError(res, error);
        }
    }
);

/**
 * PATCH /api/mikrotik/pppoe/:username/desbloquear
 *
 * Desbloqueia o usuário PPPoE.
 */
router.patch(
    "/api/mikrotik/pppoe/:username/desbloquear",
    async (req: Request, res: Response) => {
        try {
            const username = String(req.params.username).trim();

            if (!username) {
                return res.status(400).json({
                    success: false,
                    error: "Usuário PPPoE é obrigatório.",
                });
            }

            const user =
                await mikrotik.enablePPPUser(
                    username
                );

            return res.json({
                success: true,
                message:
                    "Usuário PPPoE desbloqueado com sucesso.",
                data: user,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Erro ao desbloquear usuário PPPoE.";

            if (
                message
                    .toLowerCase()
                    .includes("não foi encontrado")
            ) {
                return res.status(404).json({
                    success: false,
                    error: message,
                });
            }

            return handleError(res, error);
        }
    }
);

/**
 * DELETE /api/mikrotik/pppoe/:username
 *
 * Remove definitivamente o usuário PPPoE
 * do MikroTik.
 */
router.delete(
    "/api/mikrotik/pppoe/:username",
    async (req: Request, res: Response) => {
        try {
            const username = String(req.params.username).trim();

            if (!username) {
                return res.status(400).json({
                    success: false,
                    error: "Usuário PPPoE é obrigatório.",
                });
            }

            await mikrotik.deletePPPUser(
                username
            );

            return res.json({
                success: true,
                message: `Usuário PPPoE "${username}" removido com sucesso.`,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Erro ao remover usuário PPPoE.";

            if (
                message
                    .toLowerCase()
                    .includes("não foi encontrado")
            ) {
                return res.status(404).json({
                    success: false,
                    error: message,
                });
            }

            return handleError(res, error);
        }
    }
);

/**
 * GET /api/mikrotik/pppoe-sessoes/ativas
 *
 * Lista conexões PPP ativas no MikroTik.
 */
router.get(
    "/api/mikrotik/pppoe-sessoes/ativas",
    async (_req: Request, res: Response) => {
        try {
            const sessions =
                await mikrotik.getActivePPPSessions();

            return res.json({
                success: true,
                data: sessions,
            });
        } catch (error) {
            return handleError(
                res,
                error,
                "Não foi possível consultar as sessões PPP ativas."
            );
        }
    }
);

/**
 * GET /api/mikrotik/health
 *
 * Testa a comunicação com o MikroTik.
 */
router.get(
    "/api/mikrotik/health",
    async (_req: Request, res: Response) => {
        try {
            const identity =
                await mikrotik.getIdentity();

            return res.json({
                success: true,
                status: "online",
                identity,
            });
        } catch (error) {
            console.error(
                "[API MikroTik] Health check falhou:",
                error
            );

            return res.status(503).json({
                success: false,
                status: "offline",
                error:
                    error instanceof Error
                        ? error.message
                        : "MikroTik indisponível.",
            });
        }
    }
);

/**
 * Exporta o Router.
 */
export default router;