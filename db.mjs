import mongoose from 'mongoose';



const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
	StockListids: [StocklistSchema],  
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

const itemSchema = new Schema({
    name: String,
    ticket: String,
    price: Number
  });

mongoose.model('Review', UserSchema);

mongoose.connect('mongodb://localhost/project1');



