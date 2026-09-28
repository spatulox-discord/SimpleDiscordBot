import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {SelectMenuManager} from "../manager/interactible/SelectMenuManager";

describe("SelectMenuManager.option", () => {
    it("builds one option", () => {
        const {label, value, description} = SelectMenuManager.option({label: "A", value: "a", description: "desc"}).toJSON();
        assert.deepEqual({label, value, description}, {label: "A", value: "a", description: "desc"});
    });

    it("builds several options at once", () => {
        const options = SelectMenuManager.option([{label: "A", value: "a"}, {label: "B", value: "b"}]);
        assert.deepEqual(options.map(o => o.toJSON().value), ["a", "b"]);
    });
});
