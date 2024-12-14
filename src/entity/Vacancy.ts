import {Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Company} from "./Company";
import {User} from "./User";

@Entity()
export class Vacancy {
    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    title: string

    @Column('text')
    salary: string

    @Column('text')
    description: string

    @ManyToOne(type => Company, (company) => company.vacancies)
    @JoinColumn({name: 'companyId'})
    company: Company

    @ManyToMany(type=> User, (user) => user.appliedVacancies)
    @JoinTable()
    applicants: User[]
}