import express from "express";
import { AppDataSource } from "./data-source"
import authRoute from "./router/authRoute";
import editUserRoute from "./router/editUserRoute";
import companyRoute from "./router/companyRoute";
import resumeRoute from "./router/resumeRoute";
import vacancyRoute from "./router/vacancyRoute";
import cors from "cors";
import path from "path";
import checkAuthRote from "./router/checkAuthRote";
import responseToVacancyRoute from "./router/responseToVacancyRoute";
import chatRoute from "./router/chatRoute";
import {createServer} from "node:http";
import {Server} from "socket.io";
import * as http from "node:http";
import testRoute from "./router/testRoute";
import {authMiddleware, authSocket} from "./middleware/authMiddleware";

const app = express();
app.use(cors({
    origin: '*',
}));

const httpServer = http.createServer();

httpServer.on('request', app);

export const ioSocket = new Server(httpServer, {
    cors: {
        origin: "*",
    },
    pingTimeout: 60000,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

AppDataSource.initialize().then(() => {
    console.log("AppDataSource initialized");

    app.use('/auth', authRoute)
    app.use('/user', editUserRoute)
    app.use('/user', checkAuthRote)
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
    app.use('/company', companyRoute)
    app.use('/vacancy', vacancyRoute)
    app.use('/resume', resumeRoute)
    app.use('/response-to-vacancy', responseToVacancyRoute)
    app.use('/chat', chatRoute)

    app.use('/test', testRoute);

    ioSocket.on("connection", (socket) => {
        const id = authSocket(socket);

        if(!id || !id.userId) {
            socket.disconnect();
            return;
        }

        if (id.companyId !== undefined || null) {
            socket.join(`company:${parseInt(id.companyId)}`);
            return;
        }

        socket.join(`user:${id.userId}`);
    });

    const port = process.env.PORT || 3000;
    httpServer.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}).catch((err) => {
    console.error(err);
});



