import { useState, useRef } from 'react';
import sidebarImage from './assets/menu.png';
import './App.css';
images = [
          'src\assets\robber.png',
          'src\assets\farm-house.png',
          'src\assets\cave.png',
          'src\assets\farm.png',
          'src\assets\nurse.png',
          'src\assets\farmhouse.png',
          'src\assets\field.png',
          'src\assets\hay-bale.png',
          'src\assets\policeman.png',
]

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [settings, setSettings] = useState(null);
  const [imageMap, setImageMap] = useState({});

  const ref2D = useRef(null);
  const refProximity = useRef(null);
  const refN = useRef(null);
  const refModeInteractive = useRef(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleGenerate = () => {
    const newSettings = {
      is2D: ref2D.current.checked,
      proximity: refProximity.current.checked,
      n: parseInt(refN.current.value) || 1,
      mode: refModeInteractive.current.checked ? 'interactive' : 'analysis',
    };

    setSettings(newSettings);
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
                  defaultChecked
                  ref={refModeInteractive}
                />
                Interactive
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="analysis"
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

    
    </div>
  );
}

export default App;
