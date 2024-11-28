const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');
//const cors = require('cors');
const bodyParser = require("body-parser");
const Task = require("./model/task");
const methodOverride = require("method-override");

const app = express();
// convert data into json format
//app.use(express.json());

//app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Use EJS as the view engine
app.set('view engine', 'ejs');


// Static file serving (for CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));


app.get('/', (req, res) => {
    res.render('login');
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

//Register User
app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };

    // Check if the user already exists in the database
    const existinguser = await collection.findOne({ name: data.name });

    if (existinguser) {
        res.send('User already exists. Please choose a different username.');
    } else {
        // Hash the password using bcrypt
        const saltRounds = 10; // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword; // Replace the original password with the hashed password

        // Insert the user data into the collection
        const userdata = await collection.insertMany([data]);
        res.send('User successfully signed up, go to login Page.');
        console.log(userdata);

    }
});


//Login User
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the user exists in the database
        const user = await collection.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ message: "Username not found" });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Successful login: Render the home page
        res.render("home", { user });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create a task
app.post("/tasks", async (req, res) => {
    try {
        const { title, description, deadline, priority } = req.body;
        const task = new Task({ title, description, deadline, priority });
        await task.save();
        res.status(201).json(task)
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Get all tasks with optional filtering
app.get("/tasks", async (req, res) => {
    try {
        const { priority, dueDate, keyword } = req.query;
        let filter = {};

        if (priority) {
            filter.priority = priority.toLowerCase();
        }
        if (dueDate) {
            filter.deadline = { $lte: new Date(dueDate) };
        }
        if (keyword) {
            filter.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ];
        }
        const tasks = await Task.find(filter);
        res.json(tasks);
    } catch (err) {
        res.status(400).json({ error: err.message });

    }
});

// Render update task page
app.get("/tasks/:id/edit", async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);
        if (!task) return res.status(404).send("Task not found");
        res.render("update-task", { task });
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndDelete(id);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Define port and start the server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

