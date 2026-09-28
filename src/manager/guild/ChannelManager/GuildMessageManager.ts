import {GuildTextBasedChannel, Message, MessageCreateOptions} from "discord.js";
import {GuildChannelManager} from "./GuildChannelManager";
import {Log} from "@spatulox/utils";
import {SendableComponent, SendableComponentBuilder} from "../../builder/SendableComponentBuilder";

export class GuildMessageManager {

    /**
     * Any guild channel able to hold messages : text, announcement, thread, voice / stage text chat
     */
    private static async findTextBased(channelId: string): Promise<GuildTextBasedChannel | null> {
        const channel = await GuildChannelManager.find(channelId);
        return channel?.isTextBased() ? channel : null;
    }


    /**
     * Overloads for send
     */
    static async send(channelId: string, content: string): Promise<Message | null>;
    static async send(channelId: string, component: SendableComponent | SendableComponent[]): Promise<Message | null>;
    static async send(channelId: string, options: MessageCreateOptions): Promise<Message | null>;

    /**
     * Impl
     */
    static async send(
        channelId: string,
        content_or_component_or_options: string | SendableComponent | SendableComponent[] | MessageCreateOptions
    ): Promise<Message | null> {
        try {
            const channel = await this.findTextBased(channelId);

            if(!channel){
                Log.error(`Channel ${channelId} not found in guild`);
                return null
            }

            let payload: MessageCreateOptions;

            if (typeof content_or_component_or_options === 'string') {
                payload = SendableComponentBuilder.buildMessage(content_or_component_or_options);

            } else if (SendableComponentBuilder.isSendableComponent(content_or_component_or_options) || Array.isArray(content_or_component_or_options)) {
                payload = SendableComponentBuilder.buildMessage(content_or_component_or_options);
            } else {
                payload = content_or_component_or_options as MessageCreateOptions;
            }

            return await channel.send(payload);
        } catch (error) {
            Log.error(`Failed to send message to ${channelId}: ${error}`);
            throw error;
        }
    }

    /**
     * Delete message
     */
    static async delete(channelId: string, messageId: string): Promise<boolean> {
        try {
            const channel = await this.findTextBased(channelId);
            if (!channel) {
                Log.error(`Channel ${channelId} not found`);
                return false;
            }

            const message = await channel.messages.fetch(messageId);
            await message.delete();

            Log.info(`Deleted message ${messageId} from ${channelId}`);
            return true;
        } catch (error) {
            Log.error(`Failed to delete message ${messageId} from ${channelId}: ${error}`);
            return false;
        }
    }

    /**
     * Fetch messages (last X messages, default 10)
     */
    static async fetch(channelId: string, limit: number = 10): Promise<Message[]> {
        try {
            const channel = await this.findTextBased(channelId);
            if (!channel) {
                Log.error(`Channel ${channelId} not found`);
                return [];
            }

            const messages = await channel.messages.fetch({ limit });
            Log.info(`Fetched ${messages.size} messages from ${channelId}`);
            return Array.from(messages.values());
        } catch (error) {
            Log.error(`Failed to fetch messages from ${channelId}: ${error}`);
            return [];
        }
    }

    /**
     * Fetch single message
     */
    static async fetchOne(channelId: string, messageId: string): Promise<Message | null> {
        try {
            const channel = await this.findTextBased(channelId);
            if (!channel) {
                Log.error(`Channel ${channelId} not found`);
                return null;
            }

            const message = await channel.messages.fetch(messageId);
            return message;
        } catch (error) {
            Log.error(`Failed to fetch message ${messageId} from ${channelId}: ${error}`);
            return null;
        }
    }
}