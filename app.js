//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://localhost:27017/todolistDB");
const itemsSchema = {
  title: String,
};
//create model based on schema
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  title: "Connect todolist to mongoose",
});
const item2 = new Item({
  title: "50 push ups",
});
const item3 = new Item({
  title: "Joj 200miles in 5 seconds",
});

const defaultItems = [item1, item2, item3];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
      });
    }
  });
});

app.post("/", function (req, res) {
  const itemTitle = req.body.newItem;
  //new item document
  const item = new Item({
    title: itemTitle,
  });
  //we can simply use .save() to save a new document to a collection
  item.save();
  res.redirect("/");
});
app.post("/delete", function (req, res) {
  const checkItemId = req.body.value;
  Item.findOneAndRemove(checkItemId, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("successfully deleted");
    }
  });
  res.redirect("/");
});
app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
