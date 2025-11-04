import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ticketRoutes from "./routes/tickets.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente 🚀");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
