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
  price: Number
});


const StocklistSchema = new mongoose.Schema({
    username: String,
    name: String,
    items: [itemSchema],
    createdAt: {
        type: Date,
        default: Date.now
      }  
});



const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, minLength: 3, maxLength: 20},
    password: {type: String, required: true, minLength: 8},
	StockListids: [StocklistSchema],  
});

mongoose.model('User', UserSchema);
//mongoose.model('User', UserSchema);





