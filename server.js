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
    connection.query(`INSERT INTO HandleVerified (Handle, Verified) VALUES ('${handle}', 1)`, (err, result) => {callback(error,result)});
}

const getVerified = (handle, callback) => {
    connection.query(`SELECT Verified FROM HandleVerified WHERE Handle='${handle}'`, (err, result) => {callback(err, result)});
}



// parse requests of content-type - application/json

app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({extended:true}));

app.get ("/", (req, res) => {
        console.log("got a request")
        res.json({message: "hey"});
});

app.get ("/setdangerous/:handle", (req, res) => {
    const callback = (error, result) => {
        if(error){
            res.send(false);
        } else {
            res.send(result[0]["Verified"]);
        }
    }
    _setVerified(req.params.handle, callback);
});

app.get ("/get/:handle", (req, res) => {
    const callback = (error, result) => {
        if(error){
            res.send(false);
        } else {
            res.send(result[0]["Verified"]);
        }
    }

    getVerified(req.params.handle, callback);
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
