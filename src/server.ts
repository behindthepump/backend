import app from "./app.js";

const port = Number(process.env.PORT) || 4100;

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
