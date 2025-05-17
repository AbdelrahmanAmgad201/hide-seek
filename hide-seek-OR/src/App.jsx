import { useState, useRef } from 'react';
import sidebarImage from './assets/menu.png';
import './App.css';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [is2D, setIs2D] = useState(false);
  const [proximity, setProximity] = useState(false);
  const [n, setN] = useState(1);
  const [mode, setMode] = useState('interactive');

  // Refs to directly access DOM values
  const ref2D = useRef(null);
  const refProximity = useRef(null);
  const refN = useRef(null);
  const refModeInteractive = useRef(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleGenerate = () => {
    const newIs2D = ref2D.current.checked;
    const newProximity = refProximity.current.checked;
    const newN = parseInt(refN.current.value) || 1;
    const newMode = refModeInteractive.current.checked ? 'interactive' : 'analysis';

    setIs2D(newIs2D);
    setProximity(newProximity);
    setN(newN);
    setMode(newMode);

    // Example debug log
    console.log({ newIs2D, newProximity, newN, newMode });
  };

  return (
    <div className="container">
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className={`top-side-bar ${isCollapsed ? 'collapsedBtn' : ''}`}>
          <button className={`toggle-button`} onClick={toggleSidebar}>
            <img src={sidebarImage} alt="Toggle Sidebar" />
          </button>
        </div>

        {!isCollapsed && (
          <div className="sidebar-content">
            <h2 className="sidebar-title">Options</h2>

            <label className="sidebar-option">
              <input type="checkbox" ref={ref2D} defaultChecked={is2D} />
              2D
            </label>

            <label className="sidebar-option">
              <input type="checkbox" ref={refProximity} defaultChecked={proximity} />
              Proximity
            </label>

            <label className="sidebar-option">
              <p className="n-text">n =</p>
              <input type="number" min="1" defaultValue={n} ref={refN} className="number-input" />
            </label>

            <div className="sidebar-option">
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="interactive"
                  defaultChecked={mode === 'interactive'}
                  ref={refModeInteractive}
                />
                Interactive
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="analysis"
                  defaultChecked={mode === 'analysis'}
                />
                Analysis
              </label>
            </div>

            <button className="generate-button" onClick={handleGenerate}>
              Generate
            </button>
          </div>
        )}
      </div>

      <div className="main">
        <h1>Main Content Area</h1>
        <p>Settings applied:</p>
        <ul>
          <li>2D: {is2D ? 'Yes' : 'No'}</li>
          <li>Proximity: {proximity ? 'Yes' : 'No'}</li>
          <li>n: {n}</li>
          <li>Mode: {mode}</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
