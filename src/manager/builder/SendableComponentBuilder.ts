import {
    ActionRowBuilder,
    EmbedBuilder,
    InteractionReplyOptions,
    InteractionUpdateOptions, InteractionEditReplyOptions, MessageCreateOptions, MessageEditOptions,
    MessageFlags,
    MessageActionRowComponentBuilder, ContainerBuilder, TextDisplayBuilder, BaseSelectMenuBuilder
} from "discord.js";
import {SelectMenuManager} from "../interactible/SelectMenuManager";

//Any interface/type with those fields
type MessageFields = {
    content?: string | null | undefined;
    embeds?: any;
    components?: any;
    flags?: any;
};

export type SendableComponent = EmbedBuilder | ContainerBuilder | BaseSelectMenuBuilder<any> | ActionRowBuilder<MessageActionRowComponentBuilder>;

/**
 * Options accepted by interaction.update(), interaction.editReply() and message.edit(),
 * returned by every toXXXUpdate() helper (toInteractionUpdate(), toMessageUpdate())
 */
export type InteractionUpdateOrEditOptions = InteractionUpdateOptions & InteractionEditReplyOptions & MessageEditOptions;

/** @internal */
export class SendableComponentBuilder {

    static isSendableComponent(thing: any): thing is SendableComponent {
        return thing instanceof EmbedBuilder || thing instanceof ContainerBuilder || thing instanceof BaseSelectMenuBuilder || thing instanceof ActionRowBuilder;
    }

    /**
     * A ContainerBuilder turns the whole message into a Components V2 one
     */
    static isComponentsV2(components: SendableComponent | SendableComponent[] | null | undefined): boolean {
        const comps = Array.isArray(components) ? components : [components];
        return comps.some(comp => comp instanceof ContainerBuilder);
    }

    private static build<T extends MessageFields>(
        base: T,
        content?: string | null,
        components?: SendableComponent | SendableComponent[] | null | undefined
    ): T {
        const comps = (Array.isArray(components) ? components : [components])
            .filter((comp): comp is SendableComponent => !!comp);
        const componentsV2 = this.isComponentsV2(comps);

        const embeds: EmbedBuilder[] = [];
        const rows: (ContainerBuilder | TextDisplayBuilder | ActionRowBuilder<MessageActionRowComponentBuilder>)[] = [];

        if (content) {
            // Components V2 messages can't have a content : it becomes a TextDisplay on top of the message
            if (componentsV2) {
                rows.push(new TextDisplayBuilder().setContent(content));
            } else {
                base.content = content;
            }
        }

        for (const comp of comps) {
            if (comp instanceof EmbedBuilder) {
                if (componentsV2) {
                    throw new Error("An EmbedBuilder cannot be sent alongside a ContainerBuilder (Components V2 messages don't support embeds)");
                }
                embeds.push(comp);
            } else if (SelectMenuManager.isSelectMenuList(comp)) {
                rows.push(SelectMenuManager.row(comp));
            } else if (comp instanceof ContainerBuilder || comp instanceof ActionRowBuilder) {
                rows.push(comp);
            }
        }

        if (embeds.length > 0) base.embeds = embeds;
        if (rows.length > 0) base.components = rows;
        if (componentsV2) base.flags = [MessageFlags.IsComponentsV2];

        return base
    }

    static buildInteraction(content: string | null, component: SendableComponent | SendableComponent[] | null, ephemeral: boolean): InteractionReplyOptions | InteractionUpdateOptions {
        const base: InteractionReplyOptions = this.build({}, content, component);

        if (ephemeral) {
            base.flags = [...(Array.isArray(base.flags) ? base.flags : []), MessageFlags.Ephemeral]
        }

        return base;
    }


    static buildMessage(content: string): MessageCreateOptions;
    static buildMessage(component: SendableComponent | SendableComponent[]): MessageCreateOptions;
    static buildMessage(content: string | null, component: SendableComponent | SendableComponent[]): MessageCreateOptions;

    static buildMessage(
        contentOrComponent?: string | null | SendableComponent | SendableComponent[],
        component?: SendableComponent | SendableComponent[],
    ): MessageCreateOptions {
        const content = typeof contentOrComponent === 'string' ? contentOrComponent : null;
        const components = typeof contentOrComponent === 'string' || contentOrComponent === null || contentOrComponent === undefined
            ? component
            : contentOrComponent;

        const hasComponents = Array.isArray(components) ? components.length > 0 : !!components;
        if (!content && !hasComponents) {
            throw new Error("At least content or component need to be defined to build a message");
        }

        return this.build({} as MessageCreateOptions, content, components);
    }

}
