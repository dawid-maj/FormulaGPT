import React, { useState, useCallback } from 'react';
import { getModelDisplayName } from '../data/modelConfig';
import { TIRE_TYPES } from '../data/constants';
import { teamColors } from '../data/teamMapping';
import softTiresSvg from '../assets/svg/soft_tires.svg';
import mediumTiresSvg from '../assets/svg/medium_tires.svg';
import hardTiresSvg from '../assets/svg/hard_tires.svg';
import unknownTiresSvg from '../assets/svg/unknown_tires.svg';
import fgptLogo from '../assets/logos/fgpt_logo.svg';
import { Box, Container,Grid,Paper,Typography,Button,Checkbox,FormControlLabel,Select,MenuItem,IconButton,Tooltip,Card,CardContent,Divider,Alert,Snackbar}
from '@mui/material';
import { 
  Casino as CasinoIcon,
  Science as ScienceIcon,
  PlayArrow as PlayArrowIcon,
  Check as CheckIcon,
  Api as ApiIcon,
  Info as InfoIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';

// Helper function to format bold text
const formatBoldText = (text) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

import { RaceInfoModal } from './RaceInfoModal';

const PreRaceMenu = ({ availableTeams, teamControl, setTeamControl, cars, setCars, onStartRace, onGenerateAIStrategy, conversationHistory, onOpenApiConfig, apiError, setApiError }) => {
  const [showRaceInfo, setShowRaceInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strategiesGenerated, setStrategiesGenerated] = useState(false);
  const [strategyModal, setStrategyModal] = useState({ isOpen: false, team: null });
  // Randomizes a unique order based on the complete list of drivers.
  const [startingGrid, setStartingGrid] = useState(
    cars.map(car => car.name)
  );


  // Randomizes positions fairly for teams.
  const randomizeGridFair = () => {
    // Grouping drivers by teams.
    const teamDrivers = {};
    cars.forEach(car => {
      if (!teamDrivers[car.team]) {
        teamDrivers[car.team] = [];
      }
      teamDrivers[car.team].push(car.name);
    });

    // Randomizing the order of teams.
    const teams = Object.keys(teamDrivers);
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

    // Creating a new starting grid.
    const newGrid = new Array(cars.length).fill(null);
    
    shuffledTeams.forEach((team, index) => {
      // Randomly choosing which driver goes in front and which goes at the back.
      const [driver1, driver2] = teamDrivers[team].sort(() => Math.random() - 0.5);
      
      // Placing the first driver at the front (positions 0–4).
      newGrid[index] = driver1;
      
      // Placing the second driver at the back (positions 5–9).
      // Index for the back position is: (teams.length - 1 - index) + teams.length.
      newGrid[(teams.length - 1 - index) + teams.length] = driver2;
    });

    setStartingGrid(newGrid);
  };

  const handleGridChange = (positionIdx, driverName) => {
    let newGrid = [...startingGrid];
    // For all other positions, if that driver is already selected – clear the selection.
    newGrid = newGrid.map((item, idx) => idx !== positionIdx && item === driverName ? "" : item);
    newGrid[positionIdx] = driverName;
    setStartingGrid(newGrid);
  };

  // Helper function to get team color using centralized configuration
  const getTeamColor = (team) => teamColors[team] || "#ffffff";

  // Helper function to get tire color
  const getTireColor = (tire) => {
    const tireColors = {
      'SOFT': '#FF1801',   // Red for soft
      'MEDIUM': '#FFF200', // Yellow for medium  
      'HARD': '#FFFFFF'    // White for hard
    };
    return tireColors[tire] || '#ffffff';
  };

  // Helper function to get tire text color (for better contrast)
  const getTireTextColor = (tire) => {
    // Use black text for MEDIUM and HARD for contrast
    return (tire === 'MEDIUM' || tire === 'HARD') ? '#000000' : '#ffffff';
  };

  // Checks if all cars have selected tires.
  const allTiresSelected = () => {
    return cars.every(car => car.tires.type && car.tires.type.trim() !== "");
  };

  // Randomizes tires only for player-controlled teams without assigned tires
  const randomizeTires = () => {
    const tireTypes = ['SOFT', 'MEDIUM', 'HARD'];
    setCars(prevCars =>
      prevCars.map(car => {
        // Skip if team is AI-controlled
        if (teamControl[car.team]?.type !== "player") {
          return car;
        }
        // Skip if tires are already assigned
        if (car.tires && car.tires.type && car.tires.type.trim() !== "") {
          return car;
        }
        const randomIndex = Math.floor(Math.random() * tireTypes.length);
        const chosenTire = tireTypes[randomIndex];
        return {
          ...car,
          tires: {
            ...TIRE_TYPES[chosenTire],
            condition: 100,
            type: chosenTire
          }
        };
      })
    );
  };

  // Helper function to get model display name
  const getTeamModelDisplayName = (team) => {
    if (!teamControl[team]) return '';
    
    // Use the centralized model display name function
    return getModelDisplayName(teamControl[team].model);
  };

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 4, 
      mb: 4,
      background: '#1a1a1a',
      borderRadius: '8px',
      padding: '1rem'
    }}>
      {apiError && (
        <div className="api-error-banner">
          <span>{apiError}</span>
          <button 
            onClick={() => setApiError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginLeft: '16px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Logo na górze */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 2
      }}>
        <img 
          src={fgptLogo} 
          alt="F1 GPT Logo" 
          style={{ 
            height: '40px', 
            marginBottom: '10px',
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
          }} 
        />
      </Box>

      <Paper elevation={3} className="pre-race-menu" sx={{ 
        p: 3, 
        backgroundColor: '#1a1a1a', 
        color: 'white',
        borderRadius: 2
      }}>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6} style={{ position: 'relative' }}>
            {strategyModal.isOpen ? (
              <div style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(145deg, #1a2234 0%, #0c1220 100%)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 10
              }}>
                <div style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  minHeight: '3rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  background: `linear-gradient(145deg, ${getTeamColor(strategyModal.team)} 0%, ${getTeamColor(strategyModal.team)}dd 100%)`,
                  borderRadius: '8px 8px 0 0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={() => setStrategyModal({ isOpen: false, team: null })}
                      style={{ 
                        background: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '0.25rem 0.75rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                      onMouseOut={e => e.target.style.backgroundColor = 'transparent'}
                    >
                      ←
                    </button>
                    <h2 style={{ 
                      color: '#ffffff',
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}>
                      <div>{strategyModal.team} Strategy</div>
                      <div style={{
                        fontSize: '0.7rem',
                        opacity: 0.8,
                        fontWeight: 'normal'
                      }}>
                        {getTeamModelDisplayName(strategyModal.team)}
                      </div>
                    </h2>
                  </div>
                </div>
                <div style={{ 
                  overflowY: 'auto', 
                  flex: 1, 
                  padding: '1rem',
                  whiteSpace: 'pre-wrap', 
                  textAlign: 'left',
                  color: '#fff'
                }}>
                  {conversationHistory[strategyModal.team]?.filter(msg => msg.role === 'assistant').map((msg, i) => (
                    <div key={i} style={{ 
                      marginBottom: '1rem',
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ 
                        fontSize: '0.9rem',
                        lineHeight: '1.5'
                      }}
                      dangerouslySetInnerHTML={{ __html: formatBoldText(msg.content) }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Card sx={{ 
                background: 'linear-gradient(145deg, #1a2234 0%, #0c1220 100%)',
                height: '100%',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    color: '#ffffff',
                    fontFamily: 'Titillium Web',
                    fontWeight: 600,
                    letterSpacing: '0.5px'
                  }}>
                    Team Selection
                  </Typography>
            {availableTeams.map(team => (
              <div key={team} className="team-option" style={{ 
                marginBottom: '1rem', 
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                background: 'transparent',
                transition: 'background-color 0.2s ease',
                ':hover': {
                  backgroundColor: 'rgba(255,255,255,0.06)'
                }
              }}>
                <label style={{ color: getTeamColor(team), fontWeight: 'bold' }}>
                  <input
                    type="checkbox"
                    checked={teamControl[team]?.type === "player" || false}
                    onChange={() =>
                      setTeamControl(prev => ({
                        ...prev,
                        [team]: { 
                          ...prev[team], 
                          type: prev[team].type === "player" ? "ai" : "player" 
                        }
                      }))
                    }
                  />
                  {team} – {teamControl[team].type === "player" ? "Player" : "AI"}
                </label>
                {teamControl[team].type === "ai" && 
                 teamControl[team].model &&
                 teamControl[team].aiStrategyApplied && 
                 conversationHistory[team] && 
                 conversationHistory[team].length > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      marginLeft: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      minWidth: 'auto',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                    onClick={() => setStrategyModal({ isOpen: true, team })}
                  >
                    View Strategy
                  </Button>
                )}
              </div>
            ))}
                  {/* Przyciski konfiguracyjne */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
                    <Button 
                      variant="outlined"
                      startIcon={<ApiIcon />}
                      fullWidth
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                      onClick={onOpenApiConfig}
                    >
                      API Configuration
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<InfoIcon />}
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                      onClick={() => setShowRaceInfo(true)}
                    >
                      Race Information
                    </Button>
                    <Button 
                      variant="outlined"
                      startIcon={<CasinoIcon />}
                      fullWidth
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          borderColor: strategiesGenerated ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: strategiesGenerated ? 'transparent' : 'rgba(255, 255, 255, 0.05)'
                        },
                        '&.Mui-disabled': {
                          color: 'rgba(255, 255, 255, 0.3)',
                          borderColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                      disabled={strategiesGenerated || loading}
                      onClick={randomizeGridFair}
                    >
                      Fair Random Grid
                    </Button>
                    <Button 
                      variant="outlined"
                      startIcon={<CasinoIcon />}
                      fullWidth
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          borderColor: strategiesGenerated ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: strategiesGenerated ? 'transparent' : 'rgba(255, 255, 255, 0.05)'
                        },
                        '&.Mui-disabled': {
                          color: 'rgba(255, 255, 255, 0.3)',
                          borderColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                      disabled={strategiesGenerated || loading}
                      onClick={randomizeTires}
                    >
                      Random Tires
                    </Button>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ScienceIcon />}
                      fullWidth
                      disabled={loading}
                      sx={{ 
                        mb: 2,
                        color: 'rgba(255, 255, 255, 0.9)',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        },
                        '&.Mui-disabled': {
                          color: 'rgba(255, 255, 255, 0.3)',
                          borderColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await Promise.all(
                            Object.entries(teamControl)
                              .filter(([_, control]) => control.type === "ai")
                              .map(([team]) => onGenerateAIStrategy(team, startingGrid))
                          );
                          setStrategiesGenerated(true);
                        } catch (error) {
                          console.error('Error generating AI strategies:', error);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Generate AI Strategies {loading && <div className="spinner" style={{ marginLeft: '8px', verticalAlign: 'middle' }} />}
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<PlayArrowIcon />}
                      disabled={!allTiresSelected()}
                      sx={{
                        opacity: allTiresSelected() ? 1 : 0.5,
                        '&.Mui-disabled': {
                          backgroundColor: '#2e7d32',
                          opacity: 0.5,
                          color: '#fff'
                        }
                      }}
                      onClick={() => {
                        const grid = startingGrid.map((name, index) => {
                          const car = cars.find(c => c.name === name);
                          return {
                            name,
                            distanceTraveled: -25 - (20 * index),
                            tires: { ...car.tires }
                          };
                        });
                        onStartRace(grid);
                      }}
                    >
                      Start Race
                    </Button>
                  </Box>

                </CardContent>
                <Box sx={{ 
                  mt: 2, 
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  pt: 2,
                  pb: 1,
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <Button
                    variant="text"
                    startIcon={<GitHubIcon />}
                    href="https://github.com/dawid-maj/FormulaGPT"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      textTransform: 'none',
                      '&:hover': {
                        color: 'rgba(255, 255, 255, 0.9)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    View on GitHub
                  </Button>
                </Box>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'linear-gradient(145deg, #1a2234 0%, #0c1220 100%)',
              height: '100%',
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)'
            }}>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ 
                  color: '#ffffff',
                  fontFamily: 'Titillium Web',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                  
                }}>
                  Starting Grid
                </Typography>
                
          {startingGrid.map((driver, index) => {
            const usedDrivers = startingGrid.filter((item, idx) => idx !== index && item !== "");
            const selectedCar = driver ? cars.find(car => car.name === driver) : null;
            const isPlayerControlled = selectedCar && teamControl[selectedCar.team]?.type === "player";
            
            return (
              <div key={index} className="grid-row" style={{ 
                padding: '0.75rem', 
                borderRadius: '8px',
                backgroundColor: selectedCar ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '0.3rem',
                transition: 'all 0.2s ease',
                minHeight: '2rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ minWidth: '40px', color: '#ffffff' }}>P{index + 1}:</span>
                  <select 
                    value={driver || ""} 
                    onChange={(e) => handleGridChange(index, e.target.value)}
                    style={{ 
                      padding: '0.125rem',
                      width: '80px',
                      borderRadius: '4px',
                      backgroundColor: '#2a2a2a',
                      color: '#ffffff',
                      border: '1px solid #333',
                      textAlign: 'center'
                    }}
                  >
                    <option value="">-- Wybierz zawodnika --</option>
                    {cars
                      .map(car => car.name)
                      .filter(name => !usedDrivers.includes(name) || name === driver)
                      .map(name => {
                        const car = cars.find(c => c.name === name);
                        return (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        );
                      })
                    }
                  </select>
                  
                  {driver && selectedCar && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        color: getTeamColor(selectedCar.team),
                        fontWeight: 'bold' 
                      }}>
                        {selectedCar.team}
                      </span>
                      
                      {isPlayerControlled ? (
                        <div style={{ 
                          position: 'relative',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        title="Click to switch tires"
                        onMouseOver={(e) => {
                          e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                        }}
                        >
                          <select
                            value={selectedCar.tires.type || ""}
                            onChange={(e) => {
                              const newTireType = e.target.value;
                              setCars(prevCars => prevCars.map(car => {
                                if (car.name === selectedCar.name) {
                                  if (newTireType) {
                                    return {
                                      ...car,
                                      tires: { ...TIRE_TYPES[newTireType], condition: 100, type: newTireType },
                                      tireHistory: [TIRE_TYPES[newTireType].name]
                                    };
                                  } else {
                                    return {
                                      ...car,
                                      tires: { condition: 100, type: "" },
                                      tireHistory: ["?"]
                                    };
                                  }
                                }
                                return car;
                              }));
                            }}
                            style={{
                              opacity: 0,
                              position: 'absolute',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">?</option>
                            <option value="SOFT">S</option>
                            <option value="MEDIUM">M</option>
                            <option value="HARD">H</option>
                          </select>
                          <img 
                            src={
                              selectedCar.tires.type === 'SOFT' ? softTiresSvg :
                              selectedCar.tires.type === 'MEDIUM' ? mediumTiresSvg :
                              selectedCar.tires.type === 'HARD' ? hardTiresSvg : unknownTiresSvg
                            }
                            alt={`${selectedCar.tires.type || 'Unknown'} tires`}
                            style={{
                              width: '24px',
                              height: '24px',
                              padding: '0rem',
                              borderRadius: '4px',
                              pointerEvents: 'none',
                              boxShadow: '0 0 4px rgba(255, 255, 255, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              filter: 'none'
                            }}
                          />
                          {(!selectedCar.tires.type || selectedCar.tires.type === '') && (
                            <span style={{
                              color: '#ff6b6b',
                              fontSize: '0.7rem',
                              fontWeight: 'bold'
                            }}>
                              Choose starting compound
                            </span>
                          )}
                        </div>
                      ) : (
                        <img 
                          src={
                            selectedCar.tires.type === 'SOFT' ? softTiresSvg :
                            selectedCar.tires.type === 'MEDIUM' ? mediumTiresSvg :
                            selectedCar.tires.type === 'HARD' ? hardTiresSvg : unknownTiresSvg
                          }
                          alt={`${selectedCar.tires.type || 'Unknown'} tires`}
                          style={{
                            width: '24px',
                            height: '24px',
                            padding: '0.25rem',
                            borderRadius: '4px'
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Paper>
      <RaceInfoModal 
        isOpen={showRaceInfo}
        onClose={() => setShowRaceInfo(false)}
      />
    </Container>
  );
};

export default PreRaceMenu;
