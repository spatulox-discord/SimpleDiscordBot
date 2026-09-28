import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ComponentType,
    InteractionCollector,
    Message,
    MessageFlags,
    RepliableInteraction,
} from "discord.js";
import {Log} from "@spatulox/utils";
import { ButtonManager } from "./ButtonManager";

export interface PaginationPage {
    embed: EmbedBuilder;
    content?: string;
}

export interface PaginationOptions {
    /** Total lifetime of the pagination in ms, default 60000 */
    time?: number;
    /** Stop after this many ms without any click, default 15000 */
    idle?: number;
    /** Only used when the interaction isn't acknowledged yet, default false */
    ephemeral?: boolean;
}

export class PaginationManager {

    /**
     * Reply to the interaction (or edit the deferred reply) with the first page and navigation buttons.
     * Only the user who triggered the interaction can navigate, and the buttons are disabled when the
     * collector ends.
     */
    static async send(
        interaction: RepliableInteraction,
        pages: PaginationPage[],
        options: PaginationOptions = {}
    ): Promise<InteractionCollector<ButtonInteraction> | null> {
        if (pages.length === 0) {
            Log.error("PaginationManager: at least one page is required");
            return null;
        }

        const prefix = `pag_${interaction.id}_`;
        let currentPage = 0;

        const payload = (disabled: boolean = false) => {
            const page = pages[currentPage]!;
            return {
                content: page.content ?? "",
                embeds: [page.embed],
                components: [this.row(prefix, currentPage, pages.length, disabled)]
            };
        };

        let message: Message;
        if (interaction.deferred || interaction.replied) {
            message = await interaction.editReply(payload());
        } else {
            const response = await interaction.reply({
                ...payload(),
                flags: options.ephemeral ? [MessageFlags.Ephemeral] : [],
                withResponse: true
            });
            message = response.resource?.message ?? await interaction.fetchReply();
        }

        // Collector bound to this message only, so other buttons of the channel are left untouched
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i: ButtonInteraction) => i.customId.startsWith(prefix),
            time: options.time ?? 60000,
            idle: options.idle ?? 15000
        });

        collector.on('collect', async (i: ButtonInteraction) => {
            try {
                if (i.user.id !== interaction.user.id) {
                    await i.reply({content: "Only the user who opened this pagination can use it", flags: [MessageFlags.Ephemeral]});
                    return;
                }

                switch (i.customId.slice(prefix.length)) {
                    case "first":
                        currentPage = 0;
                        break;
                    case "prev":
                        currentPage = Math.max(0, currentPage - 1);
                        break;
                    case "next":
                        currentPage = Math.min(pages.length - 1, currentPage + 1);
                        break;
                    case "last":
                        currentPage = pages.length - 1;
                        break;
                    case "stop":
                        await i.update({components: []});
                        collector.stop("user");
                        return;
                }

                await i.update(payload());
            } catch (error) {
                Log.error(`PaginationManager: failed to update the page: ${error}`);
            }
        });

        collector.on('end', async (_collected, reason) => {
            if (reason === "user") return; // Stop button already removed the components
            await interaction.editReply({components: [this.row(prefix, currentPage, pages.length, true)]})
                .catch(error => Log.warn(`PaginationManager: failed to disable the buttons: ${error}`));
        });

        return collector;
    }

    private static row(prefix: string, currentPage: number, pageCount: number, disabled: boolean): ActionRowBuilder<ButtonBuilder> {
        const isFirst = currentPage === 0;
        const isLast = currentPage === pageCount - 1;

        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            ButtonManager.secondary({customId: `${prefix}first`, emoji: "⏪", disabled: disabled || isFirst}),
            ButtonManager.secondary({customId: `${prefix}prev`, emoji: "⬅️", disabled: disabled || isFirst}),
            ButtonManager.secondary({customId: `${prefix}stop`, emoji: "⏹️", disabled}),
            ButtonManager.secondary({customId: `${prefix}next`, emoji: "➡️", disabled: disabled || isLast}),
            ButtonManager.secondary({customId: `${prefix}last`, emoji: "⏩", disabled: disabled || isLast}),
        );
    }
}
