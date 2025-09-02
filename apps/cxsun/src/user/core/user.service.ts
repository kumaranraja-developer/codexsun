// apps/user/user.service.ts
import { Service } from "../../../../../cortex/core/service";
import { User } from "./user.model";
import { UserValidator } from "./user.validator";

export interface UserDTO {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResult<T> {
    status: "success" | "error";
    data: T[];
    meta: {
        total: number;
        limit: number;
        offset: number;
        sort?: string;
        order?: string;
        filters?: Record<string, any>;
    };
}

export class UserService extends Service<User, UserDTO> {
    constructor() {
        super(User);
    }

    // --- DTO Mappers ---
    private toDTO(user: User): UserDTO {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            is_active: user.is_active ?? true,
            created_at: new Date(user.created_at ?? new Date()).toISOString(),
            updated_at: new Date(user.updated_at ?? new Date()).toISOString(),
        };
    }

    private toDTOList(users: User[]): UserDTO[] {
        return users.map((u) => this.toDTO(u));
    }

    // --- Queries ---
    async findAll(query: any): Promise<PaginatedResult<UserDTO>> {
        const {
            name,
            email,
            sort = "id",
            order = "asc",
            limit = 100,
            offset = 0,
            is_active,
        } = query;

        const filters: Record<string, any> = {};
        if (name) filters.name = name;
        if (email) filters.email = email;
        if (is_active !== undefined) filters.is_active = is_active;

        const users = await this.model.findAll({
            filters,
            sort,
            order,
            limit: +limit,
            offset: +offset,
        });

        const total = await this.model.count({ filters });

        return {
            status: "success",
            data: this.toDTOList(users),
            meta: { total, limit: +limit, offset: +offset, sort, order, filters },
        };
    }

    async findByIdOrFail(id: number): Promise<UserDTO> {
        const user = await this.findById(id);
        if (!user) throw new Error("User not found");
        return this.toDTO(user);
    }

    async create(data: any): Promise<UserDTO> {
        const input = UserValidator.validateCreate(data);
        const user = await this.model.create(input);
        return this.toDTO(user);
    }

    async update(id: number, data: any): Promise<UserDTO> {
        const input = UserValidator.validateUpdate(data);
        const user = await this.model.update(id, input);
        return this.toDTO(user);
    }

    async remove(id: number): Promise<void> {
        await this.model.remove(id);
    }

    async count(filters: Record<string, any> = {}): Promise<number> {
        return this.model.count({ filters });
    }

    async nextSequence(): Promise<number> {
        return this.model.nextSequence();
    }
}
