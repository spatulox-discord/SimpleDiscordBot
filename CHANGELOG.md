# Changelog
Date format : dd/mm/yyyy

### 25/09/2026 - 3.2.0
- Bump discord-interaction-manager (add a web interface)

### 21/09/2026 - 3.1.1
- Add :
    - `ComponentManager.chart(container, chart, separator?)` : adds one chart or an array of charts to a container, like `field()` / `mediaGallery()` / `selectMenu()` do, instead of calling `container.addTextDisplayComponents()` by hand. No separator by default

### 21/09/2026 - 3.1.0
- Add :
  - `ChartManager` : text based charts for Components V2, since Discord has no chart component. `progressBar()` / `progressBars()` draw unicode gauges (`CPU : ███░░░░░░░ 32.7 %`), `sparkline()` / `sparklines()` draw one line curves (`▁▂▃▅▇█▆▄▃▂▁`). Each method returns a `TextDisplayBuilder` to drop into a `ContainerBuilder`, and the grouped forms render every row in a single one so a dashboard costs 1 component instead of N against the 40 components budget of a message
    - `sparklines()` takes an opt-in `sharedScale` so stacked curves are scaled against the same bounds and stay comparable, instead of each one filling the whole height
    - Values are clamped (`value > max`, negative values, `max = 0`), a constant serie renders as a straight line instead of dividing by zero, an empty serie or an empty row list renders `—` (`TextDisplayBuilder.setContent()` rejects an empty string), and non finite points are dropped instead of flattening the whole curve

### 28/04/2026 - 2.2.1
- Changes :
  - Add dependency to @spatulox/utils
    - `Time/Log/SimpleMutex` are now part of the `@spatulox/utils` package but are still reexported from this package
    - `FileManager/CacheManager` are now part of the `@spatulox/utils` package but are still reexported from this package
  - CacheManager now have a fixed cache folder `.utilscache`
  - The `sendErrorToChannel` param of FileManager.writeJsonFile() have been removed

### 27/04/2026 - 2.2.1
- Add :
  - Add a full wiki matching this version
- Changes:
  - `DISCORD_BOT_DEV` now enable/disable the Bot.log.debug() / Log.debug()
  - Removed `DISCORD_BOT_CLIENTID`
  - Add overloading for `BotMessage.sendDM()` : Should now match all other `send()` from the framework for consistency
  - Rework the type of `ComponentManagerField` : 'name' & 'value' are now optional. 'value' is now only mandatory when using 'thumbnailUrl' field with
- Fix :
  - `Bot.interaction.xxx()` logic : some interaction were enable to pass some requirement because of a wrong check logic
  - RoleManager : take the member.guild.role instead of member.role to assign an exsiting role to a GuildMember

### 15/04/2026 - 2.1.2
- CacheManager should now take the botname in lowercase and escape weird char from it

### 15/04/2026 - 2.1.0 & 2.1.1
- Add a CacheManager for simple persisting data
- Add QoL method to FileManager (fileExist(), deleteFile())
- Fix :
  - SimpleDiscordBotInfo.version showing license instead of version
  - FileManager should be able to create hidden folder

### 13/04/2026 - 2.0.3
- Fix : WebhookManager can now send webhooks in threads

### 08/04/2026 - 2.0.1
- Fix the README.md to match the new BotLog system

### 08/04/2026 - 2.0.0
- GuildManager.find now seach in cache then fetch. Now can return Guild | null
- BotLog now have separate channelId for each log type
- EmbedManager.field now use two parameter instead of 4 (embed: EmbedBuilder, field: {name: string, value: string, inline?: boolean})
- Rework of WebHookManager : Can use local image or http(s) link
  - fix a crash when sending a Component V2 with webhook.send() method

### 08/04/2026 - 1.7.1
- WebHook Manager now don't crash when another bot with the same Webhook manager and webhook name try to access to the same webhook with the same name

### 08/04/2026 - 1.7.0
- SelectMenu can now be directly put inside Bot.log.xxx() and Bot.message.send(). no more need for SelectMenuManager.rows()