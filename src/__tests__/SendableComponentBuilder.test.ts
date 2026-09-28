import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    ContainerBuilder,
    EmbedBuilder,
    MessageFlags,
    StringSelectMenuBuilder,
    TextDisplayBuilder,
} from "discord.js";
import {SendableComponentBuilder} from "../manager/builder/SendableComponentBuilder";

const container = () => new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("x"));
const embed = () => new EmbedBuilder().setDescription("e");
const menu = () => new StringSelectMenuBuilder().setCustomId("menu").addOptions({label: "a", value: "a"});
const types = (components: readonly unknown[] | undefined) => components?.map(c => (c as {toJSON(): {type: number}}).toJSON().type);

describe("SendableComponentBuilder.buildMessage", () => {
    it("builds a plain text message", () => {
        assert.deepEqual(SendableComponentBuilder.buildMessage("hello"), {content: "hello"});
    });

    it("wraps a select menu in an action row and keeps embeds apart", () => {
        const message = SendableComponentBuilder.buildMessage([embed(), menu()]);
        assert.equal(message.embeds?.length, 1);
        assert.deepEqual(types(message.components), [ComponentType.ActionRow]);
        assert.equal(message.flags, undefined);
    });

    it("flags a container as Components V2, even inside an array", () => {
        const message = SendableComponentBuilder.buildMessage([container()]);
        assert.deepEqual(message.flags, [MessageFlags.IsComponentsV2]);
    });

    it("turns the content into a TextDisplay for Components V2", () => {
        const message = SendableComponentBuilder.buildMessage("hello", container());
        assert.equal(message.content, undefined);
        assert.deepEqual(types(message.components), [ComponentType.TextDisplay, ComponentType.Container]);
    });

    it("keeps action rows as is", () => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("b").setLabel("b").setStyle(ButtonStyle.Primary)
        );
        const message = SendableComponentBuilder.buildMessage("hello", row);
        assert.equal(message.content, "hello");
        assert.deepEqual(types(message.components), [ComponentType.ActionRow]);
    });

    it("refuses an embed alongside a container, and an empty message", () => {
        assert.throws(() => SendableComponentBuilder.buildMessage([embed(), container()]));
        assert.throws(() => SendableComponentBuilder.buildMessage([]));
    });
});

describe("SendableComponentBuilder.buildInteraction", () => {
    it("merges the ephemeral flag with the Components V2 one", () => {
        const options = SendableComponentBuilder.buildInteraction(null, container(), true);
        assert.deepEqual(options.flags, [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral]);
    });

    it("doesn't flag a legacy message as Components V2", () => {
        const options = SendableComponentBuilder.buildInteraction("hello", embed(), false);
        assert.equal(options.flags, undefined);
        assert.equal(options.content, "hello");
    });
});
