export function soloDigitos(numero: string): string {
  return numero.replace(/\D/g, '');
}

export function linkWhatsApp(numero: string, mensaje?: string): string | null {
  const digitos = soloDigitos(numero);
  if (digitos.length < 8) return null;
  const base = `https://wa.me/${digitos}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
