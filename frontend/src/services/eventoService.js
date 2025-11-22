const API_URL = "http://localhost:3001/api";

/**
 * Obtiene la lista de todos los eventos desde el backend.
 */
export async function getEventos() {
  try {
    const response = await fetch(`${API_URL}/eventos`);

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw error;
  }
}

/**
 * Obtiene el detalle de un solo evento por su ID.
 * @param {number} id El ID del evento a buscar.
 */
export async function getEventoById(id) {
  try {
    const response = await fetch(`${API_URL}/eventos/${id}`);

    if (!response.ok) {
      // Lanza un error si el evento no existe (e.g., 404)
      throw new Error(`Error al cargar el evento: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al obtener el evento ${id}:`, error);
    throw error;
  }
}
// Ya no se necesita el export al final si se exporta en la declaración.
