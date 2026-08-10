import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { MikroTikService } from "@/services/mikrotik";

/**
 * ============================================================
 * SCHEMAS
 * ============================================================
 */

const pppUsernameSchema = z.object({
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
 * HELPERS
 * ============================================================
 */

function serializePPPUser(user: {
    id: string;
    username: string;
    service: string;
    profile: string;
    disabled: boolean;
}) {
    return {
        id: user.id,
        username: user.username,
        service: user.service,
        profile: user.profile,
        disabled: user.disabled,
    };
}

/**
 * ============================================================
 * LISTAR PPPoE
 * ============================================================
 */

export const getPPPUsers = createServerFn({
    method: "GET",
}).handler(async () => {
    const mikrotik = new MikroTikService();

    try {
        await mikrotik.connect();

        const users = await mikrotik.getPPPUsers();

        return {
            success: true,
            users: users.map(serializePPPUser),
            total: users.length,
        };
    } finally {
        await mikrotik.disconnect();
    }
});

/**
 * ============================================================
 * BUSCAR PPPoE
 * ============================================================
 */

export const findPPPUser = createServerFn({
    method: "POST",
})
    .validator(pppUsernameSchema)
    .handler(async ({ data }) => {
        const mikrotik = new MikroTikService();

        try {
            await mikrotik.connect();

            const user = await mikrotik.findPPPUser(data.username);

            return {
                success: true,
                found: !!user,
                user: user ? serializePPPUser(user) : null,
            };
        } finally {
            await mikrotik.disconnect();
        }
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
        const mikrotik = new MikroTikService();

        try {
            await mikrotik.connect();

            const user = await mikrotik.createPPPUser(
                data.username,
                data.password,
                data.profile,
            );

            return {
                success: true,
                message: `PPPoE "${data.username}" criado com sucesso.`,
                user: serializePPPUser(user),
            };
        } finally {
            await mikrotik.disconnect();
        }
    });

/**
 * ============================================================
 * ALTERAR PPPoE
 * ============================================================
 */

export const updatePPPForClient = createServerFn({
    method: "POST",
})
    .validator(updatePPPInput)
    .handler(async ({ data }) => {
        const mikrotik = new MikroTikService();

        try {
            await mikrotik.connect();

            const user = await mikrotik.updatePPPUser(
                data.username,
                {
                    password: data.password,
                    profile: data.profile,
                },
            );

            return {
                success: true,
                message: `PPPoE "${data.username}" atualizado com sucesso.`,
                user: serializePPPUser(user),
            };
        } finally {
            await mikrotik.disconnect();
        }
    });

/**
 * ============================================================
 * BLOQUEAR PPPoE
 * ============================================================
 */

export const disablePPPForClient = createServerFn({
    method: "POST",
})
    .validator(pppUsernameSchema)
    .handler(async ({ data }) => {
        const mikrotik = new MikroTikService();

        try {
            await mikrotik.connect();

            const user = await mikrotik.disablePPPUser(data.username);

            return {
                success: true,
                message: `PPPoE "${data.username}" bloqueado com sucesso.`,
                user: serializePPPUser(user),
            };
        } finally {
            await mikrotik.disconnect();
        }
    });

/**
 * ============================================================
 * DESBLOQUEAR PPPoE
 * ============================================================
 */

export const enablePPPForClient = createServerFn({
    method: "POST",
})
    .validator(pppUsernameSchema)
    .handler(async ({ data }) => {
        const mikrotik = new MikroTikService();

        try {
            await mikrotik.connect();

            const user = await mikrotik.enablePPPUser(data.username);

            return {
                success: true,
                message: `PPPoE "${data.username}" desbloqueado com sucesso.`,
                user: serializePPPUser(user),
            };
        } finally {
            await mikrotik.disconnect();
        }
    });

/**
 * ============================================================
 * REMOVER PPPoE
 * ============================================================
 */

export const deletePPPForClient = createServerFn({
    method: "POST",
})
    .validator(pppUsernameSchema)
    .handler(async ({ data }) => {
        const mikrotik = new MikroTikService();

        try {
            await mikrotik.connect();

            await mikrotik.deletePPPUser(data.username);

            return {
                success: true,
                message: `PPPoE "${data.username}" removido com sucesso.`,
                username: data.username,
            };
        } finally {
            await mikrotik.disconnect();
        }
    });