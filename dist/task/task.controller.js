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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const decorators_1 = require("../common/decorators");
const dto_1 = require("./dto");
const task_service_1 = require("./task.service");
let TaskController = class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    createTask(id, dto) {
        return this.taskService.createTask(id, dto);
    }
    getAllTasks(id) {
        return this.taskService.getAllTasks(id);
    }
    getTaskById(id, taskId) {
        return this.taskService.getTaskById(id, taskId);
    }
    updateTaskById(id, dto, taskId) {
        return this.taskService.updateTaskById(id, taskId, dto);
    }
    deleteTaskById(id, taskId) {
        return this.taskService.deleteTaskById(id, taskId);
    }
};
__decorate([
    (0, common_1.Post)(''),
    __param(0, (0, decorators_1.GetUserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.TaskDto]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)(''),
    __param(0, (0, decorators_1.GetUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "getAllTasks", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, decorators_1.GetUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "getTaskById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, decorators_1.GetUserId)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.EditTaskDto, String]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "updateTaskById", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, decorators_1.GetUserId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TaskController.prototype, "deleteTaskById", null);
TaskController = __decorate([
    (0, decorators_1.Protected)(),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
exports.TaskController = TaskController;
//# sourceMappingURL=task.controller.js.map