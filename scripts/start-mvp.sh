#!/bin/bash

# PulseNet MVP Setup and Startup Script

echo "🚀 Setting up PulseNet MVP..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from project root
if [ ! -f "README.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "Prerequisites check passed"

# Setup contracts
print_status "Setting up smart contracts..."
cd contracts
if [ ! -d "node_modules" ]; then
    print_status "Installing contract dependencies..."
    npm install
fi

print_status "Compiling contracts..."
npx hardhat compile

print_status "Starting local blockchain..."
npx hardhat node --hostname 127.0.0.1 &
HARDHAT_PID=$!

# Wait for Hardhat to start
sleep 5

print_status "Deploying contracts..."
npx hardhat run scripts/deploy.js --network localhost

if [ $? -eq 0 ]; then
    print_success "Contracts deployed successfully"
else
    print_error "Contract deployment failed"
    kill $HARDHAT_PID 2>/dev/null
    exit 1
fi

cd ..

# Setup backend
print_status "Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating backend .env file..."
    cp .env.example .env
    print_warning "Please update the .env file with your configuration"
fi

print_status "Starting backend server..."
npm run dev &
BACKEND_PID=$!

cd ..

# Setup frontend
print_status "Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

print_status "Starting frontend application..."
npm run dev &
FRONTEND_PID=$!

cd ..

# Wait a moment for services to start
sleep 3

print_success "🎉 PulseNet MVP is now running!"
echo ""
echo "📋 Service URLs:"
echo "  🌐 Frontend:     http://localhost:3000"
echo "  🔧 Backend API:  http://localhost:3001"
echo "  ⛓️  Blockchain:   http://localhost:8545"
echo ""
echo "📖 Quick Start:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Connect your MetaMask wallet"
echo "  3. Add local network (Chain ID: 1337, RPC: http://localhost:8545)"
echo "  4. Import a test account from Hardhat console"
echo "  5. Start submitting health data!"
echo ""
echo "🛑 To stop all services, press Ctrl+C"

# Function to cleanup processes on exit
cleanup() {
    print_status "Stopping services..."
    kill $HARDHAT_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "All services stopped"
    exit 0
}

# Trap signals to cleanup
trap cleanup SIGINT SIGTERM

# Wait for user interrupt
wait
