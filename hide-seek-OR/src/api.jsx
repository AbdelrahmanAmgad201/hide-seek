// Sends a POST request to /init to initialize the game
export async function initGame({ n, is2D, proximity }) {
    try {
        const response = await fetch('http://localhost:5000/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                n: n,
                is_2d: is2D,
                apply_proximity: proximity,
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Initialization failed');
        return data;
    } catch (error) {
        console.error('Init error:', error);
        throw error;
    }
}

// Sends a POST request to /solve to solve the game for the specified player
export async function solveGame(player) {
    try {
        const response = await fetch('http://localhost:5000/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ player }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Solving failed');
        return data;
    } catch (error) {
        console.error('Solve error:', error);
        throw error;
    }
}
