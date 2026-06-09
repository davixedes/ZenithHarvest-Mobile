#!/usr/bin/env bash
# =============================================================================
# Zenith Harvest — seed de dados de teste via API (gateway :8080)
# =============================================================================
# Uso:
#   chmod +x scripts/seed-test.sh
#   ./scripts/seed-test.sh
#
# Pré-requisitos: curl, jq
# Todos os requests passam pelo gateway. Certifique-se que os serviços estão up:
#   docker compose up -d   (ou iniciar os JARs manualmente)
# =============================================================================

set -euo pipefail

BASE="${API_BASE:-http://localhost:8080}"
EMAIL="joao.produtor@zenith.test"
PASSWORD="Senha@123"

echo "=== [1/9] Registrando usuário de teste ==="
REGISTER=$(curl -sf -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "123.456.789-00",
    "name": "João",
    "lastName": "Produtor",
    "email": "'"$EMAIL"'",
    "phone": "11999998888",
    "password": "'"$PASSWORD"'"
  }') || REGISTER="{}"

USER_ID=$(echo "$REGISTER" | jq -r '.id // empty')
if [ -z "$USER_ID" ]; then
  echo "  → Usuário já existe, prosseguindo com login..."
fi

echo "=== [2/9] Login ==="
AUTH=$(curl -sf -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$EMAIL"'","password":"'"$PASSWORD"'"}')
TOKEN=$(echo "$AUTH" | jq -r '.token')
USER_ID=$(echo "$AUTH" | jq -r '.userId')
echo "  → userId: $USER_ID"
echo "  → token: ${TOKEN:0:40}..."

AUTH_HEADER="Authorization: Bearer $TOKEN"

echo "=== [3/9] Criando fazenda ==="
FARM=$(curl -sf -X POST "$BASE/api/farms" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "userId": "'"$USER_ID"'",
    "name": "Fazenda Boa Vista",
    "carRegistration": "SP-1234567-ABCDE",
    "nirf": "12345678-0",
    "latitude": -15.7801,
    "longitude": -47.9292,
    "totalAreaHectares": 150.0,
    "state": "DF",
    "biomeId": 2,
    "propertyType": "Própria"
  }')
FARM_ID=$(echo "$FARM" | jq -r '.id')
echo "  → farmId: $FARM_ID"

echo "=== [4/9] Buscando culturas (para obter cropId da Soja) ==="
CROPS=$(curl -sf "$BASE/api/crops" -H "$AUTH_HEADER")
CROP_ID=$(echo "$CROPS" | jq -r '._embedded.cropList[0].id // .[0].id')
CROP_NAME=$(echo "$CROPS" | jq -r '._embedded.cropList[0].name // .[0].name')
echo "  → cropId: $CROP_ID ($CROP_NAME)"

echo "=== [5/9] Criando talhão ==="
PLOT=$(curl -sf -X POST "$BASE/api/plots" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "farmId": "'"$FARM_ID"'",
    "identifier": "T01",
    "plotSituationId": 2,
    "cropId": "'"$CROP_ID"'",
    "areaHectares": 50.0,
    "productionSystemId": 1,
    "plantingDate": "2024-10-15",
    "estimatedHarvestDate": "2025-02-15",
    "seedVariety": "M7739 IPRO"
  }')
PLOT_ID=$(echo "$PLOT" | jq -r '.id')
echo "  → plotId: $PLOT_ID"

echo "=== [6/9] Criando seguradora ==="
INSURER=$(curl -sf -X POST "$BASE/api/insurers" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Seguradora Rural BR",
    "cnpj": "12.345.678/0001-99",
    "email": "contato@seguradora-rural-br.com",
    "phone": "1130001234",
    "insurerSituationId": 1
  }')
INSURER_ID=$(echo "$INSURER" | jq -r '.id')
echo "  → insurerId: $INSURER_ID"

echo "=== [7/9] Criando produto de seguro ==="
INSURANCE=$(curl -sf -X POST "$BASE/api/insurances" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "insurerId": "'"$INSURER_ID"'",
    "name": "Seguro Rural Básico",
    "insuranceSituationId": 1,
    "deductiblePct": 10.00,
    "graceDays": 7,
    "maxCoveragePerHectare": 8000.00,
    "baseRatePct": 2.50
  }')
INSURANCE_ID=$(echo "$INSURANCE" | jq -r '.id')
echo "  → insuranceId: $INSURANCE_ID"

echo "=== [8/9] Criando cotação e aceitando (gera apólice) ==="
QUOTE=$(curl -sf -X POST "$BASE/api/quotes" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "userId": "'"$USER_ID"'",
    "plotId": "'"$PLOT_ID"'",
    "insuranceId": "'"$INSURANCE_ID"'",
    "quoteSituationId": 1,
    "insuredAmount": 325000.00,
    "totalPremium": 9750.00,
    "monthlyPremium": 812.50,
    "regionalFactor": 1.10,
    "historyFactor": 1.00
  }')
QUOTE_ID=$(echo "$QUOTE" | jq -r '.id')
echo "  → quoteId: $QUOTE_ID"

POLICY_ACCEPT=$(curl -sf -X POST "$BASE/api/quotes/$QUOTE_ID/accept" \
  -H "$AUTH_HEADER")
POLICY_ID=$(echo "$POLICY_ACCEPT" | jq -r '.id')
POLICY_NUMBER=$(echo "$POLICY_ACCEPT" | jq -r '.policyNumber')
echo "  → policyId: $POLICY_ID (número: $POLICY_NUMBER)"

echo "=== [9/9] Abrindo sinistro de teste ==="
CLAIM=$(curl -sf -X POST "$BASE/api/claims" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "claimNumber": "SIN-2024-001",
    "policyId": "'"$POLICY_ID"'",
    "claimSituationId": 1,
    "categoryId": 1,
    "subCategoryId": 1,
    "description": "Estiagem prolongada afetando talhão T01 — lavoura de soja.",
    "openingGpsLat": -15.7801,
    "openingGpsLng": -47.9292,
    "ndviBefore": 0.72
  }')
CLAIM_ID=$(echo "$CLAIM" | jq -r '.id')
echo "  → claimId: $CLAIM_ID"

echo ""
echo "============================================================"
echo "  SEED CONCLUÍDO — IDs para referência:"
echo "============================================================"
echo "  userId:      $USER_ID"
echo "  farmId:      $FARM_ID"
echo "  plotId:      $PLOT_ID"
echo "  cropId:      $CROP_ID"
echo "  insurerId:   $INSURER_ID"
echo "  insuranceId: $INSURANCE_ID"
echo "  quoteId:     $QUOTE_ID"
echo "  policyId:    $POLICY_ID"
echo "  claimId:     $CLAIM_ID"
echo "  email:       $EMAIL"
echo "  password:    $PASSWORD"
echo "============================================================"
echo ""
echo "  Swagger core-svc:    $BASE/swagger-ui.html  (roteia para core)"
echo "  Swagger analise-svc: http://localhost:8082/swagger-ui.html"
echo ""
echo "  App: configure EXPO_PUBLIC_API_URL=$BASE no .env"
echo "       faça login com $EMAIL / $PASSWORD"
echo "============================================================"
