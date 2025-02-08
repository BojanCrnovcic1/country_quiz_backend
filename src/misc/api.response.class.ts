export class ApiResponse {
    status: string;
    code: number;
    message: string | null;

    constructor(status: string, code: number, message: string | null = null) {
        this.status = status,
        this.code = code,
        this.message = message
    }
}

