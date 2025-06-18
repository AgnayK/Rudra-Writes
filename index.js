import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

// PostgreSQL Database Configuration
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Blog",
  password: "agiK19$$",
  port: 5432,
});
db.connect();

// Path Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express App Initialization
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

/* ------------------ ROUTES ------------------ */

// Home Page - List All Blogs
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM blogs");
    res.render("index.ejs", { data: result.rows });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Create Blog Page
app.get("/create-blog", (req, res) => {
  res.render("create_blog.ejs", {
    isEdit: false,
  });
});

// Submit New Blog
app.post("/submit", async (req, res) => {
  const { "blog-heading": heading, "blog-intro": introduction, "blog-contents": content, "blog-conclusion": conclusion } = req.body;

  try {
    await db.query(
      "INSERT INTO blogs (heading, introduction, contents, conclusion) VALUES ($1, $2, $3, $4)",
      [heading, introduction, content, conclusion]
    );
    console.log("Blog saved successfully");
    res.redirect("/");
  } catch (err) {
    console.error("Error inserting blog:", err);
    res.status(500).send("Error saving blog");
  }
});

// View a Single Blog
app.get("/blog/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).send("Invalid blog ID");

  try {
    const result = await db.query("SELECT * FROM blogs WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).send("Blog not found");

    res.render("blog.ejs", { data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).send("Internal server error");
  }
});

// Delete Blog
app.post("/delete/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    await db.query("DELETE FROM blogs WHERE id = $1", [id]);
    console.log("Blog deleted successfully");
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).send("Error deleting blog");
  }
});

// Edit Blog Page
app.get("/edit/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).send("Invalid blog ID");

  try {
    const result = await db.query("SELECT * FROM blogs WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).send("Blog not found");

    res.render("create_blog.ejs", {
      id: id,
      data: result.rows[0],
      isEdit: true,
    });
  } catch (err) {
    console.error("Error fetching blog for edit:", err);
    res.status(500).send("Internal server error");
  }
});

// Update Existing Blog
app.post("/update/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).send("Invalid blog ID");

  const updatedBlog = {
    heading: req.body["blog-heading"],
    introduction: req.body["blog-intro"],
    content: req.body["blog-contents"],
    conclusion: req.body["blog-conclusion"],
  };

  try {
    await db.query(
      "UPDATE blogs SET heading = $1, introduction = $2, contents = $3, conclusion = $4 WHERE id = $5",
      [updatedBlog.heading, updatedBlog.introduction, updatedBlog.content, updatedBlog.conclusion, id]
    );
    console.log("Blog updated successfully");
    res.redirect("/");
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).send("Error updating blog");
  }
});

// Server Start
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
