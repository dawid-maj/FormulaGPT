/**
 * Main menu component for selecting between Race and Qualifying modes
 */
import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useScale } from '../contexts/ScaleContext';

const MainMenu = ({ onModeSelect }) => {
  const { scale } = useScale();

  return (
    <Box 
      sx={{ 
        width: '100vw', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        p: 2
      }}
    >
      <Paper 
        elevation={8} 
        sx={{ 
          p: 4, 
          maxWidth: 800, 
          width: '100%',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #f44336 30%, #ff9800 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            FormulaGPT
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            AI-Powered Formula 1 Racing Simulator
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
            Choose your racing experience: compete in full Grand Prix races with strategic pit stops 
            and tire management, or test your qualifying skills in time attack sessions.
          </Typography>
        </Box>

        {/* Mode Selection */}
        <Grid container spacing={3}>
          
          {/* Race Mode */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ 
                  color: '#1976d2',
                  fontWeight: 'bold'
                }}>
                  🏁 Grand Prix Race
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph>
                  Full race experience with AI-powered teams making strategic decisions in real-time.
                </Typography>
                
                <Box component="ul" sx={{ pl: 2, mt: 2, color: 'text.secondary' }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    12-lap racing with tire strategy
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    AI teams vs player control
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Pit stops and tire compound rules
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Real-time strategic decisions
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Complete championship points
                  </Typography>
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={() => onModeSelect('race')}
                  sx={{ 
                    py: 1.5,
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  }}
                >
                  Start Grand Prix
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Qualifying Mode */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ 
                  color: '#f44336',
                  fontWeight: 'bold'
                }}>
                  ⏱️ Qualifying Session
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph>
                  Time attack session with track evolution and strategic tire management.
                </Typography>
                
                <Box component="ul" sx={{ pl: 2, mt: 2, color: 'text.secondary' }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    18-minute qualifying session
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Player-only control (no AI)
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    3 tire sets per driver
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Attack modes with error risk
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Dynamic track evolution
                  </Typography>
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={() => onModeSelect('qualifying')}
                  sx={{ 
                    py: 1.5,
                    backgroundColor: '#f44336',
                    '&:hover': {
                      backgroundColor: '#d32f2f'
                    }
                  }}
                >
                  Start Qualifying
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
        </Grid>

        {/* Footer info */}
        <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="body2" color="text.secondary">
            Powered by advanced AI models including GPT, Claude, and DeepSeek
          </Typography>
        </Box>
        
      </Paper>
    </Box>
  );
};

export default MainMenu;