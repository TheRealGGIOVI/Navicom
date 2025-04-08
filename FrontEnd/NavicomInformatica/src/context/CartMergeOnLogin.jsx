import { useContext, useEffect } from "react";
import { AuthContext } from "./AuthProvider"; // importa correctamente según tu estructura
import { MERGECARTAPI } from "../api/carrito"; // ajustá según tu estructura

export const CartMergeOnLogin = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const localCart = localStorage.getItem("localCart");

    if (user && localCart) {
      const parsedCart = JSON.parse(localCart);

      if (!parsedCart.length) return;

      const carritoMergeDTO = {
        carritoId: user.carritoId,
        productos: parsedCart.map(item => ({
          productoId: item.productoId,
          cantidad: item.cantidad
        }))
      };

      mergeCartAPI(carritoMergeDTO)
        .then(() => {
          console.log("Carrito mergeado exitosamente");
          localStorage.removeItem("localCart");
          // opcional: refetch carrito aquí
        })
        .catch(err => {
          console.error("Error al mergear carrito:", err);
        });
    }
  }, [user]);

  return null;
};
