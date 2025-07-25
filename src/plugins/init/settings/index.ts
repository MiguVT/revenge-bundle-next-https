import { sSections } from '@revenge-mod/discord/_/modules/settings'
import { onSettingsModulesLoaded } from '@revenge-mod/discord/modules/settings'
import { byName } from '@revenge-mod/modules/finders/filters'
import { waitForModules } from '@revenge-mod/modules/finders/wait'
import { after } from '@revenge-mod/patcher'
import { InternalPluginFlags, registerPlugin } from '@revenge-mod/plugins/_'
import { PluginFlags } from '@revenge-mod/plugins/constants'
import type { FC } from 'react'

import './register-routes'

// Always register before so setting modules that depend on the Revenge section can be registered properly
onSettingsModulesLoaded(() => {
    require('./register')
})

registerPlugin(
    {
        id: 'revenge.settings',
        name: 'Settings',
        description: 'Settings UI for Revenge.',
        author: 'Revenge',
        icon: 'SettingsIcon',
    },
    {
        start() {
            const unsubSOS = waitForModules(
                byName('SettingsOverviewScreen'),
                exports => {
                    unsubSOS()

                    const customSections = sSections

                    after(exports as { default: FC }, 'default', tree => {
                        const {
                            props: { sections },
                        } = tree as {
                            props: {
                                sections: Array<{
                                    label: string
                                    settings: string[]
                                }>
                            }
                        }

                        // Check if we even have custom sections
                        const firstCustomSection =
                            customSections[Object.keys(customSections)[0]]
                        if (!firstCustomSection) return tree

                        // Check if sections are already spliced
                        const [firstCustomItem] = firstCustomSection.settings
                        if (
                            sections.findIndex(section =>
                                section.settings.includes(firstCustomItem),
                            ) < 0
                        )
                            for (const section of Object.values(customSections))
                                if (!section.index) sections.unshift(section)
                                else sections.splice(section.index, 0, section)

                        return tree
                    })
                },
                {
                    returnNamespace: true,
                },
            )
        },
    },
    PluginFlags.Enabled,
    InternalPluginFlags.Internal | InternalPluginFlags.Essential,
)
