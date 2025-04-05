// const express = require('express')
// // const  connectDB = require('./config/dbConnection')
// const dotenv = require('dotenv').config()
// var cors = require('cors')
// const http = require('http')

// // Define multiple server ports
// const SERVER_PORTS = [3000, 3001, 3002] // Adjust ports as needed
// let currentServerIndex = 0

// // Create multiple server instances
// const servers = SERVER_PORTS.map(port => {
//     const app = express()
//     app.use(express.json())
//     app.use(cors({
//         credentials: true,
//         origin: [
//             "http://localhost:5173",
//             "http://localhost:5174",
//             "http://localhost:5175",
//         ],
//     }))

//     // Health check endpoint
//     app.get('/health', (req, res) => {
//         res.status(200).send('OK')
//     })

//     return { app, port }
// })

// // Load balancing function
// function getNextHealthyServer() {
//     const startIndex = currentServerIndex
//     do {
//         currentServerIndex = (currentServerIndex + 1) % servers.length
//         // Try to find a healthy server
//         const server = servers[currentServerIndex]
        
//         // Basic health check
//         try {
//             http.get(`http://localhost:${server.port}/health`, (resp) => {
//                 if (resp.statusCode === 200) {
//                     return server
//                 }
//             })
//         } catch (error) {
//             console.log(`Server on port ${server.port} is not responding`)
//         }
//     } while (currentServerIndex !== startIndex)
    
//     throw new Error('No healthy servers available')
// }

// // Create a main server to handle incoming requests
// const mainApp = express()
// mainApp.use(express.json())
// mainApp.use(cors({
//     credentials: true,
//     origin: [
//         "http://localhost:5173",
//         "http://localhost:5174",
//         "http://localhost:5175",
//     ],
// }))

// // Proxy middleware to forward requests
// mainApp.use(async (req, res) => {
//     try {
//         const server = await getNextHealthyServer()
        
//         // Forward the request to the healthy server
//         const proxyReq = http.request({
//             hostname: 'localhost',
//             port: server.port,
//             path: req.url,
//             method: req.method,
//             headers: req.headers
//         }, (proxyRes) => {
//             res.writeHead(proxyRes.statusCode, proxyRes.headers)
//             proxyRes.pipe(res)
//         })

//         // Forward the request body if it exists
//         if (req.body) {
//             proxyReq.write(JSON.stringify(req.body))
//         }
        
//         proxyReq.on('error', (error) => {
//             console.error('Proxy request failed:', error)
//             res.status(500).send('Server error')
//         })

//         proxyReq.end()
//     } catch (error) {
//         console.error('Load balancing error:', error)
//         res.status(503).send('All servers are currently unavailable')
//     }
// })

// // Start the main server on a different port (e.g., 8000)
// const MAIN_PORT = 8000
// mainApp.listen(MAIN_PORT, () => {
//     console.log(`Main server (load balancer) started on port ${MAIN_PORT}`)
// })

// // Start all backend servers
// servers.forEach(({ app, port }) => {
//     app.listen(port, () => {
//         console.log(`Backend server started on port ${port}`)
//     })
// })
