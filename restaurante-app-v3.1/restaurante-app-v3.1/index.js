const express = require("express");
const cors = require("cors");

const { google } = require("googleapis");

const app = express();

app.use(cors());

// Para parsear JSON en el body
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//   console.log(req.body);

//   res.send(req.body);
// });
app.post("/", async (req, res) => {
  let { historial } = req.body;

  // Transformar historial en un arreglo de filas
  const filas = historial.map((pedido) => {
    const { id, nombre, menu, total, comentarios, fecha } = pedido;
    return [id, nombre, menu, total, comentarios, fecha];
  });

  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Crear la instancia cliente para auth
  const client = await auth.getClient();

  // Instancia de Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = SPREAHSHEETID;

  // Obtener la metada de spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  // Leer filas desde el spreadsheet
  const getFilas = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Ordenes",
  });

  // Escribir en las filas de spreadsheet
  await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Ordenes!A:B",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: filas,
    },
  });
  res.json({ message: "Sincronización completada" }); // ✅ importante
});

app.listen(1337, (req, res) => console.log("running on 1337"));
