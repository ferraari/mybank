import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const rd = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export default class DBManager {
    private prisma: PrismaClient;
    private loggedIn: boolean = false;
    private username: string = "";
    private password: string = "";
    private balance: number = 0;
    private id: number = 0;
    private firstTime: boolean = true;

    constructor() {
        this.prisma = new PrismaClient();
        this.username = "";
        this.password = "";
        this.balance = 0;
        this.id = this.generateID();
        this.enterBankAccount();
    }

    generateID() : number {
        let generate = Math.floor(Math.random() * 1000000000);

        if (generate === this.id) {
            return this.generateID();
        }

        return this.id = generate;
    }

    chekcIfUserExists(username: string) : boolean {
        this.prisma.user.findMany({
            where: {
                name: username,
            },
        }).then((result) => {
            if (result.length > 0) {
                return true;
            } else {
                return false;
            }
        });

        return false;
    }

    public createBankAccount() : void {
        rd.question("Nome da Conta: ", (username) => {
            if (this.chekcIfUserExists(username)) {
                console.log("Conta já existe.");

                return this.createBankAccount();
            }
            
            rd.question("Password: ", (password) => {
                this.prisma.user.create({
                    data: {
                        id: this.id,
                        name: username,
                        password: password,
                        balance: 0,
                    },
                }).then((result) => {
                    console.log("Account created successfully.");
                    this.enterBankAccount();
                });
            });
        });
    }

    public deposit() : void {
        rd.question("Amount: ", (amount) => {
            let parsedFloatedAmount = parseFloat(amount);

            this.prisma.user.update({
                select: {
                    balance: true,
                },
                where: {
                    id: this.id,
                },
                data: {
                    balance: this.balance + Number(parsedFloatedAmount),
                },
            }).then((result) => {
                this.balance = Number(result.balance);
                console.log("Deposit successful.");
                this.showMenu();
            });
        });
    }

    public withdraw() : void {
        rd.question("Amount: ", (amount) => {
            if (this.balance - Number(amount) < 0) {
                console.log("Insufficient funds.");
                return this.showMenu();
            }

            this.prisma.user.update({
                select: {
                    balance: true,
                },
                where: {
                    id: this.id,
                },
                data: {
                    balance: this.balance - Number(amount),
                },
            }).then((result) => {
                this.balance = Number(result.balance);
                console.log("Withdraw successful.");
                this.showMenu();
            });
        });
    }

    public showMenu() : void {
        if (this.firstTime) {
            console.log("Welcome to the bank account menu.");
            console.log("1 - Deposit");
            console.log("2 - Withdraw");
            console.log("3 - Show balance");
            console.log("4 - Exit");

            this.firstTime = false;
        }

        rd.question("Choose an option: ", (option) => {
            if (option === "1") {
                this.deposit();
            } else if (option === "2") {
                this.withdraw();
            } else if (option === "3") {
                console.log("Your balance is: " + this.balance);
                this.showMenu();
            } else if (option === "4") {
                console.log("Thank you for using our bank account.");
                this.close();
                rd.close();
            } else {
                console.log("Invalid option.");
                this.showMenu();
            }
        });
    }

    public login() : void {
        rd.question("Username: ", (username) => {
            rd.question("Password: ", (password) => {
                this.prisma.user.findMany({
                    where: {
                        name: username,
                        password: password,
                    },
                }).then((result) => {
                    if (result.length > 0) {
                        this.loggedIn = true;
                        this.username = username;
                        this.password = password;
                        this.balance = Number(result[0].balance);
                        this.showMenu();
                    } else {
                        console.log("Invalid username or password.");
                        this.enterBankAccount();
                    }
                });
            });
        });
    }
    
    public enterBankAccount() : void {
        console.log("Welcome, please enter your bank account");
        console.log("Digita uma das opções 'logar' ou ''registrar' ");

        rd.question("Digite uma opção: ", (option) => {
            if (option === "logar") {
                this.login();
            } else if (option === "registrar") {
                this.createBankAccount();
            } else if (option === "debug") {
                this.adminDebug();
            } else {
                console.log("Opção inválida");
                this.enterBankAccount();
            }
        });
    }

    public adminDebug() : void {
        this.prisma.user.findMany().then((result) => {
            console.log(result);
        });
    }

    public close() : void {
        this.prisma.$disconnect();
    }

    public getID() : number {
        return this.id;
    }

    public getBalance() : number {
        return this.balance;
    }

    public getUsername() : string {
        return this.username;
    }

    public getPassword() : string {
        return this.password;
    }
}