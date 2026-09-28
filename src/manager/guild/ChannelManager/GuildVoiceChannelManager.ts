import {ChannelType, GuildChannelCreateOptions, VoiceChannel} from "discord.js";
import {GuildChannelManager} from "./GuildChannelManager";
import {Bot} from "../../../core/Bot";
import {Log} from "@spatulox/utils";

export class GuildVoiceChannelManager extends GuildChannelManager {
    static async findInGuild(guildId: string, channelId: string): Promise<VoiceChannel | null> {
        const channel = await super.findInGuild(guildId, channelId);
        return channel instanceof VoiceChannel ? channel : null;
    }

    static async find(channelId: string): Promise<VoiceChannel | null> {
        const channel = await super.find(channelId);
        return channel instanceof VoiceChannel ? channel : null;
    }

    static findAll(guildId: string): VoiceChannel[] {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            Log.warn(`Guild ${guildId} not found`);
            return [];
        }
        return Array.from(guild.channels.cache.values()).filter(c => c instanceof VoiceChannel);
    }

    static async create(guildId: string, name: string, options?: Omit<GuildChannelCreateOptions, 'type'>): Promise<VoiceChannel> {
        return await super._create(guildId, {
            name,
            type: ChannelType.GuildVoice,
            ...options
        }) as VoiceChannel;
    }
}