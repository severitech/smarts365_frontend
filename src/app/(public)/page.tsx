import CantidadDeCompras from "../components/CantidadDeCompras";
import MarcasCarousel from "../components/CarruselDeMarcas";
import TarjetaDeProductos from "../components/TarjetaDeProductos";

export default function Page() {
  return (
    <section>
      <div className="text-center mt-0 mb-0">
        <MarcasCarousel/>
        <CantidadDeCompras />
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-0">
        <TarjetaDeProductos />
        <TarjetaDeProductos />
        <TarjetaDeProductos />
        <TarjetaDeProductos />
        <TarjetaDeProductos />
        <TarjetaDeProductos />
        <TarjetaDeProductos />
        <TarjetaDeProductos />
        <TarjetaDeProductos />
      </div>
    </section>
  );
}