# Aplicar los campos nuevos y los avisos por correo al CMS

Script: `scripts/perfil-cms.mjs`. Modifica el **perfil del espacio "calaguala"** en Tricode CMS (la configuración que define las colecciones, sus campos y sus avisos). No toca el sitio ni el contenido cargado.

> Este script **no se ejecuta solo ni forma parte del deploy**. Lo corre una persona, a propósito, con un token que tiene que dar quien administra el CMS.

## Qué hace

1. **Campos nuevos (22):** agrega a las colecciones `portada` (18 campos) y `ubicacion-contacto` (4 campos) los campos editables listados en el bloque JSON al final de `docs/campos-cms.md`. Son opcionales, públicos como los actuales, y se agregan **al final** con su grupo (sección) por bloque. No quita ni renombra nada; si un campo ya existe, lo saltea.
2. **Aviso al administrador:** en la colección de solicitudes (`reservas`) activa `notifyOnCreate`, y deja `calagualacamp@gmail.com` como correo de contacto del espacio (`contactEmail`). Si ya hay **otro** correo cargado, no lo pisa: avisa del conflicto y se detiene (para cambiarlo a propósito, usar `--forzar-email`).
3. **Aviso al huésped:** en el estado **"Cancelada"** de las solicitudes configura `notifyEmailField: email`, o sea que al pasar una solicitud a "Cancelada" se le escribe al correo que dejó el huésped. Si no encuentra exactamente un estado "cancelada", o la colección no tiene campo `email`, se detiene sin cambiar nada y lista los estados que encontró.

Es **idempotente**: correrlo dos veces no cambia nada la segunda vez y lo informa.

## Cómo obtener el token

Lo obtiene **quien administra el CMS**, con un usuario que tenga el permiso `TENANTS_WRITE` (un access token Bearer). **No pegues el token en el chat, en un archivo ni en el repositorio.** Se pasa solo por variable de entorno en la terminal, y el script nunca lo imprime.

## Comandos

Windows PowerShell:

```powershell
$env:TRICODE_TOKEN = "<token>"          # solo en esta terminal
# $env:TRICODE_API_BASE = "https://cms.tricode.studio/api/v1"   # es el valor por defecto
```

Git Bash / Linux / macOS: `export TRICODE_TOKEN=...`

**1) Dry-run (por defecto, no escribe nada):** muestra qué cambiaría.

```
node scripts/perfil-cms.mjs
```

**2) Aplicar:** guarda un respaldo del perfil completo, pide confirmación (escribir `si`; con `--si` no pregunta), hace el cambio, vuelve a leer el perfil y verifica que todo quedó.

```
node scripts/perfil-cms.mjs --aplicar
```

**3) Restaurar un respaldo:** reemplaza el perfil por el guardado.

```
node scripts/perfil-cms.mjs --restaurar "../_respaldo-perfil-cms/perfil-calaguala-AAAAMMDD-HHMMSS.json"
```

Opciones: `--slug <espacio>` (por defecto `calaguala`), `--forzar-email`, `--si`, `--desde-archivo <perfil.json>` (dry-run sin conexión, para probar). Los respaldos se guardan en `_respaldo-perfil-cms/`, una carpeta hermana del repositorio (`../_respaldo-perfil-cms` respecto de la raíz del repo); se puede cambiar con la variable `TRICODE_BACKUP_DIR`.

Si algo falla al aplicar, el script muestra el estado y el cuerpo del error, la ruta del respaldo y el comando exacto para restaurarlo.

## Qué revisar en el CMS después

1. En **Portada** y **Ubicación y contacto** se ven los campos nuevos, agrupados por bloque («1 · Portada…», «2 · Descansar cerca del mar», etc.).
2. **Aviso al administrador:** crear una solicitud de prueba **desde el sitio** (formulario de `/reservar`) y comprobar que llega el correo a calagualacamp@gmail.com.
3. **Aviso al huésped:** en el CMS, pasar una solicitud de prueba (con un correo propio) al estado **"Cancelada"** y comprobar que llega el correo.

> **Importante:** «Lo que carga el propio equipo en el CMS no avisa». El aviso de alta solo ocurre con solicitudes que entran **por el sitio o por la API**; una solicitud cargada a mano en el panel no dispara ese correo.

## Requisitos previos que el script NO puede verificar

- El espacio tiene que tener **configurado el envío de correo** en el CMS (**Comunicaciones → Integraciones**, con Resend o Gmail). Sin eso los avisos no salen, aunque el perfil esté bien.
- Las plantillas **«Aviso de nuevo registro»** y **«Aviso de cambio de estado»** tienen que estar **activas**.

## Notas

- El CMS permite como máximo 40 campos por colección; el script lo verifica antes de aplicar.
- Los campos de una colección se agregan **en el perfil** (no editando la colección directamente), porque el CMS regenera la colección desde el perfil.
- El estado "Confirmada" ya puede tener su propio aviso configurado; el script no lo modifica.
