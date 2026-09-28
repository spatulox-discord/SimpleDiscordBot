export const BotEnv = {
    get token(): string {
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) throw new Error('Missing environment variable : DISCORD_BOT_TOKEN');
        return token;
    },
    get dev(): boolean {
        // Any defined value enables the dev mode, except the explicit "off" ones
        const dev = process.env.DISCORD_BOT_DEV;
        if (dev === undefined) return false;
        return !["", "false", "0", "no", "off"].includes(dev.trim().toLowerCase());
    }
} as const;
