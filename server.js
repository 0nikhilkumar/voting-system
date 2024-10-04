const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const connectDB = require("./db/index.js");
const PORT = process.env.PORT || 3000;


app.use(bodyParser.json()); // req.body

const userRoutes = require("./routes/user.routes.js");
const candidateRoutes = require("./routes/candidate.routes.js");

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);


connectDB().then(()=> {
    app.listen(PORT, () => {
      console.log(`Listening on port: ${PORT}`);
    });
})