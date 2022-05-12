const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');
require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json());
app.use(fileUpload())

// final-defense
// 5Xbhle1XOz3a0G9k

const stripe = require("stripe")('sk_test_51KxWYHBy9VrJHNnAp0IChpo5LED9UISWRSZiIkzHJwsBDUKzNqPN3S2Qd1kIb5t5TvXyhirnsKZpYIW2atnjWpYE00WaTUrxBi');




const { MongoClient } = require('mongodb');

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.pihjg.mongodb.net:27017,cluster0-shard-00-01.pihjg.mongodb.net:27017,cluster0-shard-00-02.pihjg.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-l3pmah-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db("insertDB");
        const haiku = database.collection("haiku");
        const ordersCollection = database.collection("orders");
        const userCollection = database.collection('users');
        const blogCollection = database.collection('blogs');
        const mealCollection = database.collection('meals');
        const reviewsCollection = database.collection('reviews')



        app.get('/haiku', async (req, res) => {
            const cursor = haiku.find({})
            const cars = await cursor.toArray();
            res.send(cars)
        })

        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({})
            const cars = await cursor.toArray();
            res.send(cars)
        })

        // get blog
        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find({})
            const cars = await cursor.toArray();
            res.send(cars)
        })
        // get meals
        app.get('/meals', async (req, res) => {
            const cursor = mealCollection.find({})
            const cars = await cursor.toArray();
            res.send(cars)
        })
        // get Reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const cars = await cursor.toArray();
            res.send(cars)
        })


        // Add new blog
        app.post('/blogs', async (req, res) => {
            const name = req.body.name;
            const date = req.body.date;
            const description = req.body.description;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const doctor = {
                name,
                date,
                description,
                image: imageBuffer
            }
            const result = await blogCollection.insertOne(doctor);
            res.json(result);
        })
        // Add new Food
        app.post('/meals', async (req, res) => {
            const name = req.body.name;
            const category = req.body.category;
            const price = req.body.price;
            const rating = req.body.rating;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const doctor = {

                name,
                category,
                price,
                rating,
                image: imageBuffer
            }
            const result = await mealCollection.insertOne(doctor);
            res.json(result);
        })


        // DELETE Food by id 
        app.delete('/meals/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await mealCollection.deleteOne(query)
            res.json(result)
        })



          // API POST REVIEWS
          app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('hitting the post', review)
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.send(result);
        })

        // get singel orders by using email
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray();
            res.json(result);
        })

        // // get single order by  id
        // app.get('/orders/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) }
        //     const result = await ordersCollection.findOne(query);
        //     res.json(result);
        // })

       


        // payment update to orders collection
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    order: 'Delivered'
                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // admin check
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };

            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });

        })

        // API POST for oder
        app.post('/haiku', async (req, res) => {

            const order = req.body;
            console.log('hitting the post', order)
            const result = await haiku.insertMany(order);
            console.log(result);
            res.json(result);
        })


        // API POST for oder
        app.post('/orders', async (req, res) => {

            const order = req.body;
            console.log('hitting the post', order)
            const result = await ordersCollection.insertMany(order);
            console.log(result);
            res.json(result);
        })



        //   SAVE USER INFORMATION TO DATABASE
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        })



        // MAKE ADMIN
        app.put('/users/admin', async (req, res) => {
            const user = req.body;

            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);


        })

        //  UPSART USER
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })




        // admin check
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };

            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });

        })



        // get singel orders by using email
        app.get('/haiku/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = haiku.find(query)
            const result = await cursor.toArray();
            res.json(result);
        })





        app.get('/haiku/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await haiku.findOne(query);
            res.json(result);
        })


        // app.put('/orders', async (req, res) => {
        //     const id = req.params.id;
        //     const payment = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const updateDoc = {
        //         $set: {
        //             payment: 'paid'
        //         }
        //     };
        //     const result = await ordersCollection.updateOne(filter, updateDoc);
        //     res.json(result);
        // });





    } finally {
        // await client.close();

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Food Delivery app Server')
})

app.listen(port, () => {
    console.log(`Food Delivery app listening on port ${port}`)
})

