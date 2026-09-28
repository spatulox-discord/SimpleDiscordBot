// src/guild/RoleManager.ts
import { Collection, GuildMember, Role, Snowflake } from 'discord.js';
import {Log} from "@spatulox/utils";

export class RoleManager {
    /**
     * Add role - CACHE ONLY
     * @param member - GuildMember ALREADY FETCHED
     * @param roleId - Role ID (string)
     */
    static async add(member: GuildMember, roleId: Snowflake): Promise<boolean> {
        try {
            const role = member.guild.roles.cache.get(roleId);
            if (!role) {
                Log.warn(`Role ${roleId} not found in cache`);
                return false;
            }

            await member.roles.add(role);
            Log.info(`✅ Added ${role.name} to ${member.displayName}`);
            return true;
        } catch (error) {
            Log.error(`Failed to add role ${roleId}: ${error}`);
            return false;
        }
    }

    /**
     * Remove role - CACHE ONLY
     * @param member - GuildMember ALREADY FETCHED
     * @param roleIdOrName - Role ID or name
     */
    static async remove(member: GuildMember, roleIdOrName: Snowflake | string): Promise<boolean> {
        try {
            const role = this.resolve(member.roles.cache, roleIdOrName);

            if (!role) {
                Log.warn(`Role ${roleIdOrName} not found for ${member.displayName}`);
                return false;
            }

            await member.roles.remove(role);
            Log.info(`✅ Removed ${role.name} from ${member.displayName}`);
            return true;
        } catch (error) {
            Log.error(`Failed to remove role ${roleIdOrName}: ${error}`);
            return false;
        }
    }

    /**
     * Toggle role (add/remove)
     */
    static async toggle(member: GuildMember, roleIdOrName: Snowflake | string): Promise<'added' | 'removed'> {
        // Search in the guild roles : the member doesn't own the role when it needs to be added
        const role = this.resolve(member.guild.roles.cache, roleIdOrName);

        if (!role) {
            Log.warn(`Role ${roleIdOrName} not found`);
            throw new Error(`Role not found`);
        }

        if (member.roles.cache.has(role.id)) {
            await this.remove(member, role.id);
            return 'removed';
        } else {
            await this.add(member, role.id);
            return 'added';
        }
    }

    /**
     * Check if member has role
     */
    static hasRole(member: GuildMember, roleIdOrName: Snowflake | string): boolean {
        return !!this.resolve(member.roles.cache, roleIdOrName);
    }

    /**
     * Search by id first, then by name (case insensitive). Snowflakes are 17 to 20 digits long,
     * so the length of the string can't tell an id from a name
     */
    private static resolve(roles: Collection<Snowflake, Role>, roleIdOrName: Snowflake | string): Role | undefined {
        return roles.get(roleIdOrName) ??
            roles.find(r => r.name.toLowerCase() === roleIdOrName.toLowerCase());
    }
}