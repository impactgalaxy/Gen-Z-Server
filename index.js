require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
const app = express();

const port = process.env.PORT || 5000;
const corsObj = {
    origin: ["http://localhost:5173"],
    methods: ['GET','POST','PUT','DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // allow credentials (cookies)
}
app.use(cors(corsObj))

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s7sbkwf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const messMembersBalance = client.db("Gen-Z").collection("MessMembersBalance")

    app.post('/members', async (req, res) => {
        try {
          const memberInfo = req.body; // Assuming data comes from the request body
          memberInfo.totalBalance = 0;
          memberInfo.totalCost = 0;
          memberInfo.totalMeals = [];      
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
      const filter = {_id: new ObjectId(id)}
      const result = await messMembers.findOne(filter);
      res.send(result)
    })

    app.patch("/mealUpdate/:id", async (req, res)=>{
      const {id} = req.params;
      const doc = req.body;
      const result = await messMembers.updateOne(
        { _id: new ObjectId(id) },
        { $push: {totalMeals: doc} }
      );
      res.send(result);
    })

    app.post("/balance", async (req, res)=> {
      const balance = req.body;
      let id = balance?.memberId;
      const amount = parseInt(balance?.balance);
      const result = await messMembersBalance.insertOne(balance);

      const up = await messMembers.updateOne(
        { _id: new ObjectId (id) },
        { $inc: { totalBalance: amount } }, // Increment value
      );
  
      res.send(result)
    });

    app.get("/balanceQuery/:id", async(req, res)=>{
      const {id} = req.params;
      const result = await messMembersBalance.find({memberId: id}).toArray();
      res.send(result);
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