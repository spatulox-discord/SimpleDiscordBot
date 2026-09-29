import {Bot, ReactionManager} from "../../index";
import {UiTester} from "./UiTester";

export async function reaction_test(t: UiTester) {
    const message = await t.send("Reactions : 👍 and 🎉 are added, listed, then 👍 is removed and everything is cleared")

    await t.throttle(ReactionManager.add(t.channelId, message.id, "👍"))
    await t.throttle(ReactionManager.add(t.channelId, message.id, "🎉"))

    const reactions = await ReactionManager.getAll(t.channelId, message.id)
    await t.send(`getAll() : ${reactions.map(r => `${r.emoji} × ${r.count}`).join(", ")}`)

    await t.throttle(ReactionManager.remove(t.channelId, message.id, "👍", Bot.client.user!.id))
    await t.throttle(ReactionManager.clear(t.channelId, message.id))
}
