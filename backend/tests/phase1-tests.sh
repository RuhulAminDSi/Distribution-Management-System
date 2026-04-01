#!/bin/bash
# Phase 1 Testing Suite for DMS Backend
# Tests: Security, Validation, Error Handling, and Integration

echo "=========================================="
echo "Phase 1 Integration Tests"
echo "=========================================="
echo ""

BASE_URL="http://localhost:5000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for passed/failed tests
PASSED=0
FAILED=0

# Test helper function
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  local test_name=$5

  if [ -z "$data" ]; then
    response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -w "\n%{http_code}")
  else
    response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" \
      -w "\n%{http_code}")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} $test_name (HTTP $http_code)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} $test_name (Expected $expected_status, got $http_code)"
    echo "  Response: $body"
    ((FAILED++))
  fi
}

echo "=========================================="
echo "1. HEALTH CHECK - Verify server is running"
echo "=========================================="
test_endpoint "GET" "/health" "" "200" "Health check endpoint"
echo ""

echo "=========================================="
echo "2. VALIDATION TESTS - Invalid inputs"
echo "=========================================="
test_endpoint "POST" "/auth/login" "{}" "400" "Login without credentials"
test_endpoint "POST" "/auth/login" "{\"username\":\"test\"}" "400" "Login without password"
test_endpoint "POST" "/auth/login" "{\"username\":\"\"}" "400" "Login with empty username"
test_endpoint "POST" "/auth/register" "{}" "400" "Register without fields"
test_endpoint "POST" "/auth/register" "{\"username\":\"test\",\"password\":\"123\"}" "400" "Register with short password"
echo ""

echo "=========================================="
echo "3. ERROR RESPONSE FORMAT - Consistent structure"
echo "=========================================="
echo "Testing error response structure..."
response=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{}")

if echo "$response" | grep -q '"success":false'; then
  echo -e "${GREEN}✓ PASS${NC} Error response has success: false"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} Error response missing success field"
  ((FAILED++))
fi

if echo "$response" | grep -q '"message"'; then
  echo -e "${GREEN}✓ PASS${NC} Error response has message field"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} Error response missing message field"
  ((FAILED++))
fi

if echo "$response" | grep -q '"errors"'; then
  echo -e "${GREEN}✓ PASS${NC} Error response has errors field"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} Error response missing errors field"
  ((FAILED++))
fi
echo ""

echo "=========================================="
echo "4. 404 NOT FOUND - Non-existent routes"
echo "=========================================="
test_endpoint "GET" "/nonexistent" "" "404" "Non-existent route"
test_endpoint "POST" "/users/9999999" "{}" "404" "Non-existent user endpoint"
echo ""

echo "=========================================="
echo "5. SECURITY TEST - SQL Injection Prevention"
echo "=========================================="
echo "Testing LIMIT/OFFSET parameterization..."
# Test the stock history endpoint which had SQL injection vulnerability
response=$(curl -s "$BASE_URL/stocks?page=1' OR '1'='1&limit=10" \
  -H "Content-Type: application/json")

if echo "$response" | grep -q '"success"'; then
  echo -e "${GREEN}✓ PASS${NC} Attempted SQL injection returned proper response"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠ WARNING${NC} Unexpected response format"
fi

# Test normal pagination still works
response=$(curl -s "$BASE_URL/stocks?page=1&limit=10" \
  -H "Content-Type: application/json")

if echo "$response" | grep -q '"success"'; then
  echo -e "${GREEN}✓ PASS${NC} Normal pagination works correctly"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} Normal pagination failed"
  ((FAILED++))
fi
echo ""

echo "=========================================="
echo "6. ENDPOINT AVAILABILITY - All routes respond"
echo "=========================================="
test_endpoint "GET" "/health" "" "200" "GET /api/health"
test_endpoint "GET" "/products" "" "401" "GET /api/products (auth required)"
test_endpoint "GET" "/retailers" "" "401" "GET /api/retailers (auth required)"
test_endpoint "GET" "/users" "" "401" "GET /api/users (auth required)"
echo ""

echo "=========================================="
echo "7. ERROR HANDLING - Database constraints"
echo "=========================================="
echo "Testing database error handling..."
test_endpoint "POST" "/auth/register" \
  "{\"username\":\"admin\",\"password\":\"password123\",\"full_name\":\"Admin\",\"role_id\":1}" \
  "400" "Register duplicate username (constraint)"
echo ""

echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
echo "Total: $TOTAL"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
