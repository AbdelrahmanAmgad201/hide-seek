export function simulateGames(
    hideOptimal, 
    seekerOptimal, 
    data, 
    setSimulationData, 
    setShowPopup
)
{
    if (!hideOptimal || !seekerOptimal || !data) return;
    
    const numGames = 100;
    const n = data.board.length;
    
    // Initialize counters for each cell
    const hiderDistribution = Array(n).fill().map(() => Array(n).fill(0));
    const seekerDistribution = Array(n).fill().map(() => Array(n).fill(0));
    
    // Simulate 100 games
    for (let game = 0; game < numGames; game++) {
      // Simulate hider's choice based on optimal strategy probabilities
      let hiderRandom = Math.random();
      let hiderChoice = 0;
      let cumulativeProbH = 0;
      
      for (let i = 0; i < hideOptimal.result.probabilities.length; i++) {
        cumulativeProbH += hideOptimal.result.probabilities[i];
        if (hiderRandom <= cumulativeProbH) {
          hiderChoice = i;
          break;
        }
      }
      
      // Simulate seeker's choice based on optimal strategy probabilities
      let seekerRandom = Math.random();
      let seekerChoice = 0;
      let cumulativeProbS = 0;
      
      for (let i = 0; i < seekerOptimal.result.probabilities.length; i++) {
        cumulativeProbS += seekerOptimal.result.probabilities[i];
        if (seekerRandom <= cumulativeProbS) {
          seekerChoice = i;
          break;
        }
      }
      
      // Record the outcome
      hiderDistribution[hiderChoice][seekerChoice]++;
      seekerDistribution[seekerChoice][hiderChoice]++;
    }
    
    // Calculate percentage distributions
    const hiderPercentages = hiderDistribution.map(row => 
      row.map(cell => (cell / numGames) * 100)
    );
    
    const seekerPercentages = seekerDistribution.map(row => 
      row.map(cell => (cell / numGames) * 100)
    );
    
    // Row and column totals for hider and seeker
    const hiderRowTotals = hiderDistribution.map(row => 
      row.reduce((sum, cell) => sum + cell, 0)
    );
    
    const seekerRowTotals = seekerDistribution.map(row => 
      row.reduce((sum, cell) => sum + cell, 0)
    );
    
    setSimulationData({
      hiderDistribution,
      seekerDistribution,
      hiderPercentages,
      seekerPercentages,
      hiderRowTotals,
      seekerRowTotals,
      numGames
    });
    
    setShowPopup(true);
  };


export function Simulation({simulationData, setShowPopup, data}) {
    return (
        <div className="simulation-popup">
            <div className="popup-content">
            <span className="close-button" onClick={() => setShowPopup(false)}>&times;</span>
            <h2>Strategy Simulation (100 Games)</h2>
            
            <div className="simulation-container">
                {/* Hider's Distribution */}
                <div className="distribution-section">
                <h3>Hider's Position Distribution</h3>
                <table className="distribution-table">
                    <tbody>
                    <tr>
                        <th></th>
                        {data.board[0].map((_, colIndex) => (
                        <th key={colIndex}>S{colIndex + 1}</th>
                        ))}
                        <th>Total</th>
                    </tr>
                    {simulationData.hiderPercentages.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                        <th>H{rowIndex + 1}</th>
                        {row.map((percentage, colIndex) => (
                            <td 
                            key={colIndex}
                            style={{ 
                                backgroundColor: `rgba(255, 165, 0, ${percentage / 100})`,
                                color: percentage > 50 ? 'white' : 'black'
                            }}
                            >
                            {percentage.toFixed(1)}%
                            </td>
                        ))}
                        <td>{simulationData.hiderRowTotals[rowIndex]}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
                
                {/* Seeker's Distribution */}
                <div className="distribution-section">
                <h3>Seeker's Position Distribution</h3>
                <table className="distribution-table">
                    <tbody>
                    <tr>
                        <th></th>
                        {data.board[0].map((_, colIndex) => (
                        <th key={colIndex}>H{colIndex + 1}</th>
                        ))}
                        <th>Total</th>
                    </tr>
                    {simulationData.seekerPercentages.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                        <th>S{rowIndex + 1}</th>
                        {row.map((percentage, colIndex) => (
                            <td 
                            key={colIndex}
                            style={{ 
                                backgroundColor: `rgba(255, 165, 0, ${percentage / 100})`,
                                color: percentage > 50 ? 'white' : 'black'
                            }}
                            >
                            {percentage.toFixed(1)}%
                            </td>
                        ))}
                        <td>{simulationData.seekerRowTotals[rowIndex]}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            </div>
        </div>
    )
}