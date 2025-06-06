import { useState, useRef, useEffect } from 'react';
import { initGame, solveGame } from './api';
import {Simulation, simulateGames,chooseIndexFromDistribution} from './simulation';
import BoardMatrix from './BoardMatrix';
import AnalysisResults from './AnalysisResults';
import AllImagesPopup from './AllImagesPopup';
import sidebarImage from './assets/menu.png';

import './styles/App.css';
import './styles/optimalStrat.css';
import './styles/simulate.css';
import './styles/gameGrid.css';

const images = {
  "1:1": 'src/assets/robber.png',
  "1:2": 'src/assets/farm-house.png',
  "1:3": 'src/assets/cave.png',
  "2:1": 'src/assets/farm.png',
  "2:2": 'src/assets/nurse.png',
  "2:3": 'src/assets/farmhouse.png',
  "3:1": 'src/assets/field.png',
  "3:2": 'src/assets/hay-bale.png',
  "3:3": 'src/assets/policeman.png',
};

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState(null);
  const [data, setData] = useState(null);
  const [world, setWorld] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState({}); // { 3: 'user', 7: 'computer' }
  const [hideOptimal, setHideOptimal] = useState(null);
  const [seekerOptimal, setSeekerOptimal] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [simulationCount, setSimulationCount] = useState(100);
  const [hiderScore, setHiderScore] = useState(0);
  const [seekerScore, setSeekerScore] = useState(0);
  const [hiderWins, setHiderWins] = useState(0);
  const [seekerWins, setSeekerWins] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const [showMatrix, setShowMatrix] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSimulationPopup, setShowSimulationPopup] = useState(false);

  const ref2D = useRef(null);
  const refProximity = useRef(null);
  const refN = useRef(null);
  const refModeInteractive = useRef(null);
  const refModeAnalysis = useRef(null);
  const refRoleHide = useRef(null);
  const refRoleSeek = useRef(null);

  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSnackbar]);

  const showMessage = (message) => {
    setSnackbarMessage(message);
    setShowSnackbar(true);
  };

  const handleTileClick = (index) => {
    if (settings.mode !== 'interactive') return;
    
    // User makes their move
    const newSelected = { ...selectedTiles };
    newSelected[index] = 'user';
    
    // Computer picks a tile based on optimal strategy
    let computerIndex = 0;
    if (settings.role === "seeker") {
      computerIndex = chooseIndexFromDistribution(hideOptimal.result.probabilities);
    } else {
      computerIndex = chooseIndexFromDistribution(seekerOptimal.result.probabilities);
    }
    
    newSelected[computerIndex] = 'computer';
    
    // Calculate payoff
    const payoff = data.board;
    const result = payoff[index][computerIndex];
    
    // Update scores
    setSeekerScore(prev => prev - result);
    setHiderScore(prev => prev + result);
    setGamesPlayed(prev => prev + 1);
    
    // Update win counts
    if (index === computerIndex) {
      // Same location - seeker wins
      setSeekerWins(prev => prev + 1);
    } else {
      // Different locations - hider wins
      setHiderWins(prev => prev + 1);
    }
    
    // Update selected tiles
    setSelectedTiles(newSelected);
    
    // Show appropriate message
    if (settings.role === 'hide') {
      if (index === computerIndex) {
        showMessage('Seeker caught you!');
      } else {
        showMessage('You hid successfully!');
      }
    } else if (settings.role === 'seek') {
      if (index === computerIndex) {
        showMessage('You found the hider successfully!');
      } else {
        showMessage('You didn\'t find the hider.');
      }
    }
    
    // Clear selections after a short delay
    setTimeout(() => {
      setSelectedTiles({});
      
      // Show guidance message for next move
      if (settings.role === 'hide') {
        showMessage('Choose where to hide');
      } else {
        showMessage('Choose where to search');
      }
    }, 1500);
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newCollapsed = !prev;
      // If we're opening the sidebar and settings exist, apply them
      if (!newCollapsed && settings) {
        setTimeout(() => {
          ref2D.current.checked = settings.is2D;
          refProximity.current.checked = settings.proximity;
          refN.current.value = settings.n;
          refModeInteractive.current.checked = settings.mode === 'interactive';
          refModeAnalysis.current.checked = settings.mode === 'analysis';
          if (refRoleHide.current && refRoleSeek.current) {
            refRoleHide.current.checked = settings.role === 'hide';
            refRoleSeek.current.checked = settings.role === 'seek';
          }
        }, 0); // Ensure DOM is updated before setting
      }
      return newCollapsed;
    });
  };
  
  const handleGenerate = async () => {
    setSelectedTiles({});  
    setHiderScore(0);
    setSeekerScore(0);
    setHiderWins(0);
    setSeekerWins(0);
    setGamesPlayed(0);

    const newSettings = {
      is2D: ref2D.current.checked,
      proximity: refProximity.current.checked,
      n: parseInt(refN.current.value) || 1,
      mode: refModeInteractive.current.checked ? 'interactive' : 'analysis',
      role: refModeInteractive.current.checked ? 
        (refRoleHide.current.checked ? 'hide' : 'seek') : null
    };
    setSettings(newSettings);
    const newData = await initGame(newSettings)
    setData(newData);
    setSeekerOptimal(await solveGame(1));
    setHideOptimal(await solveGame(2));
  
    console.log('Initialized with settings:', newSettings, 'Response:', newData);

    const n = newSettings.n;
    const board = newData.originalBoard;
    const size = !newSettings.is2D ? n : n * n;
    const worldArray = [];
    for (let j = 0; j < size; j++) {
      let neighborValue = j + 1;
      if (j + 1 >= size) {
        neighborValue = j - 1;
      } 
      const key = `${board[j][neighborValue]}:${board[j][j]*-1}`;
      worldArray[j] = images[key] || null; 
    }
    setWorld(worldArray);
    console.log('World grid with images:', worldArray);
    
    // Show initial guidance message
    if (newSettings.mode === 'interactive') {
      setTimeout(() => {
        if (newSettings.role === 'hide') {
          showMessage('Choose where to hide');
        } else {
          showMessage('Choose where to search');
        }
      }, 500);
    }
  };

  return (
    <div className="container">
      <button
        className="info-icon"
        onClick={() => setShowPopup(true)}
        title="Show all images"
      >
        🖼️
      </button>

      {showPopup && (
        <AllImagesPopup 
          setShowPopup={setShowPopup}
          images={images}
        />
      )}

      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className={`top-side-bar ${isCollapsed ? 'collapsedBtn' : ''}`}>
          <button className="toggle-button" onClick={toggleSidebar}>
            <img src={sidebarImage} alt="Toggle Sidebar" />
          </button>
        </div>

        {!isCollapsed && (
          <div className="sidebar-content">
            <h2 className="sidebar-title">Options</h2>

            <label className="sidebar-option">
              <input type="checkbox" ref={ref2D} />
              2D
            </label>

            <label className="sidebar-option">
              <input type="checkbox" ref={refProximity} />
              Proximity
            </label>

            <label className="sidebar-option">
              <p className="n-text">n =</p>
              <input type="number" min="1" defaultValue={1} ref={refN} className="number-input" />
            </label>

            <div className="sidebar-option">
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="interactive"
                  ref={refModeInteractive}
                  onChange={() => {
                    const roleOptions = document.getElementById("role-options");
                    if (roleOptions) roleOptions.style.display = "block";
                  }}
                />
                Interactive
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="analysis"
                  defaultChecked
                  ref={refModeAnalysis}
                  onChange={() => {
                    const roleOptions = document.getElementById("role-options");
                    if (roleOptions) roleOptions.style.display = "none";
                  }}
                />
                Analysis
              </label>
            </div>

            <div id="role-options" className="sidebar-option" style={{
              display: refModeInteractive?.current?.checked ? "block" : "none"
            }}>
              <p>Choose your role:</p>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="hide"
                  defaultChecked
                  ref={refRoleHide}
                />
                Hide
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="seek"
                  ref={refRoleSeek}
                />
                Seek
              </label>
            </div>

            <button className="generate-button" onClick={handleGenerate}>
              Generate
            </button>
          </div>
        )}
      </div>

      {data && settings && (
        <div className="game-section">
          {settings.mode === 'interactive' && (
            <div className="score-display">
              <p><strong>Seeker Wins:</strong> {seekerWins}</p>
              <p><strong>Hider Wins:</strong> {hiderWins}</p>
              <p><strong>Hider Score:</strong> {hiderScore}</p>
              <p><strong>Seeker Score:</strong> {seekerScore}</p>
              <p><strong>Games Played:</strong> {gamesPlayed}</p>
            </div>
          )}

          {/* Snackbar */}
          {settings.mode === 'interactive' && (
            <div className={`snackbar ${showSnackbar ? 'show' : ''}`}>
              {snackbarMessage}
            </div>
          )}

          {/* Image Grid */}
          <div className="world-grid">
            {settings.is2D ? (
              <div className="grid-2d">
                {Array.from({ length: settings.n }, (_, i) => (
                  <div key={i} className="row">
                    {world.slice(i * settings.n, (i + 1) * settings.n).map((imgSrc, j) => (
                      <img
                        key={j}
                        src={imgSrc}
                        alt={`Tile ${i},${j}`}
                        className={`tile-img ${selectedTiles[i * settings.n + j] === 'user' ? 'user-selected' : selectedTiles[i * settings.n + j] === 'computer' ? 'computer-selected' : ''}`}
                        onClick={() => handleTileClick(i * settings.n + j)}
                        style={{ cursor: settings.mode === 'analysis' ? 'not-allowed' : 'pointer' }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="row">
                {world.map((imgSrc, i) => (
                  <img
                    key={i}
                    src={imgSrc}
                    alt={`Tile ${i}`}
                    className={`tile-img ${selectedTiles[i] === 'user' ? 'user-selected' : selectedTiles[i] === 'computer' ? 'computer-selected' : ''}`}
                    onClick={() => handleTileClick(i)}
                    style={{ cursor: settings.mode === 'analysis' ? 'not-allowed' : 'pointer' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button className="toggle-matrix-button" onClick={() => setShowMatrix(prev => !prev)}>
            {showMatrix ? "Hide Matrix" : "Show Matrix"}
          </button>

          {/* Matrix Table */}
          {showMatrix && (
            <BoardMatrix 
              data={data} 
            />
          )}
    
          {/* Analysis Results */}
          {settings && settings.mode === 'analysis' && 
          hideOptimal != null && seekerOptimal != null && (
            <div className="analysis-results">
              <AnalysisResults 
                data={data}
                hideOptimal={hideOptimal}
                seekerOptimal={seekerOptimal}
              />
              
              {/* Simulation controls */}
              <div className="simulation-controls">
                <button
                  className="simulation-button"
                  onClick={() =>
                    simulateGames(
                      hideOptimal,
                      seekerOptimal,
                      data,
                      setSimulationData,
                      setShowSimulationPopup,
                      simulationCount        // <-- passes the user‑chosen N
                    )
                  }
                >
                  Run Simulation
                </button>
                <input
                  className="simulation-input"
                  type="number"
                  min="1"
                  value={simulationCount}
                  onChange={(e) => setSimulationCount(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Simulation Popup */}
      {showSimulationPopup && simulationData && (
        <Simulation 
          simulationData={simulationData} 
          data={data} 
          setShowPopup={setShowSimulationPopup} 
        />
      )}
    </div>
  );
}

export default App;