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

    it("rejects the american format", () => {
        assert.equal(ModalManager.parseDate("12/20/2020"), null);
    });
});
