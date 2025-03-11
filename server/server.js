const express = require("express");
const app=express();
const cookieParser = require('cookie-parser');

const cors=require("cors");
app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true,
}));

app.use(express.json(express.urlencoded({extended: true})))
app.use(cookieParser());




require("dotenv").config()
require("./config/mongoose")

const port=process.env.PORT





    //middleware for errors  
    app.use ((err,req,res,next) => {
        console.error(err.stack);
        const statusCode = err.statusCode || 500;
        const message = err.message || 'Internal server error';
        res.status(statusCode).json({
        success: false,
        statusCode,
        message
        })
    }
    )



app.listen(port,()=>console.log(`listening on port: ${port}`))
