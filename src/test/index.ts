import dotenv from "dotenv";
import {
    Bot,
    BotConfig,
    SimpleColor,
    Time,
} from "../index";
import {client} from "./client";
import {Events} from "discord.js"
import {randomActivityList} from "./randomActivityList";
//import {component_test} from "./ui/component_test";
import {chart_test} from "./ui/chart_test";
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
        if(interaction.isChatInputCommand()){
            console.log(interaction);
            //webhook_test(interaction)
            //component_test(interaction)
            chart_test(interaction)
        }
    })

}
main()