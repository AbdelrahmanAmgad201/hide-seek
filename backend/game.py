import numpy as np
from scipy.optimize import linprog


class Game:
    board = None
    N = None
    is_2d = None

    def __init__(self, n , is_2d= True , apply_proximity=True):
        if(is_2d == False):
            self.N = n
        else:
            self.N = n * n

        self.is_2d = is_2d
        self.board = np.random.choice([1, 2, 3], size=(self.N, self.N)).astype(float)

        print(self.board)
        for i in range(self.N):
            self.board[i][i] = self.board[i][i] * -1
        print(self.board)
        if apply_proximity:
           self.update_proximity()

    def update_proximity(self):
        if(self.is_2d == True):
            self.proximity_2d_strategy()
        else:
            self.proximity_1d_strategy()

    def proximity_2d_strategy(self):
        print("2D proximity strategy")
        for i in range(self.N):
            for j in range(self.N):
                if i == j:
                    continue
                modulu = np.sqrt(self.N)
                i_first , j_first = i // modulu, i % modulu
                i_second , j_second = j // modulu, j % modulu
                distance = abs(i_first - i_second) + abs(j_first - j_second)
                if distance == 1:
                    print(f"real point {i_first}, {j_first} and point {i_second}, {j_second} distance 1 at {i}, {j}")

                    self.board[i][j] = 0.5 * self.board[i][j]
                elif distance == 2:
                    print(f"real point {i_first}, {j_first} and point {i_second}, {j_second} distance 2 at {i}, {j}")
                    self.board[i][j] = 0.75 * self.board[i][j]
        

    def proximity_1d_strategy(self):
        print("1D proximity strategy")
        for i in range(self.N):
            for j in range(self.N):
                if i == j:
                    continue
                distance = abs(i - j)
                if distance == 1:
                    print("distance 1 at {} , {}".format(i, j))
                    self.board[i][j] = 0.5 * self.board[i][j]
                elif distance == 2:
                    print("distance 2 at {} , {}".format(i, j))
                    self.board[i][j] = 0.75 * self.board[i][j]

    def solve(self, player=1):
        if player not in [1, 2]:
            raise ValueError("Player must be either 1 (seeker) or 2 (hider).")

        return self.solve_engine(self.board, player)



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


G = Game(2 , is_2d= True)
print(G.board)

# board = [[3,  -1,  -3],
#          [ -2, 4,  -1],
#          [ -5,  -6, 2]]

# print(G.solve_engine(board, player=1))
# print(G.solve_engine(board, player=2))

print(G.solve(player=1))
print(G.solve(player=2))