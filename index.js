const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yxeyv01.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server (optional starting in v4.7)
        // await client.connect();

        const carsCollection = client.db('carsDB').collection('cars');
        const cartCollection = client.db('carsDB').collection('cart');

        app.post('/cars', async (req, res) => {
            const newCar = req.body;
            console.log(newCar);
            const result = await carsCollection.insertOne(newCar);
            res.send(result);
        });

        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/cars/:brandName', async (req, res) => {
            const selectedBrand = req.params.brandName;
            const query = { brandName: selectedBrand }; // Update the query to match the "brandName" field.
            const cursor = carsCollection.find(query); // Pass the query to the find method.
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carsCollection.findOne(query);
            res.send(result);
        })



        app.put('/car/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCar = req.body;

            const car = {
                $set: {
                    name: updatedCar.name,
                    brandName: updatedCar.brandName,
                    type: updatedCar.type,
                    price: updatedCar.price,
                    rating: updatedCar.rating,
                    shortDescription: updatedCar.shortDescription,
                    image: updatedCar.image
                }
            }

            const result = await carsCollection.updateOne(filter, car, options);
            res.send(result);
        })

        app.post('/cart', async (req, res) => {
            const newCar = req.body;
            console.log(newCar);
            const result = await cartCollection.insertOne(newCar);
            res.send(result);
        });

        app.get('/cart', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.delete('/cart/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id }
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // Commenting this out to keep the client connected as long as the server is running
        // await client.close();
    }
}

app.get('/', (req, res) => {
    res.send('Car Fusion server is running');
});

app.listen(port, () => {
    console.log(`Car Fusion Server is running on port: ${port}`);
});

// Call the run function to connect to MongoDB and define routes
run().catch(console.dir);
