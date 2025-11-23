const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api/eventos";

export async function getEventos() {
  try {
    const response = await fetch(`${API_URL}/eventos`);
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    throw error;
  }
}

export async function getEventoById(id) {
  try {
    const response = await fetch(`${API_URL}/eventos/${id}`);

    if (!response.ok) {
      throw new Error(`Error al cargar el evento: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error al obtener el evento ${id}:`, error);
    throw error;
  }
}

export async function comprarBoletosAPI(boletoId, cantidad, token) {
  // 1. Agregamos 'token' aquí
  const response = await fetch(`${API_URL}/eventos/comprar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 2. Enviamos el token en el Header
    },
    body: JSON.stringify({ boletoId, cantidad }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error desconocido al procesar la compra.");
  }

  return data;
}
