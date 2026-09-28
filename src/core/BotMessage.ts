import {
    TextChannel,
    DMChannel,
    ThreadChannel,
    Message,
    User,
    GuildMember, MessageCreateOptions
} from 'discord.js';
import {Log} from "@spatulox/utils";
import {Bot} from "./Bot";
import {EmbedManager} from "../manager/messages/EmbedManager";
import {SendableComponent, SendableComponentBuilder} from "../manager/builder/SendableComponentBuilder";

export class BotMessage {
    /**
     * Send message to any text-based channel
     */
    static async send(channel:TextChannel | DMChannel | ThreadChannel | string, content?: string | null, component?: SendableComponent | SendableComponent[]): Promise<Message | null>
    static async send(channel:TextChannel | DMChannel | ThreadChannel | string, content: SendableComponent | SendableComponent[]): Promise<Message | null>
    static async send(channel:TextChannel | DMChannel | ThreadChannel | string, content: MessageCreateOptions): Promise<Message | null>
    static async send(
        channel: TextChannel | DMChannel | ThreadChannel | string,
        content?: string | null | SendableComponent | SendableComponent[] | MessageCreateOptions,
        component?: SendableComponent | SendableComponent[]
    ): Promise<Message | null> {

        try {
            if (!channel) {
                Log.warn('Cannot send message: Invalid channel ID');
                return null;
            }


            if (typeof channel === "string") {
                const fetchedChannel = Bot.client.channels.cache.get(channel);
                if (!fetchedChannel?.isTextBased()) {
                    Log.warn(`Cannot send message : Invalid channel ID: ${channel}`);
                    return null;
                }
                channel = fetchedChannel as TextChannel;
            }

            return await channel.send(this.buildPayload(content, component));
        } catch (e) {
            Log.error(`Cannot send message : ${e}`);
            return null;
        }
    }

    private static buildPayload(
        content?: string | null | SendableComponent | SendableComponent[] | MessageCreateOptions,
        component?: SendableComponent | SendableComponent[]
    ): MessageCreateOptions {
        if (typeof content === "string") {
            return component
                ? SendableComponentBuilder.buildMessage(content, component)
                : SendableComponentBuilder.buildMessage(content);
        }
        if (content === null || content === undefined) {
            if (!component) {
                throw new Error("Cannot send message : content and component cannot be null at the same time");
            }
            return SendableComponentBuilder.buildMessage(component);
        }
        if (SendableComponentBuilder.isSendableComponent(content) || Array.isArray(content)) {
            return SendableComponentBuilder.buildMessage(content);
        }
        return content;
    }

    static async sendDM(userOrId: User | GuildMember | string, content: string, component: SendableComponent | SendableComponent[]): Promise<Message | null>;
    static async sendDM(userOrId: User | GuildMember | string, content: string | SendableComponent | SendableComponent[] | MessageCreateOptions): Promise<Message | null>;
    static async sendDM(userOrId: User | GuildMember | string, content: string | SendableComponent | SendableComponent[] | MessageCreateOptions, component?: SendableComponent | SendableComponent[]): Promise<Message | null> {
        try {
            if (!userOrId) {
                Log.warn("Cannot send DM: Invalid user / ID");
                return null;
            }

            let targetUser: User;

            if (userOrId instanceof User || userOrId instanceof GuildMember) {
                targetUser = userOrId instanceof GuildMember ? userOrId.user : userOrId;
            } else {
                const fetchedUser = await Bot.client.users.fetch(userOrId);
                if (!fetchedUser) {
                    Log.warn(`Cannot send DM: User not found for ID: ${userOrId}`);
                    return null;
                }
                targetUser = fetchedUser;
            }

            return await targetUser.send(this.buildPayload(content, component));
        } catch (error) {
            Log.error(`Cannot send DM to ${userOrId}: ${error}`);
            return null;
        }
    }

    /**
     * Quick success message
     */
    static success(channel: TextChannel | DMChannel | ThreadChannel | User | GuildMember, message: string): Promise<Message | null> {
        const embed = EmbedManager.success(message);
        if(channel instanceof User || channel instanceof GuildMember) {
            return this.sendDM(channel, message, embed)
        }
        return this.send(channel, message, embed);
    }

    /**
     * Quick error message
     */
    static error(channel: TextChannel | DMChannel | ThreadChannel | User | GuildMember, message: string): Promise<Message | null> {
        const embed = EmbedManager.error(message);
        if(channel instanceof User || channel instanceof GuildMember) {
            return this.sendDM(channel, message, embed)
        }
        return this.send(channel, message, embed);
    }
}