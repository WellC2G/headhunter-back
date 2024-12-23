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

const app = express();
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

AppDataSource.initialize().then(() => {
    console.log("AppDataSource initialized");

    app.use('/auth', authRoute)
    app.use('/user', editUserRoute)
    app.use('/user', checkAuthRote)
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
    app.use('/company', companyRoute)
    app.use('/vacancy', vacancyRoute)
    app.use('/resume', resumeRoute)

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}).catch((err) => {
    console.error(err);
});



