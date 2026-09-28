import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {ModalManager} from "../manager/interactible/ModalManager";

describe("ModalManager.parseNumber", () => {
    it("parses digits only", () => {
        assert.equal(ModalManager.parseNumber("0042"), 42);
        assert.equal(ModalManager.parseNumber("4.2"), null);
        assert.equal(ModalManager.parseNumber("abc"), null);
    });
});

describe("ModalManager.parseDate", () => {
    it("parses the four supported formats", () => {
        for (const value of ["2020-12-20", "20-12-2020", "20/12/2020", "2020/12/20"]) {
            const date = ModalManager.parseDate(value);
            assert.ok(date, value);
            assert.deepEqual([date.getFullYear(), date.getMonth(), date.getDate()], [2020, 11, 20]);
        }
    });

    it("rejects impossible dates instead of rolling them over", () => {
        assert.equal(ModalManager.parseDate("31/02/2024"), null);
        assert.equal(ModalManager.parseDate("2023-02-29"), null);
        assert.ok(ModalManager.parseDate("2024-02-29"));
    });

    it("rejects the american format", () => {
        assert.equal(ModalManager.parseDate("12/20/2020"), null);
    });
});

describe("ModalManager presets", () => {
    const inputId = (modal: ReturnType<typeof ModalManager.date>) =>
        (modal.toJSON().components[0] as unknown as {component: {custom_id: string}}).component.custom_id;

    it("suffix the modal customId by default", () => {
        const modal = ModalManager.date("mod");
        assert.equal(modal.data.custom_id, "mod_date");
        assert.equal(inputId(modal), "mod_date_input");
        assert.equal(ModalManager.number("mod").data.custom_id, "mod_number");
        assert.equal(ModalManager.phone("mod").data.custom_id, "mod_phone_number");
    });

    it("keep the given customId when suffix is false", () => {
        const modal = ModalManager.date("mod", undefined, undefined, false);
        assert.equal(modal.data.custom_id, "mod");
        assert.equal(inputId(modal), "mod_input");
        assert.equal(ModalManager.number("mod", undefined, undefined, false).data.custom_id, "mod");
        assert.equal(ModalManager.phone("mod", undefined, undefined, false).data.custom_id, "mod");
    });
});
