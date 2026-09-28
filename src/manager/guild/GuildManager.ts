import {Channel, Collection, Guild, GuildBan, GuildMember, StageChannel, VoiceChannel} from 'discord.js';
import {Log} from "@spatulox/utils";
import {Time} from "@spatulox/utils";
import {GuildUserManager} from "./GuildUserManager";
import {Bot} from "../../core/Bot";
import {GuildChannelManager} from "./ChannelManager/GuildChannelManager";
import {RoleManager} from "./RoleManager";
import {GuildChannelList} from "./ChannelManager/GuildChannelList";
import {InviteManager} from "./InviteManager";

export class GuildManager {

    public static readonly role = RoleManager;
    public static readonly user= GuildUserManager;
    public static readonly channel = GuildChannelList ;
    public static readonly invite = InviteManager;

    static list(): Guild[] {
        return Array.from(Bot.client.guilds.cache.values());
    }

    static async find(guild_id: string): Promise<Guild | null> {
        try {
            const cached = Bot.client.guilds.cache.get(guild_id);
            if (cached) return cached;

            return await Bot.client.guilds.fetch(guild_id)
        } catch (error) {
            Log.error(`GuildManager: Guild ${guild_id} : ${error} `);
            return null
        }
    }

    /**
     * Search channel by ID (TextChannel, DMChannel, ThreadChannel)
     */
    static async searchChannel(guildId: string, channelId: string): Promise<Channel | null> {
        try {
            return await GuildChannelManager.findInGuild(guildId, channelId);
        } catch (error) {
            Log.error(`Failed to fetch channel ${channelId}: ${error}`);
            return null;
        }
    }

    /**
     * Search guild member by ID
     */
    static async searchMember(guildId: string, memberId: string): Promise<GuildMember | null> {
        try {
            return await this.user.findInGuild(guildId, memberId);
        } catch (error) {
            Log.error(`Failed to fetch member ${memberId} in guild ${guildId}: ${error}`);
            return null;
        }
    }

    /**
     * Check if member is still in guild
     */
    static async isMemberInGuild(guildId: string, memberId: string): Promise<boolean> {
        try {
            return await this.user.isInGuild(guildId, memberId);
        } catch (error: any) {
            return error.code !== 10007; // Unknown Member
        }
    }

    /**
     * Fetch all members with retry (heavy operation)
     */
    static async fetchAllMembers(guildId: string | Guild, MAX_ATTEMPTS: number = 3, RETRY_DELAY: number = Time.minute.MIN_05.toMilliseconds()): Promise<Collection<string, GuildMember>> {
        let guild: Guild
        if(guildId instanceof  Guild){
            guild = guildId
        } else {
            let tmp = Bot.client.guilds.cache.get(guildId);
            if (!tmp) throw new Error(`Guild ${guildId} not found`);
            guild = tmp
        }

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                Log.info(`UserManager: Fetching ${guild.name} members (attempt ${attempt})`);
                return await guild.members.fetch();
            } catch (error) {
                Log.error(`UserManager: Fetch failed (attempt ${attempt}): ${error}`);
                if (attempt < MAX_ATTEMPTS) {
                    await new Promise(r => setTimeout(r, RETRY_DELAY));
                }
            }
        }
        throw new Error(`Failed to fetch members after ${MAX_ATTEMPTS} attempts`);
    }

    static async listban(guildId: string, limit?: number): Promise<GuildBan[]> {
        const guild = Bot.client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error(`Guild ${guildId} not found`);
        }

        try {
            const bans = await guild.bans.fetch({ limit });
            return Array.from(bans.values());
        } catch (error) {
            Log.error(`Failed to list bans in guild ${guildId}: ${error}`);
            throw error;
        }
    }

    static async moveMember(
        memberId: string,
        fromChannelId: string,
        toChannelId: string
    ): Promise<boolean> {
        try {
            const guild = Bot.client.guilds.cache.find(g =>
                g.channels.cache.has(fromChannelId) || g.channels.cache.has(toChannelId)
            );

            if (!guild) {
                throw new Error(`Guild containing channels ${fromChannelId} or ${toChannelId} not found`);
            }

            const member = await guild.members.fetch(memberId).catch(() => null);
            if (!member) {
                throw new Error(`Member ${memberId} not found in guild ${guild.id}`);
            }

            const fromChannel = guild.channels.cache.get(fromChannelId);
            const toChannel = guild.channels.cache.get(toChannelId);

            if (!fromChannel) {
                throw new Error(`From channel ${fromChannelId} not found`);
            }
            if (!toChannel) {
                throw new Error(`To channel ${toChannelId} not found`);
            }

            if (!(fromChannel instanceof VoiceChannel || fromChannel instanceof StageChannel)) {
                throw new Error(`From channel ${fromChannelId} is not a voice/stage channel`);
            }

            if (!(toChannel instanceof VoiceChannel || toChannel instanceof StageChannel)) {
                throw new Error(`To channel ${toChannelId} is not a voice/stage channel`);
            }

            if (member.voice.channelId !== fromChannelId) {
                throw new Error(`Member ${memberId} is not in channel ${fromChannelId}`);
            }

            try {
                await member.voice.setChannel(toChannel);
                Log.info(`Moved member ${memberId} from ${fromChannelId} to ${toChannelId}`);
            } catch (error) {
                Log.error(`Failed to move member ${memberId} from ${fromChannelId} to ${toChannelId}: ${error}`);
                throw error;
            }
            return true;
        } catch (e) {
            Log.error(`Failed to move member ${e}`);
            return false
        }
    }
}