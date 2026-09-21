import {TextDisplayBuilder} from "discord.js";

/**
 * Text based charts for the Components V2 system. Discord has no chart component : everything
 * here is unicode rendered inside a TextDisplayBuilder, which is the only way to draw a gauge
 * or a curve in a ContainerBuilder / SectionBuilder.
 *
 * Every builder returned costs exactly 1 component against the 40 components budget of a
 * message, which is why progressBars() and sparklines() exist : several rows in a single
 * TextDisplay instead of one TextDisplay each.
 */

const SPARK_BLOCKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"] as const

/** Discord truncates a TextDisplay at 4000 chars : keep sparklines to a sane length */
const DEFAULT_MAX_POINTS = 50

/** Rendered when there is nothing to draw : no point, or no row at all */
const EMPTY = "—"

export interface ProgressBarOptions {
    /** Number of characters of the bar itself, default 10 */
    width?: number
    /** Character of the filled part, default "█" */
    filled?: string
    /** Character of the empty part, default "░" */
    empty?: string
    /** Append the numeric value after the bar, default true */
    showValue?: boolean
    /** Unit printed after the value, default "%" */
    unit?: string
    /** Decimals of the printed value, default 1 */
    decimals?: number
    /**
     * Wrap the whole render in a ``` block. Discord renders TextDisplay with a proportional
     * font, so labels of different widths never line up : only a code block gives a real
     * monospace alignment. Default false.
     */
    codeBlock?: boolean
}

export interface SparklineOptions {
    /** Fixed low bound of the scale, default min(values) */
    min?: number
    /** Fixed high bound of the scale, default max(values) */
    max?: number
    /** Only keep the N most recent points, default 50 */
    maxPoints?: number
    /** Append the last value after the curve, default true */
    showValue?: boolean
    /** Unit printed after the value, default "" */
    unit?: string
    /** Decimals of the printed value, default 1 */
    decimals?: number
    /** See ProgressBarOptions.codeBlock. Default false */
    codeBlock?: boolean
}

export interface ProgressBarRow {
    label: string
    value: number
    /** Default 100 */
    max?: number
    /** Overrides the options given to progressBars() for this row only */
    options?: ProgressBarOptions
}

export interface SparklineRow {
    label: string
    values: number[]
    /** Overrides the options given to sparklines() for this row only */
    options?: SparklineOptions
}

export interface SparklinesOptions extends SparklineOptions {
    /**
     * Scale every curve against the same bounds, deduced from all the series at once.
     * Off by default : each curve then uses its own min/max and fills the whole height,
     * which reads better alone but makes two stacked curves impossible to compare.
     */
    sharedScale?: boolean
}

export class ChartManager {

    /**
     * A single gauge : `CPU : ███░░░░░░░ 32.7 %`
     */
    static progressBar(label: string, value: number, max: number = 100, options: ProgressBarOptions = {}): TextDisplayBuilder {
        const line = `${label} : ${ChartManager.renderBar(value, max, options)}`
        return new TextDisplayBuilder().setContent(ChartManager.wrap(line, options.codeBlock))
    }

    /**
     * Several gauges in ONE TextDisplay, so a dashboard of 6 metrics still costs 1 component.
     * Labels are padded to the longest one so the bars start at the same column.
     */
    static progressBars(rows: ProgressBarRow[], options: ProgressBarOptions = {}): TextDisplayBuilder {
        const width = rows.reduce((longest, row) => Math.max(longest, row.label.length), 0)
        const lines = rows.map(row => {
            const opts = {...options, ...row.options}
            return `${row.label.padEnd(width, " ")} : ${ChartManager.renderBar(row.value, row.max ?? 100, opts)}`
        })
        return new TextDisplayBuilder().setContent(ChartManager.wrap(lines.join("\n"), options.codeBlock))
    }

    /**
     * A one line curve : `RAM : ▁▂▃▅▇█▆▄▃▂▁ 62 %`. One block character per point, the last
     * value is printed at the end because a sparkline alone carries no scale.
     */
    static sparkline(label: string, values: number[], options: SparklineOptions = {}): TextDisplayBuilder {
        const line = `${label} : ${ChartManager.renderSpark(values, options)}`
        return new TextDisplayBuilder().setContent(ChartManager.wrap(line, options.codeBlock))
    }

