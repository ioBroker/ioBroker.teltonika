import type { JSX } from 'react';

/** A router: the picture of the hint of the device elements */
const ROUTER_PATH =
    'M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3s-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7zm-.9.8c-.9-.9-2.1-1.4-3.3-1.4s-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8zM19 13h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm3.5 0h-2v-2h2v2zm3.5 0h-2v-2h2v2z';

/** A person: the picture of the hint of the presence elements */
const PERSON_PATH =
    'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4';

/**
 * A hint instead of the content: a setting is missing or names nothing of the adapter
 *
 * @param props what to say
 * @param props.text the hint
 * @param props.icon the picture above it
 * @param props.editMode in edit mode the element takes no clicks
 */
export function Hint({
    text,
    icon,
    editMode,
}: {
    text: string;
    icon: 'router' | 'person';
    editMode: boolean;
}): JSX.Element {
    return (
        <div className={`hint${editMode ? ' edit' : ''}`}>
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d={icon === 'person' ? PERSON_PATH : ROUTER_PATH} />
            </svg>
            <span>{text}</span>
        </div>
    );
}
