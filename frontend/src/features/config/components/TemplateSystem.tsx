import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, TextField, Button, Chip, Alert, CircularProgress, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from '@mui/material';
import { Add, Edit, Delete, ContentCopy, Save, CheckCircle, Code, Description } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Editor from '@monaco-editor/react';

const TemplateSystem: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState([
    {
      id: 'basic',
      name: 'Basic Template',
      description: 'Basic collection template with common settings',
      type: 'collection',
      content: `name: Basic
type: collection
collection_mode: default
sort_by: title
sort_order: asc
limit: 20
builders:
  - type: plex_search
    search:
      type: movie
      genre: Action
      decade: 2020s
`,
      tags: ['basic', 'collection', 'movie']
    },
    {
      id: 'shows',
      name: 'TV Shows Template',
      description: 'Template for TV show collections',
      type: 'collection',
      content: `name: TV Shows
type: collection
collection_mode: show
sort_by: originally_available_at
sort_order: desc
limit: 30
builders:
  - type: plex_search
    search:
      type: show
      genre: Drama
      content_rating: TV-MA
`,
      tags: ['show', 'collection', 'tv']
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'collection',
    content: '',
    tags: ''
  });

  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  const handleAddTemplate = () => {
    if (!newTemplate.name.trim()) {
      setSnackbarMessage('Template name is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const newId = newTemplate.name.toLowerCase().replace(/\s+/g, '-');
    const templateToAdd = {
      ...newTemplate,
      id: newId,
      tags: newTemplate.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    setTemplates([...templates, templateToAdd]);
    setNewTemplate({
      name: '',
      description: '',
      type: 'collection',
      content: '',
      tags: ''
    });

    setSnackbarMessage('Template added successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate({...template, tags: template.tags.join(', ')});
    setOpenDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingTemplate.name.trim()) {
      setSnackbarMessage('Template name is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const updatedTemplate = {
      ...editingTemplate,
      tags: editingTemplate.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
    };

    setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    setOpenDialog(false);
    setSnackbarMessage('Template updated successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    setSnackbarMessage('Template deleted successfully!');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    setSnackbarMessage('Template copied to clipboard!');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const editorOptions = {
    minimap: { enabled: false },
    wordWrap: 'on',
    wrappingIndent: 'same',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    fontSize: 13,
    tabSize: 2,
    theme: theme.palette.mode === 'dark' ? 'vs-dark' : 'vs-light',
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Template System
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="template tabs">
          <Tab label="Template Library" />
          <Tab label="Create Template" />
        </Tabs>
      </Paper>

      {/* Search */}
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search templates by name, description, or tags..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <Box sx={{ mr: 1 }}>
              <Code color="action" />
            </Box>
          )
        }}
      />

      {/* Template Library */}
      {activeTab === 0 && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {filteredTemplates.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No templates found matching your search criteria.
            </Alert>
          ) : (
            <List sx={{ width: '100%' }}>
              {filteredTemplates.map((template) => (
                <React.Fragment key={template.id}>
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Copy template">
                          <IconButton edge="end" onClick={() => handleCopyTemplate(template.content)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit template">
                          <IconButton edge="end" onClick={() => handleEditTemplate(template)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete template">
                          <IconButton edge="end" onClick={() => handleDeleteTemplate(template.id)}>
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">{template.name}</Typography>
                          <Chip
                            label={template.type}
                            size="small"
                            color={template.type === 'collection' ? 'primary' : 'secondary'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {template.description}
                          </Typography>
                          {template.tags.map((tag: string) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      )}

      {/* Create Template */}
      {activeTab === 1 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Template Name"
              variant="outlined"
              size="small"
              fullWidth
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              placeholder="e.g., Basic Collection"
            />
            <TextField
              label="Type"
              variant="outlined"
              size="small"
              select
              SelectProps={{ native: true }}
              value={newTemplate.type}
              onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
              sx={{ minWidth: 150 }}
            >
              <option value="collection">Collection</option>
              <option value="overlay">Overlay</option>
              <option value="metadata">Metadata</option>
              <option value="playlist">Playlist</option>
            </TextField>
          </Box>

          <TextField
            label="Description"
            variant="outlined"
            size="small"
            fullWidth
            value={newTemplate.description}
            onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
            placeholder="Brief description of what this template does"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Tags (comma separated)"
            variant="outlined"
            size="small"
            fullWidth
            value={newTemplate.tags}
            onChange={(e) => setNewTemplate({...newTemplate, tags: e.target.value})}
            placeholder="e.g., basic, collection, movie"
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
            Template Content (YAML)
          </Typography>

          <Box sx={{ flex: 1, position: 'relative', mb: 2 }}>
            <Editor
              height="400px"
              language="yaml"
              value={newTemplate.content}
              onChange={(value) => setNewTemplate({...newTemplate, content: value || ''})}
              options={editorOptions}
              loading={<CircularProgress />}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTemplate}
            disabled={loading || !newTemplate.name.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            Add Template
          </Button>
        </Box>
      )}

      {/* Edit Template Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Template</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          {editingTemplate && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Template Name"
                variant="outlined"
                size="small"
                fullWidth
                value={editingTemplate.name}
                onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
              />

              <TextField
                label="Description"
                variant="outlined"
                size="small"
                fullWidth
                value={editingTemplate.description}
                onChange={(e) => setEditingTemplate({...editingTemplate, description: e.target.value})}
              />

              <TextField
                label="Tags (comma separated)"
                variant="outlined"
                size="small"
                fullWidth
                value={editingTemplate.tags}
                onChange={(e) => setEditingTemplate({...editingTemplate, tags: e.target.value})}
              />

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Template Content (YAML)
              </Typography>

              <Box sx={{ height: '400px', position: 'relative' }}>
                <Editor
                  height="100%"
                  language="yaml"
                  value={editingTemplate.content}
                  onChange={(value) => setEditingTemplate({...editingTemplate, content: value || ''})}
                  options={editorOptions}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveEdit}
            disabled={!editingTemplate?.name.trim()}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TemplateSystem;