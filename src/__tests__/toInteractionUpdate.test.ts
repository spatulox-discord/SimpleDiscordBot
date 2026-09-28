import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {MessageFlags} from "discord.js";
import {ButtonManager} from "../manager/interactible/ButtonManager";
import {SelectMenuManager} from "../manager/interactible/SelectMenuManager";
import {EmbedManager} from "../manager/messages/EmbedManager";
import {ComponentManager} from "../manager/messages/ComponentManager";

describe("toInteractionUpdate", () => {
    it("matches toInteractionEdit for embeds, buttons and select menus", () => {
        const embed = EmbedManager.simple("x");
        assert.deepEqual(EmbedManager.toInteractionUpdate(embed), EmbedManager.toInteractionEdit(embed));

        const buttons = [ButtonManager.primary({customId: "a"}), ButtonManager.danger({customId: "b"})];
        assert.equal(ButtonManager.toInteractionUpdate(buttons).components?.length, 1);

        const menu = SelectMenuManager.users("users");
        assert.equal(SelectMenuManager.toInteractionUpdate(menu).components?.length, 1);
    });

    it("keeps the Components V2 flag for containers", () => {
        const options = ComponentManager.toInteractionUpdate(ComponentManager.simple("x"), null, false);
        assert.deepEqual(options.flags, [MessageFlags.IsComponentsV2]);
        assert.equal(options.components?.length, 1);
    });
});
