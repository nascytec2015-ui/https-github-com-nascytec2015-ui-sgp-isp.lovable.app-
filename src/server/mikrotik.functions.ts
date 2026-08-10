import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { MikroTikService } from "@/services/mikrotik";

/**
 * ============================================================
 * SCHEMAS
 * ============================================================
 */

const usernameSchema = z.object({
    username: z.string().trim().min(1).max(80),
});

const createPPPInput = z.object({
    username: z.string().trim().min(1).max(80),
    password: z.string().min(1).max(80),
    profile: z.string().trim().min(1).max(80),
});

const updatePPPInput = z.object({
    username: z.string().trim().min(1).max(80),
    password: z.string().min(1).max(80).optional(),
    profile: z.string().trim().min(1).max(80).optional(),
});

/**
 * ============================================================
 * HELPER
 * ============================================================
 */

async function withMikroTik<T>(
    callback: (mikrotik: MikroTikService) => Promise<T>,
): Promise<T> {
    const mikrotik = new MikroTikService();

    try {
        await mikrotik.connect();

        return await callback(mikrotik);
    } finally {
        await mikrotik.disconnect();
    }
}

/**
 * ============================================================
 * LISTAR TODOS OS PPPoE
 * ============================================================
 */

export const getPPPUsers = createServerFn({
    method: "GET",
}).handler(async () => {
    return withMikroTik(async (mikrotik) => {
        const users = await mikrotik.getPPPUsers();

        return {
            success: true,
            users,
        };
    });
});

/**
 * ============================================================
 * BUSCAR UM PPPoE
 * ============================================================
 */

export const getPPPUser = createServerFn({
    method: "POST",
})
    .validator(usernameSchema)
    .handler(async ({ data }) => {
        return withMikroTik(async (mikrotik) => {
            const user = await mikrotik.findPPPUser(data.username);

            if (!user) {
                throw new Error(
                    `O usuário PPP "${data.username}" não foi encontrado.`,
                );
            }

            return {
                success: true,
                user,
            };
        });
    });

/**
 * ============================================================
 * CRIAR PPPoE
 * ============================================================
 */

export const createPPPForClient = createServerFn({
    method: "POST",
})
    .validator(createPPPInput)
    .handler(async ({ data }) => {
        return withMikroTik(async (mikrotik) => {
            const user = await mikrotik.createPPPUser(
                data.username,
                data.password,
                data.profile,
            );

            return {
                success: true,
                message: "PPPoE criado com sucesso.",
                user: {
                    id: user.id,
                    username: user.username,
                    service: user.service,
                    profile: user.profile,
                    disabled: user.disabled,
                },
            };
        });
    });

/**
 * ============================================================
 * EDITAR PPPoE
 * ============================================================
 *
 * Pode alterar:
 * - senha
 * - perfil
 */

export const updatePPPForClient = createServerFn({
    method: "POST",
})
    .validator(updatePPPInput)
    .handler(async ({ data }) => {
        if (
            data.password === undefined &&
            data.profile === undefined
        ) {
            throw new Error(
                "Informe a nova senha ou o novo perfil.",
            );
        }

        return withMikroTik(async (mikrotik) => {
            const user = await mikrotik.updatePPPUser(
                data.username,
                {
                    password: data.password,
                    profile: data.profile,
                },
            );

            return {
                success: true,
                message: "PPPoE atualizado com sucesso.",
                user,
            };
        });
    });

/**
 * ============================================================
 * BLOQUEAR PPPoE
 * ============================================================
 */

export const disablePPPForClient = createServerFn({
    method: "POST",
})
    .validator(usernameSchema)
    .handler(async ({ data }) => {
        return withMikroTik(async (mikrotik) => {
            const user = await mikrotik.disablePPPUser(
                data.username,
            );

            return {
                success: true,
                message: "PPPoE bloqueado com sucesso.",
                user,
            };
        });
    });

/**
 * ============================================================
 * DESBLOQUEAR PPPoE
 * ============================================================
 */

export const enablePPPForClient = createServerFn({
    method: "POST",
})
    .validator(usernameSchema)
    .handler(async ({ data }) => {
        return withMikroTik(async (mikrotik) => {
            const user = await mikrotik.enablePPPUser(
                data.username,
            );

            return {
                success: true,
                message: "PPPoE desbloqueado com sucesso.",
                user,
            };
        });
    });

/**
 * ============================================================
 * REMOVER PPPoE
 * ============================================================
 */

export const deletePPPForClient = createServerFn({
    method: "POST",
})
    .validator(usernameSchema)
    .handler(async ({ data }) => {
        return withMikroTik(async (mikrotik) => {
            await mikrotik.deletePPPUser(
                data.username,
            );

            return {
                success: true,
                message: `PPPoE "${data.username}" removido com sucesso.`,
            };
        });
    });

/**
 * ============================================================
 * SESSÕES PPPoE ATIVAS
 * ============================================================
 */

export const getActivePPPSessions = createServerFn({
    method: "GET",
}).handler(async () => {
    return withMikroTik(async (mikrotik) => {
        const sessions =
            await mikrotik.getActivePPPSessions();

        return {
            success: true,
            sessions,
        };
    });
});