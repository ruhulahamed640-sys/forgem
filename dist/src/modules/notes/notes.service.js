"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma/prisma.service");
let NotesService = class NotesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listNotes(userId, search) {
        return this.prisma.note.findMany({
            where: {
                userId,
                isArchived: false,
                ...(search
                    ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { content: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            include: { folder: true, subject: true },
            orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        });
    }
    async createNote(userId, dto) {
        return this.prisma.note.create({
            data: {
                userId,
                title: dto.title.trim(),
                content: dto.content,
                subjectId: dto.subjectId,
                folderId: dto.folderId,
                tags: dto.tags || [],
            },
        });
    }
    async deleteNote(userId, noteId) {
        const note = await this.prisma.note.findUnique({ where: { id: noteId } });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        if (note.userId !== userId)
            throw new common_1.ForbiddenException('Not your note');
        await this.prisma.note.delete({ where: { id: noteId } });
        return { deleted: true, id: noteId };
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotesService);
//# sourceMappingURL=notes.service.js.map