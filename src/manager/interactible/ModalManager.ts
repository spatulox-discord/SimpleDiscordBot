import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder,
} from "discord.js";
import {Bot} from "../../core/Bot";

export enum ModalFieldType {
    SHORT,
    LONG,
    NUMBER,
    DATE,
    PHONE,
}

interface BaseModalField {
    label: string;
    /** Custom id of the input, default `${modalCustomId}_${label}` (add()) or `${modalCustomId}_input` (simple()) */
    customId?: string;
    value?: string
    required?: boolean;
}

interface TextModalField extends BaseModalField {
    type: ModalFieldType.SHORT | ModalFieldType.LONG | ModalFieldType.NUMBER | ModalFieldType.PHONE;
    placeholder?: string;
}

interface DateModalField extends BaseModalField {
    type: ModalFieldType.DATE;
}

export type ModalField = TextModalField | DateModalField;

interface InternalModalField extends BaseModalField {
    customId: string;
    type: ModalFieldType;
    placeholder?: string;
}

export class ModalManager {

    /**
     * Creates base Modal - SIMPLE API !
     */
    public static create(modalTitle: string, customId: string): ModalBuilder {
        return new ModalBuilder()
            .setTitle(modalTitle)
            .setCustomId(customId)
    }

    /**
     * Individual field creator
     */
    private static _createField(
        opt: InternalModalField
    ): LabelBuilder {

        const builder = new TextInputBuilder()
            .setCustomId(opt.customId)
            .setRequired(opt.required ?? false)

        if(opt.value){
            builder.setValue(opt.value)
        }

        if(opt.placeholder) {
            builder.setPlaceholder(opt.placeholder);
        } else {
            builder.setPlaceholder(`Enter ${opt.label.toLowerCase()}`);
        }

        switch (opt.type) {
            case ModalFieldType.SHORT:
                builder.setStyle(TextInputStyle.Short).setMaxLength(4000);
                break;
            case ModalFieldType.LONG:
                builder.setStyle(TextInputStyle.Paragraph).setMaxLength(4000);
                break;
            case ModalFieldType.NUMBER:
                builder.setStyle(TextInputStyle.Short).setMaxLength(10);
                break;
            case ModalFieldType.DATE:
                builder.setStyle(TextInputStyle.Short).setMaxLength(10).setPlaceholder("YYYY-MM-DD / DD-MM-YYYY or YYYY/MM/DD / DD/MM/YYYY");
                break;
            case ModalFieldType.PHONE:
                builder.setStyle(TextInputStyle.Short).setMaxLength(20);
                break;
        }

        return new LabelBuilder().setLabel(opt.label).setTextInputComponent(builder);
    }



        /**
     * Simple modal with ONE field - DIRECT ModalBuilder return !
     */
    static simple(
        customId: string,
        modalTitle: string | null,
        field: ModalField
    ): ModalBuilder {
        const modal = this.create(modalTitle ?? Bot.config?.botName ?? "Bot", customId);
        const opt: InternalModalField = {
            ...field,
            customId: field.customId ?? `${customId}_input`,
            placeholder: ('placeholder' in field && field.placeholder)
                ? field.placeholder
                : `Enter ${field.label.toLowerCase()}`,
            value: field.value,
        }

        modal.addLabelComponents(this._createField(opt));
        return modal;
    }

    /**
     * Title + Description modal preset
     */
    static titleDescription(
        customId: string,
        modalTitle: string,
        title: Omit<TextModalField, "type">,
        description: Omit<TextModalField, "type">,
    ): ModalBuilder {
        const modal = this.create(modalTitle, customId);

        const titleField: InternalModalField = {
            customId: `${customId}_title`,
            label: title.label,
            placeholder: title.placeholder ?? `Enter ${title.label.toLowerCase()}`,
            type: ModalFieldType.SHORT,
            required: title.required,
            value: title.value
        }

        const descField: InternalModalField = {
            customId: `${customId}_desc`,
            label: description.label,
            placeholder: description.placeholder ?? `Enter ${description.label.toLowerCase()}`,
            type: ModalFieldType.LONG,
            required: description.required,
            value: description.value
        }

        modal.addLabelComponents(this._createField(titleField))
        modal.addLabelComponents(this._createField(descField))

        return modal;
    }

    /**
     * Date modal preset
     */
    static date(
        customId: string,
        modalTitle: string = "Select Date",
        inputLabel: string = "Date"
    ): ModalBuilder {
        return this.simple(customId, modalTitle, {label:inputLabel, type: ModalFieldType.DATE});
    }

    /**
     * Number modal preset
     */
    static number(
        customId: string,
        modalTitle: string = "Enter a Number",
        inputLabel: string = "Number"
    ): ModalBuilder {
        return this.simple(customId, modalTitle, {label:inputLabel, type: ModalFieldType.NUMBER, placeholder: "Enter a number"});
    }

    /**
     * Number modal preset
     */
    static phone(
        customId: string,
        modalTitle: string = "Enter a Phone number",
        inputLabel: string = "Phone number"
    ): ModalBuilder {
        return this.simple(customId, modalTitle, {label:inputLabel, type: ModalFieldType.PHONE, placeholder: "Enter a phone number"});
    }

    /**
     * Add field to existing modal (Fluent API)
     */
    static add(modal: ModalBuilder, field: ModalField[]): ModalBuilder
    static add(modal: ModalBuilder, field: ModalField): ModalBuilder
    static add(modal: ModalBuilder, field: ModalField | ModalField[]): ModalBuilder {

        if(Array.isArray(field)){
            for (const f of field) {
                this.add(modal, f);
            }
            return modal
        }

        const opt = {
            ...field,
            customId: field.customId ?? `${modal.data.custom_id}_${field.label}`
        }

        modal.addLabelComponents(this._createField(opt))
        return modal;
    }

    // Keep your existing parse methods
    static parseNumber(value: string): number | null {
        if (!/^\d+$/.test(value)) return null;
        const num = parseInt(value);
        return isNaN(num) ? null : num;
    }

    /**
     * yyyy-mm-dd / dd-mm-yyyy / dd/mm/yyyy / yyyy/mm/dd
     * American format is not supported lol
     * @param value
     */
    static parseDate(value: string): Date | null {
        if (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) { // 2020-12-20
            const [year, month, day] = value.split('-').map(Number);
            return this.buildDate(year!, month!, day!);
        }

        if (/^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/.test(value)) { // 20-12-2020
            const [day, month, year] = value.split('-').map(Number);
            return this.buildDate(year!, month!, day!);
        }


        if (/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(value)) { // 20/12/2020
            const [day, month, year] = value.split('/').map(Number);
            return this.buildDate(year!, month!, day!);
        }

        if (/^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(value)) { // 2020/12/20
            const [year, month, day] = value.split('/').map(Number);
            return this.buildDate(year!, month!, day!);
        }

        return null;
    }

    /**
     * new Date() silently rolls an impossible date over (31/02 becomes 02/03) : reject any date that doesn't round-trip
     */
    private static buildDate(year: number, month: number, day: number): Date | null {
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
        return date;
    }
}
