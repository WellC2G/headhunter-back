/*
import express from 'express';
import {createServer} from 'http';
import {Server} from "socket.io";
import {AppDataSource} from "./data-source";
import {User} from "./entity/User";
import {Company} from "./entity/Company";
import * as http from "node:http";

const app = express();
const httpServer = http.createServer();

httpServer.on('request', app)

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
});

AppDataSource.initialize()
    .then(async () => {console.log("Data Source has been initialized!");

    io.on('connection', async(socket) => {
    console.log('Пользователь подключился:', socket.id);

    const userId = socket.handshake.auth.id;
    if (!userId) {
        return socket.disconnect();
    }

    try {
        const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
        if (!user || !user.manager) {
            console.error('Пользователь или компания не найдены');
            return socket.disconnect();
        }

        const companyId = user.manager.id;

        socket.join(companyId.toString());

        socket.on('send_message', async (message) => {
            socket.to(companyId.toString()).emit('receive_message', message);
        })
        } catch (error) {
            console.log(error)
        };

        socket.on('disconnect', () => {
            console.log('Пользователь отключился:', socket.id);
        });
    });

    httpServer.listen(3000, () => {
        console.log('Сервер Socket.IO запущен на порту 3001')});
    }).catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });*/
