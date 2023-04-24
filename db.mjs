import mongoose from 'mongoose';

console.log('Waiting for connection to database...');
try {
  await mongoose.connect('mongodb://localhost/finalproject', {useNewUrlParser: true});
  console.log('Successfully connected to database.');
} catch (err) {
  console.log('ERROR: ', err);
}

const itemSchema = new mongoose.Schema({
  name: String,
  ticket: String,
  date: String,
  price: Number
});





const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, minLength: 3, maxLength: 20},
    password: {type: String, required: true, minLength: 8},
    items: [itemSchema],  
});

mongoose.model('User', UserSchema);

mongoose.model('Item', itemSchema);



