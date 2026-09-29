import {
    Bot,
    SimpleColor,
    SelectMenuManager,
    ButtonManager,
    ComponentManager,
    ComponentManagerField,
    ComponentManagerFileInput,
} from "../../index";
import fs from "fs/promises";
import {ButtonBuilder, SeparatorSpacingSize} from "discord.js";
import {STATIC_PREFIX, UiTester} from "./UiTester";

export async function component_test(t: UiTester) {
    const botIconUrl = Bot.client.user?.displayAvatarURL({forceStatic: false, size: 128}) ?? ""

    await t.send("**Presets**")
    await t.send(ComponentManager.toMessage(ComponentManager.create()))
    await t.send(ComponentManager.toMessage(ComponentManager.create({title: "create() with a title and SimpleColor.crimson", color: SimpleColor.crimson})))
    await t.send(ComponentManager.toMessage(ComponentManager.create({title: "create() with a thumbnail", thumbnailUrl: botIconUrl})))
    await t.send(ComponentManager.toMessage(ComponentManager.create({description: "create() with a description and a separator but no title", separator: SeparatorSpacingSize.Large})))
    await t.send(ComponentManager.toMessage(ComponentManager.simple("simple()")))
    await t.send(ComponentManager.toMessage(ComponentManager.success("success()")))
    await t.send(ComponentManager.toMessage(ComponentManager.debug("debug()")))
    await t.send(ComponentManager.toMessage(ComponentManager.error("error()"), null, false))

    await t.send("**Same container converted twice** : one footer each")
    const twice = ComponentManager.simple("Converted twice with toMessage()")
    await t.send(ComponentManager.toMessage(twice))
    await t.send(ComponentManager.toMessage(twice))

    await t.send("**Senders**")
    await t.sent("Bot.message.send(channelId, content, container)", Bot.message.send(t.channelId, "Bot.message.send(channelId, content, container) : this content becomes a TextDisplay", ComponentManager.success("The container")))
    await t.sent("Bot.message.send(channelId, [container, select menu])", Bot.message.send(t.channelId, [
        ComponentManager.simple("Bot.message.send(channelId, [container, select menu])"),
        SelectMenuManager.users(`${STATIC_PREFIX}component_users`),
    ]))
    await t.throttle(Bot.log.info(ComponentManager.debug("Bot.log.info(container)")))

    await t.send("**Complex container**")
    const buttonLine: ButtonBuilder[] = [
        ButtonManager.success({customId: `${STATIC_PREFIX}component_line_1`}),
        ButtonManager.link({label: "Google", url: "https://google.com"}),
        ButtonManager.danger({customId: `${STATIC_PREFIX}component_line_2`, emoji: "🗑️"}),
    ]
    const fields: ComponentManagerField[] = [
        {name: "Thumbnail", value: "Field with a thumbnail", thumbnailUrl: botIconUrl},
        {name: "Button", value: "Field with a button accessory", button: ButtonManager.primary({customId: `${STATIC_PREFIX}component_accessory`})},
        {button: ButtonManager.secondary({customId: `${STATIC_PREFIX}component_alone`, label: "Button alone"})},
        {name: "Buttons", value: "Field with a line of buttons", button: buttonLine},
        {value: "Value only, no separator after it", separator: false},
    ]
    const fileBuf = await fs.readFile("./handlers/commands/example.json")
    const filesData: ComponentManagerFileInput[] = [
        {buffer: fileBuf, name: "file1.json", spoiler: true},
        {buffer: fileBuf, name: "file2.json"},
    ]

    const container = ComponentManager.create({title: "Complex one", color: SimpleColor.transparent, thumbnailUrl: botIconUrl})
    ComponentManager.fields(container, fields)
    ComponentManager.mediaGallery(container, [{url: botIconUrl}, {url: botIconUrl, spoiler: true}])
    ComponentManager.selectMenu(container, SelectMenuManager.roles(`${STATIC_PREFIX}component_roles`))
    const {files} = ComponentManager.file(container, filesData)
    await t.send(ComponentManager.toMessage(container, files))

    await t.send("**toMessageUpdate()** : the next container is edited after the delay")
    const message = await t.send(ComponentManager.toMessage(ComponentManager.simple("Before toMessageUpdate()")))
    await t.throttle(message.edit(ComponentManager.toMessageUpdate(ComponentManager.success("Edited with toMessageUpdate()"))))
}
