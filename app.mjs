import express from 'express'
import path from 'path'
import './db.mjs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';
import bcrypt from 'bcryptjs';

import {startAuthenticatedSession, endAuthenticatedSession} from './auth.mjs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'hbs');
// additional line to make the project run
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

const User = mongoose.model('User');

app.get('/', async (req, res) => {
    res.render('index', {user: req.session.user, home: true});
  });

app.get('/register', (req, res) => {
    res.render('register');
  });
  
app.post('/register', async (req, res) => {
    const username = sanitize(req.body.username);
    const password = sanitize(req.body.password);

  
    try {  
       // TODO: finish implementation
        const name = await User.findOne({username:username});
        if(name){
           res.render('register', {message: "User is in the system"});
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

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
  const username = sanitize(req.body.username);
  const password = sanitize(req.body.password);

  try {
    // TODO: finish implementation
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
        res.redirect(req.session.redirectPath || '/');
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

app.listen(process.env.PORT || 3000);
