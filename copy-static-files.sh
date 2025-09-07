#!/bin/bash

# Copy static files for Next.js standalone build
# This script should be run after 'pnpm build' and before starting the server

echo "🔄 Copying static files for standalone build..."

# Copy static files to standalone directory
if [ -d ".next/static" ]; then
    echo "📁 Copying .next/static to .next/standalone/.next/"
    cp -r .next/static .next/standalone/.next/
    echo "✅ Static files copied successfully"
else
    echo "❌ .next/static directory not found. Make sure to run 'pnpm build' first."
    exit 1
fi

# Copy public directory if it exists
if [ -d "public" ]; then
    echo "📁 Copying public directory to .next/standalone/"
    cp -r public .next/standalone/
    echo "✅ Public directory copied successfully"
else
    echo "ℹ️  No public directory found, skipping..."
fi

echo "🎉 All static files copied successfully!"
echo "💡 You can now start the server with PM2"
