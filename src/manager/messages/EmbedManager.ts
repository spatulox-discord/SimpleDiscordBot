import {
    EmbedBuilder, EmbedFooterData,
    InteractionDeferReplyOptions, InteractionReplyOptions, MessageCreateOptions,
    MessageFlags, InteractionUpdateOptions, MessageEditOptions,
} from "discord.js";
import { Bot } from '../../core/Bot';
import {SimpleColor} from "../../constants/SimpleColor";

export class EmbedManager {
    private static get BOT_ICON(): string {
        return Bot.client?.user?.displayAvatarURL({ forceStatic: false, size: 128 }) || "";
    }

    private static get DEFAULT_COLOR(): number | SimpleColor {
        return Bot.config?.defaultSimpleColor ?? SimpleColor.default;
    }

    /**
     * Creates base embed - SAME SIMPLE API !
     */
    static create(color: SimpleColor | null = null): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTimestamp(new Date());

        const colorC = color ?? this.DEFAULT_COLOR;

        if(colorC !== SimpleColor.transparent){
            embed.setColor(colorC)
        }

        if (Bot.config?.botName) {
            const footer: EmbedFooterData = {
                text: Bot.config.botName
            };

            if (this.BOT_ICON) {
                footer.iconURL = this.BOT_ICON;
            }

            embed.setFooter(footer);
        }
        return embed
    }

    /**
     * Creates simple embed with just description
     */
    static simple(description: string, color: SimpleColor | null = null): EmbedBuilder {
        return this.create(color)
            .setDescription(description)
    }

    /**
     * Creates error embed
     */
    static error(description: string): EmbedBuilder {
        return this.create(SimpleColor.error)
            .setTitle('Something went Wrong')
            .setDescription(description);
    }

    /**
     * Creates success embed
     */
    static success(description: string): EmbedBuilder {
        return this.create(SimpleColor.minecraft)
            .setTitle('Success')
            .setDescription(description);
    }

    /**
     * Creates a simple description embed
     */
    static description(description: string): EmbedBuilder {
        return this.create()
            .setDescription(description)
            .setFooter(null)
            .setTimestamp(null)
    }

    /**
     * Creates debug embed
     */
    static debug(description: string): EmbedBuilder {
        return this.create(SimpleColor.green)
            .setTitle('Debug')
            .setDescription(description);
    }

    /**
     * Defer ephemeral reply
     */
    static deferEphemeral(): InteractionDeferReplyOptions {
        return { flags: MessageFlags.Ephemeral };
    }

    /**
     * Quick field adder
     */
    static field(embed: EmbedBuilder, field: {name: string, value: string, inline?: boolean}): EmbedBuilder {
        return embed.addFields({ name: field.name, value: field.value, inline: field.inline ?? false });
    }

    static fields(embed: EmbedBuilder, fields: {name: string, value: string, inline?: boolean}[]): EmbedBuilder {
        fields.forEach((f) => {
            embed.addFields({ name: f.name, value: f.value, inline: f.inline ?? false })
        })
        return embed;
    }

    /**
     * Transform embed into objet for interaction.reply()
     */
    static toInteraction(embed: EmbedBuilder, ephemeral: boolean = false): InteractionReplyOptions {
        return {
            embeds: [embed],
            flags: ephemeral ? [MessageFlags.Ephemeral] : []
        };
    }

    /**
     * Options to edit an existing message : message.edit()
     */
    static toMessageUpdate(embed: EmbedBuilder): MessageEditOptions {
        return {
            embeds: [embed]
        };
    }

    /**
     * Options for interaction.update() and interaction.editReply() (buttons, select menus, modals, deferred replies)
     */
    static toInteractionUpdate(embed: EmbedBuilder): InteractionUpdateOptions {
        return this.toMessageUpdate(embed);
    }


    /**
     * Transform embed into objet to send a message
     */
    static toMessage(embed: EmbedBuilder): MessageCreateOptions {
        return {
            embeds: [embed]
        };
    }
}