import {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    MessageCreateOptions,
    ThumbnailBuilder,
    SectionBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ButtonBuilder,
    AttachmentBuilder,
    FileBuilder,
    ActionRowBuilder, InteractionReplyOptions, InteractionEditReplyOptions,
} from "discord.js";
import { Bot } from '../../core/Bot';
import {SelectMenuList, SelectMenuManager} from "../interactible/SelectMenuManager";
import {SimpleColor} from "../../constants/SimpleColor";

type BasicText = {
    separator?: SeparatorSpacingSize | false;
    name?: string;
}
type OptionalText = BasicText & { value?: string; };
type RequiredText = BasicText & { value: string; };

type ComponentManagerFieldThumbnail = RequiredText & { thumbnailUrl: string };
type ComponentManagerFieldAccessory = OptionalText & { button: ButtonBuilder | ButtonBuilder[] };
export type ComponentManagerField = (ComponentManagerFieldAccessory | ComponentManagerFieldThumbnail | OptionalText)

export interface ComponentManagerCreate {
    title?: string | null,
    description?: string | null,
    color?: SimpleColor | null,
    thumbnailUrl?: string,
    separator?: SeparatorSpacingSize | false
}

export interface ComponentManagerFileInput {
    buffer: Buffer;
    name: string;
    spoiler?: boolean;
}

export class ComponentManager {

    private static get DEFAULT_COLOR(): number | SimpleColor {
        return Bot.config?.defaultSimpleColor || SimpleColor.default;
    }

