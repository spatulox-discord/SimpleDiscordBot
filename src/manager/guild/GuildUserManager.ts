import {Bot} from "../../core/Bot";
import {Log} from "@spatulox/utils";
import {BasicUserManager} from "../direct/BasicUserManager"
import {BanOptions, GuildMember} from "discord.js";
import {setTimeout} from "timers/promises";
import {EmbedManager} from "../messages/EmbedManager";
import {GuildManager} from "./GuildManager";

const MAX_NICKNAME_LENGTH = 32;

export class GuildUserManager extends BasicUserManager {

    static async rename(member: GuildMember, nickname: string, maxAttempts: number = 3): Promise<boolean> {
        if (nickname.length > MAX_NICKNAME_LENGTH) {
            nickname = nickname.slice(0, MAX_NICKNAME_LENGTH);
        }

        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            try {
                const oldName = member.displayName;
                await member.setNickname(nickname.trim());
                Log.info(`Renaming user: ${oldName} → ${nickname.trim()}`);
                await setTimeout(1500)
                return true;
            } catch (error: any) {
                console.error(`Attempt ${attempts + 1} failed when renaming ${member.displayName} into ${nickname.trim()}:`, error);
                await setTimeout(1000)
            }
        }

        Bot.log.info(EmbedManager.error(`Failed to rename ${member.displayName} to ${nickname.trim()} after ${maxAttempts} attempts.`))
        return false;
    }
    /**
     * Check if user is banned from guild
     */
    static async isBanned(guildId: string, userId: string): Promise<boolean> {
        try {
            const guild = await GuildManager.find(guildId) //await GuildManager.find(guildId);
            if (!guild) {
                Log.warn(`Guild ${guildId} not found`);
                return false;
            }

            const ban = await guild.bans.fetch(userId);
            return !!ban;
        } catch (error: any) {
            Log.debug(`User ${userId} is not banned from guild ${guildId}`);
            return false;
        }
    }

    /**
     * Deconnect a member from a voice
     */
    static async deconnectFromVoice(guildId: string, memberId: string): Promise<void> {
        try {
            const member = await GuildManager.user.findInGuild(guildId, memberId)
            if (!member || !member.voice.channel) {
                throw new Error(`Member ${memberId} not found or not in a voice channel`);
            }

            await member.voice.disconnect();
            Log.info(`Disconnected member ${memberId} from voice in guild ${guildId}`);
        } catch (error) {
            Log.error(`Failed to disconnect member ${memberId} from voice in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Check if a member is in voice
     */
    static async isInVoice(memberId: string, guildId: string): Promise<boolean> {
        try {
            const member = await GuildManager.user.findInGuild(guildId, memberId)
            if(!member){
                throw new Error(`Member ${memberId} not found in guild ${guildId}`);
            }
            return member.voice.channelId !== null;
        } catch (error) {
            Log.debug(`Member ${memberId} not found or not in voice in guild ${guildId}`);
            return false;
        }
    }

    /**
     * Mute a member
     */
    static async mute(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const member = await GuildManager.user.findInGuild(guildId, memberId)
            if(!member){
                throw new Error(`Member ${memberId} not found in guild ${guildId}`);
            }
            await member.voice.setMute(true, reason);
            Log.info(`Server muted ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to server mute ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Unmute a member
     */
    static async unmute(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const member = await GuildManager.user.findInGuild(guildId, memberId)
            if(!member){
                throw new Error(`Member ${memberId} not found in guild ${guildId}`);
            }
            await member.voice.setMute(false, reason);
            Log.info(`Server unmuted ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to server unmute ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Deafen a member
     */
    static async deafen(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const member = await GuildManager.user.findInGuild(guildId, memberId)
            if(!member){
                throw new Error(`Member ${memberId} not found in guild ${guildId}`);
            }
            await member.voice.setDeaf(true, reason);
            Log.info(`Server deafened ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to server deafen ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Undeafen member voice
     */
    static async undeafen(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const member = await GuildManager.user.findInGuild(guildId, memberId)
            if(!member){
                throw new Error(`Member ${memberId} not found in guild ${guildId}`);
            }
            await member.voice.setDeaf(false, reason);
            Log.info(`Server undeafened ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to server undeafen ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Timeout a member
     */
    static async timeout(guildId: string, memberId: string, duration: number, reason?: string): Promise<void> {
        try {
            const member = await GuildManager.user.findInGuild(guildId, memberId)
            if(!member){
                throw new Error(`Member ${memberId} not found in guild ${guildId}`);
            }
            // discord.js expects a duration, it adds Date.now() itself
            await member.timeout(duration, reason);
            Log.info(`Timed out ${memberId} for ${duration}ms in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to timeout ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Remove the timeout of a member
     */
    static async untimeout(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const member = await GuildManager.user.findInGuild(guildId, memberId)
            if(!member){
                throw new Error(`Member ${memberId} not found in guild ${guildId}`);
            }
            await member.timeout(null, reason);
            Log.info(`Untimed out ${memberId} in guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to untimeout ${memberId} in ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Kick a member
     */
    static async kick(guildId: string, memberId: string, reason?: string): Promise<void> {
        try {
            const member = await GuildManager.user.findInGuild(guildId, memberId)
            if(!member){
                throw new Error(`Member ${memberId} not found in guild ${guildId}`);
            }
            await member.kick(reason);
            Log.info(`Kicked ${memberId} from guild ${guildId}: ${reason || 'No reason'}`);
        } catch (error) {
            Log.error(`Failed to kick ${memberId} from ${guildId}: ${error}`);
            throw error;
        }
    }

    static async ban(guildId: string, userId: string, banOption?: BanOptions): Promise<void> {
        const guild = await GuildManager.find(guildId);
        if (!guild) {
            throw new Error(`Guild ${guildId} not found`);
        }

        try {
            await guild.members.ban(userId, banOption);
            Log.info(`Banned user ${userId} from guild ${guildId}`);
        } catch (error) {
            Log.error(`Failed to ban user ${userId} from guild ${guildId}: ${error}`);
            throw error;
        }
    }

    static async unban(guildId: string, userId: string, reason?: string): Promise<void> {
        const guild = await GuildManager.find(guildId);
        if (!guild) {
            throw new Error(`Guild ${guildId} not found`);
        }

        try {
            await guild.members.unban(userId, reason);
            Log.info(`Unbanned user ${userId} from guild ${guildId}`);
        } catch (error) {
            Log.error(`Failed to unban user ${userId} from guild ${guildId}: ${error}`);
            throw error;
        }
    }
}