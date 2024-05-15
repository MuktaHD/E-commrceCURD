const express=require('express');
const session=require('express-session');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const path=require('path');

const app=express();



app.use(bodyParser.urlencoded({extended:true}));

//step-4 database connection
const db=mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'demo2',
    insecureAuth:true,
});

db.connect((err)=>{
    if(err){
        console.error('Database not connection',err.stack);
        return;
    }
    console.log('Connection to database');
})

// step-6 Express middleware
app.use(session({
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true
}));

//step-1
app.get('/',(req,res)=>{
    res.redirect('/login');
})
//step-2
app.get('/login',(req,res)=>{
    res.render('login.ejs');
})
//step-8 Routes


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

    db.query(query, [username, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            req.session.username = username;
            res.redirect('/home');
        } else {
            res.redirect('/login');
        }
    });
});




//step-3
app.get('/registration',(req,res)=>{
    res.render('registration.ejs');
})
//step-5
app.post('/registration',(req,res)=>{
    const {username,password}=req.body;
    console.log(username);
    const query= 'INSERT INTO users (username,password) VALUES (?,?)';
    db.query(query,[username,password],(err)=>{
        if(err) throw err;
        res.redirect('/login');
    })
})
//step 7 
app.get('/home', (req, res) => {
    if (req.session.username) {
        res.render('home.ejs', { username: req.session.username });
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

//step 8 home page product details
app.get('/home', (req, res) => {
    if (req.session.username) {
        const query = 'SELECT * FROM products';
        db.query(query, (err, products) => {
            if (err) {
                console.error('Error fetching products:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.render('home.ejs', { username: req.session.username, products });
        });
    } else {
        res.redirect('/login');
    }
});


// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




