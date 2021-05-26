const express = require("express");
const PORT = process.env.PORT || 5000
const app = express();
var cors = require('cors')


app.use(express.json(), cors());

const screener = require("./routes/screener");
app.use("/api/v1", screener);

app.listen(PORT, () => console.log(`Server running successfully at ${PORT}`));