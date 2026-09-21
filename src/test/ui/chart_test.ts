import {
    ChartManager,
    ComponentManager,
    GuildManager,
} from "../../index";
import {ChatInputCommandInteraction, SeparatorSpacingSize} from "discord.js";

const cpu = [12, 18, 9, 34, 41, 28, 22, 37, 55, 48, 32]
const memory = [70, 71, 73, 72, 75, 78, 81, 80, 79, 81, 81]
const flat = [5, 5, 5, 5, 5, 5, 5]

export async function chart_test(interaction: ChatInputCommandInteraction) {
    const channel = await GuildManager.channel.text.find("1162047096220827831")

    const container = ComponentManager.create({title: "Host metrics"})
    ComponentManager.chart(container, ChartManager.progressBars([
        {label: "CPU", value: 32.7},
        {label: "Memory", value: 81.25},
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
        ], {unit: "%", sharedScale: true}),
    ])

    await interaction.reply(ComponentManager.toInteraction(container))

    if (channel) {
        // Edge cases : must render, never throw
        await channel.send(ComponentManager.toMessage(ComponentManager.simple(
            [
                ChartManager.progressBar("Over max", 150).toJSON().content,
                ChartManager.progressBar("Negative", -20).toJSON().content,
                ChartManager.progressBar("Zero max", 5, 0).toJSON().content,
                ChartManager.sparkline("Empty", []).toJSON().content,
                ChartManager.sparklines([]).toJSON().content,
            ].join("\n")
        )))
    }
}
