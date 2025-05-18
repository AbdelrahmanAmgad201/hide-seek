function AnalysisResults({
    data, 
    seekerOptimal, 
    hideOptimal
}) 
{
    return (
        <>
            <h2>Optimal Strategy</h2>
            <div className="optimal-strategy-table-container">
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
            </div>
            
            {/* Game Value */}
            <div className="game-value">
            <h3>Expected Payoff = {hideOptimal.result.value.toFixed(3)}</h3>
            </div>
        </>
    )
}

export default AnalysisResults;