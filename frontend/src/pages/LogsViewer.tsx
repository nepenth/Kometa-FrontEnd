import React, { useEffect, useState, useRef } from 'react'
import { Box, Typography, Paper, IconButton, Tooltip, FormControlLabel, Switch } from '@mui/material'
import { PlayArrow, Pause, DeleteSweep, Download } from '@mui/icons-material'
import { logWebSocket } from '../services/websocket'

const LogsViewer: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([])
    const [isPaused, setIsPaused] = useState(false)
    const [autoScroll, setAutoScroll] = useState(true)
    const logsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        logWebSocket.connect()

        const handleLogMessage = (message: string) => {
            if (!isPaused) {
                setLogs((prevLogs) => {
                    const newLogs = [...prevLogs, message]
                    if (newLogs.length > 1000) {
                        return newLogs.slice(newLogs.length - 1000)
                    }
                    return newLogs
                })
            }
        }

        logWebSocket.addListener(handleLogMessage)

        return () => {
            logWebSocket.removeListener(handleLogMessage)
            logWebSocket.disconnect()
        }
    }, [isPaused])

    useEffect(() => {
        if (autoScroll && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs, autoScroll])

    const handleClearLogs = () => {
        setLogs([])
    }

    const handleDownloadLogs = () => {
        const element = document.createElement("a")
        const file = new Blob([logs.join('\n')], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = "kometa-logs.txt"
        document.body.appendChild(element)
        element.click()
    }

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">System Logs</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControlLabel
                        control={<Switch checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />}
                        label="Auto-scroll"
                    />
                    <Tooltip title={isPaused ? "Resume" : "Pause"}>
                        <IconButton onClick={() => setIsPaused(!isPaused)} color={isPaused ? "warning" : "default"}>
                            {isPaused ? <PlayArrow /> : <Pause />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear Logs">
                        <IconButton onClick={handleClearLogs}>
                            <DeleteSweep />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Logs">
                        <IconButton onClick={handleDownloadLogs}>
                            <Download />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Paper
                sx={{
                    flexGrow: 1,
                    p: 2,
                    bgcolor: '#0f172a',
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    fontSize: '0.875rem',
                    overflowY: 'auto',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&::-webkit-scrollbar': { width: '10px' },
                    '&::-webkit-scrollbar-track': { background: '#1e293b' },
                    '&::-webkit-scrollbar-thumb': { background: '#475569', borderRadius: '5px' }
                }}
            >
                {logs.length === 0 && (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Waiting for logs...
                    </Typography>
                )}
                {logs.map((log, index) => (
                    <Box key={index} sx={{ mb: 0.5, color: log.includes('ERROR') ? '#ef4444' : log.includes('WARNING') ? '#f59e0b' : '#94a3b8' }}>
                        {log}
                    </Box>
                ))}
                <div ref={logsEndRef} />
            </Paper>
        </Box>
    )
}

export default LogsViewer

