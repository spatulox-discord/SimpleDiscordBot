import {EmbedField} from "discord.js";
import {Bot, SimpleColor, EmbedManager} from "../../index";
import {UiTester} from "./UiTester";

export async function embed_test(t: UiTester) {
    await t.send("**Presets**")
    await t.send(EmbedManager.toMessage(EmbedManager.create(SimpleColor.transparent).setDescription("create(SimpleColor.transparent)")))
    await t.send(EmbedManager.toMessage(EmbedManager.create(SimpleColor.yellow).setDescription("create(SimpleColor.yellow)")))
    await t.send(EmbedManager.toMessage(EmbedManager.simple("simple()")))
    await t.send(EmbedManager.toMessage(EmbedManager.description("description() : no footer, no timestamp")))
    await t.send(EmbedManager.toMessage(EmbedManager.success("success()")))
    await t.send(EmbedManager.toMessage(EmbedManager.debug("debug()")))
    await t.send(EmbedManager.toMessage(EmbedManager.error("error()")))

    await t.send("**Fields**")
    const fields: EmbedField[] = [
        {name: "Name", value: "John", inline: true},
        {name: "Lastname", value: "Doe", inline: true},
        {name: "Age", value: "41", inline: true},
        {name: "Location", value: "Somewhere", inline: false},
    ]
    await t.send(EmbedManager.toMessage(EmbedManager.fields(EmbedManager.create().setTitle("fields()"), fields)))

    await t.send("**Senders**")
    await t.sent("Bot.message.send(channelId, embed)", Bot.message.send(t.channelId, EmbedManager.simple("Bot.message.send(channelId, embed)")))
    await t.sent("Bot.message.send(channelId, content, embed)", Bot.message.send(t.channelId, "Bot.message.send(channelId, content, embed)", EmbedManager.simple("The embed")))
    const channel = t.textChannel
    if (channel) {
        await t.sent("Bot.message.success()", Bot.message.success(channel, "Bot.message.success() : the text must appear once, in the embed"))
        await t.sent("Bot.message.error()", Bot.message.error(channel, "Bot.message.error() : the text must appear once, in the embed"))
    }
    await t.throttle(Bot.log.info(EmbedManager.success("Bot.log.info(embed) : printed in the console as INFO")))
    await t.throttle(Bot.log.error(EmbedManager.error("Bot.log.error(embed) : printed in the console as ERROR")))

    await t.send("**toMessageUpdate()** : the next embed is edited after the delay")
    const message = await t.send(EmbedManager.toMessage(EmbedManager.simple("Before toMessageUpdate()")))
    await t.throttle(message.edit(EmbedManager.toMessageUpdate(EmbedManager.success("Edited with toMessageUpdate()"))))
}
