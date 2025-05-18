import { useState, useRef, useEffect } from 'react';
import './styles/boardMatrix.css';

export default function BoardMatrix({ data }) {
  const tableRef = useRef(null);
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  
  // Effect to handle initial scroll position
  useEffect(() => {
    if (tableRef.current && containerRef.current) {
      // Default to showing the first columns (left side) on initial render
      containerRef.current.scrollLeft = 0;
    }
  }, [data]);

  // Function to handle scrolling to start/end
  const scrollTo = (direction) => {
    if (containerRef.current) {
      if (direction === 'start') {
        containerRef.current.scrollLeft = 0;
      } else if (direction === 'end') {
        containerRef.current.scrollLeft = containerRef.current.scrollWidth;
      }
    }
  };

  // Update scroll position state for indicators
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition({
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop
      });
    }
  };

  // Calculate if there's more content to scroll to
  const hasMoreLeft = scrollPosition.x > 10;
  const hasMoreRight = containerRef.current 
    ? (containerRef.current.scrollWidth - containerRef.current.clientWidth - scrollPosition.x) > 10
    : false;

  // Check if the board is large enough to need scrolling
  const needsScrolling = data?.board && (data.board[0]?.length > 6 || data.board.length > 6);

  // Safety check if no data is provided
  if (!data || !data.board || !data.board.length) {
    return <div className="board-matrix-main"><h1>No board data available</h1></div>;
  }

  return (
    <div className="board-matrix-main">
      <h1>Board Matrix</h1>
      
      {/* Navigation controls - Only show if scrolling is needed */}
      {needsScrolling && (
        <div className="board-matrix-controls">
          <button 
            className="board-matrix-scroll-button"
            onClick={() => scrollTo('start')}
            disabled={!hasMoreLeft}
          >
            ← Start
          </button>
          
          <button 
            className="board-matrix-scroll-button"
            onClick={() => scrollTo('end')}
            disabled={!hasMoreRight}
          >
            End →
          </button>
        </div>
      )}
      
      {/* Board container with adaptive dimensions */}
      <div 
        className={`board-matrix-container ${!needsScrolling ? 'small-board' : ''}`}
        ref={containerRef}
        onScroll={handleScroll}
      >
        <table className="board-matrix-table" ref={tableRef}>
          <tbody>
            <tr className="board-matrix-header-row">
              <th className="board-matrix-corner-cell"></th>
              {data.board[0].map((_, colIndex) => (
                <th key={colIndex} className="board-matrix-column-header">S{colIndex + 1}</th>
              ))}
            </tr>
            {data.board.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th className="board-matrix-row-header">H{rowIndex + 1}</th>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="board-matrix-cell">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}