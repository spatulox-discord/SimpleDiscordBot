import {
    User,
    EmojiResolvable,
    Message,
    parseEmoji,
} from 'discord.js';
import {Log} from "@spatulox/utils";
import { Bot } from '../../core/Bot';

export class ReactionManager {

    /**
     * Any text based channel : guild channels, threads and DMs
     */
    private static async fetchMessage(channelId: string, messageId: string): Promise<Message> {
        const channel = Bot.client.channels.cache.get(channelId) ?? await Bot.client.channels.fetch(channelId);
        if (!channel?.isTextBased()) {
            throw new Error(`Channel ${channelId} not found or not text based`);
        }
        return await channel.messages.fetch(messageId);
    }

    /**
     * Add a reaction to a message
     */
    static async add(
        channelId: string,
        messageId: string,
        emoji: string | EmojiResolvable,
    ): Promise<void> {
        try {
            const message = await this.fetchMessage(channelId, messageId);
            await message.react(emoji);

            Log.info(`Added reaction ${emoji} to message ${messageId}`);
        } catch (error) {
            Log.error(`Failed to add reaction to ${messageId}: ${error}`);
            throw error;
        }
    }

    /**
     * Delete a reaction from a user
     */
    static async remove(
        channelId: string,
        messageId: string,
        emoji: string,
        userId: string
    ): Promise<void> {
        try {
            const message = await this.fetchMessage(channelId, messageId);
            // Reactions are keyed by the emoji id for custom emojis ("<:name:id>"), by the emoji itself otherwise
            const reaction = message.reactions.resolve(parseEmoji(emoji)?.id ?? emoji);

            if (!reaction) {
                throw new Error(`Reaction ${emoji} not found on message ${messageId}`);
            }

            const user = await Bot.client.users.fetch(userId);
            await reaction.users.remove(user);

            Log.info(`Removed reaction ${emoji} from user ${userId} on message ${messageId}`);
        } catch (error) {
            Log.error(`Failed to remove reaction from ${messageId}: ${error}`);
            throw error;
        }
    }

    /**
     * Get all reaction of a message
     */
    static async getAll(channelId: string, messageId: string): Promise<Reaction[]> {
        try {
            const message = await this.fetchMessage(channelId, messageId);
            const reactions = message.reactions.cache;

            const reactionList: Reaction[] = [];
            for (const reaction of reactions.values()) {
                const users = await reaction.users.fetch();
                reactionList.push({
                    emoji: reaction.emoji,
                    count: reaction.count!,
                    users: Array.from(users.values())
                });
            }

            Log.info(`Fetched ${reactionList.length} reactions for message ${messageId}`);
            return reactionList;
        } catch (error) {
            Log.error(`Failed to fetch reactions for ${messageId}: ${error}`);
            throw error;
        }
    }

    /**
     * Delete all reaction
     */
    static async clear(channelId: string, messageId: string): Promise<void> {
        try {
            const message = await this.fetchMessage(channelId, messageId);
            await message.reactions.removeAll();

            Log.info(`Cleared all reactions from message ${messageId}`);
        } catch (error) {
            Log.error(`Failed to clear reactions from ${messageId}: ${error}`);
            throw error;
        }
    }
}

interface Reaction {
    emoji: any;
    count: number;
    users: User[];
}