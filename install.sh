#!/bin/bash

echo "========================================"
echo "INSTALACION - SISTEMA DE GESTION INMOBILIARIA"
echo "========================================"
echo ""

echo "[1/5] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    echo "Descarga Node.js desde: https://nodejs.org/"
    exit 1
fi
node --version
echo ""

echo "[2/5] Verificando MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "ADVERTENCIA: MySQL no encontrado en PATH"
    echo "Asegúrate de que MySQL esté instalado"
    echo ""
fi

echo "[3/5] Instalando dependencias del backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Falló la instalación de dependencias"
    exit 1
fi
cd ..
echo ""

echo "[4/5] Configurando variables de entorno..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "Archivo .env creado desde .env.example"
    echo "IMPORTANTE: Edita backend/.env con tus credenciales de MySQL"
else
    echo "Archivo .env ya existe"
fi
echo ""

echo "[5/5] Creando estructura de base de datos..."
echo ""
echo "INSTRUCCIONES PARA MYSQL:"
echo "1. Ejecuta los siguientes comandos:"
echo ""
echo "mysql -u root -p -e \"CREATE DATABASE inmobiliaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
echo "mysql -u root -p inmobiliaria < backend/database/schema.sql"
echo ""

echo "========================================"
echo "INSTALACION COMPLETADA"
echo "========================================"
echo ""
echo "PROXIMOS PASOS:"
echo "1. Edita backend/.env con tus credenciales de MySQL"
echo "2. Crea la base de datos e importa el schema"
echo "3. Ejecuta: cd backend"
echo "4. Ejecuta: npm run dev"
echo ""
echo "El servidor estará en: http://localhost:3000"
echo ""
