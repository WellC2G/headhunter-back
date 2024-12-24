import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./User";
import {Vacancy} from "./Vacancy";

@Entity()
export class Resume {
    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    title: string

    @Column('text')
    description: string

    @ManyToOne(type => User, (user: User) => user.resumes)
    @JoinColumn({name: 'userId'})
    user: User

    @ManyToMany(type => Vacancy, (vacancy: Vacancy) => vacancy.receivedResumes)
    submittedResumes: Vacancy[]
}