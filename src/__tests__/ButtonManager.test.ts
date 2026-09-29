import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {ButtonManager} from "../manager/interactible/ButtonManager";

const buttons = (count: number) => Array.from({length: count}, (_, i) => ButtonManager.primary({customId: `b${i}`}));
const rowSizes = (rows: unknown[] | undefined) => rows?.map(row => (row as {components: unknown[]}).components.length);

describe("ButtonManager.toMessage", () => {
    it("groups an array of buttons in rows of 5", () => {
        assert.deepEqual(rowSizes(ButtonManager.toMessage(buttons(3)).components as unknown[]), [3]);
        assert.deepEqual(rowSizes(ButtonManager.toMessage(buttons(7)).components as unknown[]), [5, 2]);
    });

    it("accepts an array mixing rows and buttons", () => {
        const components = ButtonManager.toMessage([ButtonManager.row(buttons(2)), ...buttons(1)]).components as unknown[];
        assert.deepEqual(rowSizes(components), [2, 1]);
    });

    it("keeps action rows as is", () => {
        const components = ButtonManager.toMessage([ButtonManager.row(buttons(2)), ButtonManager.row(buttons(1))]).components as unknown[];
        assert.deepEqual(rowSizes(components), [2, 1]);
    });
});

describe("ButtonManager.create", () => {
    it("doesn't add a default label to an emoji only button", () => {
        assert.equal((ButtonManager.primary({customId: "e", emoji: "⏪"}).data as {label?: string}).label, undefined);
        assert.equal((ButtonManager.primary({customId: "n"}).data as {label?: string}).label, "Button");
    });
});
