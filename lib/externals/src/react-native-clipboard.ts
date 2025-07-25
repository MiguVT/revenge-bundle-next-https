import {
    byDependencies,
    byProps,
    preferExports,
} from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import { ReactModuleId, ReactNativeModuleId } from '@revenge-mod/react'
import { destructure, proxify } from '@revenge-mod/utils/proxy'

const { relative } = byDependencies

let ClipboardModule: typeof import('@react-native-clipboard/clipboard') =
    proxify(
        () => {
            // ID: 4790

            // r6 = 4790;
            // r5 = [4791, 4792];

            // r6 = 4791;
            // r5 = [175, 4792];

            // r6 = 4792;
            // r5 = [27, 4793];

            const [module] = lookupModule(
                preferExports(
                    byProps<typeof ClipboardModule>('useClipboard'),
                    byDependencies([
                        relative.withDependencies(
                            [ReactModuleId, relative(2, true)],
                            1,
                        ),
                        relative.withDependencies(
                            [ReactNativeModuleId, relative(3, true)],
                            2,
                        ),
                    ]),
                ),
                {
                    uninitialized: true,
                },
            )

            if (module) {
                Clipboard = module.default
                useClipboard = module.useClipboard
                return (ClipboardModule = module)
            }
        },
        {
            hint: {},
        },
    )!

export let { default: Clipboard, useClipboard } = destructure(ClipboardModule, {
    default: {
        hint: {},
    },
    useClipboard: {
        hint: () => {},
    },
})
