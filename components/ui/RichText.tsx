/**
 * Renderiza RICH_TEXT del CMS. El CMS es contenido del propio tenant, pero
 * igual se limpian scripts, iframes y handlers inline por las dudas.
 */
function limpiar(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

/** Texto plano del CMS (textarea): una línea en blanco separa párrafos. */
function parrafos(texto: string): string {
  const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return texto
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapar(p).replace(/\r?\n/g, '<br />')}</p>`)
    .join('');
}

export function RichText({ html, className = '' }: { html: string; className?: string }) {
  const contenido = /<[a-z][\s\S]*>/i.test(html) ? limpiar(html) : parrafos(html);
  return <div className={`prosa ${className}`} dangerouslySetInnerHTML={{ __html: contenido }} />;
}
