import { ReactNavigationNative } from '@revenge-mod/externals/react-navigation'
import { noop } from '@revenge-mod/utils/callback'
import { findInTree } from '@revenge-mod/utils/tree'
import { Constants } from '../../common'
import { sLoaded } from '../../start'
import { RootNavigationRef } from '../main_tabs_v2'
import { sConfig, sSections, sSubscriptions } from './_internal'
import type { NavigationState, PartialState } from '@react-navigation/core'
import type { DiscordModules } from '../../types'

export type SettingsItem = DiscordModules.Modules.Settings.SettingsItem
export type SettingsSection = DiscordModules.Modules.Settings.SettingsSection

export type SettingsModulesLoadedSubscription = () => void

/**
 * Checks if the settings modules are loaded.
 */
export function isSettingsModulesLoaded() {
    return sLoaded
}

/**
 * Subscribes to when settings modules are loaded.
 * Plugins should ideally register their settings in the given callback to ensure fast startup time.
 *
 * If settings modules are already loaded, the callback will be called immediately.
 *
 * @param subcription The subscription function to call when the settings modules are loaded.
 * @returns A function to unsubscribe from the event.
 */
export function onSettingsModulesLoaded(
    subcription: SettingsModulesLoadedSubscription,
) {
    if (isSettingsModulesLoaded()) {
        subcription()
        return noop
    }

    sSubscriptions.add(subcription)
    return () => {
        sSubscriptions.delete(subcription)
    }
}

/**
 * Registers a settings section with a given key.
 *
 * @param key The key to register the settings section with.
 * @param section The settings section to register.
 * @returns A function to unregister the settings section.
 */
export function registerSettingsSection(key: string, section: SettingsSection) {
    sSections[key] = section
    return () => {
        delete sSections[key]
    }
}

/**
 * Registers a settings item with a given key.
 *
 * @param key The key to register the settings item with.
 * @param item The settings item to register.
 * @returns A function to unregister the settings item.
 */
export function registerSettingsItem(key: string, item: SettingsItem) {
    sConfig[key] = item
    return () => {
        delete sConfig[key]
    }
}

/**
 * Registers multiple settings items at once.
 *
 * @param record The settings items to register.
 * @returns A function to unregister the settings items.
 */
export function registerSettingsItems(record: Record<string, SettingsItem>) {
    Object.assign(sConfig, record)
    return () => {
        for (const key in record) delete sConfig[key]
    }
}

/**
 * Adds a settings item to an existing section.
 *
 * @param key The section to add the settings item to.
 * @param item The settings item to add.
 * @returns A function to remove the settings item from the section.
 */
export function addSettingsItemToSection(key: string, item: string) {
    const section = sSections[key]
    if (!section) throw new Error(`Section "${key}" does not exist`)

    const newLength = section.settings.push(item)
    return () => {
        delete section.settings[newLength - 1]
    }
}

const { CommonActions, StackActions } = ReactNavigationNative

/**
 * Refreshes the SettingsOverviewScreen, applying any changes made to settings modules.
 *
 * @param renavigate Whether to renavigate instead of replacing the screen in the stack.
 * @returns Whether the SettingsOverviewScreen was refreshed.
 */
export async function refreshSettingsOverviewScreen(renavigate?: boolean) {
    const navigation = RootNavigationRef.getRootNavigationRef()
    if (!navigation.isReady()) return

    let state = navigation.getRootState()
    // State with SettingsOverviewScreen
    let settingsState = findInTree(state, isNavigationSettingsState)
    // We're currently not on the settings screen, so we don't need to reset
    if (!settingsState) return

    if (renavigate) {
        const mainState = findInTree(state, isNavigationMainState)
        if (!mainState) return

        navigation.dispatch({
            ...CommonActions.goBack(),
            target: mainState.key,
        })

        navigation.navigate(mainState.routes[mainState.index].name)

        // Wait for navigation to complete and reset to the settings state
        requestAnimationFrame(() => {
            navigation.reset({
                index: settingsState!.routes.length - 1,
                routes: settingsState!.routes,
            } as PartialState<NonNullable<typeof settingsState>>)
        })
    } else {
        requestAnimationFrame(() => {
            // Get updated state
            state = navigation.getRootState()
            settingsState = findInTree(state, isNavigationSettingsState)
            if (!settingsState) return

            const {
                key: target,
                routes: [{ name, key: source }],
            } = settingsState

            navigation.dispatch({
                ...StackActions.replace(name),
                source,
                target,
            })
        })
    }
}

function isNavigationMainState(state: any): state is NavigationState {
    return Array.isArray(state.routes) && state.routes.length > 1
}

function isNavigationSettingsState(state: any): state is NavigationState {
    return (
        Array.isArray(state.routes) &&
        state.routes[0]?.name ===
            (Constants.UserSettingsSections as Record<string, string>).OVERVIEW
    )
}
