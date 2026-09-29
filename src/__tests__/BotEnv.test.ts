import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {BotEnv} from "../core/BotEnv";

describe("BotEnv.dev", () => {
    it("is only enabled by true / 1, like the dim CLI", () => {
        const cases: [string | undefined, boolean][] = [
            [undefined, false], ["", false], ["false", false], ["0", false], ["no", false],
            ["off", false], ["yes", false], ["dev", false],
            ["true", true], ["TRUE", true], [" true ", true], ["1", true],
        ];
        for (const [value, expected] of cases) {
            if (value === undefined) delete process.env.DISCORD_BOT_DEV;
            else process.env.DISCORD_BOT_DEV = value;
            assert.equal(BotEnv.dev, expected, String(value));
        }
    });
});
