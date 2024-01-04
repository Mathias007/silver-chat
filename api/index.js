const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcryptjs = require('bcryptjs');
const ws = require('ws');

const User = require('./models/User');
const Message = require('./models/Message');

dotenv.config();
mongoose.connect(process.env.DB_CONNECTION_STRING);

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcryptjs.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.get('/test', (req, res) => {
    res.json('test ok');
});

app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (error, userData) => {
            if (error) throw error;
            res.json(userData);
        });
    } else {
        res.status(401).json('no token');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.find({ username });
    if (foundUser) {
        const passOk = bcryptjs.compareSync(password, foundUser.password);
        if (passOk) {
            jwt.sign({ userId: foundUser._id, username }, jwtSecret, {}, (error, token) => {
                if (error) throw error;
                res.cookie('token', token, { sameSite: 'none', secure: true }).json({
                    id: foundUser._id,
                });
            })
        }
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = bcryptjs.hashSync(password, bcryptSalt);

        const createdUser = await User.create({ 
            username: username, 
            password: hashedPassword
        });

        jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (error, token) => {
            if (error) throw error;
            res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
                id: createdUser._id,
                username,
            });
        });
    } catch (error) {
        if (error) throw error;
        res.status(500).json('error');
    }
});

const server = app.listen(4040);

const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {

    // read username and id from the cookie for this connection
    const cookies = req.headers.cookie;
    if (cookies) {
       const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
       if (tokenCookieString) {
        const token = tokenCookieString.split('=')[1];
        if (token) {
            jwt.verify(token, jwtSecret, {}, (error, userData) => {
                if (error) throw error;
                const { userId, username } = userData;
                connection.userId = userId;
                connection.username = username;
            });
        }
       }
    }

    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString());
        const { recipient, text } = messageData;
        if (recipient && text) {

            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text,
            });

            [...wss.clients]
                .filter(client => client.userId === recipient)
                .forEach(client => client.send(JSON.stringify({ 
                    text, 
                    sender: connection.userId,
                    recipient,
                    id: messageDoc._id
                })));
        }
    });




    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(connection => ({ userId: connection.userId, username: connection.username }))
        }));
    });
});

