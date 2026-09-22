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

export function RichText({ html, className = '' }: { html: string; className?: string }) {
  const contenido = /<[a-z][\s\S]*>/i.test(html) ? limpiar(html) : `<p>${html.replace(/</g, '&lt;')}</p>`;
  return <div className={`prosa ${className}`} dangerouslySetInnerHTML={{ __html: contenido }} />;
}
