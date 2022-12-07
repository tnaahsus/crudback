const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const { check, validationResult } = require("express-validator");
// config dot env file
dotenv.config();
console.log(process.env.DATABASE_URL)
mongoose.connect(
  process.env.DATABASE_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (error) {
    if (error) {
      console.log("Error!" + error);
    }
  }
);
const app = express();
const port = 3000;



const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: Number,
  age: Number,
});
const Contact = mongoose.model("Contact", contactSchema);

app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//static files

app.get("/get", async (req, res) => {
  try {
    const data = await Contact.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post(
  "/admin",
  [
    check("email", "Please Enter Valid emailId").isEmail(),
    check("name", "Name length should be 2 to 20 characters").isLength({
      min: 2,
      max: 20,
    }),
    check("phone", "Phone length should be maximum 10 digits").isLength({
      min: 2,
      max: 10,
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    let myData = new Contact(req.body);
    myData
      .save()
      .then(() => {
        res.send("This item has been saved to the database");
      })
      .catch((err) => {
        res.status(400).send("this item is not saved");
      });
  }
);
app.put("/admin/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };

    const result = await Contact.findByIdAndUpdate(id, updatedData, options);

    res.send(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.delete("/admin/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Contact.findByIdAndDelete(id);
    res.send(`Document with ${data.name} has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.listen(port, () => {
  console.log(`The application started succesfully on port 
    ${port}`);
});
