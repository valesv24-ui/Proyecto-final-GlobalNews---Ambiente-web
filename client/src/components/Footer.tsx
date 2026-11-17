// El año se calcula una sola vez al cargar el módulo, no en cada render
const ANIO_ACTUAL = new Date().getFullYear();

/** Pie de página PROVISIONAL: la Persona C lo reemplaza con el logo y el diseño final */
export default function Footer() {
  return (
    <footer className="bg-primario py-4 text-center text-sm text-white">
      © {ANIO_ACTUAL} GlobalNews
    </footer>
  );
}
