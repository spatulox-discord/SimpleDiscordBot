import {DMChannel, Message, MessageCreateOptions, SendableChannels, TextChannel, ThreadChannel} from "discord.js";
import {setTimeout} from "timers/promises";
import {Log} from "../../index";

/**
 * Wait after every message sent by a UI test : Discord allows ~5 messages / 5s per channel,
 * so 1.5s keeps the run far below the rate limit instead of relying on the discord.js queue
 */
export const MESSAGE_DELAY_MS = 1500;

/** Components handled by handleUiTestInteraction() */
export const UI_PREFIX = "test_ui:";
/** Modals opened from the interactive panel */
export const MODAL_PREFIX = "test_ui_modal:";
/** Components that only need to render : clicking them answers an ephemeral message */
export const STATIC_PREFIX = "test_static:";

/**
 * Sends every UI test message in one channel, waiting MESSAGE_DELAY_MS after each one,
 * and keeps track of the failed sections instead of stopping the whole run
 */
export class UiTester {
    private readonly failures: string[] = [];
    private messageCount = 0;

    constructor(readonly channel: SendableChannels, private readonly delayMs: number = MESSAGE_DELAY_MS) {}

    get channelId(): string {
        return this.channel.id;
    }

    /** The channel as accepted by Bot.message.success() / error(), null for other channel types */
    get textChannel(): TextChannel | ThreadChannel | DMChannel | null {
        const channel = this.channel;
        return channel instanceof TextChannel || channel instanceof ThreadChannel || channel instanceof DMChannel ? channel : null;
    }

    async wait(): Promise<void> {
        await setTimeout(this.delayMs);
    }

    /** Await any sending call (Bot.message, Bot.log, webhooks, edits...), then wait */
    async throttle<T>(sending: Promise<T>): Promise<T> {
        const result = await sending;
        this.messageCount++;
        await this.wait();
        return result;
    }

    /** Same as throttle(), but fails the section when the call returns null / false (Bot.message & co don't throw) */
    async sent<T>(label: string, sending: Promise<T | null | false | undefined | void>): Promise<T> {
        const result = await this.throttle(sending);
        if (!result) throw new Error(`${label} returned ${result}`);
        return result;
    }

    /** channel.send(), then wait */
    async send(payload: string | MessageCreateOptions): Promise<Message> {
        return this.throttle<Message>(this.channel.send(payload));
    }

    /**
     * Run one test section : a failure is reported in the channel and in the console,
     * then the next section runs anyway
     */
    async section(title: string, test: (tester: UiTester) => Promise<void>): Promise<void> {
        await this.send(`## ${title}`);
        try {
            await test(this);
        } catch (error) {
            this.failures.push(`**${title}** : \`${error}\``);
            Log.error(`UI test "${title}" failed: ${error}`);
            await this.send(`❌ **${title}** failed : \`${error}\``).catch(() => undefined);
        }
    }

    get report(): {ok: boolean, text: string} {
        if (this.failures.length === 0) {
            return {ok: true, text: `Every section passed (${this.messageCount} messages sent)`};
        }
        return {
            ok: false,
            text: `${this.failures.length} section(s) failed (${this.messageCount} messages sent) :\n- ${this.failures.join("\n- ")}`
        };
    }
}
