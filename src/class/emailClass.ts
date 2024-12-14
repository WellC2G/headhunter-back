import {ValueTransformer} from "typeorm";

export class Email {
    private email: string;

    constructor(email: string) {
        if (!this.isValidEmail(email)) {
            throw new Error("Введите email");
        }
        this.email = email.toLowerCase();
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    toString(): string {
        return this.email;
    }
}
export const emailTransformer: ValueTransformer = {
    to(email: Email | null): string | null {
        if (email == null) {
            return null
        }
        return email.toString()
    },
    from(email: string | null): Email | null {
        if (email == null) {
            return null
        }
        return new Email(email);
    },
};