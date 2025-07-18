import {
    byDependencies,
    byProps,
    every,
    preferExports,
    withoutProps,
} from '@revenge-mod/modules/finders/filters'
import {
    lookupModule,
    lookupModules,
} from '@revenge-mod/modules/finders/lookup'
import {
    ReactJSXRuntimeModuleId,
    ReactModuleId,
    ReactNativeModuleId,
} from '@revenge-mod/react'
import { proxify } from '@revenge-mod/utils/proxy'
import { DispatcherModuleId } from './common/flux'
import type { DiscordModules } from './types'

const { relative } = byDependencies

// modules/action_sheet/native/ActionSheetActionCreators.tsx
export let ActionSheetActionCreators: DiscordModules.Actions.ActionSheetActionCreators =
    proxify(
        () => {
            const [module] = lookupModule(
                preferExports(
                    byProps<DiscordModules.Actions.ActionSheetActionCreators>(
                        'hideActionSheet',
                        'openLazy',
                    ),
                    byDependencies([
                        undefined,
                        ReactModuleId,
                        ReactJSXRuntimeModuleId,
                        DispatcherModuleId,
                        relative(1),
                        relative(2),
                        2,
                    ]),
                ),
                {
                    uninitialized: true,
                },
            )

            if (module) return (ActionSheetActionCreators = module)
        },
        {
            hint: {},
        },
    )!

// actions/native/AlertActionCreators.tsx
export let AlertActionCreators: DiscordModules.Actions.AlertActionCreators =
    proxify(
        () => {
            const [module] = lookupModule(
                preferExports(
                    byProps<DiscordModules.Actions.AlertActionCreators>(
                        'openAlert',
                    ),
                    byDependencies([
                        [[], relative(1)],
                        [ReactNativeModuleId, 2],
                        2,
                    ]),
                ),
                {
                    uninitialized: true,
                },
            )

            if (module) return (AlertActionCreators = module)
        },
        {
            hint: {},
        },
    )!

// modules/toast/native/ToastActionCreators.tsx
export let ToastActionCreators: DiscordModules.Actions.ToastActionCreators =
    proxify(() => {
        // Many other modules share the same dependencies, the second yielded should be the correct module.
        // [Dispatcher, ImportTracker]

        const generator = lookupModules(
            preferExports(
                every(
                    byProps<DiscordModules.Actions.ToastActionCreators>('open'),
                    withoutProps('init'),
                ),
                byDependencies([DispatcherModuleId, 2]),
            ),
            {
                uninitialized: true,
            },
        )

        for (const [module] of generator)
            if (module.open.length === 1) return (ToastActionCreators = module)
    })!
