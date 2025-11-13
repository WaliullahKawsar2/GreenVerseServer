const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
const serviceAccount = require("./service-key.json");
app.use(express.json())
app.use(cors())

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const uri = "mongodb+srv://GalleryVerseAdmin:lHMMOWy2TNcgwtfP@cluster0.lsoelsf.mongodb.net/?appName=Cluster0";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).send({
      message: "unauthorized access. Token not found!",
    });
  }

  const token = authorization.split(" ")[1];
  try {
    await admin.auth().verifyIdToken(token);

    next();
  } catch (error) {
    res.status(401).send({
      message: "unauthorized access.",
    });
  }
};

async function run() {

  try {
    await client.connect();
    
    const db = client.db('greenverse_db')
    const artsCollection = db.collection('arts_collection')

    
    app.get('/arts',async(req, res)=>{

        const result = await artsCollection.find().toArray()
        res.send(result)
    })
    
    app.get('/arts/:id',async(req, res)=>{
        
        const {id} = req.params
        console.log(id);
        const result = await artsCollection.findOne({_id: new ObjectId(id)})
        
        res.send(result)
    })

    app.post('/arts',async(req, res)=>{
        const data = req.body
        const result = await artsCollection.insertOne(data)
        res.send({
            success : true,
            result
        })
    })
    
    app.put('/arts/:id',async(req, res)=>{
        const {id} = req.params
        const data = req.body
        console.log(id);

        const objectId = new ObjectId(id)
        const filter = {_id: objectId}
        const update = {
            $set: data
        }
        
        const result = await artsCollection.updateOne(filter,update)
        
        res.send({
            success : true,
            result

        })
    })

    app.delete('/arts/:id',async(req, res)=>{
        const {id} = req.params
        const objectId = new ObjectId(id)
        
        const result = await artsCollection.updateOne(objectId)
        
        res.send({
            success : true,
            result

        })
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})