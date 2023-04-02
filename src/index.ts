import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import Logging from './library/Logging';
import authorRoutes from './routes/Author';
import bookRoutes from './routes/Book';
import dotenv from 'dotenv';

dotenv.config();


const app = express();


const server = http.createServer(app);


//middlewares

/** connect to Mongo */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL as string);
    Logging.info('connected to MongoDB')
    StartServer();
  } catch (error) {
    Logging.error(error.message);
    process.exit(1);
  }
};

/** Only start the server if Mongo Connects */
const StartServer = () => {
    app.use((req:express.Request,res:express.Response,next:express.NextFunction) => {
        /** Log the Request */
        Logging.info(`Incoming -> Method: [${req.method}] - url: [${req.url}] - 
        IP:[${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** Log the Response */
            Logging.info(`Incoming -> Method: [${req.method}] - url: [${req.url}] 
            - IP:[${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);    
        });
         
        next();
    });

    app.use(express.urlencoded({ extended: true}));
    app.use(express.json());

    /** Rules of our API */
    app.use((req:express.Request,res:express.Response,next:express.NextFunction) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type,Accept,Authorization');

        if(req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
            return res.status(200).json({});
        }

        next();
    });

    /** Routes */
    app.use('/authors', authorRoutes);
    app.use('/books', bookRoutes);

    /** Healthcheck */
    app.get('/ping', (req:express.Request,res:express.Response,next:express.NextFunction) => res.status(200).json({ message:'working'}))

    /** Error Handling */
    app.use((req:express.Request,res:express.Response,next:express.NextFunction) => {
        const error = new Error('not found');
        Logging.error(error);

        return res.status(404).json({ message:error.message });

    });

}


server.listen(8080, () => {
    connectDB();
    Logging.info('Server is running on http://localhost:8080/');

  })





