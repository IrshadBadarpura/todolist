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

mongoose.connect("mongodb+srv://admin-irshad:test1234@cluster0-wpxed.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology:true});
mongoose.set('useFindAndModify', false);

const itemsSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const task1 = new Item({
  name: "Complete one module"
})

const task2 = new Item({
  name:"leetcode"
})

const task3=new Item ({
  name: "Dark ep. 5"
})

const defaultItems = [task1, task2, task3];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List",listSchema);

// Item.insertMany(defaultItems, (err)=>{
//   if(err){
//     console.log(err);
//   }else{
//     console.log('Added successfully');
//   }
// })


app.get("/", function(req, res) {

const day = date.getDate();


Item.find(function(err, items){

  if(items === 0){
    Item.insertMany(defaultItems, (err)=>{
      if(err){
        console.log(err);
      }else{
        console.log('Added successfully');
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: day, newListItems: items});
  }
});



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === date.getDate()){
    newItem.save();
    res.redirect("/");
  }else{
      List.findOne({name: listName}, (err, foundList) =>{
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+ listName);
      });
  }
});

app.post("/delete", (req, res) =>{
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if( listName === date.getDate()){
    Item.deleteOne({_id:checkedItem}, (err) =>{
      if(err){
        console.log(err);
      } else{
        console.log("Deleted successfully");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},
    {$pull: {items:{_id:checkedItem}}},
    (err, foundList) =>{
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:custom", (req, res) =>{
  const customListName = _.capitalize(req.params.custom);

  List.findOne({name: customListName}, (err,foundList)=>{
    if(!err){
      if(!foundList){
        const listItem = new List({
          name: customListName,
          items: defaultItems
        });
        listItem.save();
        res.redirect("/"+customListName);
      }else{
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
//
// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
