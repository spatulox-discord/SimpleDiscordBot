import {TextChannel, ChannelType, GuildChannelCreateOptions} from "discord.js";
import {GuildChannelManager} from "./GuildChannelManager";
import {Bot} from "../../../core/Bot";
import {Log} from "@spatulox/utils";

export class GuildTextChannelManager extends GuildChannelManager {

    static async findInGuild(guildId: string, channelId: string): Promise<TextChannel | null> {
        const channel = await super.findInGuild(guildId, channelId);
        return channel instanceof TextChannel ? channel : null;
    }

    static async find(channelId: string): Promise<TextChannel | null> {
        const channel = await super.find(channelId);
        return channel instanceof TextChannel ? channel : null;
    }

    static findAll(guildId: string): TextChannel[] {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            Log.warn(`Guild ${guildId} not found`);
            return [];
        }
        return Array.from(guild.channels.cache.values()).filter(c => c instanceof TextChannel);
    }

    static async create(guildId: string, name: string, options?: Omit<GuildChannelCreateOptions, 'type'>): Promise<TextChannel> {
        return await super._create(guildId, {
            name,
            type: ChannelType.GuildText,
            ...options
        }) as TextChannel;
    }
}