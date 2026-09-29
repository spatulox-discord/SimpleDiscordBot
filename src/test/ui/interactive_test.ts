import {ContainerBuilder, Interaction} from "discord.js";
import {setTimeout} from "timers/promises";
import {
    Bot,
    ButtonManager,
    ComponentManager,
    EmbedManager,
    PaginationManager,
    PaginationPage,
    SelectMenuCreateOption,
    SelectMenuManager,
} from "../../index";
import {MODAL_PREFIX, STATIC_PREFIX, UI_PREFIX, UiTester} from "./UiTester";
import {modal_submitted, TEST_MODALS} from "./modal_test";

const now = () => `<t:${Math.floor(Date.now() / 1000)}:T>`

const PAGES: PaginationPage[] = Array.from({length: 4}, (_, i) => ({
    embed: EmbedManager.simple(`Content of page ${i + 1}`).setTitle(`PaginationManager - page ${i + 1}`),
}))

const SELECT_OPTIONS: SelectMenuCreateOption[] = [
    {label: "Red", value: "red", emoji: "🟥"},
    {label: "Green", value: "green", emoji: "🟩"},
    {label: "Blue", value: "blue", emoji: "🟦"},
]

/** Rebuilt on every click : a Components V2 message is updated with a whole new container */
function v2Playground(state: string): ContainerBuilder {
    const container = ComponentManager.create({title: "Update playground (Components V2)", description: state})
    return ComponentManager.field(container, {
        separator: false,
        button: [
            ButtonManager.primary({customId: `${UI_PREFIX}update_container`, label: "update(toInteractionUpdate())"}),
            ButtonManager.secondary({customId: `${UI_PREFIX}defer_update_container`, label: "defer() + Bot.interaction.update()"}),
        ],
    })
}

/**
 * Post the components that need a click to be tested : modals, pagination, interaction updates, selects
 */
export async function interactive_test(t: UiTester) {
    await t.sent("update playground (legacy)", Bot.message.send(t.channelId, "**Update playground (legacy message)** : each button edits the embed, the buttons stay", [
        EmbedManager.simple("Not updated yet"),
        ButtonManager.row([
            ButtonManager.primary({customId: `${UI_PREFIX}update_embed`, label: "Bot.interaction.update()"}),
            ButtonManager.secondary({customId: `${UI_PREFIX}defer_update_embed`, label: "defer() + editReply(toInteractionUpdate())"}),
        ]),
    ]))

    await t.send(ComponentManager.toMessage(v2Playground("Not updated yet"), null, false))

    await t.sent("select playground", Bot.message.send(t.channelId, "**Select playground**", [
        SelectMenuManager.simple(`${UI_PREFIX}select`, SELECT_OPTIONS, "Update the message with the choice"),
        SelectMenuManager.users(`${UI_PREFIX}users`, "Answer the selected users (ephemeral)"),
    ]))

    await t.send({
        content: "**Modals & pagination** : 9 buttons → 2 rows",
        ...ButtonManager.toMessage([
            ...Object.keys(TEST_MODALS).map(name => ButtonManager.primary({customId: `${UI_PREFIX}modal:${name}`, label: `Modal ${name}`})),
            ButtonManager.success({customId: `${UI_PREFIX}pagination`, label: "Pagination", emoji: "📖"}),
            ButtonManager.success({customId: `${UI_PREFIX}pagination_ephemeral`, label: "Pagination (ephemeral)", emoji: "📖"}),
        ]),
    })
}

export function isUiTestInteraction(interaction: Interaction): boolean {
    if (!interaction.isMessageComponent() && !interaction.isModalSubmit()) return false
    return [UI_PREFIX, MODAL_PREFIX, STATIC_PREFIX].some(prefix => interaction.customId.startsWith(prefix))
}

export async function handleUiTestInteraction(interaction: Interaction): Promise<void> {
    if (interaction.isModalSubmit()) {
        await modal_submitted(interaction)
        return
    }
    if (!interaction.isMessageComponent()) return

    // Components only sent to check how they render
    if (interaction.customId.startsWith(STATIC_PREFIX)) {
        const values = interaction.isAnySelectMenu() ? ` : ${interaction.values.join(", ") || "(none)"}` : ""
        await Bot.interaction.reply(interaction, `\`${interaction.customId}\` clicked${values}`, true)
        return
    }

    const action = interaction.customId.slice(UI_PREFIX.length)

    if (action.startsWith("modal:")) {
        const modal = TEST_MODALS[action.slice("modal:".length)]
        if (modal) await interaction.showModal(modal())
        return
    }

    switch (action) {
        case "update_embed":
            await Bot.interaction.update(interaction, EmbedManager.simple(`Bot.interaction.update() ${now()}`))
            return
        case "defer_update_embed":
            await Bot.interaction.defer(interaction)
            await setTimeout(1000)
            await interaction.editReply(EmbedManager.toInteractionUpdate(EmbedManager.success(`defer() then editReply(toInteractionUpdate()) ${now()}`)))
            return
        case "update_container":
            await interaction.update(ComponentManager.toInteractionUpdate(v2Playground(`interaction.update(toInteractionUpdate()) ${now()}`), null, false))
            return
        case "defer_update_container":
            await Bot.interaction.defer(interaction)
            await setTimeout(1000)
            await Bot.interaction.update(interaction, v2Playground(`defer() then Bot.interaction.update() ${now()}`))
            return
        case "select":
            if (interaction.isStringSelectMenu()) {
                await Bot.interaction.update(interaction, EmbedManager.simple(`Selected : ${interaction.values.join(", ")} ${now()}`))
            }
            return
        case "users":
            if (interaction.isUserSelectMenu()) {
                await Bot.interaction.reply(interaction, `Selected users : ${interaction.users.map(user => user.toString()).join(", ")}`, true)
            }
            return
        case "pagination":
            await PaginationManager.send(interaction, PAGES, {time: 120_000, idle: 60_000})
            return
        case "pagination_ephemeral":
            await PaginationManager.send(interaction, PAGES, {ephemeral: true})
            return
    }
}
