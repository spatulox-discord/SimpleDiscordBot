import {
    Invite,
    InviteCreateOptions
} from 'discord.js';
import {setTimeout} from "timers/promises";
import {Log} from "@spatulox/utils";
import {GuildChannelManager} from "./ChannelManager/GuildChannelManager";
import {GuildManager} from "./GuildManager";
import {Bot} from "../../core/Bot";

export class InviteManager {

    /**
     * Create an invite for a channel
     */
    static async create(
        channelId: string,
        options: {
            maxAge?: number;
            maxUses?: number;
            reason?: string;
            temporary?: boolean;
        } = {}
    ): Promise<Invite> {
        try {
            const channel = await GuildChannelManager.find(channelId);
            if (!channel) {
                throw new Error(`Channel ${channelId} not found`);
            }

            const guild = channel.guild;
            const inviteOptions: InviteCreateOptions = {
                maxAge: options.maxAge ?? 86400,
                maxUses: options.maxUses ?? 0,
                temporary: options.temporary ?? false,
                reason: options.reason
            };

            const invite = await guild.invites.create(channelId, inviteOptions);
            Log.info(`Created invite ${invite.code} for channel ${channelId}`);
            return invite;
        } catch (error) {
            Log.error(`Failed to create invite for channel ${channelId}: ${error}`);
            throw error;
        }
    }


    /**
     * Find an invite by its code or its url (discord.gg/code, discord.com/invite/code)
     */
    static async find(codeOrUrl: string): Promise<Invite | null> {
        try {
            return await Bot.client.fetchInvite(codeOrUrl);
        } catch (error) {
            Log.error(`Failed to find invite ${codeOrUrl}: ${error}`);
            return null;
        }
    }

    /**
     * Delete an invitation, from the invite itself or its code / url
     */
    static async delete(invite: Invite): Promise<boolean>;
    static async delete(codeOrUrl: string): Promise<boolean>;
    static async delete(inviteOrCode: Invite | string): Promise<boolean> {
        const invite = typeof inviteOrCode === 'string' ? await this.find(inviteOrCode) : inviteOrCode;
        if (!invite) return false;

        try {
            await invite.delete();
            Log.info(`Deleted invite ${invite.code} from guild ${invite.guild?.id}`);
            return true;
        } catch (error) {
            Log.error(`Failed to delete invite ${invite.code}: ${error}`);
            return false;
        }
    }

    /**
     * List every invitation from a guild
     */
    static async list(guildId: string): Promise<Invite[]> {
        try {
            const guild = await GuildManager.find(guildId);
            if (!guild) {
                throw new Error(`Guild ${guildId} not found`);
            }

            const invites = await guild.invites.fetch();
            const inviteList = Array.from(invites.values());

            Log.info(`Fetched ${inviteList.length} invites for guild ${guildId}`);
            return inviteList;
        } catch (error) {
            Log.error(`Failed to fetch invites for guild ${guildId}: ${error}`);
            throw error;
        }
    }

    /**
     * Check if an invite is older than maxAgeMs (default 1 hour).
     * Permanent invites (maxAge = 0) and excluded codes are never considered old
     */
    static isOld(invite: Invite, excludedCodes: string[] = [], maxAgeMs: number = 60 * 60 * 1000): boolean {
        if (!invite.createdAt) return false;

        return (
            invite.maxAge !== 0 &&
            !excludedCodes.includes(invite.code) &&
            invite.createdAt.getTime() < Date.now() - maxAgeMs
        );
    }

    /**
     * Delete every old invite of a guild, returns the number of deleted invites
     */
    static async cleanup(guildId: string, excludedCodes: string[] = [], maxAgeMs?: number): Promise<number> {
        try {
            const invites = await this.list(guildId);
            let deletedCount = 0;

            for (const invite of invites) {
                if (!this.isOld(invite, excludedCodes, maxAgeMs)) continue;

                if (await this.delete(invite)) deletedCount++;
                // Rate limit protection
                await setTimeout(100);
            }

            Log.info(`Invite cleanup ${guildId}: ${deletedCount} old invites deleted`);
            return deletedCount;
        } catch (error) {
            Log.error(`Invite cleanup failed for ${guildId}: ${error}`);
            return 0;
        }
    }
}
