import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createPPPInput = z.object({
    username: z.string().trim().min(1).max(80),
    password: z.string().min(1).max(80),
    profile: z.string().trim().min(1).max(80),
});

export const createPPPForClient = createServerFn({
    method: "POST",
})
    .validator(createPPPInput)
    .handler(async ({ data }) => {
        // Importação feita somente no servidor.
        const { MikroTikService } = await import(
            "@/services/mikrotik"
        );

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
                user: {
                    id: user.id,
                    username: user.username,
                    service: user.service,
                    profile: user.profile,
                    disabled: user.disabled,
                },
            };
        } finally {
            await mikrotik.disconnect();
        }
    });