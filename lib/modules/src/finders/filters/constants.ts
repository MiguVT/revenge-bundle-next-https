export const FilterFlag = {
    /**
     * This filter works with and without module exports.
     * Allowing for both initialized and uninitialized modules to be matched.
     */
    Dynamic: 0,
    /**
     * This filter requires module exports to work.
     * Only initialized modules will be matched.
     */
    RequiresExports: 1,
} as const

/**
 * @see {@link FilterFlag}
 */
export type FilterFlag = number

/**
 * Scopes to limit filters to certain module states.
 */
export const FilterScopes = {
    /**
     * Include all modules (both initialized and uninitialized, including blacklisted).
     * This overrides {@link FilterScopes.Uninitialized} and {@link FilterScopes.Initialized}.
     */
    All: 1,
    /**
     * Include uninitialized modules in the search.
     */
    Uninitialized: 2,
    /**
     * Include initialized modules from the search.
     */
    Initialized: 4,
} as const

export type FilterScope = (typeof FilterScopes)[keyof typeof FilterScopes]

/**
 * @see {@link FilterScopes}
 */
export type FilterScopeValue = number

export interface FilterInfo {
    /**
     * The result type of the filter.
     */
    Result: any
    /**
     * Whether the filter requires exports to work.
     */
    RequiresExports: boolean
    /**
     * Scopes the filter matches modules in.
     */
    Scopes: FilterScope[]
}

export interface DefaultFilterInfo extends FilterInfo {
    Result: any
    RequiresExports: boolean
    Scopes: FilterScope[]
}
