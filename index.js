const express = require('express');
const app = express();
const cors = require('cors');

require ('dotenv').config();
const { MongoClient } = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sfmd0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);



async function run() {
    try {
        await client.connect();
        const database = client.db('travelers-Blog');
        const blogsCollection = database.collection('blogs');
        const usersCollection = database.collection('users');
        


       // GET Blogs API
        app.get('/blogs', async(req, res) => {
            const cursor = blogsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let Blogs;
            const count = await cursor.count();

            if (page) {
                Blogs = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                Blogs= await cursor.toArray();
            }

            res.send({
                count,
                Blogs
            });
        });

        // GET SINGLE Blogs API
        app.get('/blogs/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await blogsCollection.findOne(query);
            res.json(result);
            
        })

        // POST Blogs API
        app.post('/blogs', async(req, res) => {
            const product = req.body;
            const result = await blogsCollection.insertOne(product);
            res.json(product);
        })

        // POST USER API
        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
            
        })

        // upsert USER DATA
        app.put('/users', async(req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        //  set Admin Api
        app.put('/users/admin',  async(req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}}
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
            
        })
       
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Blogs')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
});