// Stands in for `@iobroker/dm-widgets` when the shared views of `../src-devices/src` are built for vis-2.
//
// Those views read React, MUI and I18n off the bridge the devices app provides. vis-2 has no such bridge, but it
// shares React and MUI through Module Federation, so the plain packages are the host's instances here.

import * as React from 'react';
import * as MuiMaterial from '@mui/material';
import { I18n } from './guiComponents';

export { React, MuiMaterial };
export const AdapterReact = { I18n };
