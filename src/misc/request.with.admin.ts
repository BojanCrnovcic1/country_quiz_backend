import { Admin } from "src/entities/admin.entity";

declare module 'express' {
    interface Request {
        admin?: Admin;
    }
}