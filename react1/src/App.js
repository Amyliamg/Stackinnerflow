import { useEffect, useState } from 'react';
import protobuf from 'protobufjs';
import { Buffer } from 'buffer';

const emojis = {
  '': '',
  'up': 'shan',
  'down': '👇🏻',
};

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function App() {
  const [ticker, setTicker] = useState('');
  const [previousStonk, setPreviousStonk] = useState(null);
  const [currentStonk, setCurrentStonk] = useState(null);
  const [direction, setDirection] = useState('');

  useEffect(()=>{
    const ws = new WebSocket('wss://streamer.finance.yahoo.com');
    protobuf.load('./YPricingData.proto', (error, root)=>{
      if(error){
        return console.log(error);
      }
      const Yaticker = root.lookupType('yaticker'); 
      ws.onopen = function open() {
        console.log('connected');
        ws.send(JSON.stringify({
          subscribe: [ticker]
        }));
      };
      
      ws.onclose = function close() {
        console.log('disconnected');
      };
      
      ws.onmessage = function incoming(data) {
        const next = Yaticker.decode(new Buffer(data.data, 'base64'));
        setCurrentStonk((current)=>{
          setPreviousStonk(current);
          return next;
        });
      };
  
    });
  }, [ticker]);

  useEffect(() =>{
    if(previousStonk && currentStonk){
      const nextDirection = currentStonk.price < previousStonk.price ? 'down' : currentStonk.price > previousStonk.price ? 'up' : '';
      if(nextDirection){
        setDirection(nextDirection);
      }
    }
  }, [previousStonk, currentStonk]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setTicker(event.target.ticker.value);
  }

  return (
    <div>
      <h1>STONKS</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Ticker Symbol:
          <input type="text" name="ticker" value={ticker} onChange={(event) => setTicker(event.target.value)} />
        </label>
        <button type="submit">Get Price</button>
      </form>
      {currentStonk && (
        <h2>
          {currentStonk.id} {formatPrice(currentStonk.price)}{' '}
          {emojis[direction]}
        </h2>
      )}
    </div>
  );
}

export default App;


/*import React,{ useEffect, useState } from 'react';
import protobuf from 'protobufjs';
import { Buffer } from 'buffer';

const emojis = {
  '': '',
  'up': '👆🏻',
  'down': '👇🏻',
};

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function App() {
  const [ticker, setTicker] = useState('');
  const [previousStonk, setPreviousStonk] = useState(null);
  const [currentStonk, setCurrentStonk] = useState(null);
  const [direction, setDirection] = useState('');

  useEffect(()=>{
    const ws = new WebSocket('wss://streamer.finance.yahoo.com');
    protobuf.load('./YPricingData.proto', (error, root)=>{
      if(error){
        return console.log(error);
      }
      const Yaticker = root.lookupType('yaticker'); 
      ws.onopen = function open() {
        console.log('connected');
        ws.send(JSON.stringify({
          subscribe: [ticker]
        }));
      };
      
      ws.onclose = function close() {
        console.log('disconnected');
      };
      
      ws.onmessage = function incoming(data) {
        const next = Yaticker.decode(new Buffer(data.data, 'base64'));
        setCurrentStonk((current)=>{
          setPreviousStonk(current);
          return next;
        });
      };
  
    });
  }, [ticker]);

  useEffect(() =>{
    if(previousStonk && currentStonk){
      const nextDirection = currentStonk.price < previousStonk.price ? 'down' : currentStonk.price > previousStonk.price ? 'up' : '';
      if(nextDirection){
        setDirection(nextDirection);
      }
      fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: currentStonk.shortName,
          symbol: currentStonk.id,
          price: currentStonk.price,
          direction: nextDirection,
          timestamp: Date.now()
        })
      }).then(response => {

        if (!response.ok) {
          throw new Error('Failed to store stock information');
        }
      }).catch(error => {
        console.log(error);
      });
    }
  }, [previousStonk, currentStonk]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setTicker(event.target.ticker.value);
  }

  return (
    <div>
      <h1>Stock With API</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Ticker Symbol:
          <input type="text" name="ticker" value={ticker} onChange={(event) => setTicker(event.target.value)} />
        </label>
        <button type="submit">Get Price</button>
      </form>
      {currentStonk && (
        <h2>
          {currentStonk.id} {formatPrice(currentStonk.price)}{' '}
          {emojis[direction]}
        </h2>
      )}
    </div>
  );
}



export default App;*/