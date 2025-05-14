import numpy as np
from scipy.optimize import linprog


class Game:
    board = None
    N = None

    def __init__(self, n):
        self.N = n
        self.board = np.random.choice([1, 2, 3], size=(n, n))  # Random values {1, 2, 3}
        np.fill_diagonal(self.board, -1 * np.diag(self.board))  # Multiply diagonal by -1

    def solve(self, player=1):
        if player not in [1, 2]:
            raise ValueError("Player must be either 1 (seeker) or 2 (hider).")

        return self.solve_engine(self.board, player)

    def simulate(self, player=1, n=100):
        player_wins = 0
        computer_wins = 0
        player_score = 0
        computer_score = 0

        for _ in range(n):
            # Randomly choose who is the seeker (player or computer)
            current_player = np.random.choice([1, 2]) 
            result = self.solve_engine(self.board, player=current_player)

            if current_player == player:
                player_score += result["value"]
                if result["value"] > 0:
                    player_wins += 1
                else:
                    computer_wins += 1
            else:
                computer_score += result["value"]
                if result["value"] > 0:
                    computer_wins += 1
                else:
                    player_wins += 1

        print(f"Simulation Results after {n} rounds:")
        print(f"Player Wins: {player_wins}, Total Score: {player_score}")
        print(f"Computer Wins: {computer_wins}, Total Score: {computer_score}")

    def solve_engine(self, board, player=1):
        A = np.asarray(board, dtype=float)
        n, m = A.shape

        if player == 1:
            # decision vars = [p₁ … pₙ, v]  (n + 1 variables)
            c = np.r_[np.zeros(n), 1.0]
            A_ub = np.c_[A, -np.ones(m)]
            b_ub = np.zeros(m)
            A_eq = np.r_[np.ones(n), 0.0][None, :]
            b_eq = np.array([1.0])
            bounds = [(0, None)] * n + [(None, None)]

        elif player == 2:
            # decision vars = [q₁ … q_m, v]  (m + 1 variables)
            c = np.r_[np.zeros(m), -1.0]
            A_ub = np.c_[ -A.T, np.ones(n) ]
            b_ub = np.zeros(n)
            A_eq = np.r_[np.ones(m), 0.0][None, :]
            b_eq = np.array([1.0])
            bounds = [(0, None)] * m + [(None, None)]

        res = linprog(c, A_ub=A_ub, b_ub=b_ub,
                          A_eq=A_eq, b_eq=b_eq,
                          bounds=bounds, method="highs")

        if not res.success:
            raise RuntimeError(f"LP failed: {res.message}")

        strategy = res.x[:-1]      # probabilities
        value    = res.x[-1]       # result

        return {"probabilities": strategy, "value": value}


G = Game(3)
print(G.board)

# board = [[3,  -1,  -3],
#          [ -2, 4,  -1],
#          [ -5,  -6, 2]]

# print(G.solve_engine(board, player=1))
# print(G.solve_engine(board, player=2))

print(G.solve(player=1))
print(G.solve(player=2))
G.simulate(player=1, n=100)