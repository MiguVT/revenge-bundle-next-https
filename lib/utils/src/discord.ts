import { getAssetByName } from '@revenge-mod/assets'
import { TokensModuleId } from '@revenge-mod/discord/common'
import {
    byDependencies,
    createFilterGenerator,
} from '@revenge-mod/modules/finders/filters'
import { lookupModule } from '@revenge-mod/modules/finders/lookup'
import {
    ReactJSXRuntimeModuleId,
    ReactModuleId,
    ReactNativeModuleId,
} from '@revenge-mod/react'
import type {
    Filter,
    FilterGenerator,
} from '@revenge-mod/modules/finders/filters'
import type { FC } from 'react'

// [React, ReactJsxRuntime, (Tokens), (BaseIconImage), (Asset), 2]
// Asset = relativeDep(1)
const IconComponentFilter = [
    ReactModuleId,
    ReactJSXRuntimeModuleId,
    TokensModuleId,
    undefined,
    undefined,
    2,
]

// Generated IconComponents that have multiple assets, there is no specific length, so the filter has to be generated on-the-fly.
// [React, ReactNative, ReactJsxRuntime, (Tokens), (BaseIconImage), (...Assets), 2]
// ...Assets = relativeDep(1..n)
const MultiIconComponentFilterBase = [
    ReactModuleId,
    ReactNativeModuleId,
    ReactJSXRuntimeModuleId,
    TokensModuleId,
    undefined,
]

export type ByGeneratedIconComponent = FilterGenerator<
    <N extends string>(
        name: N,
        ...assets: string[]
    ) => Filter<{ [K in N]: FC<any> }>
>

/**
 * Filter by icon component name and asset names.
 *
 * **Make sure to set `uninitialized: true` when using this filter in `lookupModule`!**
 *
 * @param names The component name, then the asset names if the component has multiple assets. *
 * @example
 * ```ts
 * const [CopyIconModule] = lookupModule(
 *   byGeneratedIconComponent('CopyIcon'),
 *   {
 *     uninitialized: true,
 *   }
 * )
 * if (CopyIconModule) {
 *   const { CopyIcon } = CopyIconModule
 *   // Use CopyIcon as a React component
 * }
 * ```
 * @example
 * ```ts
 * const [CircleXIconModule] = lookupModule(
 *   byGeneratedIconComponent(
 *     'CircleXIcon',
 *     'CircleXIcon-secondary',
 *     'CircleXIcon-primary',
 *   ),
 *   {
 *    uninitialized: true,
 *   }
 * )
 * ```
 */
export const byGeneratedIconComponent = createFilterGenerator<
    Parameters<ByGeneratedIconComponent>
>(
    (names, id, exports) => {
        if (exports instanceof Object) {
            if (exports[names[0]] instanceof Function) {
                let hasMultipleProps = false
                for (const _ in exports) {
                    if (hasMultipleProps) return false
                    hasMultipleProps = true
                }

                return true
            }
        } else {
            let filter = IconComponentFilter

            if (names.length > 1) {
                const mids = []

                for (let i = 1; i < names.length; i++) {
                    const name = names[i]
                    const mid = getAssetByName(name)?.moduleId
                    if (!mid) {
                        if (__DEV__) warnUnregisteredAsset(name)
                        return false
                    }

                    mids.push(mid)
                }

                filter = [...MultiIconComponentFilterBase, ...mids, 2]
            } else {
                const [name] = names

                const mid = getAssetByName(name)?.moduleId
                if (!mid) {
                    if (__DEV__) warnUnregisteredAsset(name)
                    return false
                }

                IconComponentFilter[4] = mid
            }

            return byDependencies(filter)(id, exports)
        }

        return false
    },
    names => `revenge.byGeneratedIconComponent(${names.join(',')})`,
) as ByGeneratedIconComponent

/**
 * Looks up a generated icon component by its name and asset names.
 *
 * @param names The component name, then the asset names if the component has multiple assets.
 * @returns The icon component, or `undefined` if it could not be found.
 */
export function lookupGeneratedIconComponent<N extends string>(
    ...names: [N, ...string[]]
) {
    const [module] = lookupModule(byGeneratedIconComponent(...names), {
        uninitialized: true,
    })

    return module?.[names[0]] as FC<any> | undefined
}

function warnUnregisteredAsset(name: string) {
    nativeLoggingHook(
        `\u001b[31mAsset "${name}" is not registered. Cannot get module ID to filter by.\u001b[0m`,
        2,
    )
}
