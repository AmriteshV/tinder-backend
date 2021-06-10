//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true},{useUnifiedTopology: true});
const itemSchema = {
  task: String
};

const listSchema = {
  name: String,
  items: [itemSchema]
};

const Items = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listSchema);

const item1 = new Items({
  task: "Welcome to my To-Do List"
});
const item2 = new Items({
  task: "Hit + to add a new item to the list"
});
const item3 = new Items({
  task: "<-- Hit to delete an item"
});
const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {
  Items.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Items.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully inserted !");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  });
});

app.post("/", function(req, res){
  const itemTask = req.body.newItem;
  const listName = req.body.list
  const itemNew = new Items({
    task: itemTask
  });
  if(listName == "Today"){
    itemNew.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(itemNew);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});


app.post("/delete", function(req, res){
  const listName = req.body.listName;
  const checkedItem = req.body.checkbox;
  if(listName == "Today"){
    Items.findByIdAndRemove(checkedItem,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Deleted the task!");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName)
      }
    });
  }
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const lists = new List({
          name : customListName,
          items: defaultItems
        });
        lists.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
