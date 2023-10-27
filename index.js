const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
const { Server } = require("socket.io");
const PORT = process.env.PORT || 8000
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://yumyumexpress.netlify.app",
      "https://vendor-yumyumexpress.netlify.app",
    ],
  },
});

app.get('/', (req, res) => {
  res.send('Hi mom!')
});

io.on('connection', (socket) => {
  console.log('a user connected => '+socket.id);

  socket.on('join', id => {
    socket.join(id);
    console.log('joined --'+ id)
  })

  socket.on('order-from-customer', (order)=>{
    console.log('from:' +  order.customer_id + ' to:'+order.seller_id, order);
    socket.join(order.customer_id);
    io.to(order.customer_id).emit('nice','Placed order');
    io.to(order.seller_id).emit('server:order-from-client', order)
  })

  socket.on('approve',(order) => {
    console.log('approved by resturant')
    console.log(order)
    io.to(order.customer_id).emit('approved', order)
  })
  socket.on('reject',(order) => {
    console.log('rejected by resturant')
    console.log(order)
    io.to(order.customer_id).emit('rejected', order)
  })
});

httpServer.listen(PORT, () => {
  console.log('listening on *:'+PORT);
});