import React, { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';

import { Job } from '../features/scheduler/schedulerSlice';

interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (job: Partial<Job>) => void;
  initialJob?: Job | null;
}

const ScheduleDialog: React.FC<ScheduleDialogProps> = ({ open, onClose, onSave, initialJob }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'interval' | 'daily'>('interval');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [target, setTarget] = useState('run_operations');

  useEffect(() => {
    if (initialJob) {
      setName(initialJob.name);
      setType(initialJob.type);
      setValue(initialJob.value);
      setUnit(initialJob.unit);
      setTarget(initialJob.target);
    } else {
      setName('');
      setType('interval');
      setValue('');
      setUnit('minutes');
      setTarget('run_operations');
    }
  }, [initialJob, open]);

  const handleSave = () => {
    onSave({
      name,
      type,
      value,
      unit,
      target,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialJob ? 'Edit Job' : 'Add New Job'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                label="Type"
                onChange={(e: SelectChangeEvent) => setType(e.target.value as 'interval' | 'daily')}
              >
                <MenuItem value="interval">Interval</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Target</InputLabel>
              <Select
                value={target}
                label="Target"
                onChange={(e: SelectChangeEvent) => setTarget(e.target.value)}
              >
                <MenuItem value="run_operations">Run Operations</MenuItem>
                <MenuItem value="run_collections">Run Collections</MenuItem>
                <MenuItem value="run_metadata">Run Metadata</MenuItem>
                <MenuItem value="run_overlays">Run Overlays</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {type === 'interval' && (
            <>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Every"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={unit}
                    label="Unit"
                    onChange={(e: SelectChangeEvent) =>
                      setUnit(e.target.value as 'minutes' | 'hours' | 'days')
                    }
                  >
                    <MenuItem value="minutes">Minutes</MenuItem>
                    <MenuItem value="hours">Hours</MenuItem>
                    <MenuItem value="days">Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
          {type === 'daily' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Time (HH:MM)"
                type="time"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 min
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDialog;
