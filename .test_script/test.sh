#!/bin/bash
# Full Integration Test for DMS
# Tests: Login, Logout, Create, Update, CRUD operations

BASE_URL="http://localhost:5000/api"
COOKIE_FILE="/tmp/dms_test_cookie.txt"

echo "=========================================="
echo "DMS Full Integration Test"
echo "=========================================="
echo ""

PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_result() {
  local status=$1
  local test_name=$2
  if [ "$status" = "0" ]; then
    echo -e "${GREEN}✓ PASS${NC} $test_name"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} $test_name"
    ((FAILED++))
  fi
}

http_test() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_pattern=$4
  local test_name=$5
  
  if [ -z "$data" ]; then
    response=$(curl -s -X "$method" "$BASE_URL$endpoint" -b "$COOKIE_FILE" -c "$COOKIE_FILE" -w "\n%{http_code}")
  else
    response=$(curl -s -X "$method" "$BASE_URL$endpoint" -b "$COOKIE_FILE" -c "$COOKIE_FILE" -H "Content-Type: application/json" -d "$data" -w "\n%{http_code}")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if echo "$body" | grep -q "$expected_pattern"; then
    test_result 0 "$test_name"
    return 0
  else
    test_result 1 "$test_name"
    echo "  Response: $body"
    return 1
  fi
}

# Clean cookie
rm -f "$COOKIE_FILE"

echo "=========================================="
echo "1. Health Check"
echo "=========================================="
curl -s "$BASE_URL/health" | grep -q "OK"
test_result $? "Health check"

echo ""
echo "=========================================="
echo "2. Login Test"
echo "=========================================="
response=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c "$COOKIE_FILE" -w "\n%{http_code}")

if echo "$response" | grep -q '"user"'; then
  test_result 0 "Login with valid credentials"
else
  test_result 1 "Login with valid credentials"
fi

echo ""
echo "=========================================="
echo "3. Create Tests (Authenticated)"
echo "=========================================="

# Create Company
http_test "POST" "/companies" '{"name":"Test Company","email":"test@test.com","phone":"01712345678"}' '"id":' "Create Company"

# Create Retailer
http_test "POST" "/retailers" '{"name":"Test Retailer","contact_person":"John","phone":"01712345678"}' '"id":' "Create Retailer"

# Create Product - use unique code with timestamp
RANDOM_CODE="TP$(date +%s)"
http_test "POST" "/products" "{\"name\":\"Test Product\",\"code\":\"$RANDOM_CODE\",\"stock_quantity\":10}" '"id":' "Create Product"

# Create Invoice
http_test "POST" "/invoices" '{"retailer_id":105,"invoice_date":"2026-04-01","items":[{"product_id":1,"quantity":1,"rate":100}]}' '"id":' "Create Invoice"

echo ""
echo "=========================================="
echo "4. Update Tests"
echo "=========================================="

# Update Company
http_test "PUT" "/companies/26" '{"name":"Updated Company"}' '"name":"Updated' "Update Company"

# Update Retailer
http_test "PUT" "/retailers/105" '{"name":"Updated Retailer"}' '"name":"Updated' "Update Retailer"

# Update Product
http_test "PUT" "/products/63" '{"name":"Updated Product"}' '"name":"Updated' "Update Product"

echo ""
echo "=========================================="
echo "5. List/Read Tests"
echo "=========================================="

# Get Companies
curl -s -b "$COOKIE_FILE" "$BASE_URL/companies" | grep -q '"data"'
test_result $? "List Companies"

# Get Retailers
curl -s -b "$COOKIE_FILE" "$BASE_URL/retailers" | grep -q '"data"'
test_result $? "List Retailers"

# Get Products
curl -s -b "$COOKIE_FILE" "$BASE_URL/products" | grep -q '"data"'
test_result $? "List Products"

# Get Dashboard
curl -s -b "$COOKIE_FILE" "$BASE_URL/dashboard/summary" | grep -q '"today"'
test_result $? "Get Dashboard"

echo ""
echo "=========================================="
echo "6. Logout Test"
echo "=========================================="

response=$(curl -s -X POST "$BASE_URL/auth/logout" -b "$COOKIE_FILE" -c "$COOKIE_FILE" -w "\n%{http_code}")
if echo "$response" | grep -q "Logged out"; then
  test_result 0 "Logout"
else
  test_result 1 "Logout"
fi

# Try to access protected endpoint after logout
curl -s -b "$COOKIE_FILE" "$BASE_URL/companies" | grep -q "Authentication required"
test_result $? "Auth required after logout"

echo ""
echo "=========================================="
echo "7. Login Again After Logout"
echo "=========================================="

response=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c "$COOKIE_FILE" -w "\n%{http_code}")

if echo "$response" | grep -q '"user"'; then
  test_result 0 "Re-login after logout"
else
  test_result 1 "Re-login after logout"
fi

echo ""
echo "=========================================="
echo "8. Validation Error Tests"
echo "=========================================="

# Login without credentials
curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{}' | grep -q "Validation"
test_result $? "Validation error - empty login"

# Login with invalid credentials
curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"username":"invalid","password":"wrong"}' | grep -q "Invalid credentials"
test_result $? "Invalid credentials error"

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
TOTAL=$((PASSED + FAILED))
echo "Total: $TOTAL"

# Cleanup
rm -f "$COOKIE_FILE"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
