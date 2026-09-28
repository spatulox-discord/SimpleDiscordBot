import {describe, it} from "node:test";
import assert from "node:assert/strict";
import {ChartManager} from "../manager/messages/ChartManager";

const content = (builder: {toJSON(): {content: string}}) => builder.toJSON().content;

describe("ChartManager.progressBar", () => {
    it("renders a gauge with its value", () => {
        assert.equal(content(ChartManager.progressBar("CPU", 50)), "CPU : █████░░░░░ 50.0 %");
    });

    it("clamps values out of range and survives max = 0", () => {
        assert.equal(content(ChartManager.progressBar("A", 150, 100, {showValue: false})), "A : ██████████");
        assert.equal(content(ChartManager.progressBar("B", -20, 100, {showValue: false})), "B : ░░░░░░░░░░");
        assert.equal(content(ChartManager.progressBar("C", 5, 0, {showValue: false})), "C : ░░░░░░░░░░");
    });

    it("pads labels so every bar starts at the same column", () => {
        const lines = content(ChartManager.progressBars([
            {label: "CPU", value: 10},
            {label: "Memory", value: 20},
        ], {showValue: false})).split("\n");
        assert.equal(lines[0]!.indexOf(":"), lines[1]!.indexOf(":"));
    });
});

describe("ChartManager.sparkline", () => {
    it("draws the lowest and highest blocks at the bounds", () => {
        assert.equal(content(ChartManager.sparkline("S", [0, 10], {showValue: false})), "S : ▁█");
    });

    it("draws a constant serie as a straight line", () => {
        assert.equal(content(ChartManager.sparkline("S", [5, 5, 5], {showValue: false})), "S : ▄▄▄");
    });

    it("drops non finite points and renders an empty serie", () => {
        assert.equal(content(ChartManager.sparkline("S", [0, NaN, 10], {showValue: false})), "S : ▁█");
        assert.equal(content(ChartManager.sparkline("S", [])), "S : —");
        assert.equal(content(ChartManager.sparklines([])), "—");
    });

    it("keeps only the most recent points", () => {
        assert.equal(content(ChartManager.sparkline("S", [0, 1, 2, 3], {maxPoints: 2, showValue: false})), "S : ▁█");
    });
});
