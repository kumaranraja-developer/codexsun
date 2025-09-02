// cortex/service/base-service.ts

export interface PaginatedMeta {
    total: number;
    limit: number;
    offset: number;
    sort?: string;
    order?: "asc" | "desc";
    filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
    status: "success" | "error";
    data: T[];
    meta: PaginatedMeta;
}

export interface ServiceOptions<M> {
    model: M;
    name?: string;
}

export abstract class Service<M, DTO> {
    protected model: M;
    protected name: string;

    constructor(model: M, name?: string) {
        this.model = model;
        this.name = name ?? (model as any).name ?? "Unknown";
    }

    // --- Abstract DTO mappers ---
    protected abstract toDTO(entity: any): DTO;
    protected abstract toDTOList(entities: any[]): DTO[];

    // --- Optional validation hooks ---
    protected validateCreate?(data: any): any;
    protected validateUpdate?(data: any): any;

    // --- Base CRUD ---
    async findAll(query: any): Promise<PaginatedResult<DTO>> {
        const {
            sort = "id",
            order = "asc",
            limit = 100,
            offset = 0,
            ...filters
        } = query;

        const rows = await (this.model as any).findAll({
            filters,
            sort,
            order,
            limit: +limit,
            offset: +offset,
        });
        const total = await (this.model as any).count({ filters });

        return {
            status: "success",
            data: this.toDTOList(rows),
            meta: { total, limit: +limit, offset: +offset, sort, order, filters },
        };
    }

    async findByIdOrFail(id: number): Promise<DTO> {
        const row = await (this.model as any).findById(id);
        if (!row) throw new Error(`${this.name} not found`);
        return this.toDTO(row);
    }

    async create(data: any): Promise<DTO> {
        const input = this.validateCreate ? this.validateCreate(data) : data;
        const row = await (this.model as any).create(input);
        return this.toDTO(row);
    }

    async update(id: number, data: any): Promise<DTO> {
        const input = this.validateUpdate ? this.validateUpdate(data) : data;
        const row = await (this.model as any).update(id, input);
        return this.toDTO(row);
    }

    async remove(id: number): Promise<void> {
        await (this.model as any).remove(id);
    }

    async count(filters: Record<string, any> = {}): Promise<number> {
        return (this.model as any).count({ filters });
    }

    async nextSequence(): Promise<number> {
        return (this.model as any).nextSequence();
    }
}
