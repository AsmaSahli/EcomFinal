const mongoose = require("mongoose")

const dbName=process.env.DB

mongoose.connect(`mongodb://127.0.0.1/${dbName}`)
    .then(()=>console.log(`connected to ${dbName} database`))
    .catch(err => console.error(err))
