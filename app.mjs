import express from 'express'
import path from 'path'
import './db.mjs';
//import emailjs from 'emailjs-com';
import {config} from './config.js'
import { fileURLToPath } from 'url';
import session from 'express-session';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';
import bcrypt from 'bcryptjs';

// ChatGPT
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';


import {startAuthenticatedSession, endAuthenticatedSession} from './auth.mjs';
let username;

dotenv.config();
// Initialize OpenAI API
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.API_KEY,
}));

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

const User = mongoose.model('User');
const Item =  mongoose.model('Item');


app.get('/api/stock', (req, res) => {
  app.use(express.static(path.join(__dirname, 'react1/build')));
  app.use('/api', express.static(path.join(__dirname, 'public')));
  res.sendFile(path.join(__dirname, 'react1/build/index.html'));
});



app.post('/api/stock', async (req, res) => {
  const { name, symbol, price, timestamp} = req.body;
  const existingItem = await Item.findOne({ ticket: symbol });
  if (existingItem) {
    existingItem.name = name;
    existingItem.date = timestamp;
    existingItem.price = price;
    await existingItem.save();
  } else {
    const newItem = new Item({
      name: name,
      ticket: symbol,
      date: timestamp,
      price: price,
    });
    await newItem.save();
  }
  res.status(200).json({ message: 'Stock data saved successfully' });
});


app.get('/', async (req, res) => {
    res.render('welcome', {user: req.session.user, home: true, emailjsKey: config.emailjs.key});
  });

app.get('/email', async (req, res) => {
    res.render('email', {user: req.session.user, emailjsKey: config.emailjs.key});

  });

  

  app.get('/edit', async (req, res) => {
    try {
      const user = await User.findOne({ username: req.session.user.username });
      const items = user.items;
      res.render('index', { user: req.session.user, items });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });



app.get('/ask-chatgpt', (req, res) => {
  res.render('chatGPT');
});

app.post('/ask-chatgpt', async (req, res) => {
  const {message} = req.body;
 
  
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${message}`,
    temperature: 0,
    max_tokens: 100,
  });
  const answer = response.data.choices[0].text;

  res.json({ answer });
});

app.post('/delete', async (req, res) => {
  const { id } = req.body;

  try {
    const deletedItem = await Item.findByIdAndDelete(id);

    const user = await User.findOne({ username });
    user.items = user.items.filter(item => item.ticket !== deletedItem.ticket);
    await user.save();

    res.redirect('/edit');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.post('/edit', async function(req, res) {
  const item = new Item({
    
    name: req.body.stockname,
    ticket: req.body.ticket,
    price: req.body.price,
    date: new Date().toLocaleDateString('en-US')
  

  });
  await item.save();
 
  const user = await User.findOne({ username: req.session.user.username });
  const itemToUpdate = user.items.find(item => item.ticket === req.body.ticket);
  if (itemToUpdate) {
    itemToUpdate.price = req.body.price;
    itemToUpdate.date = new Date().toLocaleDateString('en-US');
    itemToUpdate.name = req.body.stockname;
  }else{
    user.items.push(item);
  }
  await user.save();

  res.redirect('/edit');


});


app.post('/save', async (req, res) => {
  const id = req.body.id;
  const name = req.body.stockname;
  const ticket = req.body.ticket;
  const price = isNaN(Number(req.body.price)) ? '' : Number(req.body.price);
  const date = req.body.date; 
  let bool = false;
  let message = '';
  
  try {
    const item = await Item.findById(id);
    if (name) {
      item.stockname = name;
      bool = true;
    }
    if (ticket) {
      item.ticket = ticket;
      bool = true;
    }

    if (date) {
      item.date = date;
      bool = true;
    }
    if (price) {
      item.price = price;
      bool = true;
    }
    
    if (bool) {
      await item.save();
      const user = await User.findOne({ username });
      const itemToUpdate = user.items.find(item => item.ticket === ticket);
      if (itemToUpdate) {
        itemToUpdate.price = price;
        itemToUpdate.date = date;
        itemToUpdate.name = name;
      } else {
        user.items.push(item);
      }
      await user.save();
      message = 'Changes saved successfully';
    } else {
      message = 'No changes made';
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
    return;
  }


  res.status(200);
  res.write(`<script>alert('${message}')</script>`);
  res.write(`<script>window.location.href = '/edit'</script>`);
  res.end();
});





app.post('/', async (req, res) => {
  const stockname = req.body.stockname;

  res.render('index', {user: req.session.user, home: true, stockname: stockname });
  });

app.get('/register', (req, res) => {
    res.render('register');
  });
  
app.post('/register', async (req, res) => {
    username = sanitize(req.body.username);
    const password = sanitize(req.body.password);

  
    try {  
        const name = await User.findOne({username:username});
        if(name){
           res.render('register', {message: "User existed. Go to "});
        }else{
          const salt = await bcrypt.genSalt();
          const hash = await bcrypt.hash(password, salt);
  
          const newPerson = new User({ username:username, password: hash});
          await newPerson.save();
          await startAuthenticatedSession(req,newPerson);
          res.redirect('/');
  
        }
  
     
    } catch (err) {
      if(err instanceof mongoose.Error.ValidationError) {
        res.render('register', {message: err.message});
      } else {
        throw err;
      }
    }
  });

app.get('/login', (req, res) => {
    res.render('login');
});



app.post('/login', async (req, res) => {
  const username = sanitize(req.body.username);
  const password = sanitize(req.body.password);

  try {
    const user = await User.findOne({username});
    if(!user){
      res.render('login', {message: "The username is not exited"});
    }else if(!user.password){
      res.render('login', {message: "The password is not exited"});

    }else{
      const passwordMatch = await bcrypt.compare(password, user.password);
      if(!passwordMatch){
        res.render('login', {message: "The password is incorrect"});
      }else{
        await startAuthenticatedSession(req,user);
        res.redirect(req.session.redirectPath || '/edit');
    } 
    }

  } catch (err) {
    if(err instanceof mongoose.Error.ValidationError) {
      res.render('login', {message: err.message});
    } else {
      throw err;
    }
  }
});

app.get('/logout', async (req, res) => {
    await endAuthenticatedSession(req);
    res.redirect('/');
  });



app.listen(process.env.PORT || 3002);
