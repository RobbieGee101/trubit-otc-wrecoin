require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const TRUBIT_API_KEY = process.env.TRUBIT_API_KEY;
const TRUBIT_SECRET = process.env.TRUBIT_SECRET;
const TRUBIT_BASE_URL = "https://api.trubit.com";

// 🔥 Función para obtener el precio en USDT
async function obtenerPrecioBNB() {
    try {
        const response = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT");
        return parseFloat(response.data.price);
    } catch (error) {
        console.error("Error obteniendo precio de BNB:", error);
        return null;
    }
}

// ✅ Endpoint para crear la orden OTC con conversión de USDT
app.post("/api/crear-orden", async (req, res) => {
    try {
        const { monto, moneda } = req.body;

        if (moneda !== "USDT") {
            return res.status(400).json({ success: false, message: "Solo se permite comprar con USDT." });
        }

        // 🔄 Obtener tasa de conversión BNB → USDT
        const precioBNB = await obtenerPrecioBNB();
        if (!precioBNB) {
            return res.status(500).json({ success: false, message: "Error obteniendo precio de BNB." });
        }

        // 📉 Convertir monto de USDT a BNB
        const cantidadBNB = monto / precioBNB;

        // 🛒 Datos de la orden
        const data = {
            symbol: "WRE_COIN_BNB",
            side: "buy",
            type: "limit",
            price: "MERCADO",
            quantity: cantidadBNB,
        };

        // 📤 Enviar orden a Trubit
        const response = await axios.post(
            `${TRUBIT_BASE_URL}/v1/orders`,
            data,
            {
                headers: { "X-MBX-APIKEY": TRUBIT_API_KEY },
            }
        );

        res.json({ success: true, order: response.data, cantidadBNB, precioBNB });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📌 Endpoint para verificar orden
app.get("/api/estado-orden/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;

        const response = await axios.get(
            `${TRUBIT_BASE_URL}/v1/order?orderId=${orderId}`,
            {
                headers: { "X-MBX-APIKEY": TRUBIT_API_KEY },
            }
        );

        res.json({ success: true, orderStatus: response.data.status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🖥 Iniciar servidor en Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en Vercel corriendo en puerto ${PORT}`));

module.exports = app;
