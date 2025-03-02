require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;
const corsObj = {
    origin: ["http://localhost:5173"],
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // allow credentials (cookies)
}
app.use(cors(corsObj))

app.use(express.json());
const uri = `mongodb+srv://${import.meta.DB_USER}:${import.meta.DB_PASS}@cluster0.s7sbkwf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection;

    const messMembers = client.db("Gen-Z").collection("MessMembers");

    app.post('/members', async (req, res) => {
        try {
          const memberInfo = req.body; // Assuming data comes from the request body
          memberInfo.totalBalance = 0;
          memberInfo.totalCost = 0;      
          if (!memberInfo) {
            return res.status(400).send("No document provided.");
          }
      
          const result = await messMembers.insertOne(memberInfo);
          res.send(result);
        } catch (error) {
          res.status(500).send("Internal server error.");
        }
      });


    app.get("/allMembers", async(req, res)=>{
        const result = await messMembers.find().toArray();
        res.send(result);
    })

    app.get("/member/:id", async(req,res)=>{
      const {id} = req.params;
      console.log(id);
      const filter = {_id: new ObjectId(id)}
      const result = await messMembers.findOne(filter);
      res.send(result)
    })
    
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => res.send("Server for gen-z mess members is running successfully..."));
app.listen(port, ()=> console.log("Server running on port: ", port));