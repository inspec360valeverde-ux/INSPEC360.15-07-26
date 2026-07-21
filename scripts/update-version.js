#!/usr/bin/env node

/**
 * Script para atualizar version.json com data/hora atual de build
 * Executado automaticamente durante build no Render
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFilePath = path.join(__dirname, '../public/version.json');

try {
  console.log(`[update-version] Iniciando script...`);
  console.log(`[update-version] Caminho: ${versionFilePath}`);
  
  // Ler version.json existente
  const versionContent = fs.readFileSync(versionFilePath, 'utf8');
  const versionData = JSON.parse(versionContent);
  console.log(`[update-version] Versão anterior: ${versionData.version}`);

  // Atualizar buildDate com timestamp atual
  const now = new Date();
  const isoDate = now.toISOString();
  versionData.buildDate = isoDate;
  console.log(`[update-version] Nova data/hora: ${isoDate}`);

  // Incrementar versão patch
  const versionParts = versionData.version.split('.');
  let datePart = versionParts[1]; // 20260602
  let patchPart = parseInt(versionParts[2] || 0);
  
  // Checar se é um novo dia
  const currentDate = now.toISOString().split('T')[0].replace(/-/g, '');
  const lastDate = datePart ? datePart.substring(0, 8) : '00000000';
  
  if (currentDate !== lastDate) {
    // Novo dia, resetar patch
    versionData.version = `2.1.${currentDate}001`;
    console.log(`[update-version] Novo dia detectado - resetando patch`);
  } else {
    // Mesmo dia, incrementar patch
    versionData.version = `2.1.${datePart}${String(patchPart + 1).padStart(3, '0')}`;
    console.log(`[update-version] Mesmo dia - incrementando patch`);
  }

  // Escrever version.json atualizado
  fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2) + '\n');

  console.log(`✅ [update-version] version.json atualizado com sucesso!`);
  console.log(`   Versão: ${versionData.version}`);
  console.log(`   Build Date: ${versionData.buildDate}`);
} catch (error) {
  console.error(`❌ [update-version] Erro ao atualizar version.json:`, error.message);
  console.error(`Stack:`, error.stack);
  process.exit(1);
}