    /**
     * Creates base ComponentV2
     */
    static create(option?: ComponentManagerCreate | null): ContainerBuilder {
        const container = new ContainerBuilder()

        const colorC = option?.color ?? this.DEFAULT_COLOR;
        if(colorC !== SimpleColor.transparent){
            container.setAccentColor(colorC)
        }

        if (option?.title || option?.thumbnailUrl) {
            if (option?.thumbnailUrl) {
                const headerSection = new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            option?.title ? option.title : "\u200B"
                        )
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(option.thumbnailUrl)
                    );
                container.addSectionComponents(headerSection);
            } else {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(option.title!)
                );
            }

            if(option?.description) {
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(option.description))
            }
            if(option?.separator) {
                container.addSeparatorComponents(this.separator(option.separator));
            }
        }

        return container;
    }

    /**
     * Creates simple ComponentV2 with just description
     */
    static simple(description: string, color: SimpleColor | null = null): ContainerBuilder {
        return this.create({color})
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(description))
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates success ComponentV2
     */
    static success(description: string): ContainerBuilder {
        return this.create({title:"Success", color:SimpleColor.success})
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(description))
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates debug ComponentV2
     */
    static debug(description: string): ContainerBuilder {
        return this.create({title:"Debug", color:SimpleColor.minecraft})
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            )
            .addSeparatorComponents(this.separator())
    }

    /**
     * Creates error ComponentV2
     */
    static error(description: string): ContainerBuilder {
        return this.create({title:"Something went wrong", color: SimpleColor.error})
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(description)
            )
            .addSeparatorComponents(this.separator())
    }

    private static separator(spacing: SeparatorSpacingSize = SeparatorSpacingSize.Small): SeparatorBuilder{
        return new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(spacing)
    }

    /**
     * Quick field adder
     */
    private static fieldAddText(container: ContainerBuilder | SectionBuilder, options: {name?: string, value?: string}) {
        options.name && container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`__**${options.name}**__`));
        options.value && container.addTextDisplayComponents(new TextDisplayBuilder().setContent(options.value));
    }
    static field(container: ContainerBuilder, field: ComponentManagerField): ContainerBuilder {

        const hasText = ('name' in field || 'value' in field) && (field.name || field.value);

        if("button" in field && Array.isArray(field.button) && field.button.length > 0){
            const actionRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(field.button);
            if(hasText) this.fieldAddText(container, {name: field.name, value: field.value});

            container.addActionRowComponents(actionRow);

        } else if( ("button" in field && !Array.isArray(field.button)) || "thumbnailUrl" in field){
            if(hasText){ // Text 'value' is mandatory when it's a thumbnail
                const section = new SectionBuilder()
                this.fieldAddText(section, {name: field.name, value: field.value});
                if("button" in field && !Array.isArray(field.button)){
                    section.setButtonAccessory(field.button)
                } else if ("thumbnailUrl" in field){
                    section.setThumbnailAccessory(new ThumbnailBuilder().setURL(field.thumbnailUrl))
                }
                container.addSectionComponents(section);
            } else {
                if("button" in field && !Array.isArray(field.button)) {
                    const actionRow = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(field.button);
                    container.addActionRowComponents(actionRow);
                }
            }
        } else {
            if(hasText) this.fieldAddText(container, {name: field.name, value: field.value});
        }

        if(field.separator !== false){
            container.addSeparatorComponents(this.separator(field.separator));
        }
        return container;
    }


    /**
     * Multiple fields
     */
    static fields(container: ContainerBuilder, fields: ComponentManagerField[]): ContainerBuilder {
        fields.forEach((field, index) => {
            const finalField = { ...field };

            // Disable the last separator unless explicitly defined
            if (index === fields.length - 1 && finalField.separator === undefined) {
                finalField.separator = false;
            }

            this.field(container, finalField);
        });
        return container;
    }

    /**
     * Add chart(s) built by the ChartManager, so a dashboard reads like the other helpers :
     * `ComponentManager.chart(container, ChartManager.progressBars([...]))` instead of
     * `container.addTextDisplayComponents(...)`.
     * No separator by default : stacked charts are meant to be read as one block
     */
    static chart(container: ContainerBuilder, chart: TextDisplayBuilder[], separator?: SeparatorSpacingSize | false): ContainerBuilder
    static chart(container: ContainerBuilder, chart: TextDisplayBuilder, separator?: SeparatorSpacingSize | false): ContainerBuilder
    static chart(
            container: ContainerBuilder,
            chart: TextDisplayBuilder | TextDisplayBuilder[],
            separator: SeparatorSpacingSize | false = false
    ): ContainerBuilder {
        const charts = Array.isArray(chart) ? chart : [chart];
        charts.forEach(c => {
            container.addTextDisplayComponents(c);
            if(separator !== false){
                container.addSeparatorComponents(this.separator(separator));
            }
        });

        return container;
    }

    /**
     * Add a media gallery (links)
     */
    static mediaGallery(container: ContainerBuilder, medias: {url: string, spoiler?: boolean}[]): ContainerBuilder {
        const gallery = new MediaGalleryBuilder();
        medias.forEach(med => {
            gallery.addItems(new MediaGalleryItemBuilder().setURL(med.url).setSpoiler(med.spoiler ?? false));
        });
        container.addMediaGalleryComponents(gallery);
        return container;
    }


    /**
     * Add a select menu
     */
    static selectMenu(container: ContainerBuilder, selectMenu: SelectMenuList[]): ContainerBuilder
    static selectMenu(container: ContainerBuilder, selectMenu: SelectMenuList): ContainerBuilder
    static selectMenu(
            container: ContainerBuilder,
            selectMenu: SelectMenuList | SelectMenuList[]
    ): ContainerBuilder {
        const menus = Array.isArray(selectMenu) ? selectMenu : [selectMenu];
        menus.forEach(menu => {
            const row = SelectMenuManager.row(menu);
            container.addActionRowComponents(row);
        });

        return container;
    }


    /**
     * Add file(s)
     * Don't forget to get the files, return by the function and send it via the "file" field when sending message, or passing the file to the ComponentManager.toMessage()
     */
    static file(container: ContainerBuilder, file: ComponentManagerFileInput): { container: ContainerBuilder, files: AttachmentBuilder[] };
    static file(container: ContainerBuilder, file: ComponentManagerFileInput[]): { container: ContainerBuilder, files: AttachmentBuilder[] };
    static file(container: ContainerBuilder, file: ComponentManagerFileInput | ComponentManagerFileInput[]): { container: ContainerBuilder, files: AttachmentBuilder[] } {
        const files: AttachmentBuilder[] = [];
        const fileArray = Array.isArray(file) ? file : [file];

        fileArray.forEach(f => {
            const attachment = new AttachmentBuilder(f.buffer, {
                name: f.name
            });
            files.push(attachment);

            container.addFileComponents(
                new FileBuilder()
                    .setURL(`attachment://${f.name}`)
                    .setSpoiler(f.spoiler ?? false)
            )
            container.addSeparatorComponents(this.separator());
        });

        return { container, files };
    }




    private static footer(container: ContainerBuilder): ContainerBuilder {
        container.addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`-# **${Bot.config?.botName || "Bot"} · <t:${Math.floor(Date.now() / 1000)}:d> <t:${Math.floor(Date.now() / 1000)}:t>**`)
        );
        return container;
    }

    /**
     * Transform ComponentV2 into object for channel.send()
     * @param container The container to send
     * @param file Only if you have files to attach
     * @param footer Sometimes you don't want to have the Bot name neither the timestamp...
     */
    static toMessage(container: ContainerBuilder, file: AttachmentBuilder | AttachmentBuilder[] | null = null, footer: boolean = true): MessageCreateOptions {
        if(footer){
            this.footer(container);
        }
        if(file){
            return {
                components: [container],
                files: Array.isArray(file) ? file : [file],
                flags: [MessageFlags.IsComponentsV2]
            };
        }
        return {
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        };
    }

    static toInteraction(
        container: ContainerBuilder,
        file: AttachmentBuilder | AttachmentBuilder[] | null = null,
        footer: boolean = true
    ): InteractionReplyOptions {
        if(footer){
            this.footer(container);
        }
        const base: InteractionReplyOptions = {
            components: [container],
            flags: [MessageFlags.IsComponentsV2]
        };

        if(file){
            return {
                ...base,
                files: Array.isArray(file) ? file : [file]
            };
        }

        return base;
    }

    static toInteractionEdit(
        container: ContainerBuilder,
        file: AttachmentBuilder | AttachmentBuilder[] | null = null,
        footer: boolean = true
    ): InteractionEditReplyOptions {
        if(footer){
            this.footer(container);
        }
        const base: InteractionEditReplyOptions = {
            components: [container],
        };

        if(file){
            return {
                ...base,
                files: Array.isArray(file) ? file : [file]
            };
        }

        return base;
    }
}