import {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder, MessageCreateOptions, InteractionReplyOptions, MessageFlags,
} from "discord.js";
import type {UpdateOptions} from "../builder/SendableComponentBuilder";

export interface ButtonOptions {
    label?: string;
    emoji?: string;
    customId: string;
    disabled?: boolean;
}

/** One button, one row, or an array mixing buttons and rows (consecutive buttons are grouped by 5 per row) */
export type ButtonInput = ButtonBuilder | ActionRowBuilder<ButtonBuilder> | (ButtonBuilder | ActionRowBuilder<ButtonBuilder>)[];

export class ButtonManager {

    static create(options: ButtonOptions & { style: ButtonStyle }): ButtonBuilder {
        const btn = new ButtonBuilder()
            .setCustomId(options.customId)
            .setStyle(options.style)
            .setDisabled(options.disabled ?? false);

        // An emoji only button is valid : the default label is only needed when there is nothing to show
        if (options.label || !options.emoji) {
            btn.setLabel(options.label ?? "Button");
        }
        if (options.emoji) {
            btn.setEmoji(options.emoji);
        }

        return btn;
    }

    static primary(options: ButtonOptions): ButtonBuilder {
        return this.create({ ...options, style: ButtonStyle.Primary });
    }

    static success(options: ButtonOptions): ButtonBuilder {
        return this.create({ ...options, style: ButtonStyle.Success });
    }

    static secondary(options: ButtonOptions): ButtonBuilder {
        return this.create({ ...options, style: ButtonStyle.Secondary });
    }

    static danger(options: ButtonOptions): ButtonBuilder {
        return this.create({ ...options, style: ButtonStyle.Danger });
    }

    static link(options: Omit<ButtonOptions & {url: string, label: string}, "customId">): ButtonBuilder {
        const btn = new ButtonBuilder()
            .setLabel(options.label)
            .setStyle(ButtonStyle.Link)
            .setURL(options.url)

        if(options.emoji) btn.setEmoji(options.emoji);

        return btn
    }


    static confirm(customId: string) {
        return this.success({ customId, label: "Confirm" });
    }

    static cancel(customId: string) {
        return this.danger({ customId, label: "Cancel" });
    }

    static row(but: ButtonBuilder): ActionRowBuilder<ButtonBuilder>
    static row(but: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder>
    static row(but: ButtonBuilder | ButtonBuilder[]): ActionRowBuilder<ButtonBuilder> {
        const buttons = Array.isArray(but) ? but.slice(0, 5) : [but];
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttons);
    }

    static toMessage(button: ButtonInput): MessageCreateOptions {
        return {
            components: this.createRowsToReturn(button),
        }
    }

    static toInteraction(button: ButtonInput, ephemeral: boolean = false): InteractionReplyOptions {
        return {
            components: this.createRowsToReturn(button),
            flags: ephemeral ? [MessageFlags.Ephemeral] : []
        };
    }

    /**
     * Options to edit an existing message : message.edit()
     */
    static toMessageUpdate(button: ButtonInput): UpdateOptions {
        return {
            components: this.createRowsToReturn(button)
        };
    }

    /**
     * Options for interaction.update() and interaction.editReply() (buttons, select menus, modals, deferred replies)
     */
    static toInteractionUpdate(button: ButtonInput): UpdateOptions {
        return this.toMessageUpdate(button);
    }

    /**
     * Consecutive buttons are grouped by 5 in the same row (like row() does), action rows are kept as is
     */
    private static createRowsToReturn(button: ButtonInput): ActionRowBuilder<ButtonBuilder>[]{
        const items = Array.isArray(button) ? button : [button];
        const rows: ActionRowBuilder<ButtonBuilder>[] = [];
        let pending: ButtonBuilder[] = [];

        const flush = () => {
            for (let i = 0; i < pending.length; i += 5) {
                rows.push(ButtonManager.row(pending.slice(i, i + 5)));
            }
            pending = [];
        };

        for (const item of items) {
            if (item instanceof ActionRowBuilder) {
                flush();
                rows.push(item);
            } else {
                pending.push(item);
            }
        }
        flush();

        return rows;
    }
}
