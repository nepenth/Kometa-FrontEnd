import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import {
    GitHub as GitHubIcon,
    Language as WebsiteIcon,
    Description as WikiIcon,
    BugReport as BugIcon,
    Chat as DiscordIcon
} from '@mui/icons-material';

const About: React.FC = () => {
    const links = [
        { text: 'Kometa Website', url: 'https://kometa.wiki', icon: <WebsiteIcon /> },
        { text: 'Documentation (Wiki)', url: 'https://kometa.wiki/en/latest/', icon: <WikiIcon /> },
        { text: 'GitHub Repository', url: 'https://github.com/Kometa-Team/Kometa', icon: <GitHubIcon /> },
        { text: 'Discord Community', url: 'https://kometa.wiki/en/latest/discord', icon: <DiscordIcon /> },
        { text: 'Report an Issue', url: 'https://github.com/Kometa-Team/Kometa/issues', icon: <BugIcon /> },
    ];

    return (
        <Box p={3} maxWidth="800px" mx="auto">
            <Typography variant="h4" component="h1" fontWeight="bold" mb={4}>
                About Kometa
            </Typography>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Box textAlign="center" mb={4}>
                    <Typography variant="h3" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2 }}>
                        KOMETA
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Plex Media Manager
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Version 2.0.0
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Resources
                </Typography>
                <Grid container spacing={2}>
                    {links.map((link) => (
                        <Grid item xs={12} sm={6} key={link.text}>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={link.icon}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ justifyContent: 'flex-start', py: 1.5 }}
                            >
                                {link.text}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Paper sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Credits
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Kometa is an open-source project developed by the Kometa Team and contributors.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    &copy; {new Date().getFullYear()} Kometa Team. Licensed under the MIT License.
                </Typography>
            </Paper>
        </Box>
    );
};

export default About;
