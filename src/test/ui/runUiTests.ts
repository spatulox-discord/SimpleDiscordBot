import {ChatInputCommandInteraction, User} from "discord.js";
import {Bot, ComponentManager, EmbedManager, SelectMenuManager, UserManager} from "../../index";
import {MESSAGE_DELAY_MS, STATIC_PREFIX, UiTester} from "./UiTester";
import {embed_test} from "./embed_test";
import {component_test} from "./component_test";
import {chart_test} from "./chart_test";
import {button_test} from "./button_test";
import {selectmenu_test} from "./selectmenu_test";
import {webhook_test} from "./webhook_test";
import {reaction_test} from "./reaction_test";
import {interactive_test} from "./interactive_test";

/** DMs go to the user who ran the command, still throttled */
function dm_test(user: User) {
    return async (t: UiTester) => {
        await t.send(`Sending 2 DMs to ${user}`)
        await t.sent("Bot.message.sendDM(user, [embed, select])", Bot.message.sendDM(user, [
            EmbedManager.simple("Bot.message.sendDM(user, [embed, select])"),
            SelectMenuManager.users(`${STATIC_PREFIX}dm_users`),
        ]))
        await t.sent("UserManager.send(userId, content, container)", UserManager.send(user.id, "UserManager.send(userId, content, container)", ComponentManager.simple("The container")))
    }
}

/**
 * Run every UI test in the channel of the command, one message every MESSAGE_DELAY_MS,
 * then post the interactive panel. The command reply (ephemeral) shows the progress and the report
 */
export async function runUiTests(interaction: ChatInputCommandInteraction) {
    await Bot.interaction.defer(interaction, true)

    const channel = interaction.channel
    if (!channel?.isSendable()) {
        await Bot.interaction.update(interaction, ComponentManager.error("Run the command in a channel where the bot can send messages"))
        return
    }

    const sections: [string, (t: UiTester) => Promise<void>][] = [
        ["EmbedManager", embed_test],
        ["ComponentManager", component_test],
        ["ChartManager", chart_test],
        ["ButtonManager", button_test],
        ["SelectMenuManager", selectmenu_test],
        ["WebhookManager", webhook_test],
        ["ReactionManager", reaction_test],
        ["Direct messages", dm_test(interaction.user)],
        ["Interactive : click to test", interactive_test],
    ]

    // A container from the start : the deferred reply becomes a Components V2 message, updated with containers only
    await Bot.interaction.update(interaction, ComponentManager.simple(
        `Running ${sections.length} UI test sections here, ${MESSAGE_DELAY_MS}ms after each message...`
    ))

    const t = new UiTester(channel)
    await t.send(`# UI tests · <t:${Math.floor(Date.now() / 1000)}:f>`)
    for (const [title, test] of sections) {
        await t.section(title, test)
    }

    const report = t.report
    await t.send(`${report.ok ? "✅" : "❌"} ${report.text}`)
    await Bot.interaction.update(interaction, report.ok ? ComponentManager.success(report.text) : ComponentManager.error(report.text))
    await Bot.interaction.followUp(interaction, "Done : the interactive panel is at the bottom of the channel", true)
}
