// src/utils/BotLog.ts
import {
    TextChannel,
    EmbedBuilder,
    Message,
    ActionRowBuilder,
    ContainerBuilder, MessageFlags,
} from 'discord.js';
import {Log} from "@spatulox/utils";
import {Bot} from "./Bot";
import {SendableComponent} from "../manager/builder/SendableComponentBuilder";
import {SelectMenuManager} from "../manager/interactible/SelectMenuManager";
import {BotEnv} from "./BotEnv";

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
        content: string | SendableComponent,
        prefix: "info" | "warn" | "error" | "debug" = 'info'
    ): Promise<Message | void> {
        if (!channel) return;
        let msg

        try {
            if (content instanceof EmbedBuilder) {
                const text = content.data.description ?? content.data.title;
                if (text) {
                    Log.info(text);
                }
                msg = await channel.send({embeds: [content]});
            } else if (SelectMenuManager.isSelectMenuList(content)) {
                msg = await channel.send({components: SelectMenuManager.rows(content)});
            } else if (content instanceof ContainerBuilder) {
                msg = await channel.send({components: [content], flags: MessageFlags.IsComponentsV2});
            } else if (content instanceof ActionRowBuilder) {
                msg = await channel.send({components: [content]});
            } else {
                const timestamp = `\`${new Date().toISOString()}\``;
                msg = await channel.send(`[${timestamp}] [${prefix.toUpperCase()}] ${content}`);
            }
        } catch (error) {
            Log.error(`Failed to send to Discord channel: ${error}`);
        }

        return msg
    }

    /**
     * Send INFO log - TEXT or EMBED ! Respecte config.log.info
     */
    static async info(content: string | SendableComponent): Promise<Message | void> {
        const logConfig = Bot.config?.log;

        // 1. CONSOLE selon config (ou défaut ON)
        if (!logConfig || logConfig.info.console) {
            if(typeof content == 'string') { Log.info(content) }
        }

        // 2. Discord seulement si config + channel
        if (logConfig?.info.discord && this.logChannel) {
            return await this._sendToChannel(this.logChannel, content, 'info');
        }
    }

    /**
     * Send ERROR log - TEXT or EMBED ! Respecte config.log.error
     */
    static async error(content: string | SendableComponent): Promise<Message | void> {
        const logConfig = Bot.config?.log;

        // 1. CONSOLE selon config (ou défaut ON)
        if (!logConfig || logConfig.error.console) {
            if(typeof content == 'string') { Log.error(content) }
        }

        // 2. Discord seulement si config + channel
        if (logConfig?.error.discord && this.errorChannel) {
            return await this._sendToChannel(this.errorChannel, content, 'error');
        }
    }

    /**
     * Send WARNING log - TEXT or EMBED ! Respecte config.log.warn
     */
    static async warn(content: string | SendableComponent): Promise<Message | void> {
        const logConfig = Bot.config?.log;

        if (!logConfig || logConfig?.warn.console) {
            if(typeof content == 'string') { Log.warn(content) }
        }

        if (logConfig?.warn.discord && this.warnChannel) {
            return await this._sendToChannel(this.warnChannel, content, 'warn');
        }
    }

    /**
     * Send DEBUG log - TEXT or EMBED ! Respecte config.log.debug
     */
    static async debug(content: string | SendableComponent): Promise<Message | void> {
        if(!BotEnv.dev) return
        const logConfig = Bot.config?.log;

        if (!logConfig || logConfig?.debug.console) {
            if(typeof content == 'string') { Log.debug(content) }
        }

        if (logConfig?.debug.discord && this.debugChannel) {
            return await this._sendToChannel(this.debugChannel, content, 'debug');
        }
    }

}