// src/utils/BotLog.ts
import {
    TextChannel,
    EmbedBuilder,
    Message,
} from 'discord.js';
import {Log} from "@spatulox/utils";
import {Bot} from "./Bot";
import {SendableComponent, SendableComponentBuilder} from "../manager/builder/SendableComponentBuilder";
import {BotEnv} from "./BotEnv";

type LogContent = string | SendableComponent | SendableComponent[]
type PreciseLogConfig = {channelId: string, console: boolean, discord: boolean}
export type ConfigLog = {
    info: PreciseLogConfig
    error: PreciseLogConfig
    warn: PreciseLogConfig
    debug: PreciseLogConfig
}

export class BotLog {
    private static logChannel: TextChannel | null = null;
    private static warnChannel: TextChannel | null = null;
    private static debugChannel: TextChannel | null = null;
    private static  errorChannel: TextChannel | null = null;

    constructor() {}

    static config(): ConfigLog | undefined {
        return Bot.config.log
    }

    /**
     * Initialize Discord logging channels and update Bot.log references
     */

    public static async initDiscordLogging(): Promise<void> {
        if (!Bot.client.isReady()) {
            Log.warn('Client not ready for Discord logging init');
            return;
        }
        
        const logTypes = [
            { config: 'info', prop: 'logChannel' },
            { config: 'warn', prop: 'warnChannel' },
            { config: 'error', prop: 'errorChannel' },
            { config: 'debug', prop: 'debugChannel' }
        ] as const;

        for (const { config, prop } of logTypes) {
            const channelId = Bot.config.log?.[config]?.channelId;
            if (!channelId) continue;

            try {
                const channel = await Bot.client.channels.fetch(channelId) as TextChannel;
                if (channel?.isTextBased()) {
                    (BotLog)[prop] = channel;
                } else {
                    Log.warn(`${config.charAt(0).toUpperCase() + config.slice(1)} channel ${channelId} invalid`);
                }
            } catch (error) {
                Log.error(`${config.charAt(0).toUpperCase() + config.slice(1)} channel fetch failed: ${error}`);
            }
        }
    }

    /*public static async initDiscordLogging(): Promise<void> {
        if (!Bot.client.isReady()) {
            Log.warn('Client not ready for Discord logging init');
            return;
        }

        if (Bot.config.log?.info.channelId) {
            try {
                const logCh = await Bot.client.channels.fetch(Bot.config.log.info.channelId) as TextChannel;
                if (logCh?.isTextBased()) {
                    BotLog.logChannel = logCh;
                } else {
                    Log.warn(`Log channel ${Bot.config.log.info.channelId} invalid`);
                }
            } catch (error) {
                Log.error(`Log channel fetch failed: ${error}`);
            }
        }

        if (Bot.config.log?.warn.channelId) {
            try {
                const errorCh = await Bot.client.channels.fetch(Bot.config.log.warn.channelId) as TextChannel;
                if (errorCh?.isTextBased()) {
                    BotLog.warnChannel = errorCh;
                } else {
                    Log.warn(`Warn channel ${Bot.config.log.warn.channelId} invalid`);
                }
            } catch (error) {
                Log.error(`Warn channel fetch failed: ${error}`);
            }
        }

        if (Bot.config.log?.error.channelId) {
            try {
                const errorCh = await Bot.client.channels.fetch(Bot.config.log.error.channelId) as TextChannel;
                if (errorCh?.isTextBased()) {
                    BotLog.errorChannel = errorCh;
                } else {
                    Log.warn(`Error channel ${Bot.config.log.error.channelId} invalid`);
                }
            } catch (error) {
                Log.error(`Error channel fetch failed: ${error}`);
            }
        }

        if (Bot.config.log?.debug.channelId) {
            try {
                const errorCh = await Bot.client.channels.fetch(Bot.config.log.debug.channelId) as TextChannel;
                if (errorCh?.isTextBased()) {
                    BotLog.debugChannel = errorCh;
                } else {
                    Log.warn(`Debug channel ${Bot.config.log.debug.channelId} invalid`);
                }
            } catch (error) {
                Log.error(`Debug channel fetch failed: ${error}`);
            }
        }
    }*/


    /**
     * Send content to specific Discord channel
     */
    private static  async _sendToChannel(
        channel: TextChannel | null,
        content: LogContent,
        prefix: "info" | "warn" | "error" | "debug" = 'info'
    ): Promise<Message | void> {
        if (!channel) return;

        try {
            if (typeof content === 'string') {
                const timestamp = `\`${new Date().toISOString()}\``;
                return await channel.send(`[${timestamp}] [${prefix.toUpperCase()}] ${content}`);
            }
            return await channel.send(SendableComponentBuilder.buildMessage(content));
        } catch (error) {
            Log.error(`Failed to send to Discord channel: ${error}`);
        }
    }

    /**
     * Text printed in the console : the string itself, or the description / title of an embed
     */
    private static _consoleText(content: LogContent): string | null {
        if (typeof content === 'string') return content;
        if (content instanceof EmbedBuilder) return content.data.description ?? content.data.title ?? null;
        return null;
    }

    /**
     * Send INFO log - TEXT or EMBED ! Respecte config.log.info
     */
    static async info(content: LogContent): Promise<Message | void> {
        const logConfig = Bot.config?.log;

        // 1. CONSOLE selon config (ou défaut ON)
        if (!logConfig || logConfig.info.console) {
            const text = this._consoleText(content);
            if (text) { Log.info(text) }
        }

        // 2. Discord seulement si config + channel
        if (logConfig?.info.discord && this.logChannel) {
            return await this._sendToChannel(this.logChannel, content, 'info');
        }
    }

    /**
     * Send ERROR log - TEXT or EMBED ! Respecte config.log.error
     */
    static async error(content: LogContent): Promise<Message | void> {
        const logConfig = Bot.config?.log;

        // 1. CONSOLE selon config (ou défaut ON)
        if (!logConfig || logConfig.error.console) {
            const text = this._consoleText(content);
            if (text) { Log.error(text) }
        }

        // 2. Discord seulement si config + channel
        if (logConfig?.error.discord && this.errorChannel) {
            return await this._sendToChannel(this.errorChannel, content, 'error');
        }
    }

    /**
     * Send WARNING log - TEXT or EMBED ! Respecte config.log.warn
     */
    static async warn(content: LogContent): Promise<Message | void> {
        const logConfig = Bot.config?.log;

        if (!logConfig || logConfig?.warn.console) {
            const text = this._consoleText(content);
            if (text) { Log.warn(text) }
        }

        if (logConfig?.warn.discord && this.warnChannel) {
            return await this._sendToChannel(this.warnChannel, content, 'warn');
        }
    }

    /**
     * Send DEBUG log - TEXT or EMBED ! Respecte config.log.debug
     */
    static async debug(content: LogContent): Promise<Message | void> {
        if(!BotEnv.dev) return
        const logConfig = Bot.config?.log;

        if (!logConfig || logConfig?.debug.console) {
            const text = this._consoleText(content);
            if (text) { Log.debug(text) }
        }

        if (logConfig?.debug.discord && this.debugChannel) {
            return await this._sendToChannel(this.debugChannel, content, 'debug');
        }
    }

}