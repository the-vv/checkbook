import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TemplatesModule } from './templates/templates.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { User } from './users/user.entity';
import { Template } from './templates/template.entity';
import { TemplateItem } from './templates/template-item.entity';
import { ChecklistInstance } from './checklists/checklist-instance.entity';
import { InstanceItem } from './checklists/instance-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'checkbook.sqlite',
      entities: [User, Template, TemplateItem, ChecklistInstance, InstanceItem],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    TemplatesModule,
    ChecklistsModule,
  ],
})
export class AppModule {}
