# Despliegue en cPanel

Este proyecto se despliega en cPanel con el backend actualizado desde GitHub y el frontend Next.js subido ya compilado.

## Backend

1. Entrar al directorio del backend en cPanel.
2. Ejecutar `git pull` para traer los cambios desde GitHub.
3. Reiniciar la Python App desde cPanel.

## Frontend

El frontend usa `output: "standalone"` en `front/next.config.ts`. No ejecutes `npm run build` en cPanel porque falla por falta de memoria.

1. En local, entrar al directorio `front`.
2. Generar el build con la URL publica de la API:

   ```powershell
   $env:NEXT_PUBLIC_API_URL="http://api-portal.qualitysolution.consulting"
   cmd /c npm run build
   ```

3. Subir el directorio `front/.next` generado a cPanel.
4. En cPanel, copiar los assets estaticos al standalone:

   ```bash
   cp -R .next/static .next/standalone/.next/static
   ```

5. En cPanel, copiar `public` al standalone:

   ```bash
   cp -R public .next/standalone/public
   ```

6. Reiniciar la Node App desde cPanel.

La Node App de cPanel debe arrancar con `front/server.js`, que delega en `.next/standalone/server.js`.
