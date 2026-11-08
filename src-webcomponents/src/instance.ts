/**
 * The instance of the adapter a setting or an ID names. What every element needs - nothing else in here, so that
 * the presence elements do not carry the code of the devices.
 */

/**
 * `teltonika.0` from what an `instance` setting holds: `teltonika.0`, `system.adapter.teltonika.0` or `0`
 *
 * @param instance the value of the setting
 * @returns null if it names no instance of the adapter
 */
export function toInstance(instance: string | undefined | null): string | null {
    const match = String(instance ?? '')
        .trim()
        .match(/^(?:system\.adapter\.)?(?:teltonika\.)?(\d+)$/);
    return match ? `teltonika.${match[1]}` : null;
}

/** The instance of an ID below it, e.g. `teltonika.0` of `teltonika.0.6007866821.alive` */
export function instanceOfId(id: string | undefined | null): string | null {
    const match = String(id ?? '').match(/^(teltonika\.\d+)(\.|$)/);
    return match ? match[1] : null;
}
