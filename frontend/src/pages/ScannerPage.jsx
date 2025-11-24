import { useEffect, useState, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001/api/eventos";

function ScannerPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  // Protección de ruta
  useEffect(() => {
    if (!user || (user.rol !== "VENDEDOR" && user.rol !== "SUPER_USER")) {
      navigate("/");
    }
  }, [user, navigate]);

  // 1. DEFINIMOS LA FUNCIÓN DE VALIDACIÓN PRIMERO (con useCallback)
  const validarCodigo = useCallback(
    async (uuid) => {
      try {
        const res = await fetch(`${API_URL}/ticket/validar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ uuid }),
        });

        const data = await res.json();

        if (res.ok) {
          setScanResult(data);
        } else {
          setScanResult({
            valid: false,
            message: data.message || "Error desconocido",
          });
        }
      } catch (err) {
        setScanResult({ valid: false, message: "Error de conexión" });
      }
    },
    [token]
  ); // Dependencia: token

  // 2. AHORA SÍ EL EFECTO DEL ESCÁNER
  useEffect(() => {
    let scanner;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 5, qrbox: { width: 250, height: 250 } },
        false
      );

      // Definimos las funciones callback aquí dentro
      const onScanSuccess = (decodedText) => {
        scanner.clear();
        setIsScanning(false);
        validarCodigo(decodedText); // Ahora sí existe esta función
      };

      const onScanFailure = (error) => {
        // Dejamos esto vacío o lo comentamos para que no llene la consola de spam
        // console.warn(error);
      };

      scanner.render(onScanSuccess, onScanFailure);
    }

    // Cleanup
    return () => {
      if (scanner) {
        scanner
          .clear()
          .catch((err) => console.error("Error limpiando scanner", err));
      }
    };
  }, [isScanning, validarCodigo]); // Agregamos validarCodigo a dependencias

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        📷 Escáner de Acceso
      </h1>

      {isScanning && (
        <div
          id="reader"
          style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}
        ></div>
      )}

      {scanResult && (
        <div
          style={{
            ...styles.resultCard,
            backgroundColor: scanResult.valid ? "#dcfce7" : "#fee2e2",
            borderColor: scanResult.valid ? "#16a34a" : "#dc2626",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "10px" }}>
            {scanResult.valid ? "✅" : "⛔"}
          </div>
          <h2
            style={{
              color: scanResult.valid ? "#166534" : "#991b1b",
              fontSize: "2rem",
              margin: "10px 0",
            }}
          >
            {scanResult.valid ? "PÁSELE" : "ALTO"}
          </h2>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {scanResult.message}
          </p>

          {scanResult.data && (
            <div
              style={{
                textAlign: "left",
                marginTop: "20px",
                backgroundColor: "rgba(255,255,255,0.5)",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              <p>
                <strong>Evento:</strong> {scanResult.data.evento_nombre}
              </p>
              <p>
                <strong>Zona:</strong> {scanResult.data.nombre_zona}
              </p>
              <p>
                <strong>ID:</strong> {scanResult.data.uuid_unico.slice(0, 8)}...
              </p>
            </div>
          )}

          <button onClick={resetScanner} style={styles.nextBtn}>
            Escanear Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "20px", maxWidth: "600px", margin: "0 auto" },
  resultCard: {
    padding: "40px 20px",
    borderRadius: "20px",
    border: "5px solid",
    textAlign: "center",
    marginTop: "20px",
    animation: "popIn 0.3s",
  },
  nextBtn: {
    marginTop: "30px",
    padding: "15px 30px",
    fontSize: "1.2rem",
    fontWeight: "bold",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    width: "100%",
  },
};

export default ScannerPage;
