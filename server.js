import express from "express"
import mongoose from "mongoose"
import Cards from "./dbCards.js"
import Cors from "cors"

//XrrTTgW5TGht0fCc

//App Config
const app = express();
const port = process.env.PORT || 8000

//Middlewares
app.use(express.json());
app.use(Cors());

//DB Config
mongoose.connect("mongodb://localhost:27017/tinderdb",{useNewUrlParser:true,useUnifiedTopology: true});

//API Endpoints
app.get("/", function(req,res) {
    res.status(200).send("Hello World!");
});

app.post("/tinder/cards", function(req,res){
  const dbCard = req.body;
  Cards.create(dbCard, function(err,data){
    if(err){
      res.send(500).send(err);
    }else{
      res.status(201).send(data);
    }
  })
});

app.get("/tinder/cards",function(req,res){
  Cards.find(function(err,data){
    if(err){
      res.send(500).send(err);
    }else{
      res.status(200).send(data);
    }
  })
})



//Listener
app.listen(port, () => console.log(`Listening on port ${port} `));