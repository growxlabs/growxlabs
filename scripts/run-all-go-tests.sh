#!/usr/bin/env bash
set -e

echo "======================================================="
echo "  GrowX Labs — Comprehensive Go Test Suite"
echo "======================================================="

echo "=== 1. Testing Command Center Packages ==="
for dir in packages/*/; do
  if [ -f "${dir}go.mod" ]; then
    echo "Testing $dir..."
    (cd "$dir" && go test ./...)
  fi
done

echo "=== 2. Testing Command Center Services ==="
for dir in services/*/; do
  if [ -f "${dir}go.mod" ]; then
    echo "Testing $dir..."
    (cd "$dir" && go test ./...)
  fi
done

echo "=== 3. Testing People Ops (platform/hrms/) ==="
for dir in platform/hrms/*/; do
  if [ -f "${dir}go.mod" ]; then
    echo "Testing $dir..."
    (cd "$dir" && go test ./...)
  fi
done

echo "=== 4. Testing Root Module ==="
if [ -f "go.mod" ]; then
  go test ./...
fi

echo "======================================================="
echo "  All Command Center & People Ops Go Tests Passed!"
echo "======================================================="
