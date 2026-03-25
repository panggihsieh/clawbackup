#!/usr/bin/env python3
"""Simple Flask web calculator."""

import math
import re
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


def safe_eval(expr: str) -> float:
    """Safely evaluate a mathematical expression."""
    # Only allow numbers, operators, parentheses, and decimal points
    if not re.match(r'^[\d\s\+\-\*/\.()]+$', expr):
        raise ValueError("Invalid characters in expression")
    
    # Replace × with * and ÷ with /
    expr = expr.replace('×', '*').replace('÷', '/')
    
    # Use eval with restricted globals for safety
    result = eval(expr, {"__builtins__": {}, "math": math}, {})
    return result


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    expr = data.get('expression', '')
    
    try:
        result = safe_eval(expr)
        return jsonify({'result': result})
    except ZeroDivisionError:
        return jsonify({'error': 'Cannot divide by zero'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)