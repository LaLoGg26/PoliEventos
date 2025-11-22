function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div>
          <h3>Ticketera MVP</h3>
          <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
        <div style={styles.links}>
          <span>Ayuda</span>
          <span>Términos</span>
          <span>Privacidad</span>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#222",
    color: "#aaa",
    padding: "40px 20px",
    marginTop: "auto", // Empuja el footer al fondo si hay poco contenido
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  links: {
    display: "flex",
    gap: "20px",
    cursor: "pointer",
  },
};

export default Footer;
