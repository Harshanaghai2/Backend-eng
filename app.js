const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const file_path = "posts.json";

// Function to read posts
const getPosts = () => {
    try {
        const data = fs.readFileSync(file_path, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Function to save posts
const savePosts = (posts) => {
    fs.writeFileSync(file_path, JSON.stringify(posts, null, 2), "utf-8");
};

// 🏠 **Home Page - Displays Featured and Recent Posts**
app.get("/", (req, res) => {
    const posts = getPosts();
    const featuredPost = posts.length > 0 ? posts[0] : null;
    res.render("home", { posts, featuredPost });
});

// 📜 **Post Page - Shows Either All Posts or a Single Post**
app.get("/post", (req, res) => {
    const posts = getPosts();
    const postId = req.query.id ? parseInt(req.query.id) : null;

    if (!postId) {
        // If no ID, show all posts
        return res.render("posts", { posts });
    }

    const postFound = posts.find((p) => p.id === postId);
    if (!postFound) {
        return res.status(404).send("Post Not Found!");
    }

    res.render("post", { post: postFound });
});

// 📝 **Add Post Page**
app.get("/addPost", (req, res) => {
    res.render("addPost");
});

// 🔄 **Handle New Post Submission**
app.post("/addPost", (req, res) => {
    const posts = getPosts();
    const { title, content, image } = req.body;

    if (!title || !content) {
        return res.status(400).send("Title and Content are required!");
    }

    const newPost = {
        id: posts.length ? posts[posts.length - 1].id + 1 : 1,
        title,
        content,
        image: image || "/images/default.jpg",
        date: new Date().toISOString().split("T")[0],
    };

    posts.push(newPost);
    savePosts(posts);

    res.redirect("/");
});

// 🚀 **Start Server**
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
