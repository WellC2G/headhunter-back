import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Company} from "./Company";
import {User} from "./User";

@Entity()
export class Resume {
    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    title: string

    @Column('text')
    description: string

    @ManyToOne(type => User, (user: User) => user.resumes, {onDelete: 'RESTRICT'})
    @JoinColumn({name: 'userId'})
    user: User

    @ManyToMany(type => Company, (company: Company) => company.receivedResumes, {onDelete: "RESTRICT"})
    submittedResumes: Company[]
}