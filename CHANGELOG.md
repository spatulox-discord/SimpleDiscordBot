# Changelog
Date format : dd/mm/yyyy

### Unreleased (contains breaking changes : next major)
- Breaking :
  - `GuildManager.searchMember()`, `GuildManager.isMemberInGuild()` and `GuildUserManager.isInVoice()` now take `(guildId, memberId)` like every other member method
  - `ButtonManager.toMessage/toInteraction/toInteractionEdit([...buttons])` group the buttons by 5 per row instead of one row per button
  - `GuildManager.channel.text.find()` / `voice.find()` only return a `TextChannel` / `VoiceChannel`
  - `GuildChannelManager.delete()` returns `false` on failure instead of throwing
  - `DISCORD_BOT_DEV=false` (or `0`, `no`, `off`, empty) no longer enables the dev mode
  - `Bot._client` is private (use `Bot.client`)
- Add :
  - `PaginationManager` is exported : `PaginationManager.send(interaction, pages, options)`
  - `Bot.interaction.*` accept a plain string and arrays of components, `Bot.interaction.defer(interaction, ephemeral)`
  - `Bot.message.send/sendDM`, `Bot.log.*` and `WebhookManager.send` accept arrays of components
  - `ComponentManager.toInteraction(container, file, footer, ephemeral)`
  - `ModalManager.date()` / `number()` / `phone()` take a `suffix` parameter (default `true`) : `false` keeps the given customId for the modal instead of suffixing it with `_date` / `_number` / `_phone_number`, the input is then `${customId}_input`
  - `SelectMenuManager.option()` is public : builds one option or an array of options
  - `ModalField.customId`, `InviteManager.find(code)`, `InviteManager.delete(code)`, `InviteManager.isOld()` / `InviteManager.cleanup()`, `Bot.stopRandomActivity()`, `bot.started`
  - `DiscordRegex.SNOWFLAKE` / `DiscordRegex.DISCORD_URL`, `SendableComponent` / `ConfigLog` types are exported
  - Unit tests (`npm test`), run by `npm run build`
- Fix :
  - Components V2 : the flag was missing on interactions, arrays and `toInteractionEdit()`, content + container was rejected by Discord (the content now becomes a TextDisplay)
  - `GuildUserManager.timeout()` passed a timestamp instead of a duration
  - `RoleManager.toggle()` could never add a role, roles whose name is 18 characters long couldn't be found
  - `WebhookManager` reused the first channel's webhook for every channel
  - `ThreadChannelManager.createFromMessage()` always failed, `createFromChannel()` crashed on voice channels
  - `GuildManager.searchMember()` / `isMemberInGuild()` passed wrong arguments
  - `UserManager.send()` with an array of components
  - `Bot.interaction.followUp()` returned false for commands and modals, `Bot.interaction.update()` failed after `defer()`
  - `ComponentManager.create()` ignored description / separator without title, `toMessage()` & co stacked footers on the same container
  - `SimpleColor.black` as `defaultSimpleColor`, crashes when using `EmbedManager` / `Bot.log` before the Bot is instantiated
  - `Bot.message.success/error` printed the message twice, `Bot.message.send(channelId)` only looked in the cache
  - `ModalManager.titleDescription()` ignored prefilled values, `parseDate()` accepted `31/02`
  - `DiscordRegex` : 17 to 20 digits ids, invites, `isDiscordUrl()`, usernames with dots, every unicode emoji
  - `ReactionManager.remove()` with custom emojis, DMs support
  - `GuildUserManager.rename()` retried on permission errors, error logs of `mute()` and member lookups
  - `Bot` startup (ClientReady registered after login, unhandled errors, double login), `setRandomActivity()` stacking intervals
  - Package : ESM consumers got the CommonJS build, `@discordjs/builders` was used without being a dependency, internal files and the whole package.json were published
- Removed : `InviteManager_old`, `FolderName`, `@types/node-schedule`, dead code

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