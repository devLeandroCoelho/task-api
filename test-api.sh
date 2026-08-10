#!/bin/bash
# Script de teste para a Task API
# Uso: bash test-api.sh

API="https://task-api-gamma-sepia.vercel.app"

echo "🧪 Testando Task API..."
echo ""

# 1. Registrar usuário (senha forte: 8+ chars, maiúscula, minúscula, número)
echo "1️⃣ Registrar usuário..."
REGISTER_RESPONSE=$(curl -s -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Leandro","email":"leandro@test.com","password":"Teste123"}')
echo "$REGISTER_RESPONSE" | jq .
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
echo ""

# 2. Login
echo "2️⃣ Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"leandro@test.com","password":"Teste123"}')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
echo "Token: ${TOKEN:0:20}..."
echo ""

# 3. Ver perfil
echo "3️⃣ Ver perfil..."
curl -s "$API/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 4. Criar task
echo "4️⃣ Criar task..."
TASK_RESPONSE=$(curl -s -X POST "$API/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Minha primeira task","description":"Teste de API","priority":"high"}')
echo "$TASK_RESPONSE" | jq .
TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.data.task.id')
echo "Task ID: $TASK_ID"
echo ""

# 5. Listar tasks
echo "5️⃣ Listar tasks..."
curl -s "$API/api/tasks" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 6. Atualizar task
echo "6️⃣ Atualizar task..."
curl -s -X PUT "$API/api/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"completed"}' | jq .
echo ""

# 7. Deletar task
echo "7️⃣ Deletar task..."
curl -s -X DELETE "$API/api/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "✅ Todos os testes concluídos!"
