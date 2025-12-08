import React, { useEffect, useState } from 'react'
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
import { PlayArrow, Edit, Refresh, Add, Delete } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchJobs, triggerJob, createJob, updateJob, deleteJob, Job } from '../features/scheduler/schedulerSlice'
import Loading from '../components/Loading'
import ScheduleDialog from '../components/ScheduleDialog'

const SchedulerDashboard: React.FC = () => {
    const dispatch = useAppDispatch()
    const { jobs, loading } = useAppSelector((state) => state.scheduler)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingJob, setEditingJob] = useState<Job | null>(null)

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

    const handleAdd = () => {
        setEditingJob(null)
        setDialogOpen(true)
    }

    const handleEdit = (job: Job) => {
        setEditingJob(job)
        setDialogOpen(true)
    }

    const handleDelete = (jobId: string) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
            dispatch(deleteJob(jobId))
        }
    }

    const handleSave = async (jobData: Partial<Job>) => {
        if (editingJob) {
            await dispatch(updateJob({ id: editingJob.id, data: jobData }))
        } else {
            await dispatch(createJob(jobData))
        }
        dispatch(fetchJobs())
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'info'
            case 'queued': return 'warning'
            case 'failed': return 'error'
            case 'inactive': return 'default'
            default: return 'success'
        }
    }

    const formatSchedule = (job: Job) => {
        if (job.type === 'interval') {
            return `Every ${job.value} ${job.unit}`
        } else if (job.type === 'daily') {
            return `Daily at ${job.value}`
        }
        return job.schedule || 'Unknown'
    }

    if (loading && jobs.length === 0) {
        return <Loading message="Loading scheduled jobs..." />
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Scheduler</Typography>
                <Box>
                    <Button
                        startIcon={<Add />}
                        onClick={handleAdd}
                        variant="contained"
                        color="primary"
                        sx={{ mr: 2 }}
                    >
                        Add Job
                    </Button>
                    <Button
                        startIcon={<Refresh />}
                        onClick={() => dispatch(fetchJobs())}
                        variant="outlined"
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', backgroundImage: 'none' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Job Name</TableCell>
                            <TableCell>Target</TableCell>
                            <TableCell>Schedule</TableCell>
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
                                    <Chip label={job.target.replace('run_', '').toUpperCase()} size="small" color="secondary" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <Chip label={formatSchedule(job)} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                                </TableCell>
                                <TableCell>{job.next_run || '-'}</TableCell>
                                <TableCell>{job.last_run || '-'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={(job.status || 'IDLE').toUpperCase()}
                                        color={getStatusColor(job.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit Schedule">
                                        <IconButton size="small" onClick={() => handleEdit(job)} sx={{ mr: 1 }}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Run Now">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleTrigger(job.id)}
                                            disabled={job.status === 'running' || job.status === 'queued'}
                                            sx={{ mr: 1 }}
                                        >
                                            <PlayArrow fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Job">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(job.id)}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {jobs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">No scheduled jobs found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ScheduleDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
                initialJob={editingJob}
            />
        </Box>
    )
}

export default SchedulerDashboard
