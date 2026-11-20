# Qolqa — reto técnico Kambista

Frontend del reto técnico de Kambista: una aplicación web para cambiar USD ⇄ PEN que consume la API del reto (repositorio `api-challenge-kambista`). Está construida con Nuxt 4 y Nuxt UI, con la identidad visual de Qolqa.

## Requisitos

- Node.js 24 (versión fijada en `.nvmrc`)
- npm
- La API del reto en marcha (repositorio `api-challenge-kambista`), por defecto en http://localhost:3000

## Cómo levantarlo

```bash
cp .env.example .env
npm ci
npm run dev
```

La aplicación queda disponible en http://localhost:3001.

Abre siempre `localhost` y no `127.0.0.1`: la cookie del refresh token es `SameSite=Strict` y el origen que la API permite es `http://localhost:3001`. Con `127.0.0.1` el navegador trata la API como otro sitio y la sesión no se renueva.

En Windows CMD, copia el archivo con `copy .env.example .env`.

## Variables de entorno

| Variable                   | Descripción                  | Valor por defecto       |
| -------------------------- | ---------------------------- | ----------------------- |
| `NUXT_PUBLIC_API_BASE_URL` | URL base de la API del reto. | `http://localhost:3000` |

Como la aplicación se publica como archivos estáticos, la variable se lee al ejecutar `npm run dev` o `npm run generate`. Su origen también se agrega a `connect-src` de la Content Security Policy.

## Scripts y pruebas

| Script                 | Qué hace                                                 |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo en http://localhost:3001.         |
| `npm run generate`     | Genera la aplicación estática en `.output/public`.       |
| `npm run preview`      | Sirve localmente el resultado de la compilación.         |
| `npm run lint`         | ESLint (configuración de `@nuxt/eslint`).                |
| `npm run format`       | Formatea el código con Prettier.                         |
| `npm run format:check` | Verifica el formato sin modificar archivos.              |
| `npm run typecheck`    | Verificación de tipos con `vue-tsc` en modo estricto.    |
| `npm test`             | Pruebas con Vitest y `@nuxt/test-utils` en entorno Nuxt. |

La integración continua (`.github/workflows/ci.yml`) ejecuta lint, formato, tipos, pruebas, `generate` y `npm audit --audit-level=high` en cada pull request y en cada push a `main`.

## Autenticación

