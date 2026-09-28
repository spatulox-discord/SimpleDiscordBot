import {Client, ActivityType, Events, version} from 'discord.js';
import { Time } from '@spatulox/utils';
import {Log} from "@spatulox/utils";
import {InternetChecker} from "@spatulox/utils";
import {BotLog, ConfigLog} from "./BotLog";
import {EmbedManager} from "../manager/messages/EmbedManager";
import {BotMessage} from "./BotMessage";
import {BotEnv} from "./BotEnv";
import {BotInteraction} from "./BotInteraction";
import {SimpleColor} from "../constants/SimpleColor";
import {SimpleDiscordBotInfo} from "../SimpleDiscordBotInfo";

export type BotConfig = {
    defaultSimpleColor?: number | SimpleColor;
    botName?: string
    log?: ConfigLog
}

export type RandomBotActivity = {type: ActivityType, message: string}[]

export class Bot {

    // Static ref
    public static readonly log = BotLog
    public static readonly message = BotMessage
    public static readonly interaction = BotInteraction

    // Instance properties
    private static _client: Client;
    private static token: string;
    private static _config: BotConfig;

    get config(): BotConfig { return Bot._config; }
    get client(): Client { return Bot._client; }

    static get client(): Client { return Bot._client; }
    static get config(): BotConfig { return Bot._config; }

    /**
     * Resolves once the login is done (true) or has definitively failed (false)
     */
    public readonly started: Promise<boolean>;

    constructor(client: Client, config: BotConfig = {}) {

        Log.info('----------------------------------------------------');
        Log.info("Starting Bot")

        Bot.token = BotEnv.token;
        Bot._config = config
        Bot._client = client;

        // Registered before login() so the event can't be missed, and only once even if login() is called again
        Bot._client.once(Events.ClientReady, async () => {
            if (Bot._client.user) {
                await Bot.log.initDiscordLogging()
                Log.info(`Connected on ${Bot._client.guilds.cache.size} servers as ${Bot._client.user.tag}`);
                Bot.log.info(EmbedManager.description("Bot Started"))
            }
        });

        this.started = (async() => {
            Log.info(`Using discord.js version: ${version}`);
            Log.info(`Using simplediscordbot version: ${SimpleDiscordBotInfo.version}`);
            Log.info('Trying to connect to Discord Servers')

            await InternetChecker.checkConnection(3)

            return await this.login()
        })().catch(error => {
            Log.error(`Failed to start the bot: ${error}`);
            return false;
        });
    }

    public async login(maxTries: number = 3): Promise<boolean> {
        if (Bot._client.isReady()) return true;

        let tries = 0;

        while (tries < maxTries) {
            try {
                await Bot._client.login(Bot.token);
                return true;
            } catch (error) {
                Log.error(`Connection error : ${error}. Trying again...`);
                tries++;
                await new Promise(resolve =>
                    setTimeout(resolve, Time.second.SEC_03.toMilliseconds())
                );
            }
        }

        Log.error(`Impossible to connect the bot after ${maxTries} attempts`);
        return false;
    }

    static setActivity(message: string, type: ActivityType) {
        if (Bot._client.user) {
            Bot._client.user.setActivity({ name: message, type });
            Log.info(`Activity defined : ${message}`);
        }
    }

    static setRandomActivity(randomActivity: RandomBotActivity, intervalMs: number | null = null) {
        if(randomActivity.length == 0){
            Log.error("Bot.randomActivity = [{}] is empty")
            return
        }

        const pickRandom = () => {
            const random = randomActivity[Math.floor(Math.random() * randomActivity.length)]!;
            Bot.setActivity(random.message, random.type);
            return random;
        };

        if (intervalMs === null) {
            pickRandom();
            Log.info(`Activity set ONCE`);
            return;
        }

        pickRandom();
        setInterval(async () => {
            pickRandom();
        }, intervalMs);
        Log.info(`Random activity started (every ${Math.round(intervalMs / 60000)}min)`);
        return
    }

}
