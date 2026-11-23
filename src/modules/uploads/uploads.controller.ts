import {
    Controller,
    Post,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    BadRequestException,
    Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../../database/entities/role-permission/role.entity';
import { UploadsService } from './uploads.service';

@ApiTags('مدیریت فایل و آپلود (Uploads)')
@Controller('uploads')
export class UploadsController {

    constructor(private readonly uploadsService: UploadsService) { }

    @Post('single/:folder')
    @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'فایل تصویری' },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req: any, file, cb) => {
                    try {
                        const folder = req.params?.folder || 'models';
                        const dest = UploadsService.getDestinationPath(folder);
                        cb(null, dest);
                    } catch (error: any) {
                        cb(error, null);
                    }
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const ext = extname(file.originalname);
                    cb(null, `img-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|svg)$/)) {
                    return cb(new BadRequestException('فقط فرمت‌های jpg, png, webp, svg مجاز هستند'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
        }),
    )
    uploadSingle(
        @UploadedFile() file: Express.Multer.File,
        @Param('folder') folder: string,
    ) {
        return {
            message: 'فایل با موفقیت آپلود شد',
            url: `/assets/${folder}/${file.filename}`,
            originalName: file.originalname,
            size: `${(file.size / 1024).toFixed(2)} KB`,
        };
    }

    @Post('multiple/:folder')
    @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.OPERATOR)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: { type: 'array', items: { type: 'string', format: 'binary' } },
            },
        },
    })
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: (req: any, file, cb) => {
                    try {
                        const folder = req.params?.folder || 'models';
                        const dest = UploadsService.getDestinationPath(folder);
                        cb(null, dest);
                    } catch (error: any) {
                        cb(error, null);
                    }
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const ext = extname(file.originalname);
                    cb(null, `img-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                    return cb(new BadRequestException('فقط فرمت‌های تصویری مجاز هستند'), false);
                }
                cb(null, true);
            },
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    uploadMultiple(
        @UploadedFiles() files: Express.Multer.File[],
        @Param('folder') folder: string,
    ) {
        return {
            message: `${files.length} فایل با موفقیت آپلود شد`,
            urls: files.map(f => `/assets/${folder}/${f.filename}`),
        };
    }
}