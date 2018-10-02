const express = require('express')
const app = express()

app.use(express.static(__dirname))

// router
app.get('/', (req, res) => res.send('Hi'))

app.listen(5000, () => console.log('Test app listening on http://localhost:5000 ...'))