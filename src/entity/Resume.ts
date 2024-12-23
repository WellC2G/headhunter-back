import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
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

    @ManyToOne(type => User, (user: User) => user.resumes)
    @JoinColumn({name: 'userId'})
    user: User

    @ManyToMany(type => Company, (company: Company) => company.receivedResumes)
    @JoinTable()
    submittedResumes: Company[]
}