#!/bin/bash

# Test script for Satellite MCP Server Docker HTTP setup
# Usage: ./test-docker-http.sh [port] [api-key]

set -e

# Configuration
PORT="${1:-33000}"
API_KEY="${2:-sk-sat-mcp-2024-secure-development-key}"
BASE_URL="http://localhost:${PORT}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Satellite MCP Server - Docker HTTP Test"
echo "=========================================="
echo "Port: ${PORT}"
echo "API Key: ${API_KEY:0:20}..."
echo "Base URL: ${BASE_URL}"
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local auth=$5

    echo -n "Testing ${name}... "

    if [ "$method" = "GET" ]; then
        if response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}"); then
            http_code=$(echo "$response" | tail -n1)
            body=$(echo "$response" | sed '$d')

            if [ "$http_code" = "200" ]; then
                echo -e "${GREEN}✓ PASSED${NC}"
                echo "  Response: ${body}" | head -n 1
            else
                echo -e "${RED}✗ FAILED (HTTP ${http_code})${NC}"
                echo "  Response: ${body}"
                return 1
            fi
        else
            echo -e "${RED}✗ FAILED (Connection error)${NC}"
            return 1
        fi
    elif [ "$method" = "POST" ]; then
        if [ "$auth" = "true" ]; then
            headers="-H 'Content-Type: application/json' -H 'X-API-Key: ${API_KEY}'"
        else
            headers="-H 'Content-Type: application/json'"
        fi

        if response=$(eval curl -s -w "\n%{http_code}" -X POST ${headers} -d "'${data}'" "${BASE_URL}${endpoint}"); then
            http_code=$(echo "$response" | tail -n1)
            body=$(echo "$response" | sed '$d')

            if [ "$http_code" = "200" ]; then
                echo -e "${GREEN}✓ PASSED${NC}"
                echo "  Response: ${body}" | head -n 3
            elif [ "$http_code" = "401" ] && [ "$auth" != "true" ]; then
                echo -e "${YELLOW}⚠ Expected (requires auth)${NC}"
                echo "  Response: ${body}"
            else
                echo -e "${RED}✗ FAILED (HTTP ${http_code})${NC}"
                echo "  Response: ${body}"
                return 1
            fi
        else
            echo -e "${RED}✗ FAILED (Connection error)${NC}"
            return 1
        fi
    fi

    echo ""
}

# Check if container is running
echo "Checking Docker container status..."
if docker ps --filter "name=satellite-mcp" --format "{{.Names}}" | grep -q "satellite-mcp"; then
    echo -e "${GREEN}✓ Container is running${NC}"
    echo ""
else
    echo -e "${RED}✗ Container is not running${NC}"
    echo ""
    echo "Start the container with:"
    echo "  docker-compose up -d satellite-mcp"
    echo ""
    exit 1
fi

# Test 1: Health check endpoint (no auth)
test_endpoint "Health Check" "GET" "/health" "" "false"

# Test 2: Root endpoint (no auth)
test_endpoint "Root Endpoint" "GET" "/" "" "false"

# Test 3: MCP endpoint without auth (should fail)
mcp_request='{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
test_endpoint "MCP without Auth" "POST" "/mcp" "$mcp_request" "false"

# Test 4: MCP endpoint with auth - list tools
test_endpoint "MCP List Tools" "POST" "/mcp" "$mcp_request" "true"

# Test 5: MCP endpoint with auth - get current date
date_request='{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get-current-date","arguments":{"timezone":"America/New_York"}}}'
test_endpoint "MCP Get Date Tool" "POST" "/mcp" "$date_request" "true"

# Test 6: MCP endpoint with auth - pulsar health check
health_request='{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"pulsar-health","arguments":{"includeDetails":true}}}'
test_endpoint "MCP Pulsar Health Tool" "POST" "/mcp" "$health_request" "true"

# Test 7: Check container logs for errors
echo "Checking container logs for errors..."
if docker logs satellite-mcp 2>&1 | tail -n 20 | grep -i "error\|fatal" > /dev/null; then
    echo -e "${YELLOW}⚠ Warnings/Errors found in logs:${NC}"
    docker logs satellite-mcp 2>&1 | tail -n 10 | grep -i "error\|fatal"
    echo ""
else
    echo -e "${GREEN}✓ No critical errors in logs${NC}"
    echo ""
fi

# Test 8: Check health status via Docker
echo "Checking Docker health status..."
health_status=$(docker inspect satellite-mcp --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
if [ "$health_status" = "healthy" ]; then
    echo -e "${GREEN}✓ Container health status: ${health_status}${NC}"
elif [ "$health_status" = "starting" ]; then
    echo -e "${YELLOW}⚠ Container health status: ${health_status}${NC}"
else
    echo -e "${RED}✗ Container health status: ${health_status}${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "All basic tests completed."
echo ""
echo "Next steps:"
echo "  1. View container logs: docker logs -f satellite-mcp"
echo "  2. Inspect container: docker inspect satellite-mcp"
echo "  3. Execute commands: docker exec -it satellite-mcp sh"
echo "  4. Check resource usage: docker stats satellite-mcp"
echo ""
echo "Integration endpoints:"
echo "  Health: ${BASE_URL}/health"
echo "  MCP API: ${BASE_URL}/mcp"
echo ""
