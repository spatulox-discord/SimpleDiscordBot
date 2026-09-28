import {
    BaseInteraction,
    InteractionReplyOptions,
    InteractionResponse,
    InteractionUpdateOptions,
    Message
} from "discord.js";
import {SendableComponent, SendableComponentBuilder} from "../manager/builder/SendableComponentBuilder";

type InteractionComponent = SendableComponent | SendableComponent[];
type InteractionResult = Promise<InteractionResponse<boolean> | Message<boolean> | boolean>;

export class BotInteraction {
    /**
     * InteractionReplyOptions && InteractionUpdateOptions
     * The two have "content", "embeds" & "flags" field, so an internal cast is ok, unless discord/discordjs deprecate it
     */
    private static buildReplyOptions(content: string | null, component: InteractionComponent | null, ephemeral: boolean): InteractionReplyOptions {
        return SendableComponentBuilder.buildInteraction(content, component, ephemeral) as InteractionReplyOptions;
    }

    private static buildUpdateOptions(content: string | null, component: InteractionComponent | null): InteractionUpdateOptions {
        return SendableComponentBuilder.buildInteraction(content, component, false) as InteractionUpdateOptions;
    }

    /**
     * Normalize the (content, component, ephemeral) overloads :
     * (string, ephemeral?) | (component, ephemeral?) | (string, component, ephemeral?)
     */
    private static resolveArgs(
        content: InteractionComponent | string,
        component: InteractionComponent | boolean | undefined,
        ephemeral: boolean
    ): InteractionReplyOptions {
        if (typeof content === 'string') {
            if (typeof component === 'boolean') {
                return this.buildReplyOptions(content, null, component);
            }
            return this.buildReplyOptions(content, component ?? null, ephemeral);
        }
        return this.buildReplyOptions(null, content, typeof component === 'boolean' ? component : ephemeral);
    }

    /**
     * Reply, or followUp if the interaction is already acknowledged
     */
    static async send(interaction: BaseInteraction, content: string, ephemeral?: boolean): InteractionResult
    static async send(interaction: BaseInteraction, content: InteractionComponent, ephemeral?: boolean): InteractionResult
    static async send(interaction: BaseInteraction, content: string, component: InteractionComponent, ephemeral?: boolean): InteractionResult
    static async send(
        interaction: BaseInteraction,
        content: InteractionComponent | string,
        component?: InteractionComponent | boolean,
        ephemeral: boolean = false
    ): InteractionResult {
        if (!interaction.isRepliable()) return false;

        const options = this.resolveArgs(content, component, ephemeral);

        if (!interaction.deferred && !interaction.replied) {
            return await interaction.reply(options);
        } else {
            return await interaction.followUp(options);
        }
    }

    static async reply(interaction: BaseInteraction, content: string, ephemeral?: boolean): InteractionResult
    static async reply(interaction: BaseInteraction, content: InteractionComponent, ephemeral?: boolean): InteractionResult
    static async reply(interaction: BaseInteraction, content: string, component: InteractionComponent, ephemeral?: boolean): InteractionResult
    static async reply(
        interaction: BaseInteraction,
        content: InteractionComponent | string,
        component?: InteractionComponent | boolean,
        ephemeral: boolean = false
    ): InteractionResult {
        if (!interaction.isRepliable()) return false;

        return await interaction.reply(this.resolveArgs(content, component, ephemeral));
    }

    static async followUp(interaction: BaseInteraction, content: string, ephemeral?: boolean): InteractionResult
    static async followUp(interaction: BaseInteraction, content: InteractionComponent, ephemeral?: boolean): InteractionResult
    static async followUp(interaction: BaseInteraction, content: string, component: InteractionComponent, ephemeral?: boolean): InteractionResult
    static async followUp(
        interaction: BaseInteraction,
        content: InteractionComponent | string,
        component?: InteractionComponent | boolean,
        ephemeral: boolean = false
    ): InteractionResult {
        if (!interaction.isRepliable()) return false;

        return await interaction.followUp(this.resolveArgs(content, component, ephemeral));
    }

    static async defer(interaction: BaseInteraction): Promise<InteractionResponse<boolean>  | void> {

        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            if (!interaction.deferred && !interaction.replied) {
                return await interaction.deferReply();
            }
            return;
        }

        if (
            interaction.isMessageComponent() ||
            interaction.isModalSubmit()
        ) {
            if (!interaction.deferred && !interaction.replied) {
                return await interaction.deferUpdate();
            }
        }
    }

    static async update(interaction: BaseInteraction, content: string): InteractionResult
    static async update(interaction: BaseInteraction, content: InteractionComponent): InteractionResult
    static async update(interaction: BaseInteraction, content: string, component: InteractionComponent): InteractionResult
    static async update(
        interaction: BaseInteraction,
        content: InteractionComponent | string,
        component?: InteractionComponent,
    ): InteractionResult {

        const options = this.buildUpdateOptions(
            typeof content === 'string' ? content : null,
            typeof content === 'string' ? component ?? null : content
        );

        if (!interaction.isRepliable()) return false;

        // Already acknowledged (defer() / deferUpdate() / reply()) → editReply()
        if (interaction.deferred || interaction.replied) {
            return await interaction.editReply(options);
        }

        // MessageComponent or modal opened from a message → update()
        if (interaction.isMessageComponent()) {
            return await interaction.update(options);
        }
        if (interaction.isModalSubmit() && interaction.isFromMessage()) {
            return await interaction.update(options);
        }
        return false
    }
}
