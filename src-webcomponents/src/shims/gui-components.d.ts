/**
 * Stands for `@iobroker/gui-components` while `../src-devices/src/utils.ts` is type-checked here (see `paths` in
 * `tsconfig.json`). That file imports `Connection` as a type only - the import is gone in the bundle - and calls
 * nothing of it but `getObjectViewSystem`, which the socket of every web component host has.
 */
export interface Connection {
    getObjectViewSystem<T extends ioBroker.ObjectType>(
        type: T,
        start?: string,
        end?: string,
    ): Promise<Record<string, ioBroker.AnyObject & { type: T }>>;
}
