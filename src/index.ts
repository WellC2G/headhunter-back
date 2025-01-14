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

const app = express();
app.use(cors({
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

const httpServer = http.createServer();

httpServer.on('request', app);

export const ioSocket = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
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

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}).catch((err) => {
    console.error(err);
});



