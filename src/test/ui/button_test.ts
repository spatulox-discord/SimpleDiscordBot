import {Bot, ButtonManager} from "../../index";
import {STATIC_PREFIX, UiTester} from "./UiTester";

const id = (name: string) => `${STATIC_PREFIX}button_${name}`

export async function button_test(t: UiTester) {
    await t.send("**Styles**")
    const row = ButtonManager.row([
        ButtonManager.primary({customId: id("primary"), label: "Primary", emoji: "✅"}),
        ButtonManager.secondary({customId: id("secondary"), label: "Secondary"}),
        ButtonManager.success({customId: id("success"), label: "Success"}),
        ButtonManager.danger({customId: id("danger"), label: "Danger"}),
        ButtonManager.link({label: "Link", url: "https://google.com", emoji: "🔗"}),
    ])
    await t.send(ButtonManager.toMessage(row))
    await t.send(ButtonManager.toMessage([
        ButtonManager.confirm(id("confirm")),
        ButtonManager.cancel(id("cancel")),
        ButtonManager.secondary({customId: id("disabled"), label: "Disabled", disabled: true}),
    ]))

    await t.send("**Emoji only** : no \"Button\" label")
    await t.send(ButtonManager.toMessage([
        ButtonManager.secondary({customId: id("emoji_1"), emoji: "⏪"}),
        ButtonManager.secondary({customId: id("emoji_2"), emoji: "⏩"}),
        ButtonManager.primary({customId: id("no_label")}),
    ]))

    await t.send("**Grouping** : 7 buttons → 2 rows (5 + 2), then [row, button] → 2 rows (2 + 1)")
    await t.send(ButtonManager.toMessage(
        Array.from({length: 7}, (_, i) => ButtonManager.secondary({customId: id(`group_${i}`), label: `${i + 1}`}))
    ))
    await t.send(ButtonManager.toMessage([
        ButtonManager.row([
            ButtonManager.primary({customId: id("row_a"), label: "Row A"}),
            ButtonManager.primary({customId: id("row_b"), label: "Row B"}),
        ]),
        ButtonManager.success({customId: id("row_c"), label: "Alone C"}),
    ]))

    await t.send("**Senders**")
    await t.sent("Bot.message.send(channelId, row)", Bot.message.send(t.channelId, "Bot.message.send(channelId, content, row)", row))
    await t.throttle(Bot.log.info(row))
}
