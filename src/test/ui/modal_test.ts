import {APIEmbedField, ComponentType, ModalBuilder, ModalSubmitInteraction} from "discord.js";
import {Bot, EmbedManager, ModalFieldType, ModalManager} from "../../index";
import {MODAL_PREFIX} from "./UiTester";

/**
 * Modals opened by the buttons of the interactive panel, by name.
 * A modal can only be shown as the first answer to an interaction, hence the buttons
 */
export const TEST_MODALS: Record<string, () => ModalBuilder> = {
    simple: () => ModalManager.simple(`${MODAL_PREFIX}simple`, "simple()", {type: ModalFieldType.SHORT, label: "Simple", required: true}),
    title_desc: () => ModalManager.titleDescription(`${MODAL_PREFIX}title_desc`, "titleDescription() prefilled",
        {label: "Title", value: "Prefilled title"},
        {label: "Description", value: "Prefilled description"}
    ),
    date: () => ModalManager.date(`${MODAL_PREFIX}date`, "date() : customId suffixed"),
    date_raw: () => ModalManager.date(`${MODAL_PREFIX}date_raw`, "date(suffix = false)", "Date", false),
    number: () => ModalManager.number(`${MODAL_PREFIX}number`, "number()"),
    phone: () => ModalManager.phone(`${MODAL_PREFIX}phone`, "phone()"),
    add: () => ModalManager.add(ModalManager.create("create() + add()", `${MODAL_PREFIX}add`), [
        {type: ModalFieldType.SHORT, label: "Name"},
        {type: ModalFieldType.LONG, label: "Paragraph", customId: "paragraph"},
        {type: ModalFieldType.DATE, label: "Date", customId: "date"},
        {type: ModalFieldType.NUMBER, label: "Number", customId: "number"},
        {type: ModalFieldType.PHONE, label: "Phone", customId: "phone"},
    ]),
}

/** Parsed value of the date / number inputs, so parseDate() and parseNumber() are checked on real inputs */
function parsed(customId: string, value: string): string {
    if (customId.includes("date")) return ` → parseDate() : ${ModalManager.parseDate(value)?.toDateString() ?? "null"}`
    if (customId.includes("number")) return ` → parseNumber() : ${ModalManager.parseNumber(value) ?? "null"}`
    return ""
}

/**
 * Answer with every submitted value (and the customId of the modal, to check the suffixes), then a followUp
 */
export async function modal_submitted(interaction: ModalSubmitInteraction) {
    const fields: APIEmbedField[] = [...interaction.fields.fields.values()]
        .flatMap(field => field.type === ComponentType.TextInput ? [field] : [])
        .map(field => ({
            name: field.customId,
            value: `${field.value || "(empty)"}${parsed(field.customId, field.value)}`
        }))

    await Bot.interaction.reply(interaction, EmbedManager.fields(EmbedManager.simple(`Modal \`${interaction.customId}\` submitted`), fields), true)
    await Bot.interaction.followUp(interaction, "Bot.interaction.followUp() after a modal submit", true)
}
