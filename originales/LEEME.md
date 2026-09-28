# Originales

Archivos fuente que **no se sirven al navegador**. Viven fuera de `public/`
a propósito: ahí dentro se subirían a Vercel en cada deploy sin que nadie
los descargue nunca.

- `mardefondo.heic` — original de la foto de fondo de "Descansar cerca del
  mar" (4032x3024). Ningún navegador muestra HEIC, y ni sharp ni los códecs
  de Windows lo decodifican. Para regenerar el webp:

  ```
  npm install --no-save heic-convert
  node -e "const c=require('heic-convert'),fs=require('fs'),s=require('sharp');c({buffer:fs.readFileSync('originales/mardefondo.heic'),format:'PNG'}).then(p=>s(p).rotate().resize(3600,2400,{fit:'cover'}).webp({quality:88,effort:6}).toFile('public/fotos/mardefondo.webp'))"
  ```
