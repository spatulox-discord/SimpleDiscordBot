import {TextChannel, ThreadAutoArchiveDuration} from "discord.js";
import {Bot, ComponentManager, EmbedManager, GuildManager, SelectMenuManager, WebhookManager} from "../../index";
import {STATIC_PREFIX, UiTester} from "./UiTester";

export async function webhook_test(t: UiTester) {
    const web = new WebhookManager(Bot.client, "Amiral", "./src/test/img/amiral_super_terre.jpg")

    await t.send("**Send**")
    await t.sent("webhook.send(string)", web.send(t.channelId, "webhook.send(string)"))
    await t.sent("webhook.send(embed)", web.send(t.channelId, EmbedManager.error("webhook.send(embed)")))
    await t.sent("webhook.send(container)", web.send(t.channelId, ComponentManager.success("webhook.send(container)")))
    await t.sent("webhook.send(select)", web.send(t.channelId, SelectMenuManager.users(`${STATIC_PREFIX}webhook_users`)))
    await t.sent("webhook.send([embed, select])", web.send(t.channelId, [
        EmbedManager.simple("webhook.send([embed, select])"),
        SelectMenuManager.roles(`${STATIC_PREFIX}webhook_roles`),
    ]))
    await t.sent("webhook.success()", web.success(t.channelId, "webhook.success()"))

    if (!(t.channel instanceof TextChannel)) {
        await t.send("Thread test skipped : run the command in a text channel")
        return
    }

    await t.send("**Thread** : the same instance sends in a thread, then back in the channel")
    const starter = await t.send("Starter message of the webhook thread")
    const thread = await t.throttle(GuildManager.channel.thread.createFromMessage(starter, {
        name: "UI test - webhook",
        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
    }))
    await t.sent("webhook.send(threadId)", web.send(thread.id, "webhook.send(threadId) : inside the thread"))
    await t.sent("webhook.send(channelId) after a thread", web.send(t.channelId, "webhook.send(channelId) : back in the channel, with the same instance"))
    await t.throttle(thread.setArchived(true, "UI test done"))
}
