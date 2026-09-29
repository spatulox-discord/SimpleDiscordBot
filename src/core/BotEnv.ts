export const BotEnv = {
    get token(): string {
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) throw new Error('Missing environment variable : DISCORD_BOT_TOKEN');
        return token;
    },
    get dev(): boolean {
        // Same rule as the dim CLI (discord-interaction-manager) : only true / 1 enable the dev mode
        return ["true", "1"].includes(process.env.DISCORD_BOT_DEV?.trim().toLowerCase() ?? "");
    }
} as const;
