import { createHash } from 'node:crypto';
import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime';

const CHARSET_META = '<meta charset="utf-8">';
const INLINE_SCRIPT =
  /<script(?![^>]*\ssrc=)(?![^>]*\stype="application\/json")[^>]*>([\s\S]*?)<\/script>/g;

function hashSource(content: string): string {
  return `'sha256-${createHash('sha256').update(content).digest('base64')}'`;
}

function buildPolicy(apiBaseUrl: string, scriptHashes: string[]): string {
  return [
    "default-src 'self'",
    ["script-src 'self'", ...scriptHashes].join(' '),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${new URL(apiBaseUrl).origin}`,
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    const markup = [
      ...html.head,
      ...html.bodyPrepend,
      ...html.body,
      ...html.bodyAppend,
    ].join('');
    const scriptHashes = [
      ...new Set(
        [...markup.matchAll(INLINE_SCRIPT)].map(([, content = '']) =>
          hashSource(content),
        ),
      ),
    ];
    const policy = buildPolicy(
      useRuntimeConfig().public.apiBaseUrl,
      scriptHashes,
    );
    const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}">`;
    const charsetIndex = html.head.findIndex((chunk) =>
      chunk.includes(CHARSET_META),
    );

    if (charsetIndex === -1) {
      html.head.unshift(meta);
      return;
    }

    html.head[charsetIndex] = html.head[charsetIndex]!.replace(
      CHARSET_META,
      `${CHARSET_META}${meta}`,
    );
  });
});
