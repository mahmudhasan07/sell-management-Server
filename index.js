const express = require('express')
const cors = require('cors')
const port = 5000
const app = express()
require('dotenv').config()
app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173', 'https://sell-project-6af5a.web.app'],
    credentials: true
}))


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.oqk84kq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const users = client.db('sell-service').collection('users')
        const orders = client.db('sell-service').collection('orders')


        // Get Section

        app.get('/users', async (req, res) => {
            const result = await users.find().toArray()
            res.send(result)

        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email
            const query = { $or: [{ $and: [{ email: email }, { role: 'seller' }] }, { $and: [{ email: email }, { role: 'admin' }] }] }
            const result = await users.findOne(query)
            if (result) {
                res.send({ role: result.role })
            }
            else {
                res.send({ role: 'none' })
            }
        })

        app.get('/users/seller', async (req, res) => {
            const query = { role: '' }
            const result = await users.find(query).toArray()
            res.send(result)
        })

        app.get('/sellreport', async (req, res) => {
            const result = await orders.find().toArray()
            res.send(result)
        })

        app.get('/sellreport/:email', async(req,res)=>{
            const email = req.params.email
            const query = {sellerEmail : email}
            const result = await orders.find(query).toArray()
            res.send(result)
        })

        app.get('/order/:id', async (req, res) => {
            const id = req.params.id
            console.log(id);

            const query = { _id: new ObjectId(id) }
            const result = await orders.findOne(query)
            res.send(result)

        })


        // Post Section

        app.post('/orders', async (req, res) => {
            const order = req.body
            console.log(order);
            const result = await orders.insertOne(order)
            res.send(result)
        })

        app.post("/users", async (req, res) => {
            const data = req.body
            const query = { $and: [{ name: { $regex: data?.name, $options: 'i' } }, { email: { $regex: data?.email, $options: 'i' } }] }
            const user = await users.findOne()
            const result = await users.insertOne(data)
            res.send(result)
        })

        // Update Section

        app.patch('/user/:email', async (req, res) => {
            const email = req.params.email
            const data = req.body.role
            console.log(email, data);
            const query = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    role: data
                }
            }

            const result = await users.updateOne(query, updateDoc, options)
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', async (req, res) => {
    res.send({ message: 'Welcome to server side' })
})

app.listen(port, () => {
    console.log(`Server is running at ${port}`);

})
