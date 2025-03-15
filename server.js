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

// 🔹 **Define el precio manualmente** aquí
const PRECIO_WRE_COIN_USDT = 2.00; // 🔄 Cambia este valor según tu estrategia de precios

// ✅ Endpoint para crear orden de compra en USDT
app.post("/api/crear-orden", async (req, res) => {
    try {
        const { cantidad } = req.body; 

        if (!cantidad || cantidad <= 0) {
            return res.status(400).json({ success: false, message: "Cantidad inválida." });
        }

        // 📌 **Calcular total en USDT basado en el precio fijo**
        const totalUSDT = cantidad * PRECIO_WRE_COIN_USDT;

        // 🛒 Datos de la orden en Trubit
        const data = {
            symbol: "WRE_COIN_USDT", 
            side: "buy",
            type: "limit",
            price: PRECIO_WRE_COIN_USDT,
            quantity: cantidad,
        };

        // 📤 Enviar orden a Trubit
        const response = await axios.post(
            `${TRUBIT_BASE_URL}/v1/orders`,
            data,
            {
                headers: { "X-MBX-APIKEY": TRUBIT_API_KEY },
            }
        );

        res.json({ success: true, order: response.data, totalUSDT });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

