#!/usr/bin/env python3

"""Simple CLI calculator with basic arithmetic operations."""

from __future__ import annotations

import argparse


def calculate(operation: str, left: float, right: float) -> float:
    if operation == "add":
        return left + right
    if operation == "subtract":
        return left - right
    if operation == "multiply":
        return left * right
    if operation == "divide":
        if right == 0:
            raise ValueError("Cannot divide by zero.")
        return left / right
    raise ValueError(f"Unsupported operation: {operation}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="A simple calculator for add, subtract, multiply, and divide."
    )
    parser.add_argument(
        "operation",
        nargs="?",
        choices=["add", "subtract", "multiply", "divide"],
        help="Arithmetic operation to perform.",
    )
    parser.add_argument("left", nargs="?", type=float, help="First number.")
    parser.add_argument("right", nargs="?", type=float, help="Second number.")
    return parser


def prompt_for_input() -> tuple[str, float, float]:
    print("Simple Calculator")
    print("Available operations: add, subtract, multiply, divide")
    operation = input("Operation: ").strip().lower()
    left = float(input("First number: ").strip())
    right = float(input("Second number: ").strip())
    return operation, left, right


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.operation is None:
        try:
            operation, left, right = prompt_for_input()
        except ValueError:
            print("Invalid number entered.")
            return 1
    else:
        if args.left is None or args.right is None:
            parser.error("left and right are required when operation is provided")
        operation, left, right = args.operation, args.left, args.right

    try:
        result = calculate(operation, left, right)
    except ValueError as exc:
        print(f"Error: {exc}")
        return 1

    print(f"Result: {result}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
