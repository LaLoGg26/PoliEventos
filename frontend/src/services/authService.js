const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api/auth";

export async function registerAPI(nombre, email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al registrarse.");
  }
  return data;
}

/**
 * Llama a la API para loguear un usuario.
 */
export async function loginAPI(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al iniciar sesión.");
  }
  return data; // Contiene { token, user }
}
