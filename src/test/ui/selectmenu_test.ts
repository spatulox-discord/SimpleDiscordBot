import {Bot, SelectMenuCreateOption, SelectMenuManager} from "../../index";
import {STATIC_PREFIX, UiTester} from "./UiTester";

const id = (name: string) => `${STATIC_PREFIX}select_${name}`

export async function selectmenu_test(t: UiTester) {
    await t.send("**Pre-built**")
    await t.send(SelectMenuManager.toMessage(SelectMenuManager.users(id("users"))))
    await t.send(SelectMenuManager.toMessage(SelectMenuManager.roles(id("roles"))))
    await t.send(SelectMenuManager.toMessage(SelectMenuManager.mentionables(id("mentionables"))))
    await t.send(SelectMenuManager.toMessage(SelectMenuManager.channels(id("channels"))))

    await t.send("**String select**")
    const selection: SelectMenuCreateOption[] = [
        {label: "Guild", value: "guild", description: "With a description", emoji: "👀"},
        {label: "Other guild", value: "other_guild"},
    ]
    await t.send(SelectMenuManager.toMessage(SelectMenuManager.simple(id("simple"), selection)))

    // create() + the public option() helper, with a single option then an array
    const menu = SelectMenuManager.create(id("option"), "create() + option()")
    menu.addOptions(SelectMenuManager.option({label: "Single option()", value: "single"}))
    menu.addOptions(SelectMenuManager.option([
        {label: "option([...]) 1", value: "array_1", emoji: "1️⃣"},
        {label: "option([...]) 2", value: "array_2", emoji: "2️⃣"},
    ]))
    await t.send(SelectMenuManager.toMessage(SelectMenuManager.minMax(menu, 1, 2)))

    const lotOfSelection: SelectMenuCreateOption[] = Array.from({length: 13}, (_, i) => ({label: `Option ${i + 1}`, value: `option_${i}`}))
    await t.send("**paginated()** : 13 options, 5 per menu → 3 menus")
    await t.send(SelectMenuManager.toMessage(SelectMenuManager.paginated(id("paginated"), lotOfSelection, 5)))

    await t.send("**Senders**")
    await t.sent("Bot.message.send(channelId, select)", Bot.message.send(t.channelId, SelectMenuManager.simple(id("sender"), selection)))
    await t.sent("Bot.message.send(channelId, [select, select])", Bot.message.send(t.channelId, "Bot.message.send(channelId, content, [users, channels])", [
        SelectMenuManager.users(id("sender_users")),
        SelectMenuManager.channels(id("sender_channels")),
    ]))
    await t.throttle(Bot.log.info(SelectMenuManager.mentionables(id("log"))))
}
