import { useState, useRef, useEffect } from 'react';
import { initGame, solveGame } from './api';
import sidebarImage from './assets/menu.png';
import './App.css';

import './boardMatrix.css';
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
  const [showMatrix, setShowMatrix] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState({}); // { 3: 'user', 7: 'computer' }





  const ref2D = useRef(null);
  const refProximity = useRef(null);
  const refN = useRef(null);
  const refModeInteractive = useRef(null);
  const refModeAnalysis = useRef(null);
  const refRoleHide = useRef(null);
  const refRoleSeek = useRef(null);

  const handleTileClick = (index) => {
    if (index in selectedTiles) return; // Prevent duplicate clicks

    const newSelected = { ...selectedTiles, [index]: 'user' };

    // Computer picks a random unselected tile
    const availableIndices = world
      .map((_, i) => i)
      .filter((i) => !(i in newSelected));

    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      newSelected[randomIndex] = 'computer';
      console.log(`Computer chose index: ${randomIndex}`);
    }

    setSelectedTiles(newSelected);
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
    console.log('Initialized with settings:', newSettings, 'Response:', newData);

    const n = newSettings.n;
    const board = newData.board;
    const size = !newSettings.is2D ? n : n * n;
    const worldArray  = [];
      for (let j = 0; j < size; j++) {
        let neighborValue = j + 1;
        if (j + 1 >= size) {
          neighborValue = j - 1;
        } 
        const key = `${board[j][neighborValue]}:${board[j][j]*-1}`;
        worldArray [j] = images[key] || null; 
      }
      setWorld(worldArray);
    console.log('World grid with images:', worldArray );
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
{data && settings && (
  <div className="game-section">
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
                  style={{ cursor: ((i * settings.n + j) in selectedTiles) ? 'not-allowed' : 'pointer' }}
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
              style={{ cursor: (i in selectedTiles) ? 'not-allowed' : 'pointer' }}
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
      <div className="main">
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
      </div>
    )}
  </div>
)}




    </div>
  );
}

export default App;