    /**
     * Several curves in ONE TextDisplay, the sparkline counterpart of progressBars().
     * Labels are padded to the longest one so every curve starts at the same column.
     */
    static sparklines(rows: SparklineRow[], options: SparklinesOptions = {}): TextDisplayBuilder {
        const width = rows.reduce((longest, row) => Math.max(longest, row.label.length), 0)
        const base = ChartManager.withSharedScale(rows, options)
        const lines = rows.map(row => {
            const opts = {...base, ...row.options}
            return `${row.label.padEnd(width, " ")} : ${ChartManager.renderSpark(row.values, opts)}`
        })
        return new TextDisplayBuilder().setContent(ChartManager.wrap(lines.join("\n"), options.codeBlock))
    }

    /**
     * Only fills the bounds that were not given explicitly, and only when asked : a row
     * setting its own min/max still wins, since row options are spread after these.
     */
    private static withSharedScale(rows: SparklineRow[], options: SparklinesOptions): SparklineOptions {
        if (!options.sharedScale) return options
        if (options.min !== undefined && options.max !== undefined) return options

        const points = rows.flatMap(row => row.values).filter(v => Number.isFinite(v))
        if (points.length === 0) return options

        return {
            ...options,
            min: options.min ?? Math.min(...points),
            max: options.max ?? Math.max(...points),
        }
    }

    private static renderBar(value: number, max: number, options: ProgressBarOptions): string {
        const width = Math.max(1, Math.trunc(options.width ?? 10))
        const filled = options.filled ?? "█"
        const empty = options.empty ?? "░"

        const ratio = ChartManager.clamp01(value / max)
        const filledCount = Math.round(ratio * width)

        const bar = filled.repeat(filledCount) + empty.repeat(width - filledCount)
        return bar + ChartManager.formatValue(value, options)
    }

    private static renderSpark(values: number[], options: SparklineOptions): string {
        const maxPoints = Math.max(1, Math.trunc(options.maxPoints ?? DEFAULT_MAX_POINTS))
        // NaN / Infinity would poison Math.min and turn the whole curve into a single block
        const points = values.filter(v => Number.isFinite(v)).slice(-maxPoints)

        if (points.length === 0) return EMPTY

        const lo = options.min ?? Math.min(...points)
        const hi = options.max ?? Math.max(...points)

        // Flat curve : hi === lo means a division by zero. A constant serie must look like a
        // straight line, so every point is drawn at the middle block instead
        const middle = SPARK_BLOCKS[Math.floor(SPARK_BLOCKS.length / 2) - 1]!
        const curve = hi === lo
            ? middle.repeat(points.length)
            : points.map(v => {
                const level = Math.round(ChartManager.clamp01((v - lo) / (hi - lo)) * (SPARK_BLOCKS.length - 1))
                return SPARK_BLOCKS[level]!
            }).join("")

        const last = points[points.length - 1]!
        return curve + ChartManager.formatValue(last, {...options, unit: options.unit ?? ""})
    }

    private static formatValue(value: number, options: {showValue?: boolean, unit?: string, decimals?: number}): string {
        if (options.showValue === false) return ""
        const decimals = Math.max(0, Math.trunc(options.decimals ?? 1))
        const printable = Number.isFinite(value) ? value.toFixed(decimals) : "?"
        const unit = options.unit ?? "%"
        return unit ? ` ${printable} ${unit}` : ` ${printable}`
    }

    /**
     * TextDisplayBuilder.setContent() rejects an empty string, so an empty row list must
     * still render something rather than throw at build time.
     */
    private static wrap(content: string, codeBlock: boolean | undefined): string {
        const body = content.length > 0 ? content : EMPTY
        return codeBlock ? "```\n" + body + "\n```" : body
    }

    private static clamp01(ratio: number): number {
        if (!Number.isFinite(ratio)) return 0
        return Math.min(1, Math.max(0, ratio))
    }
}
