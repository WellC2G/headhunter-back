import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Vacancy} from "./Vacancy";
import {Resume} from "./Resume";

@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    name: string

    @Column('text')
    description: string

    @Column('text', { nullable: true })
    avatar: string;

    @OneToMany(type => Vacancy, (Vacancy) => Vacancy.company)
    vacancies: Vacancy[]

    @OneToMany(type => User, (User) => User.manager)
    managers: User[]

    @ManyToMany(type => Resume, (resume) => resume.submittedResumes, {onDelete: "RESTRICT"})
    receivedResumes: Resume[]
}