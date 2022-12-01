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
exports.AuthServices = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const argon = require("argon2");
const prisma_service_1 = require("./../prisma/prisma.service");
let AuthServices = class AuthServices {
    constructor(prisma, config, jwt) {
        this.prisma = prisma;
        this.config = config;
        this.jwt = jwt;
    }
    async register(dto) {
        try {
            const { name, email, password } = dto;
            const hash = await argon.hash(password);
            const data = { name, email, hash };
            const user = await this.prisma.user.create({ data });
            const { refreshToken } = await this.generateTokens({
                id: user.id,
                name: user.name,
                email: user.email,
            });
            await this.updateRt(user.id, refreshToken);
            this.deleteUserHash(user);
            return { user, refreshToken };
        }
        catch (err) {
            throw err;
        }
    }
    async login(dto) {
        try {
            const { email, password } = dto;
            const user = await this.prisma.user.findUnique({ where: { email } });
            const isPwValid = await argon.verify(user.hash, password);
            if (!isPwValid) {
                throw new common_1.HttpException('Invalid credentials', common_1.HttpStatus.UNAUTHORIZED);
            }
            const { refreshToken } = await this.generateTokens({
                id: user.id,
                name: user.name,
                email: user.email,
            });
            await this.updateRt(user.id, refreshToken);
            this.deleteUserHash(user);
            return { user, refreshToken };
        }
        catch (err) {
            throw err;
        }
    }
    async refreshToken(id, jwt) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user)
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            if (!user.rT)
                throw new common_1.HttpException('Access denied, Deleted RT', common_1.HttpStatus.FORBIDDEN);
            const isRtValid = await argon.verify(user.rT, jwt);
            if (!isRtValid)
                throw new common_1.HttpException('Access denied, Invalid RT', common_1.HttpStatus.FORBIDDEN);
            const { accessToken } = await this.generateTokens({
                id: user.id,
                name: user.name,
                email: user.email,
            });
            return { accessToken };
        }
        catch (err) {
            throw err;
        }
    }
    async resetPassword(dto) {
        try {
            const { email, password } = dto;
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user)
                throw new common_1.HttpException('Email not registered', common_1.HttpStatus.NOT_FOUND);
            const newHash = await argon.hash(password);
            await this.prisma.user.update({
                where: { email },
                data: { hash: newHash },
            });
            return { message: 'password updated' };
        }
        catch (err) {
            throw err;
        }
    }
    async logout(id, jwt, res) {
        try {
            if (!jwt)
                return res.status(common_1.HttpStatus.NO_CONTENT).send();
            await this.prisma.user.updateMany({
                where: {
                    id,
                    rT: {
                        not: null,
                    },
                },
                data: {
                    rT: null,
                },
            });
            return res
                .clearCookie('jwt', {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'none',
            })
                .status(common_1.HttpStatus.OK)
                .json({ message: 'cookie cleared' });
        }
        catch (err) {
            throw err;
        }
    }
    async updateRt(userId, refreshToken) {
        const hashedRt = await argon.hash(refreshToken);
        await this.prisma.user.update({
            where: { id: userId },
            data: { rT: hashedRt },
        });
    }
    async generateTokens(user) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(user, {
                expiresIn: '1m',
                secret: this.config.get('ACCESS_SECRET_TOKEN'),
            }),
            this.jwt.signAsync(user, {
                expiresIn: '1d',
                secret: this.config.get('REFRESH_SECRET_TOKEN'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    deleteUserHash(user) {
        delete user.hash;
        delete user.rT;
    }
};
AuthServices = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        jwt_1.JwtService])
], AuthServices);
exports.AuthServices = AuthServices;
//# sourceMappingURL=auth.service.js.map