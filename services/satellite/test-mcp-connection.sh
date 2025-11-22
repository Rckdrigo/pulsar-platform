#!/bin/bash

# Test script for Satellite MCP Server HTTP connection
# This script verifies that the MCP server is properly responding to tool calls

API_KEY="sk-sat-mcp-2024-secure-development-key"
MCP_URL="http://localhost:8000/mcp"

echo "Testing Satellite MCP Server HTTP Connection..."
echo "================================================"
echo ""

# Test 1: Health check (no auth required)
echo "1. Testing health endpoint..."
curl -s http://localhost:8000/health | jq .
echo ""

# Test 2: List available tools
echo "2. Testing tools/list..."
curl -s -X POST "$MCP_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' | jq -r '.result.tools[] | "- \(.name): \(.description)"'
echo ""

# Test 3: Call get-current-date tool
echo "3. Testing get-current-date tool..."
curl -s -X POST "$MCP_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get-current-date",
      "arguments": {"timezone": "America/New_York"}
    }
  }' | jq .
echo ""

# Test 4: Call pulsar-health tool
echo "4. Testing pulsar-health tool..."
curl -s -X POST "$MCP_URL" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "pulsar-health",
      "arguments": {"includeDetails": true}
    }
  }' | jq .
echo ""

echo "================================================"
echo "Test complete!"
