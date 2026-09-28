import {
    Message, MessageCreateOptions,
    StartThreadOptions,
    ThreadChannel
} from "discord.js";
import {GuildChannelManager} from "./GuildChannelManager";
import {GuildTextChannelManager} from "./GuildTextChannelManager";
import {SendableComponent, SendableComponentBuilder} from "../../builder/SendableComponentBuilder";

export class ThreadChannelManager {

    static async findInGuild(guildId: string, channelId: string): Promise<ThreadChannel | null> {
        const channel = await GuildChannelManager.findInGuild(guildId, channelId);
        return channel?.isThread() ? channel as ThreadChannel : null;
    }

    static async find(channelId: string): Promise<ThreadChannel | null> {
        const channel = await GuildChannelManager.find(channelId);
        return channel?.isThread() ? channel as ThreadChannel : null;
    }

    static findAll(guildId: string): ThreadChannel[] {
        const channels = GuildChannelManager.findAll(guildId);
        return channels.filter(c => c.isThread()) as ThreadChannel[];
    }

    static async createFromChannel(
        parentId: string,
        options: StartThreadOptions
    ): Promise<ThreadChannel> {
        const channel = await GuildTextChannelManager.find(parentId);
        if (!channel || !channel.isTextBased()) {
            throw new Error('Parent must be a text-based channel');
        }

        const thread = await channel.threads.create(options);
        return thread as ThreadChannel;
    }

    static async createFromMessage(message: Message, options: StartThreadOptions): Promise<ThreadChannel> {
        if (!message.inGuild()) throw new Error('Cannot start a thread from a message outside of a guild');

        return await message.startThread(options)
    }


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

        if(typeof content_or_component_or_options == 'string') {
            return await GuildTextChannelManager.message.send(channelId, content_or_component_or_options)
        } else if (SendableComponentBuilder.isSendableComponent(content_or_component_or_options) || Array.isArray(content_or_component_or_options)) {
            return await GuildTextChannelManager.message.send(channelId, content_or_component_or_options)
        } else {
            return await GuildTextChannelManager.message.send(channelId, content_or_component_or_options as MessageCreateOptions)
        }
    }

}