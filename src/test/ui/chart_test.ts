import {
    ChartManager,
    ComponentManager,
} from "../../index";
import {ContainerBuilder, SeparatorSpacingSize} from "discord.js";
import {UiTester} from "./UiTester";

const flat = [5, 5, 5, 5, 5, 5, 5]

/** Number of times the dashboard is refreshed with toMessageUpdate() */
const DASHBOARD_REFRESHES = 3

function randomSerie(length: number, min: number, max: number): number[] {
    return Array.from({length}, () => Math.round(min + Math.random() * (max - min)))
}

function dashboard(refresh: number, cpu: number[], memory: number[]): ContainerBuilder {
    const container = ComponentManager.create({title: `Host metrics (refresh ${refresh}/${DASHBOARD_REFRESHES})`})
    ComponentManager.chart(container, ChartManager.progressBars([
        {label: "CPU", value: cpu[cpu.length - 1] ?? 0},
        {label: "Memory", value: memory[memory.length - 1] ?? 0},
        {label: "Disk", value: 128, max: 512, options: {unit: "GB", decimals: 0}},
    ]), SeparatorSpacingSize.Small)
    ComponentManager.chart(container, [
        ChartManager.sparklines([
            {label: "CPU", values: cpu},
            {label: "Memory", values: memory},
            {label: "Flat", values: flat},
        ], {unit: "%"}),
        ChartManager.sparklines([
            {label: "CPU", values: cpu},
            {label: "Memory", values: memory},
            {label: "Flat", values: flat},
        ], {unit: "%", sharedScale: true, codeBlock: true}),
    ])
    return container
}

export async function chart_test(t: UiTester) {
    await t.send(`**Dashboard** : refreshed ${DASHBOARD_REFRESHES} times with toMessageUpdate()`)
    let cpu = randomSerie(12, 5, 60)
    let memory = randomSerie(12, 60, 90)
    const message = await t.send(ComponentManager.toMessage(dashboard(0, cpu, memory)))

    for (let refresh = 1; refresh <= DASHBOARD_REFRESHES; refresh++) {
        cpu = [...cpu.slice(1), ...randomSerie(1, 5, 60)]
        memory = [...memory.slice(1), ...randomSerie(1, 60, 90)]
        await t.throttle(message.edit(ComponentManager.toMessageUpdate(dashboard(refresh, cpu, memory))))
    }

    await t.send("**Edge cases** : must render, never throw")
    await t.send(ComponentManager.toMessage(ComponentManager.simple(
        [
            ChartManager.progressBar("Over max", 150).toJSON().content,
            ChartManager.progressBar("Negative", -20).toJSON().content,
            ChartManager.progressBar("Zero max", 5, 0).toJSON().content,
            ChartManager.sparkline("Empty", []).toJSON().content,
            ChartManager.sparkline("NaN", [1, NaN, 3, Infinity, 2]).toJSON().content,
            ChartManager.sparklines([]).toJSON().content,
        ].join("\n")
    )))
}
