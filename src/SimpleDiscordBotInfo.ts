// Named imports so the bundler only keeps these fields instead of the whole package.json
import {name, version, author, description, license} from '../package.json'

export const SimpleDiscordBotInfo = {
    name,
    version,
    author,
    description,
    license
}
