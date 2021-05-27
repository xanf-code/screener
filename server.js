const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000
const app = express();
var cors = require('cors')

require('dotenv').config();
let mongoURL = process.env.MongoDB_URL;

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
});

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB is connected");
});


app.use(express.json(), cors());

const screener = require("./routes/screener");
app.use("/api/v1", screener);

app.listen(PORT, () => console.log(`Server running successfully at ${PORT}`));