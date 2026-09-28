import {
    BaseInteraction,
    InteractionReplyOptions,
    InteractionResponse,
    InteractionUpdateOptions,
    Message
} from "discord.js";
import {SendableComponent, SendableComponentBuilder} from "../manager/builder/SendableComponentBuilder";

export class BotInteraction {
    /**
     * InteractionReplyOptions && InteractionUpdateOptions
     * The two have "content", "embeds" & "flags" field, so an internal cast is ok, unless discord/discordjs deprecate it
     */
    private static buildReplyOptions(content: string | null, component: SendableComponent, ephemeral: boolean): InteractionReplyOptions {
        return this._buildOptions(content, component, ephemeral) as InteractionReplyOptions;
    }

    private static buildUpdateOptions(content: string | null, component: SendableComponent): InteractionUpdateOptions {
        return this._buildOptions(content, component, false) as InteractionUpdateOptions;
    }

    private static _buildOptions(content: string | null, component: SendableComponent, ephemeral: boolean): InteractionReplyOptions | InteractionUpdateOptions {
        return SendableComponentBuilder.buildInteraction(content, component, ephemeral);
    }

    static async send(interaction: BaseInteraction, content: SendableComponent, ephemeral?: boolean): Promise<InteractionResponse<boolean> | Message<boolean> | boolean>
    static async send(interaction: BaseInteraction, content: string, component: SendableComponent, ephemeral?: boolean): Promise<InteractionResponse<boolean> | Message<boolean> | boolean>
    static async send(
        interaction: BaseInteraction,
        content: SendableComponent | string,
        component: SendableComponent | boolean = false,
        ephemeral: boolean = false
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {
        if (!interaction.isRepliable()) return false;

        const options = this.buildReplyOptions(
            typeof content === 'string' ? content : null,
            typeof content === 'string' ? component as SendableComponent : content,
            typeof content === 'string' ? ephemeral : component as boolean
        );

        if (!interaction.deferred && !interaction.replied) {
            return await interaction.reply(options);
        } else {
            return await interaction.followUp(options);
        }
    }

    static async reply(interaction: BaseInteraction, content: SendableComponent, ephemeral?: boolean): Promise<InteractionResponse<boolean> | Message<boolean> | boolean>
    static async reply(interaction: BaseInteraction, content: string, component: SendableComponent, ephemeral?: boolean): Promise<InteractionResponse<boolean> | Message<boolean> | boolean>
    static async reply(
        interaction: BaseInteraction,
        content: SendableComponent | string,
        component: SendableComponent | boolean = false,
        ephemeral: boolean = false
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {
        if (!interaction.isRepliable()) return false;

        const options = this.buildReplyOptions(
            typeof content === 'string' ? content : "",
            typeof content === 'string' ? component as SendableComponent : content,
            typeof content === 'string' ? ephemeral : component as boolean
        );

        return await interaction.reply(options);
    }

    static async followUp(interaction: BaseInteraction, content: SendableComponent, ephemeral?: boolean): Promise<InteractionResponse<boolean> | Message<boolean> | boolean>
    static async followUp(interaction: BaseInteraction, content: string, component: SendableComponent, ephemeral?: boolean): Promise<InteractionResponse<boolean> | Message<boolean> | boolean>
    static async followUp(
        interaction: BaseInteraction,
        content: SendableComponent | string,
        component: SendableComponent | boolean = false,
        ephemeral: boolean = false
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {
        if (!interaction.isRepliable()) return false;

        const options = this.buildReplyOptions(
            typeof content === 'string' ? content : "",
            typeof content === 'string' ? component as SendableComponent : content,
            typeof content === 'string' ? ephemeral : component as boolean
        );

        return await interaction.followUp(options);
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

    static async update(interaction: BaseInteraction, content: SendableComponent): Promise<InteractionResponse<boolean> | Message<boolean> | boolean>
    static async update(interaction: BaseInteraction, content: string, component: SendableComponent): Promise<InteractionResponse<boolean> | Message<boolean> | boolean>
    static async update(
        interaction: BaseInteraction,
        content: SendableComponent | string,
        component?: SendableComponent,
    ): Promise<InteractionResponse<boolean> | Message<boolean> | boolean> {

        const options = this.buildUpdateOptions(
            typeof content === 'string' ? content : "",
            typeof content === 'string' ? component as SendableComponent : content as SendableComponent
        );

        // MessageComponent → update()
        if (interaction.isMessageComponent()) {
            return await interaction.update(options);
        }

        // Slash commands → editReply()
        if(!interaction.isCommand()) return false
        if (interaction.deferred || interaction.replied) {
            return await interaction.editReply(options);
        }
        return false
    }
}