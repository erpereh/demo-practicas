# Despliegue en cPanel

Guia rapida para desplegar la app principal en cPanel:

- Frontend: `qualitysolution.consulting`
- API: `api.qualitysolution.consulting`
- Backend FastAPI: `back/app`
- Frontend Next.js: `front`

## Backend FastAPI

1. Crear el subdominio `api.qualitysolution.consulting` en cPanel.
2. Crear una Python App apuntando a la carpeta `back`.
3. Configurar el startup file como `passenger_wsgi.py`.
4. Abrir la terminal de la Python App y ejecutar:

   ```bash
   pip install -r ../requirements.txt
   ```

5. Crear `back/.env` a partir de `back/.env.example`:

   ```env
   DB_USER=usuario_mysql
   DB_PASSWORD=password_mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=nombre_bd
   FRONTEND_URL=https://qualitysolution.consulting
   SECRET_KEY=clave_segura
   INIT_DB=false
   ```

6. Reiniciar la Python App desde cPanel.
7. Probar:

   ```text
   https://api.qualitysolution.consulting/health
   ```

   La respuesta correcta debe incluir:

   ```json
   { "status": "ok", "database": "connected" }
   ```

## Frontend Next.js

1. Crear una Node.js App apuntando a la carpeta `front`.
2. Configurar el startup file como `server.js`.
3. Crear `front/.env.local` a partir de `front/.env.local.example`:

   ```env
   NEXT_PUBLIC_API_URL=https://api.qualitysolution.consulting
   ```

4. Abrir la terminal de la Node.js App y ejecutar:

   ```bash
   npm install
   npm run build
   ```

5. Reiniciar la Node.js App desde cPanel.
6. Abrir:

   ```text
   https://qualitysolution.consulting
   ```

## Comprobaciones

- No subir `back/.env` ni `front/.env.local`.
- Si `/health` no devuelve `database: connected`, revisar credenciales MySQL, permisos remotos/locales y nombre de base de datos en `back/.env`.
- Si el frontend apunta al backend local, confirmar que `NEXT_PUBLIC_API_URL=https://api.qualitysolution.consulting` estaba definido antes de ejecutar `npm run build`.
