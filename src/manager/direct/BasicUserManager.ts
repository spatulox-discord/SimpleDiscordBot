import {Guild, GuildMember, Message, MessageCreateOptions, User} from "discord.js";
import {Bot} from "../../core/Bot";
import {Log} from "@spatulox/utils";
import {SendableComponent, SendableComponentBuilder} from "../builder/SendableComponentBuilder";
import {GuildManager} from "../guild/GuildManager";

export abstract class BasicUserManager {

    /**
     * Find member in specific guild
     */
    static async findInGuild(guild: string | Guild, memberId: string) : Promise<GuildMember | null>{
        let targetGuild: Guild | null = null;

        if (typeof guild === 'string') {
            targetGuild = await GuildManager.find(guild);
            if (!targetGuild) return null;
        } else {
            targetGuild = guild;
        }

        const cached = targetGuild.members.cache.get(memberId);
        if (cached) return cached;

        const member = await targetGuild.members.fetch(memberId).catch(() => null);
        if (!member) Log.error(`UserManager: Member ${memberId} not found in guild ${targetGuild.id}`);
        return member;
    }

    /**
     * Check if user is still in guild
     */
    static async isInGuild(guildId: string, userId: string): Promise<boolean> {
        try {
            const guild = Bot.client.guilds.cache.get(guildId);
            if (!guild) return false;

            await guild.members.fetch({ user: userId, force: true });
            return true;
        } catch (error: any) {
            return error.code !== 10007; // Unknown Member
        }
    }

    /**
     * Overload for send
     */
    // Normal message
    static async send(user_id: string, content: string): Promise<Message>;
    static async send(user: User, content: string): Promise<Message>;
    static async send(user: GuildMember, content: string): Promise<Message>;
    // Component Message
    static async send(user_id: string, component: SendableComponent | SendableComponent[]): Promise<Message>;
    static async send(user: User, component: SendableComponent | SendableComponent[]): Promise<Message>;
    static async send(user: GuildMember, component: SendableComponent | SendableComponent[]): Promise<Message>;
    static async send(user_id: string, content: string, component: SendableComponent | SendableComponent[]): Promise<Message>;
    static async send(user: User, content: string, component: SendableComponent | SendableComponent[]): Promise<Message>;
    static async send(user: GuildMember, content: string, component: SendableComponent | SendableComponent[]): Promise<Message>;
    // Discord Message Create Option
    static async send(user_id_or_user: string, options: MessageCreateOptions): Promise<Message>;
    static async send(user_id_or_user: User, options: MessageCreateOptions): Promise<Message>;
    static async send(user_id_or_user: GuildMember, options: MessageCreateOptions): Promise<Message>;


    /**
     * Impl
     */
    static async send(
        user_id_or_user: string | User | GuildMember,
        content_or_component_or_options: string | SendableComponent | SendableComponent[] | MessageCreateOptions,
        component?: SendableComponent | SendableComponent[]
    ): Promise<Message> {
        try {
            let user: User | GuildMember;
            if (typeof user_id_or_user === 'string') {
                user = await Bot.client.users.fetch(user_id_or_user);
            } else {
                user = user_id_or_user;
            }

            const dmChannel = await user.createDM();

            let payload: MessageCreateOptions;

            if (component && typeof content_or_component_or_options == "string") { // component + content
                payload = SendableComponentBuilder.buildMessage(
                    content_or_component_or_options,
                    component
                );
            } else if (typeof content_or_component_or_options === 'string') { // content only
                payload = SendableComponentBuilder.buildMessage(content_or_component_or_options);
            } else if(SendableComponentBuilder.isSendableComponent(content_or_component_or_options) || Array.isArray(content_or_component_or_options)) { // component(s) only
                payload = SendableComponentBuilder.buildMessage(content_or_component_or_options);
            } else { // MessageCreationOptionOnly
                payload = content_or_component_or_options as MessageCreateOptions;
            }

            const message = await dmChannel.send(payload);

            if(user instanceof  GuildMember){
                Log.info(`Sent DM to ${user.id} (${user.user.username}): "${(payload.content || 'Embed/Component').substring(0, 50)}..."`);
            } else {
                Log.info(`Sent DM to ${user.id} (${user.username}): "${(payload.content || 'Embed/Component').substring(0, 50)}..."`);
            }
            return message;
        } catch (error) {
            Log.error(`Failed to send DM to ${user_id_or_user}: ${error}`);
            throw new Error(`Cannot send DM to ${user_id_or_user}`);
        }
    }
}