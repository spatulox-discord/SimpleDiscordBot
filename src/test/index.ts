import dotenv from "dotenv";
import {
    Bot,
    BotConfig,
    Log,
    SimpleColor,
    Time,
} from "../index";
import {client} from "./client";
import {Events} from "discord.js"
import {randomActivityList} from "./randomActivityList";
import {runUiTests} from "./ui/runUiTests";
import {handleUiTestInteraction, isUiTestInteraction} from "./ui/interactive_test";
dotenv.config();

async function main() {

    const config: BotConfig = {
        defaultSimpleColor: SimpleColor.blue, // (When embed are created with EmbedManager/ComponentManager)
        botName: "Simple Discord Bot", // The name of the bot
        log: {
            info: {channelId: "1162047096220827831", console: true, discord: true},
            error: {channelId: "1162047096220827831", console: true, discord: true},
            warn: {channelId: "1162047096220827831", console: true, discord: true},
            debug: {channelId: "1162047096220827831", console: true, discord: false},
        }
    }

    const bot = new Bot(client, config);
    bot.client.on(Events.ClientReady, async () => {
        Bot.setRandomActivity(randomActivityList, Time.minute.MIN_10.toMilliseconds())
    })

    bot.client.on(Events.InteractionCreate, async (interaction) => {
        try {
            // Any slash command runs the whole UI test suite in its channel
            if (interaction.isChatInputCommand()) {
                await runUiTests(interaction)
            } else if (isUiTestInteraction(interaction)) {
                await handleUiTestInteraction(interaction)
            }
        } catch (error) {
            Log.error(`UI test interaction failed: ${error}`)
        }
    })

}
main()
