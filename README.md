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

## Decisiones

- **SPA sin SSR.** Es un panel autenticado que no necesita SEO, así que se compila como SPA (`ssr: false`) y se publica como archivos estáticos con `nuxt generate`, sin servidor Node en producción.
- **Nuxt UI tematizado con los tokens de Qolqa.** Las escalas de color, superficies, bordes, radios, sombras y tipografías salen del sistema de diseño de Qolqa (`app/assets/css/main.css` y `app/app.config.ts`). El CTA principal es una píldora maíz con texto oscuro para cumplir el contraste mínimo.
- **Fuentes e íconos servidos localmente.** Geist, Geist Mono y Bricolage Grotesque se descargan al compilar con `@nuxt/fonts`, y los íconos de Lucide se incluyen en el bundle. Así la aplicación no hace peticiones a CDNs y la Content Security Policy puede ser estricta.
- **Content Security Policy por `<meta>`.** Un módulo local (`modules/csp`) agrega la política al HTML generado y calcula el hash de los scripts en línea que produce Nuxt, por lo que `script-src` no necesita `'unsafe-inline'`. `style-src` sí lo permite, porque Nuxt UI inyecta en tiempo de ejecución una etiqueta `<style>` con las variables de color.
- **Solo modo claro.** El modo de color de Nuxt UI está desactivado.
