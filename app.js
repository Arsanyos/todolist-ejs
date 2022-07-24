//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
// import mongoose from "mongoose";
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect(
  "mongodb+srv://madnman_lacy:Gashew.24@blogpost.dkyqo.mongodb.net/todolistDB?retryWrites=true&w=majority"
);
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

const ListSchema = {
  title: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", ListSchema);

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
  const listName = req.body.list;
  //new item document
  const item = new Item({
    title: itemTitle,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ title: itemTitle }, function (err, foundList) {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});
app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findOneAndRemove(checkItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successfully deleted");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { title: listName },
      { $pull: { _id: checkItemId } },
      function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListname", function (req, res) {
  const customListname = _.capitalize(req.params.customListname);

  List.findOne({ title: customListname }, function (err, foundList) {
    if (!foundList) {
      const list = new List({
        title: customListname,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListname);
    } else {
      res.render("list", {
        listTitle: foundList.title,
        newListItems: foundList.items,
      });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});
let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 27017;
// }
app.listen(port);
app.listen(port, function () {
  console.log("Server started successfully");
  console.log(port);
});
