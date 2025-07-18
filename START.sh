#!/bin/bash

# Resume Builder Pro v2.0 - Quick Start Script
# This script will set up and start the entire application

echo "🚀 Resume Builder Pro v2.0 - Quick Start"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
        
        # Check if version is 16 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt "16" ]; then
            print_error "Node.js version 16+ required. Please upgrade Node.js"
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is running
check_mongodb() {
    if command -v mongod &> /dev/null; then
        if pgrep -x "mongod" > /dev/null; then
            print_status "MongoDB is running"
        else
            print_warning "MongoDB is installed but not running"
            print_info "Starting MongoDB..."
            
            # Try to start MongoDB
            if command -v brew &> /dev/null; then
                brew services start mongodb-community 2>/dev/null || mongod --fork --logpath /tmp/mongod.log 2>/dev/null &
            else
                mongod --fork --logpath /tmp/mongod.log 2>/dev/null &
            fi
            
            sleep 3
            if pgrep -x "mongod" > /dev/null; then
                print_status "MongoDB started successfully"
            else
                print_error "Failed to start MongoDB. Please start it manually"
                exit 1
            fi
        fi
    else
        print_error "MongoDB not found. Please install MongoDB from https://www.mongodb.com/try/download/community"
        exit 1
    fi
}

# Setup environment file
setup_env() {
    print_info "Setting up environment configuration..."
    
    if [ ! -f "backend/.env" ]; then
        print_warning "Creating backend/.env file..."
        
        # Generate random secrets
        JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        
        cat > backend/.env << EOF
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/resume-builder

# Authentication
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
SESSION_SECRET=$SESSION_SECRET

# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI Service (Replace with your OpenAI API key)
OPENAI_API_KEY=your-openai-api-key-here

# Security
CORS_ORIGIN=http://localhost:3000
EOF
        
        print_status "Created backend/.env with secure random secrets"
        print_warning "⚠️  IMPORTANT: Add your OpenAI API key to backend/.env"
    else
        print_status "Backend .env file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing backend dependencies..."
    cd backend
    if npm install; then
        print_status "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    cd ../frontend
    print_info "Installing frontend dependencies..."
    if npm install; then
        print_status "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
}

# Initialize database
init_database() {
    print_info "Initializing database..."
    cd backend
    if npm run init-db; then
        print_status "Database initialized successfully"
        print_info "Demo account created: demo@resumebuilder.com / demo123"
    else
        print_error "Database initialization failed"
        exit 1
    fi
    cd ..
}

# Test API endpoints
test_api() {
    print_info "Testing API endpoints..."
    cd backend
    if npm test; then
        print_status "All API tests passed"
    else
        print_warning "Some API tests failed, but continuing..."
    fi
    cd ..
}

# Start the application
start_application() {
    print_info "Starting the application..."
    
    # Create start script for convenience
    cat > start_dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Resume Builder Pro v2.0"
echo "=================================="

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "📡 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend
echo "🌐 Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Application started successfully!"
echo "📱 Frontend: http://localhost:3000"
echo "📡 Backend:  http://localhost:5001"
echo "🔍 Health:   http://localhost:5001/health"
echo ""
echo "📝 Demo Account:"
echo "   Email:    demo@resumebuilder.com"
echo "   Password: demo123"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
EOF
    
    chmod +x start_dev.sh
    print_status "Created start_dev.sh script"
    
    print_info "To start the application, run: ./start_dev.sh"
    print_info "Or start manually:"
    print_info "  Terminal 1: cd backend && npm run dev"
    print_info "  Terminal 2: cd frontend && npm start"
}

# Main execution
main() {
    echo ""
    print_info "Step 1: Checking prerequisites..."
    check_node
    check_mongodb
    
    echo ""
    print_info "Step 2: Setting up environment..."
    setup_env
    
    echo ""
    print_info "Step 3: Installing dependencies..."
    install_dependencies
    
    echo ""
    print_info "Step 4: Initializing database..."
    init_database
    
    echo ""
    print_info "Step 5: Testing API..."
    test_api
    
    echo ""
    print_info "Step 6: Setting up start scripts..."
    start_application
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "================================"
    echo ""
    print_status "✅ All prerequisites met"
    print_status "✅ Environment configured"
    print_status "✅ Dependencies installed"
    print_status "✅ Database initialized"
    print_status "✅ API tested"
    print_status "✅ Start scripts created"
    echo ""
    print_warning "⚠️  Don't forget to add your OpenAI API key to backend/.env"
    echo ""
    print_info "🚀 Ready to start! Run: ./start_dev.sh"
    echo ""
}

# Run main function
main