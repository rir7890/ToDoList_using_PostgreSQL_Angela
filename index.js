import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  password: "12345",
  host: "localhost",
  port: "5432",
  database: "permalist",
});

db.connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL database", err);
  });

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items");
    items = result.rows;
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (error) {
    console.error(error);
  }
});

app.post("/add", async (req, res) => {
  const title = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [title]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
});

app.post("/edit", async (req, res) => {
  const ID = req.body["updatedItemId"];
  const Title = req.body["updatedItemTitle"];
  try {
    await db.query("UPDATE items SET title=$1 WHERE id=$2", [Title, ID]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
});

app.post("/delete", async (req, res) => {
  const ID = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [ID]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
