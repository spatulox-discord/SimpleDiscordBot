import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {DiscordRegex} from "../constants/DiscordRegex";

describe("DiscordRegex", () => {
    it("accepts snowflakes of 17 to 20 digits", () => {
        assert.ok(DiscordRegex.isDiscordId("80351110224678912"));
        assert.ok(DiscordRegex.isDiscordId("1162047096220827831"));
        assert.ok(!DiscordRegex.isDiscordId("1234"));
        assert.ok(!DiscordRegex.isDiscordId("abc"));
    });

    it("matches mentions whatever the id length", () => {
        assert.ok(DiscordRegex.isUserMention("<@1162047096220827831>"));
        assert.ok(DiscordRegex.isUserMention("<@!80351110224678912>"));
        assert.ok(DiscordRegex.isAnyMention("<@&1162047096220827831>"));
        assert.ok(DiscordRegex.isAnyMention("<#80351110224678912>"));
        assert.ok(DiscordRegex.USER_MENTION.test("<@1162047096220827831>"));
    });

    it("matches invites", () => {
        for (const invite of ["discord.gg/abc", "https://discord.gg/abc", "https://discord.com/invite/abc-def", "discordapp.com/invite/abc"]) {
            assert.ok(DiscordRegex.INVITE.test(invite), invite);
        }
        assert.ok(!DiscordRegex.INVITE.test("https://example.com/invite/abc"));
    });

    it("only considers Discord domains as Discord URLs", () => {
        assert.ok(DiscordRegex.isDiscordUrl("https://discord.com/channels/1/2"));
        assert.ok(DiscordRegex.isDiscordUrl("https://cdn.discordapp.com/attachments/1/2/a.png"));
        assert.ok(DiscordRegex.isDiscordUrl("discord.gg/abc"));
        assert.ok(!DiscordRegex.isDiscordUrl("https://google.com"));
        assert.ok(!DiscordRegex.isDiscordUrl("https://notdiscord.com.evil.io"));
    });

    it("accepts new usernames with dots", () => {
        assert.ok(DiscordRegex.isUsername("spatu.lox"));
        assert.ok(!DiscordRegex.isUsername("a"));
    });

    it("matches custom and unicode emojis", () => {
        assert.ok(DiscordRegex.EMOJI.test("<:name:1162047096220827831>"));
        assert.ok(DiscordRegex.EMOJI.test("<a:name:80351110224678912>"));
        assert.ok(DiscordRegex.EMOJI.test("🤖"));
        assert.ok(DiscordRegex.EMOJI.test("👍🏽"));
        assert.ok(DiscordRegex.EMOJI.test("🇫🇷"));
        assert.ok(!DiscordRegex.EMOJI.test("abc"));
    });
});
