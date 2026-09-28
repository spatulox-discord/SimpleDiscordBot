import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    UserSelectMenuBuilder,
    RoleSelectMenuBuilder,
    MentionableSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    MessageActionRowComponentBuilder, ChannelType, MessageCreateOptions, MessageFlags,
    InteractionReplyOptions, InteractionEditReplyOptions,
} from "discord.js";

export type SelectMenuCreateOption = {
    label: string;
    value: string
    description?: string;
    emoji?: string;
}

export type SelectMenuList = StringSelectMenuBuilder | UserSelectMenuBuilder | RoleSelectMenuBuilder | MentionableSelectMenuBuilder | ChannelSelectMenuBuilder

export class SelectMenuManager {

    static isSelectMenuList(comp: any): comp is SelectMenuList {
        return comp instanceof StringSelectMenuBuilder ||
            comp instanceof UserSelectMenuBuilder ||
            comp instanceof RoleSelectMenuBuilder ||
            comp instanceof MentionableSelectMenuBuilder ||
            comp instanceof ChannelSelectMenuBuilder;
    }

    /**
     * Creates base StringSelectMenu - SIMPLE API !
     */
    static create(customId: string, placeholder: string = "Select an option..."): StringSelectMenuBuilder {
        return new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(1);
    }

    /**
     * Quick StringSelectMenu
     */
    static simple(
        customId: string,
        options: SelectMenuCreateOption[],
        placeholder: string = "Choose an option"
    ): StringSelectMenuBuilder {
        const menu = this.create(customId, placeholder);

        menu.addOptions(
            options.map(opt => {
                return this.option(opt)
            })
        );


        return menu;
    }

    /**
     * Pagination menu
     */
    static paginated(
        customId: string,
        options: SelectMenuCreateOption[],
        pageSize: number = 25
    ): ActionRowBuilder<MessageActionRowComponentBuilder>[] {  // ← ARRAY

        const rows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        for (let i = 0; i < options.length; i += pageSize) {
            const pageOptions = options.slice(i, i + pageSize);
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`${customId}_page_${Math.floor(i/pageSize)}`)
                .setPlaceholder(`Page ${Math.floor(i/pageSize) + 1}`)
                .addOptions(pageOptions.map(opt => this.option(opt)));

            rows.push(SelectMenuManager.row(menu));
        }

        return rows.slice(0, 5);
    }


    /**
     * User Select Menu (Components V2)
     */
    static users(customId: string, placeholder: string = "Select users..."): UserSelectMenuBuilder {
        return new UserSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(25);
    }

    /**
     * Role Select Menu (Components V2)
     */
    static roles(customId: string, placeholder: string = "Select roles..."): RoleSelectMenuBuilder {
        return new RoleSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(25);
    }

    /**
     * Mentionable Select Menu (Components V2)
     */
    static mentionables(customId: string, placeholder: string = "Select users/roles..."): MentionableSelectMenuBuilder {
        return new MentionableSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(25);
    }

    /**
     * Channel Select Menu (Components V2)
     */
    static channels(
        customId: string,
        placeholder: string = "Select channels...",
        channelTypes: ChannelType[] = []
    ): ChannelSelectMenuBuilder {
        return new ChannelSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)
            .setMinValues(1)
            .setMaxValues(25)
            .setChannelTypes(...channelTypes);
    }

    /**
     * Quick option creator
     */
    private static option(option: SelectMenuCreateOption): StringSelectMenuOptionBuilder;
    private static option(options: SelectMenuCreateOption[]): StringSelectMenuOptionBuilder[];
    private static option(option: SelectMenuCreateOption | SelectMenuCreateOption[]): StringSelectMenuOptionBuilder | StringSelectMenuOptionBuilder[] {
        if (Array.isArray(option)) {
            return option.map((opt: SelectMenuCreateOption) => this._createOption(opt));
        }
        return this._createOption(option)
    }

    private static _createOption(option: SelectMenuCreateOption): StringSelectMenuOptionBuilder{
        const builder = new StringSelectMenuOptionBuilder()
            .setLabel(option.label)
            .setValue(option.value)

        option.description && builder.setDescription(option.description)
        option.emoji && builder.setEmoji(option.emoji)

        return builder
    }

    /**
     * Fluent API pour personnaliser
     */
    static placeholder(menu: StringSelectMenuBuilder, placeholder: string): StringSelectMenuBuilder {
        return menu.setPlaceholder(placeholder);
    }

    static minMax(menu: StringSelectMenuBuilder, min: number, max: number): StringSelectMenuBuilder {
        return menu.setMinValues(min).setMaxValues(Math.min(max, 25));
    }

    static disabled(menu: StringSelectMenuBuilder, disabled: boolean): StringSelectMenuBuilder {
        return menu.setDisabled(disabled);
    }

    /**
     * ActionRow
     */
    static row<T extends MessageActionRowComponentBuilder>(component: T): ActionRowBuilder<MessageActionRowComponentBuilder> {
        return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(component);
    }

    /**
     * Rows multiples (5 max)
     */
    static rows(...components: MessageActionRowComponentBuilder[]): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
        return components.slice(0, 5).map(component =>
            this.row(component)
        );
    }

    static toMessage(menus: SelectMenuList | SelectMenuList[] | ActionRowBuilder<MessageActionRowComponentBuilder> | ActionRowBuilder<MessageActionRowComponentBuilder>[]) : MessageCreateOptions {
        return {
            components: this._createRowsToReturn(menus),
        };
    }


    static toInteraction(
        menus: SelectMenuList | SelectMenuList[] | ActionRowBuilder<MessageActionRowComponentBuilder> | ActionRowBuilder<MessageActionRowComponentBuilder>[],
        ephemeral: boolean = false
    ): InteractionReplyOptions {
        return {
            components: this._createRowsToReturn(menus),
            flags: ephemeral ? [MessageFlags.Ephemeral] : []
        };
    }

    static toInteractionEdit(
        menus: SelectMenuList | SelectMenuList[] | ActionRowBuilder<MessageActionRowComponentBuilder> | ActionRowBuilder<MessageActionRowComponentBuilder>[]
    ): InteractionEditReplyOptions {
        return {
            components: this._createRowsToReturn(menus)
        };
    }

    private static _createRowsToReturn(menus: SelectMenuList | SelectMenuList[] | ActionRowBuilder<MessageActionRowComponentBuilder> | ActionRowBuilder<MessageActionRowComponentBuilder>[]): ActionRowBuilder<MessageActionRowComponentBuilder>[]{

        if (Array.isArray(menus)) {
            return menus.map(menu =>
                menu instanceof ActionRowBuilder
                    ? menu
                    : SelectMenuManager.row(menu)
            );
        }

        return menus instanceof ActionRowBuilder
            ? [menus]
            : [SelectMenuManager.row(menus)];
    }
}