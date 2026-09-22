export function SeccionEncabezado({ id, titulo, bajada, claro }: { id: string; titulo: string; bajada?: string; claro?: boolean }) {
  return (
    <header className="mb-10 max-w-[40rem] md:mb-14">
      <h2 id={id} className={claro ? 'text-cal' : undefined}>{titulo}</h2>
      {bajada ? <p className={`mt-4 text-lead leading-snug ${claro ? 'text-cal/85' : 'text-tinta-suave'}`}>{bajada}</p> : null}
    </header>
  );
}
