import React, { useEffect } from 'react'
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material'
import { PlayArrow, Edit, Refresh } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchJobs, triggerJob } from '../features/scheduler/schedulerSlice'
import Loading from '../components/Loading'

const SchedulerDashboard: React.FC = () => {
    const dispatch = useAppDispatch()
    const { jobs, loading } = useAppSelector((state) => state.scheduler)

    useEffect(() => {
        dispatch(fetchJobs())
        // Poll for updates every 30 seconds
        const interval = setInterval(() => {
            dispatch(fetchJobs())
        }, 30000)
        return () => clearInterval(interval)
    }, [dispatch])

    const handleTrigger = (jobId: string) => {
        dispatch(triggerJob(jobId))
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'info'
            case 'queued': return 'warning'
            case 'failed': return 'error'
            default: return 'default'
        }
    }

    if (loading && jobs.length === 0) {
        return <Loading message="Loading scheduled jobs..." />
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Scheduler</Typography>
                <Button
                    startIcon={<Refresh />}
                    onClick={() => dispatch(fetchJobs())}
                    variant="outlined"
                >
                    Refresh
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: '#1e293b', backgroundImage: 'none' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Job Name</TableCell>
                            <TableCell>Schedule (Cron)</TableCell>
                            <TableCell>Next Run</TableCell>
                            <TableCell>Last Run</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jobs.map((job) => (
                            <TableRow key={job.id} hover>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                                    {job.name}
                                </TableCell>
                                <TableCell>
                                    <Chip label={job.schedule} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                                </TableCell>
                                <TableCell>{job.next_run}</TableCell>
                                <TableCell>{job.last_run}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={job.status.toUpperCase()}
                                        color={getStatusColor(job.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit Schedule">
                                        <IconButton size="small" sx={{ mr: 1 }}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Run Now">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleTrigger(job.id)}
                                            disabled={job.status === 'running' || job.status === 'queued'}
                                        >
                                            <PlayArrow fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {jobs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No scheduled jobs found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default SchedulerDashboard
