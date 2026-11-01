#!/bin/bash

# COMPLETE PRODUCTION DEPLOYMENT COMMAND REFERENCE
# Run these commands in order to deploy with all 5 phases

echo "======================================"
echo "PHASE 1: LOCAL CODE QUALITY CHECKS"
echo "======================================"

# Format Python code
black backend/ --line-length=100

# Format JavaScript/TypeScript
cd frontend
npx prettier --write "src/**/*.{ts,tsx,js,jsx}"

# Lint Python
flake8 backend/ --max-line-length=100

# Lint JavaScript
npx eslint "src/**/*.{ts,tsx,js,jsx}" --fix

# Scan for secrets
cd ..
truffleHog3 -r . -f json > secrets-report.json
gitleaks detect -v

echo ""
echo "======================================"
echo "PHASE 2: RUN TESTS LOCALLY"
echo "======================================"

# Backend unit tests
cd backend
pytest tests/test_unit_*.py -v --cov=. --cov-report=html

# Backend integration tests
pytest tests/test_integration_*.py -v

# Check coverage
coverage report --fail-under=70

# Frontend tests
cd ../frontend
npm test -- --coverage --watchAll=false

# Build frontend
npm run build

echo ""
echo "======================================"
echo "PHASE 3: SECURITY SCANNING"
echo "======================================"

# Check Python dependencies
pip install pip-audit
pip-audit --desc

# Check Node dependencies
npm audit --audit-level=moderate

# Run Bandit
cd ..
pip install bandit
bandit -r backend/ -f json -o bandit-report.json

echo ""
echo "======================================"
echo "PHASE 4: PERFORMANCE TESTING"
echo "======================================"

# Start backend server
python -m uvicorn backend.main_production:app --host 0.0.0.0 --port 8000 &
sleep 10

# Install k6
# sudo apt-get install k6

# Run load test
k6 run tests/load_test.js

echo ""
echo "======================================"
echo "PHASE 5: CI/CD & DEPLOYMENT"
echo "======================================"

# Commit all fixes
git add -A
git commit -m "Production audit fixes - all 14 issues resolved"

# Push to production (triggers GitHub Actions)
git push origin production

# Wait for CI/CD to complete
echo "Waiting for GitHub Actions to complete..."
sleep 300

# Check deployment status
kubectl get deployments -n production
kubectl get pods -l app=app -n production

# Verify health
curl https://api.yourdomain.com/health

echo ""
echo "======================================"
echo "DEPLOYMENT COMPLETE"
echo "======================================"

