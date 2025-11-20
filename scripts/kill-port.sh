#!/bin/bash

# Kill processes using a specific port
# Usage: ./scripts/kill-port.sh [port]

PORT=${1:-3000}

echo "Checking for processes using port $PORT..."

# Find processes using the port
PIDS=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PIDS" ]; then
  echo "No processes found using port $PORT"
  exit 0
fi

echo "Found processes: $PIDS"

# Show process details
echo ""
echo "Process details:"
ps aux | grep -E "$(echo $PIDS | sed 's/ /|/g')" | grep -v grep

echo ""
read -p "Kill these processes? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Killing processes..."
  kill -9 $PIDS 2>/dev/null
  echo "Port $PORT cleared"
else
  echo "Cancelled"
  exit 1
fi
