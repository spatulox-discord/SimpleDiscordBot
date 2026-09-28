import {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder, MessageCreateOptions, InteractionReplyOptions, InteractionEditReplyOptions, MessageFlags,
} from "discord.js";

export interface ButtonOptions {
    label?: string;
    emoji?: string;
    customId: string;
    disabled?: boolean;
}

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

    static toMessage(button: ButtonBuilder | ButtonBuilder[] | ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<ButtonBuilder>[]): MessageCreateOptions {
        return {
            components: this.createRowsToReturn(button),
        }
    }

    static toInteraction(button: ButtonBuilder | ButtonBuilder[] | ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<ButtonBuilder>[], ephemeral: boolean = false): InteractionReplyOptions {
        return {
            components: this.createRowsToReturn(button),
            flags: ephemeral ? [MessageFlags.Ephemeral] : []
        };
    }

    static toInteractionEdit(button: ButtonBuilder | ButtonBuilder[] | ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<ButtonBuilder>[]): InteractionEditReplyOptions {
        return {
            components: this.createRowsToReturn(button)
        };
    }

    private static createRowsToReturn(button: ButtonBuilder | ButtonBuilder[] | ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<ButtonBuilder>[]): ActionRowBuilder<ButtonBuilder>[]{

        if (Array.isArray(button)) {
            return button.map(btn =>
                btn instanceof ActionRowBuilder
                    ? btn
                    : ButtonManager.row(btn)
            );
        }

        return button instanceof ActionRowBuilder
            ? [button]
            : [ButtonManager.row(button)];
    }
}