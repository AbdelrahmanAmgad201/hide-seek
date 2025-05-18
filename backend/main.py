from flask import Flask, request, jsonify
from flask_cors import CORS
from game import Game

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

game_instance = None

@app.route('/init', methods=['POST'])
def init_game():
    global game_instance
    data = request.get_json()
    n = data.get('n', 3) 
    is_2d = data.get('is_2d', True)
    apply_proximity = data.get('apply_proximity', True)
    game_instance = Game(n, is_2d=is_2d, apply_proximity=apply_proximity)
    return jsonify({
        "board": game_instance.board.tolist(),
        "originalBoard": game_instance.original.tolist()          
    }), 200

@app.route('/solve', methods=['POST'])
def solve_game():
    global game_instance
    if not game_instance:
        return jsonify({"error": "Game not initialized. Please initialize the game first."}), 400

    data = request.get_json()
    player = data.get('player')
    if player not in [1, 2]:
        return jsonify({"error": "Invalid player. Must be 1 (seeker) or 2 (hider)."}), 400

    try:
        result = game_instance.solve(player)
        result["probabilities"] = result["probabilities"].tolist()
        return jsonify({"player": player, "result": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
