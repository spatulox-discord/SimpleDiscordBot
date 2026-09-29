import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {ButtonInteraction, ChatInputCommandInteraction, InteractionEditReplyOptions, InteractionUpdateOptions, Message, MessageEditOptions, MessageFlags} from "discord.js";
import {ButtonManager} from "../manager/interactible/ButtonManager";
import {SelectMenuManager} from "../manager/interactible/SelectMenuManager";
import {EmbedManager} from "../manager/messages/EmbedManager";
import {ComponentManager} from "../manager/messages/ComponentManager";

describe("toMessageUpdate / toInteractionUpdate", () => {
    it("build the same options for embeds, buttons and select menus", () => {
        const embed = EmbedManager.simple("x");
        assert.deepEqual(EmbedManager.toInteractionUpdate(embed), {embeds: [embed]});
        assert.deepEqual(EmbedManager.toMessageUpdate(embed), {embeds: [embed]});

        const buttons = [ButtonManager.primary({customId: "a"}), ButtonManager.danger({customId: "b"})];
        assert.equal(ButtonManager.toInteractionUpdate(buttons).components?.length, 1);
        assert.equal(ButtonManager.toMessageUpdate(buttons).components?.length, 1);

        const menu = SelectMenuManager.users("users");
        assert.equal(SelectMenuManager.toInteractionUpdate(menu).components?.length, 1);
        assert.equal(SelectMenuManager.toMessageUpdate(menu).components?.length, 1);
    });

    it("keep the Components V2 flag for containers", () => {
        const container = ComponentManager.simple("x");
        for (const options of [ComponentManager.toInteractionUpdate(container, null, false), ComponentManager.toMessageUpdate(container, null, false)]) {
            assert.deepEqual(options.flags, [MessageFlags.IsComponentsV2]);
            assert.equal(options.components?.length, 1);
        }
    });
});

/**
 * Never called : only type checked by `npm run type-check`, to make sure the options fit every discord.js method
 * they are documented for (toInteractionUpdate() replaced toInteractionEdit(), so it must work with editReply() too,
 * and every toXXXUpdate() returns UpdateOptions, accepted by update(), editReply() and message.edit())
 */
export async function typeCheckUpdateOptions(button: ButtonInteraction, command: ChatInputCommandInteraction, message: Message) {
    const container = ComponentManager.simple("x");
    await button.update(ComponentManager.toInteractionUpdate(container));
    await button.editReply(ButtonManager.toInteractionUpdate(ButtonManager.primary({customId: "a"})));
    await command.editReply(EmbedManager.toInteractionUpdate(EmbedManager.simple("x")));
    await command.editReply({...ComponentManager.toInteractionUpdate(container, null, false), allowedMentions: {parse: []}});
    await command.editReply(SelectMenuManager.toInteractionUpdate(SelectMenuManager.users("u")));
    await message.edit(ComponentManager.toMessageUpdate(container));
    await message.edit(EmbedManager.toMessageUpdate(EmbedManager.simple("x")));

    // Usable where an InteractionEditReplyOptions or an InteractionUpdateOptions is explicitly expected
    const edit: InteractionEditReplyOptions = ComponentManager.toInteractionUpdate(container);
    const update: InteractionUpdateOptions = ComponentManager.toInteractionUpdate(container);
    await command.editReply(edit);
    await button.update(update);

    // Every toXXXUpdate() returns UpdateOptions : they are interchangeable
    const messageEdit: MessageEditOptions = ButtonManager.toInteractionUpdate(ButtonManager.primary({customId: "a"}));
    await message.edit(messageEdit);
    await message.edit(SelectMenuManager.toInteractionUpdate(SelectMenuManager.users("u")));
    await command.editReply(ComponentManager.toMessageUpdate(container));
    await button.update(EmbedManager.toMessageUpdate(EmbedManager.simple("x")));
}
