// The dialog both widgets open on a click: the same dark frame the devices app uses around the device detail.

import type React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { I18n } from '@iobroker/gui-components';

export default function DeviceDialog({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <Dialog
            open
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            slotProps={{ paper: { sx: { bgcolor: '#11161b', color: '#e6ecf2' } } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, pr: 1 }}>
                <Box
                    component="span"
                    sx={{ fontWeight: 700 }}
                >
                    {title}
                </Box>
                <IconButton
                    size="small"
                    onClick={onClose}
                    aria-label={I18n.t('telt_close')}
                    sx={{ color: 'inherit' }}
                >
                    <Box
                        component="span"
                        sx={{ fontSize: 20, lineHeight: 1, fontWeight: 600 }}
                    >
                        ×
                    </Box>
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 3 }}>{children}</DialogContent>
        </Dialog>
    );
}