- **Access token solo en memoria.** Vive en el store `session` de Pinia y nunca se guarda en `localStorage` ni `sessionStorage`, así un script inyectado no puede leerlo del almacenamiento del navegador.
- **Refresh token en cookie HttpOnly.** Lo emite la API en la cookie `refresh_token` (`HttpOnly`, `SameSite=Strict`, `Path=/v1/auth`); el frontend no la lee, solo envía las peticiones a `/v1/auth/*` con `credentials: 'include'`.
- **Sesión recuperada al recargar.** El middleware global llama una sola vez a `/v1/auth/refresh` y luego a `/v1/auth/me`; si falla, la sesión queda anónima.
- **Refresh automático ante un 401.** El cliente HTTP (`app/shared/http/api-client.ts`) renueva el token una sola vez aunque fallen varias peticiones a la vez y reintenta la petición original. Si la renovación falla, limpia la sesión y lleva a `/login`.
- **Redirección segura.** Las páginas privadas envían a `/login?redirect=<ruta>`. Tras iniciar sesión solo se aceptan rutas internas (empiezan con `/`, no con `//` ni con `/\`); cualquier otro valor lleva a `/`.

## Cambio de divisas

La pantalla **Cambiar** (`/exchange`) muestra el tipo de cambio del día y permite registrar un cambio de USD a PEN o de PEN a USD.

- **Tipo de cambio en vivo.** Se consulta `GET /v1/exchange-rates/current` al entrar y cada 30 segundos; la consulta se pausa mientras la pestaña está oculta y se repite al volver. Si la API responde 503 se avisa que no hay tipo de cambio y el botón de cambio queda deshabilitado; ante un error de red se ofrece **Reintentar**.
- **Estimado y valor final.** Mientras escribes se calcula cuánto recibirías: USD → PEN multiplica por la venta y PEN → USD divide entre la compra, redondeando a 2 decimales hacia arriba desde la mitad (`ROUND_HALF_UP`). El cálculo usa enteros (centavos y el tipo de cambio escalado), sin errores de coma flotante. Es solo una referencia: al confirmar se envían únicamente las monedas y el monto, y lo que se muestra como resultado es lo que devuelve la API.
- **Confirmación.** El campo de monto solo acepta números y un punto decimal (una coma se convierte en punto). **Cambiar ahora** valida el formulario y abre un modal para confirmar cuánto envías, qué tipo de cambio se aplica y cuánto recibirías; mientras se registra no se puede cerrar ni enviar dos veces. Si la API responde con error, el mensaje aparece en el modal y puedes reintentar o cancelar. Al terminar, el modal muestra lo que devolvió la API (montos, tipo de cambio, fecha y N.º de operación) y **Hacer otro cambio** limpia el formulario.
- **Validaciones.** El monto es obligatorio, mayor a 0, con máximo 2 decimales (acepta punto o coma) y hasta 9,999,999.99; las monedas de origen y destino deben ser distintas. Los errores aparecen al salir del campo o al enviar.

## Historial

La pantalla **Historial** (`/history`) lista tus cambios con `GET /v1/transactions/history`, del más reciente al más antiguo.

- **Fechas.** Por defecto muestra los últimos 30 días; también hay atajos (últimos 7 días, últimos 30 días, este mes) y un calendario para elegir un rango. "Hoy" se calcula en hora de Lima, igual que la API, y no se pueden elegir fechas futuras.
- **Dirección compartible.** Las fechas y la página viven en la URL (`?startDate=2026-11-01&endDate=2026-11-20&page=2`), así que recargar o compartir el enlace conserva el filtro. Si la URL trae fechas inválidas se usan los últimos 30 días, y si la página no existe se va a la última.
- **Paginación.** 10 operaciones por página; el total sale de la cabecera `X-Total-Count`.
- **Estados.** Muestra filas de carga, un mensaje cuando no hay cambios en el rango (con acceso a **Hacer un cambio**) y **Reintentar** si algo falla. Si cambias el filtro antes de que llegue la respuesta anterior, esa respuesta se descarta.
- **Accesos.** Se llega desde el menú, la tarjeta **Revisa tus operaciones** del inicio y el botón **Ver historial** al terminar un cambio.

## Decisiones

- **SPA sin SSR.** Es un panel autenticado que no necesita SEO, así que se compila como SPA (`ssr: false`) y se publica como archivos estáticos con `nuxt generate`, sin servidor Node en producción.
- **Nuxt UI tematizado con los tokens de Qolqa.** Las escalas de color, superficies, bordes, radios, sombras y tipografías salen del sistema de diseño de Qolqa (`app/assets/css/main.css` y `app/app.config.ts`). El CTA principal es una píldora maíz con texto oscuro para cumplir el contraste mínimo.
- **Fuentes e íconos servidos localmente.** Geist, Geist Mono y Bricolage Grotesque se descargan al compilar con `@nuxt/fonts`, y los íconos de Lucide se incluyen en el bundle. Así la aplicación no hace peticiones a CDNs y la Content Security Policy puede ser estricta.
- **Content Security Policy por `<meta>`.** Un módulo local (`modules/csp`) agrega la política al HTML generado y calcula el hash de los scripts en línea que produce Nuxt, por lo que `script-src` no necesita `'unsafe-inline'`. `style-src` sí lo permite, porque Nuxt UI inyecta en tiempo de ejecución una etiqueta `<style>` con las variables de color.
- **Solo modo claro.** El modo de color de Nuxt UI está desactivado.
