import { useState, useEffect } from "react";

export function chooseIndexFromDistribution(probabilities) {
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (rand <= cumulative) {
            return i;
        }
    }
    return probabilities.length - 1; // Fallback for floating-point issues
}

export function simulateGames(
    hideOptimal,
    seekerOptimal,
    data,
    setSimulationData,
    setShowPopup,
    numGames = 100
) {
    if (!hideOptimal || !seekerOptimal || !data) return;

    const n = data.board.length;

    const hiderDistribution = Array(n).fill().map(() => Array(n).fill(0));
    const seekerDistribution = Array(n).fill().map(() => Array(n).fill(0));

    let totalScore = 0;
    let hiderWins = 0;
    let seekerWins = 0;

    for (let game = 0; game < numGames; game++) {
        const hiderChoice = chooseIndexFromDistribution(hideOptimal.result.probabilities);
        const seekerChoice = chooseIndexFromDistribution(seekerOptimal.result.probabilities);

        hiderDistribution[hiderChoice][seekerChoice]++;
        seekerDistribution[seekerChoice][hiderChoice]++;
        
        const gameScore = data.board[hiderChoice][seekerChoice];
        totalScore += gameScore;
        
        // Count wins for hider and seeker
        if (gameScore > 0) {
            hiderWins++;
        } else {
            seekerWins++;
        }
    }

    const averageScore = totalScore / numGames;

    const hiderPercentages = hiderDistribution.map(row => 
        row.map(cell => (cell / numGames) * 100)
    );

    const seekerPercentages = seekerDistribution.map(row => 
        row.map(cell => (cell / numGames) * 100)
    );

    const hiderRowTotals = hiderDistribution.map(row => 
        row.reduce((sum, cell) => sum + cell, 0)
    );

    const seekerRowTotals = seekerDistribution.map(row => 
        row.reduce((sum, cell) => sum + cell, 0)
    );

    const hiderColTotals = Array(n).fill(0);
    const seekerColTotals = Array(n).fill(0);

    for (let col = 0; col < n; col++) {
        for (let row = 0; row < n; row++) {
            hiderColTotals[col] += hiderDistribution[row][col];
            seekerColTotals[col] += seekerDistribution[row][col];
        }
    }

    setSimulationData({
        hiderDistribution,
        seekerDistribution,
        hiderPercentages,
        seekerPercentages,
        hiderRowTotals,
        seekerRowTotals,
        hiderColTotals,
        seekerColTotals,
        totalScore,
        averageScore,
        numGames,
        hiderWins,
        seekerWins
    });

    setShowPopup(true);
}

export function Simulation({ simulationData, setShowPopup, data }) {
  const [maxPercentage, setMaxPercentage] = useState(0);
  
  // Find max percentage for color scaling
  useEffect(() => {
    if (simulationData) {
      let max = 0;
        
        // Check hider percentages for the max
      simulationData.hiderPercentages.forEach(row => {
        row.forEach(percentage => {
          if (percentage > max) max = percentage;
        });
      });
        
      // Row and column totals could also contain the max value
      simulationData.hiderRowTotals.forEach(total => {
        const percentage = (total / simulationData.numGames * 100);
        if (percentage > max) max = percentage;
      });
        
      setMaxPercentage(max);
    }
  }, [simulationData]);

  // Helper function to calculate cell color based on value and max
  const getCellStyle = (percentage, isTotal = false) => {
    // Linear scaling from 0 (white) to maxPercentage (full color)
    const opacity = percentage / Math.max(1, maxPercentage);
    
    // If percentage is 0, make it pure white
    if (percentage === 0) {
      return {
        backgroundColor: 'white',
        color: 'black'
      };
    }
      
    const backgroundColor = isTotal 
      ? `rgba(100, 149, 237, ${opacity})` // Cornflower blue for totals
      : `rgba(255, 165, 0, ${opacity})`; // Orange for regular cells
    
    return {
      backgroundColor,
      color: opacity > 0.5 ? 'white' : 'black'
    };
  };

  return (
    <div className="simulation-popup">
      <div className="popup-content">
        <span className="close-button" onClick={() => setShowPopup(false)}>&times;</span>
        <h2>Strategy Simulation ({simulationData.numGames} Games)</h2>
        <p><strong>Total Score:</strong> {simulationData.totalScore}</p>
        <p><strong>Average Score:</strong> {simulationData.averageScore.toFixed(2)}</p>
        <p><strong>Hider Wins:</strong> {simulationData.hiderWins} ({(simulationData.hiderWins / simulationData.numGames * 100).toFixed(1)}%)</p>
        <p><strong>Seeker Wins:</strong> {simulationData.seekerWins} ({(simulationData.seekerWins / simulationData.numGames * 100).toFixed(1)}%)</p>

        <div className="simulation-container">
          <div className="distribution-section">
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
                            style={getCellStyle(percentage)}
                          >
                            {percentage.toFixed(1)}%
                          </td>
                        ))}
                        <td style={getCellStyle(
                          (simulationData.hiderRowTotals[rowIndex] / simulationData.numGames * 100), 
                          true
                        )}>
                        {(
                          simulationData.hiderRowTotals[rowIndex] /
                          simulationData.numGames *
                          100
                        ).toFixed(1)}%
                      </td>
                    </tr>
                ))}
                <tr>
                  <th>Total</th>
                  {simulationData.hiderColTotals.map((sum, colIndex) => (
                    <td 
                      key={colIndex}
                      style={getCellStyle(sum / simulationData.numGames * 100, true)}
                    >
                      {(sum / simulationData.numGames * 100).toFixed(1)}%
                    </td>
                    ))}
                    <td style={getCellStyle(100, true)}>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}