import { sAfterRunApplication, sBeforeRunApplication } from './patches'

/**
 * Registers a callback to be run when a call to {@link AppRegistry.runApplication} is made.
 *
 * @param callback The callback to be called.
 * @returns A function to unregister the callback.
 */
export function onRunApplication(callback: RunApplicationCallback) {
    sBeforeRunApplication.add(callback)
    return () => sBeforeRunApplication.delete(callback)
}

/**
 * Registers a callback to be run when a call to {@link AppRegistry.runApplication} is finished.
 *
 * @param callback The callback to be called.
 * @returns A function to unregister the callback.
 */
export function onRunApplicationFinished(callback: RunApplicationCallback) {
    sAfterRunApplication.add(callback)
    return () => sAfterRunApplication.delete(callback)
}

export type RunApplicationCallback = () => any
