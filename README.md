
# Simple Discord Bot ![badge-status](https://img.shields.io/badge/status-active-brightgreen)

[![npm version](https://img.shields.io/npm/v/@spatulox/simplediscordbot.svg)](https://npmjs.com/package/@spatulox/simplediscordbot)
[![downloads](https://img.shields.io/npm/dm/@spatulox/simplediscordbot.svg)](https://npmjs.com/package/@spatulox/simplediscordbot)
[![license](https://img.shields.io/npm/l/@spatulox/simplediscordbot.svg)](LICENSE)

> **TypeScript Discord.js framework** - Simple, powerful, framework-ready. Built for developers who want clean bot architecture.

## ✨ Features :
> - Fully compatible with discordjs
> - Include the [DiscordInterationManager](https://github.com/Spatulox/DiscordInteractionManager) package
> - Simple Log package
> - Provides easy Managers to avoid repetitive code everywhere
> - Simple yet powerful builders (Embeds, Modals, SelectMenus, Components, Buttons) that rely on discord.js for full compatibility
> - Text based charts (progress bars, sparklines) for Components V2, since Discord has no chart component

# Don't forget to check the [wiki](https://github.com/spatulox-discord/SimpleDiscordBot/wiki)

## 🧩 Starting a new bot ?

> Don't start from an empty folder : the [**DiscordBotTemplate**](https://github.com/Spatulox/DiscordBotTemplate)
> is a ready-to-use project built on this framework. Login, logging, modules, interaction
> routing and slash command deployment are already wired, you only fill in your ids.
>
> It has [its own wiki](https://github.com/Spatulox/DiscordBotTemplate/wiki) too, and a
> `feat/multi-bot` branch for several bots living in one repository.

## Installation
```bash
  npm i @spatulox/simplediscordbot
```

## Quick Start

Env Variables:
```
DISCORD_BOT_TOKEN="" // Your bot Token
```
<details>
    <summary>Note for v2.1.2 and older</summary>

> You also need to set up this env var :
> ```
> DISCORD_BOT_CLIENTID="" // You bot ClientID
> ```

</details>

```typescript
import {Bot, BotConfig, SimpleColor, Time} from "@spatulox/simplediscordbot";
import {Client, Events, GatewayIntentBits} from "discord.js";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const config: BotConfig = {
    defaultSimpleColor: SimpleColor.blue,
    botName: "Simple Discord Bot",
    log: {
        info: {channelId: "YOUR_LOG_CHANNEL_ID", console: true, discord: true},
        error: {channelId: "YOUR_LOG_CHANNEL_ID", console: true, discord: true},
        warn: {channelId: "YOUR_LOG_CHANNEL_ID", console: true, discord: true},
        debug: {channelId: "YOUR_LOG_CHANNEL_ID", console: true, discord: false},
    }
};

const bot = new Bot(client, config);

bot.client.on(Events.ClientReady, async () => {
    Bot.setRandomActivity(randomActivityList, Time.minute.MIN_10.toMilliseconds());
    console.log("Bot ready! ✨");
});
```
