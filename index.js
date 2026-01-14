const express = require('express')
const  connectDB = require('./config/dbConnection')
const dotenv = require('dotenv').config()
const handleError = require('./middleWare/errorHandler')
var cors = require('cors')
connectDB()

const app = express()
app.use(express.json())
app.use(cors({
    credentials: true,
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
  }))



app.use('/api/v1/user', require('./router/usersRouter'))
app.use('/api/v1/group', require('./router/groupRouter'))
app.use('/api/v1/admin', require('./router/adminRouter/adminRouter'))
app.use('/api/v1/task', require('./router/taskRouter/taskRouter'))
app.use(handleError)


app.listen( process.env.PORT, ()=>{
    console.log(`server starts on port ${process.env.PORT} `);
})
