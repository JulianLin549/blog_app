const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const expressSanitizer = require('express-sanitizer')
mongoose.connect("mongodb://localhost:27017/blog_app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
//app config
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public")); //去public找東西
app.use(methodOverride("_method"));
app.use(expressSanitizer()) //要放在bodyparser後面
app.set('view engine', 'ejs'); //ejs設訂為預設檔案。//create and update


//mongoose/model config
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png"
    },
    body: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
})
const Blog = mongoose.model("Blog", blogSchema);

//restful route
app.get("/", (req, res) => {
    res.redirect("/blogs");
})

//Index route
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {
                blogs: blogs
            });
        }
    });

});

//new route
app.get("/blogs/new", (req, res) => {
    res.render("new");
});

//create route
app.post("/blogs", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body) //sanitize to prevent XSS
    //create blog
    Blog.create(req.body.blog, (err, newBlog) => {
        if (err) {
            res.render("new");
        } else {
            res.redirect("/blogs");
        }

    });
    //redirect
});

//Show Route
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("show", {
                blog: foundBlog
            });
        }
    })
});
// Edit Route
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.render("edit", {
                blog: foundBlog
            });
        }
    })
});

//Update Route
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body) //sanitize to prevent XSS
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
});

//Delete Route
app.delete("/blogs/:id", (req, res) => {
    //destroy
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect("/blogs")
        } else {
            res.redirect("/blogs")
        }
    });
});

const server = app.listen(3000, () => {
    console.log('Listening on port 3000');
});