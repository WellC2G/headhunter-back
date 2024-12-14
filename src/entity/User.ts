import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne, ManyToMany} from "typeorm"
import {Company} from "./Company";
import {Vacancy} from "./Vacancy";
import {Resume} from "./Resume";
import {emailTransformer, Email} from "../class/emailClass";

export type role = 'applicant | manager | generalManager';

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({type: 'text', transformer:emailTransformer, unique: true})
    email: Email

    @Column('text')
    password: string

    @Column('text')
    firstName: string

    @Column('text')
    lastName: string

    @Column('text', {nullable:true})
    description: string

    @Column('text', { nullable: true })
    avatar: string;

    @Column('text', {default: 'applicant'})
    role: role

    @ManyToOne(type => Company, (Company) => Company.managers, {onDelete: "RESTRICT"})
    @JoinColumn({name: 'companyId'})
    manager: Company

    @ManyToMany(type => Vacancy, (vacancy) => vacancy.applicants)
    appliedVacancies: Vacancy[]

    @OneToMany(type => Resume, (resume: Resume) => resume.user, {onDelete: "RESTRICT"})
    resumes: Resume[]

}
