import { useState, useRef, useEffect } from 'react';
import { initGame, solveGame } from './api';
import {Simulation, simulateGames} from './simulation';
import sidebarImage from './assets/menu.png';
import './App.css';
import './optimalStrat.css';
import './boardMatrix.css';
import './simulate.css'

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
  const [hideOptimal, setHideOptimal] = useState(null);
  const [seekerOptimal, setSeekerOptimal] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [simulationData, setSimulationData] = useState(null);

  const ref2D = useRef(null);
  const refProximity = useRef(null);
  const refN = useRef(null);
  const refModeInteractive = useRef(null);
  const refModeAnalysis = useRef(null);
  const refRoleHide = useRef(null);
  const refRoleSeek = useRef(null);

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
    const board = newData.board;
    const world = [];
      for (let j = 0; j < n; j++) {
        let neighborValue = j + 1;
        if (j + 1 >= n) {
          neighborValue = j - 1;
        } 
        console.log(neighborValue)
        const key = `${board[j][neighborValue]}:${board[j][j]*-1}`;
        console.log(key)
        world[j] = images[key] || null; 
      }
    console.log('World grid with images:', world);
  };

  return (
    <div className="container">
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

      {settings != null && data != null && 
        <div className="main">
          {/* Game Matrix */}
          <h1>Board Matrix</h1>
          <table className="board-table">
            <tbody>
              <tr>
                <th></th>
                {data.board[0].map((_, colIndex) => (
                  <th key={colIndex}>S{colIndex + 1}</th>
                ))}
              </tr>
              {data.board.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <th>H{rowIndex + 1}</th>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Analysis Results */}
          {settings.mode === 'analysis' && 
           hideOptimal != null && seekerOptimal != null && (
            <div className="analysis-results">
              <h2>Optimal Strategy</h2>
              
              <table className="optimal-strategy-table">
                <tbody>
                  {/* Header row with column labels */}
                  <tr>
                    <th></th>
                    {data.board[0].map((_, colIndex) => (
                      <th key={colIndex}>S{colIndex + 1}</th>
                    ))}
                  </tr>
                  
                  {/* Seeker probabilities row */}
                  <tr>
                    <th>Seeker</th>
                    {seekerOptimal.result.probabilities.map((prob, index) => (
                      <td key={index}>{(prob * 100).toFixed(1)}%</td>
                    ))}
                  </tr>
                  
                  {/* Hider probabilities row */}
                  <tr>
                    <th>Hider</th>
                    {hideOptimal.result.probabilities.map((prob, index) => (
                      <td key={index}>{(prob * 100).toFixed(1)}%</td>
                    ))}
                  </tr>
                </tbody>
              </table>
              
              {/* Game Value */}
              <div className="game-value">
                <h3>Expected Payoff = {hideOptimal.result.value.toFixed(3)}</h3>
              </div>
              
              {/* Simulation Button */}
              <button 
                className="simulation-button" 
                onClick={() => simulateGames(
                  hideOptimal, 
                  seekerOptimal, 
                  data, 
                  setSimulationData, 
                  setShowPopup
                )}
              >
                Run Strategy Simulation
              </button>
            </div>
          )}
          
          {/* Simulation Popup */}
          {showPopup && simulationData && (
            <Simulation 
              simulationData={simulationData} 
              data={data} 
              setShowPopup={setShowPopup} 
            />
          )}
        </div>
      }
    </div>
  );
}

export default App;