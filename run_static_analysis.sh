#!/bin/bash
set -e

echo "🔎 Running Bandit (Django backend)..."
if docker run --rm -v "$PWD/backend":/app python:3.11 bash -c "\
  pip install bandit > /dev/null && bandit -r /app -f sarif -o /reports/bandit.sarif"; then
  echo "✅ Bandit analysis complete."
else
  echo "❌ Bandit failed." >&2
fi

echo "🔎 Running ESLint (Vanilla JS frontend)..."
if docker run --rm -v "$PWD":/app -w /app node:18 bash -c "\
  npm install -g eslint > /dev/null && \
  eslint frontend/ --ext .js -f sarif -o reports/eslint.sarif"; then
  echo "✅ ESLint analysis complete."
else
  echo "❌ ESLint failed." >&2
fi

echo "🎉 Static analysis script finished."