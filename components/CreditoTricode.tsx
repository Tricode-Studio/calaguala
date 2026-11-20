/** Crédito del desarrollo, al pie de todas las páginas. */
export function CreditoTricode() {
  return (
    <div className="sobre-oscuro bg-mar text-cal/90">
      {/* En móvil, espacio extra abajo: el botón flotante de WhatsApp nunca tapa el crédito. */}
      <p className="contenedor pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 text-paso sm:pb-5">
        Desarrollado por{' '}
        <a
          href="https://www.tricode.studio/"
          target="_blank"
          rel="noopener"
          className="-my-3 inline-block py-3 font-semibold text-cal underline-offset-4 hover:underline"
        >
          Tricode.studio
        </a>
      </p>
    </div>
  );
}
