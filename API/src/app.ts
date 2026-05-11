import express from 'express';
import catalogueRouter from './routes/catalogue';


const app = express();
const port = process.env.PORT || 3000;

// TODO: reduce this to be less permissive.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/catalogue', catalogueRouter)

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
