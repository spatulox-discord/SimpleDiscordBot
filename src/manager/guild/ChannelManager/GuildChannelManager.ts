import {
    GuildBasedChannel, GuildChannelCreateOptions
} from 'discord.js';
import {Bot} from "../../../core/Bot";
import {Log} from "@spatulox/utils";
import {GuildMessageManager} from "./GuildMessageManager";

export class GuildChannelManager {

    static readonly message = GuildMessageManager

    /**
     * Recherche un channel par ID dans une guild spécifique
     */
    static async findInGuild(guildId: string, channelId: string): Promise<GuildBasedChannel | null> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) {
                Log.warn(`Guild ${guildId} not found`);
                return null;
            }

            const channel = await guild.channels.fetch(channelId);
            return channel ?? null
        } catch (error) {
            Log.error(`Failed to find channel ${channelId} in guild ${guildId}: ${error}`,);
            return null;
        }
    }

    static async find(channelId: string): Promise<GuildBasedChannel | null> {
        try {
            const cached = Bot.client.channels.cache.get(channelId);
            if (cached && !cached.isDMBased()) return cached;

            const channel = await Bot.client.channels.fetch(channelId);
            if (channel && !channel.isDMBased()) return channel;

            Log.warn(`Channel ${channelId} not found in any guild`);
            return null;
        } catch (error) {
            Log.error(`Failed to find channel ${channelId}: ${error}`,);
            return null
        }
    }

    static findAll(guildId: string): GuildBasedChannel[] {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) {
                Log.warn(`Guild ${guildId} not found`);
                return [];
            }
            return Array.from(guild.channels.cache.values());
        } catch (error) {
            Log.error(`Failed to find channel ${guildId}: ${error}`,);
            return []
        }
    }

    /**
     * Recherche channels par nom (insensible à la casse)
     */
    static findByName(guildId: string, name: string): GuildBasedChannel[] {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) {
                Log.warn(`Guild ${guildId} not found`);
                return [];
            }

            return Array.from(guild.channels.cache.values())
                .filter(channel =>
                    channel.name.toLowerCase().includes(name.toLowerCase())
                );
        } catch (error) {
            Log.error(`Failed to find channel ${guildId}: ${error}`);
            return []
        }
    }

    protected static async _create(guildId: string, options: GuildChannelCreateOptions): Promise<GuildBasedChannel> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) {
                throw new Error(`Guild ${guildId} not found`);
            }

            const channel = await guild.channels.create(options);
            Log.info(`Created channel ${channel.name} (${channel.id}) in guild ${guildId}`);
            return channel;
        } catch (error) {
            Log.error(`Failed to create channel in guild ${guildId}: ${error}`);
            throw error;
        }
    }

    static async delete(channelId: string): Promise<boolean> {
        try {
            const channel = await GuildChannelManager.find(channelId);
            if (!channel) {
                throw new Error(`Channel ${channelId} not found`);
            }

            await channel.delete();
            Log.info(`Deleted channel ${channelId}`);
            return true
        } catch (error) {
            Log.error(`Failed to delete channel ${channelId}: ${error}`);
            return false;
        }
    }
}
