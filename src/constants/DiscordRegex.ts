/**
 * Classe utilitaire pour valider tous les formats Discord avec regex
 */
export class DiscordRegex {
    // Caractères spéciaux
    static readonly SPACE = "\u200B";

    // URLs basiques
    static readonly URL_REGEX = /(https?:\/\/[^\s<>]+)/i;

    // URL on a Discord domain (discord.com, discord.gg, discordapp.com, cdn.discordapp.com, discord.media...)
    static readonly DISCORD_URL = /^https?:\/\/(?:[\w-]+\.)*(?:discord\.com|discord\.gg|discordapp\.com|discordapp\.net|discord\.media)(?:[\/?#]\S*)?$/i;

    /* DISCORD REGEX */
    // Snowflakes (user, bot, channel, role, guild ids) are 17 to 20 digits long, their length says nothing about their type
    static readonly USER_REGEX = /<@!?\d{17,20}>/;
    /** @deprecated A bot mention can't be told apart from a user mention : same as USER_REGEX */
    static readonly BOT_REGEX = DiscordRegex.USER_REGEX;
    static readonly CHANNEL_REGEX = /(<#\d{17,20}>)|(<id:(browse|customize|guide)>)/;
    static readonly ROLE_REGEX = /<@&\d{17,20}>/;

    /**
     * Mention a User
     * Mention a Role
     */
    static readonly DISCORD_PING_REGEX = new RegExp(
        `(${this.USER_REGEX.source})|(${this.BOT_REGEX.source})|(${this.ROLE_REGEX.source})`
    );

    /**
     * Mention a User
     * Mention a Role
     * Mention a Channel
     */
    static readonly DISCORD_MENTION_REGEX = new RegExp(
        `(${this.DISCORD_PING_REGEX.source})|(${this.CHANNEL_REGEX.source})`
    );

    // ID Discord (user, channel guild)
    static readonly SNOWFLAKE = /^[0-9]{17,20}$/;
    static readonly USER_ID = DiscordRegex.SNOWFLAKE;
    static readonly CHANNEL_ID = DiscordRegex.SNOWFLAKE;
    static readonly GUILD_ID = DiscordRegex.SNOWFLAKE;
    static readonly BOT_ID = DiscordRegex.SNOWFLAKE;

    // Username Discord (2-32 caractères alphanumériques + _ .)
    static readonly USERNAME = /^[a-zA-Z0-9_.]{2,32}$/;

    // Username + discrim (ancien format)
    static readonly USERNAME_DISCRIM = /^[a-zA-Z0-9_]{2,32}#\d{4}$/;

    // Channel mention <#123456789012345678>
    static readonly CHANNEL_MENTION = /^<#([0-9]{17,20})>$/;

    // User mention <@123456789012345678> ou <@!123456789012345678>
    static readonly USER_MENTION = /^<@!?([0-9]{17,20})>$/;

    // Role mention <@&123456789012345678>
    static readonly ROLE_MENTION = /^<@&([0-9]{17,20})>$/;

    // URL Invite Discord : discord.gg/code, discord.com/invite/code, discordapp.com/invite/code (with or without https://)
    static readonly INVITE = /^(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/[a-zA-Z0-9-]+$/i;

    // Emoji Discord (custom or unicode, skin tones / ZWJ sequences / flags included)
    static readonly EMOJI = /^<a?:[a-zA-Z0-9_]{2,32}:[0-9]{17,20}>$|^[\p{Extended_Pictographic}\p{Regional_Indicator}][\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}\u200D\uFE0F]*$/u;

    /**
     * Validate a Discord ID (snowflake, 17 to 20 digits)
     */
    static isDiscordId(id: string): boolean {
        return this.SNOWFLAKE.test(id);
    }

    /**
     * @deprecated A bot mention can't be told apart from a user mention : same as isUserMention()
     */
    static isBotMention(mention: string): boolean {
        return this.BOT_REGEX.test(mention);
    }

    /**
     * Validate a User ping
     */
    static isUserMention(mention: string): boolean {
        return this.USER_REGEX.test(mention);
    }

    /**
     * Validate a Discord username
     */
    static isUsername(username: string): boolean {
        return this.USERNAME.test(username);
    }

    /**
     * @deprecated Same as isDiscordId()
     */
    static isDiscordIdType(id: string): id is string {
        return this.isDiscordId(id);
    }

    /**
     * Any Discord URL
     */
    static isDiscordUrl(url: string): boolean {
        return this.DISCORD_URL.test(url) || this.INVITE.test(url);
    }

    /**
     * Any discord mention
     */
    static isAnyMention(text: string): boolean {
        return this.DISCORD_MENTION_REGEX.test(text);
    }

    /**
     * List all regex
     */
    static listAll(): Record<string, RegExp | string> {
        return {
            SPACE: this.SPACE,
            URL_REGEX: this.URL_REGEX,
            DISCORD_URL: this.DISCORD_URL,
            USER_REGEX: this.USER_REGEX,
            BOT_REGEX: this.BOT_REGEX,
            CHANNEL_REGEX: this.CHANNEL_REGEX,
            ROLE_REGEX: this.ROLE_REGEX,
            DISCORD_PING_REGEX: this.DISCORD_PING_REGEX,
            DISCORD_MENTION_REGEX: this.DISCORD_MENTION_REGEX,
            SNOWFLAKE: this.SNOWFLAKE,
            USER_ID: this.USER_ID,
            CHANNEL_ID: this.CHANNEL_ID,
            GUILD_ID: this.GUILD_ID,
            BOT_ID: this.BOT_ID,
            USERNAME: this.USERNAME,
            USERNAME_DISCRIM: this.USERNAME_DISCRIM,
            CHANNEL_MENTION: this.CHANNEL_MENTION,
            USER_MENTION: this.USER_MENTION,
            ROLE_MENTION: this.ROLE_MENTION,
            INVITE: this.INVITE,
            EMOJI: this.EMOJI
        };
    }
}