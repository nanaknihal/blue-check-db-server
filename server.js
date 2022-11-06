const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
//const { Sequelize } = require("Sequelize");
const dbConfig = require("../handle-verified.db.config.js");
const assert = require("assert");

const app = express();

const corsOptions = {
        origin: "*"
};

app.use(cors(corsOptions));




const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});
connection.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to database");
});

const _setVerified = (handle, callback) => {
    // assert(handle.length < 32, "handle is too long"); // I assume 32 bits or more is too long for the elliptic curve
    connection.query(`INSERT INTO HandleVerified (Handle, Verified) VALUES ('${handle.toLowerCase()}', 1)`, (err, result) => {callback(err,result)});
}

const getVerified = (handle, callback) => {
    connection.query(`SELECT Verified FROM HandleVerified WHERE Handle='${handle.toLowerCase()}'`, (err, result) => {callback(err, result)});
}


app.get ("/", (req, res) => {
        console.log("got a request")
        res.json({message: "hey"});
});

app.get ("/setdangerous/:handle", (req, res) => {
    const callback = (error, result) => {
        if(error){
            console.log(error);
            res.send(error);
        } else {
            res.send(true);
        }
    }
    _setVerified(req.params.handle, callback);
});

app.get ("/get/:handle", (req, res) => {
    const callback = (error, result) => {
        if(error){
            res.send(false);
        } else {
            if ((!(result.length)) || (!(result[0]["Verified"]))) { res.send(false); return }
            res.send(Boolean(result[0]["Verified"]));
        }
    }

    getVerified(req.params.handle, callback);
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
