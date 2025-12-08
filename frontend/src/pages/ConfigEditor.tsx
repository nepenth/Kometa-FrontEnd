import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

const ConfigEditor: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4 }}>Configuration Editor</Typography>
            <Paper sx={{ p: 3, minHeight: 400 }}>
                <Typography color="text.secondary">
                    Configuration editor will be implemented here using Monaco Editor.
                </Typography>
            </Paper>
        </Box>
    )
}

export default ConfigEditor
