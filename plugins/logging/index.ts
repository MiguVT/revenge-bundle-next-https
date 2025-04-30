import { AppStartPerformance } from '@revenge-mod/discord'

import { PluginFlags } from '@revenge-mod/plugins'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'

AppStartPerformance.mark('👊', 'Plugins register')

const tsReg = performance.now()
let tsInit: number

registerPlugin(
    {
        id: 'revenge.logging',
        name: 'Logging',
        description: "Extra logging for Revenge's internal modules",
        icon: 'PaperIcon',
    },
    {
        init() {
            tsInit = performance.now()
            AppStartPerformance.mark('👊', 'Plugins init', tsInit - tsReg)
        },
        start({ logger }) {
            AppStartPerformance.mark('👊', 'Plugins start', performance.now() - tsInit)
            logger.log(
                `👊 Revenge. Discord, your way. (v: ${__BUILD_VERSION__} c: ${__BUILD_COMMIT__} e: ${__BUILD_ENV__})`,
            )
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal,
)
