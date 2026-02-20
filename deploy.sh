#!/bin/bash

echo "🐻 Deploying Wombat Tower Defense..."

# Build server
echo "📦 Building server..."
cd server
npm run build
cd ..

# Build client
echo "🎨 Building client..."
cd client
npm run build
cd ..

# Create static directory
echo "📂 Setting up static files..."
mkdir -p server/dist/public
cp -r client/dist/* server/dist/public/

# Update server to serve static files
echo "⚙️  Configuring server..."

# Create logs directory
mkdir -p logs

echo "✅ Build complete!"
echo ""
echo "To start the server:"
echo "  pm2 start ecosystem.config.js"
echo ""
echo "Or for development:"
echo "  cd server && npm run dev"
echo "  cd client && npm run dev"
