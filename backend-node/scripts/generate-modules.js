const fs = require('fs');
const path = require('path');

const modules = [
  'users',
  'institutions',
  'opportunities',
  'events',
  'teams',
  'submissions',
  'judges',
  'certificates',
  'notifications',
  'courses',
  'career',
  'interviews',
  'community',
  'leaderboard',
  'gamification',
  'sdl',
  'uploads',
  'admin',
  'health'
];

const basePath = path.join(__dirname, '..', 'src', 'modules');

modules.forEach(mod => {
  const PascalName = mod.charAt(0).toUpperCase() + mod.slice(1);
  const modDir = path.join(basePath, mod);

  const subdirs = [
    'controllers',
    'services',
    'repositories',
    'dto',
    'validation',
    'interfaces',
    'routes'
  ];

  subdirs.forEach(sd => {
    fs.mkdirSync(path.join(modDir, sd), { recursive: true });
  });

  // Controller
  const controllerContent = `import { Request, Response } from 'express';
import { formatResponse } from '@shared/responses';

export class ${PascalName}Controller {
  public async get${PascalName}(_req: Request, res: Response): Promise<void> {
    res.json(formatResponse('${PascalName} placeholder response', { status: 'ok' }));
  }
}

export const ${mod}Controller = new ${PascalName}Controller();
`;
  fs.writeFileSync(path.join(modDir, 'controllers', `${mod}.controller.ts`), controllerContent);

  // Service
  const serviceContent = `export class ${PascalName}Service {
  public async process${PascalName}(): Promise<{ status: string }> {
    return { status: 'processed' };
  }
}

export const ${mod}Service = new ${PascalName}Service();
`;
  fs.writeFileSync(path.join(modDir, 'services', `${mod}.service.ts`), serviceContent);

  // Repository
  const repositoryContent = `export class ${PascalName}Repository {
  public async find${PascalName}(): Promise<unknown[]> {
    return [];
  }
}

export const ${mod}Repository = new ${PascalName}Repository();
`;
  fs.writeFileSync(path.join(modDir, 'repositories', `${mod}.repository.ts`), repositoryContent);

  // DTO
  const dtoContent = `export interface ${PascalName}ResponseDto {
  id: string;
}
`;
  fs.writeFileSync(path.join(modDir, 'dto', `${mod}.dto.ts`), dtoContent);

  // Validation
  const validationContent = `import { z } from 'zod';

export const ${mod}QuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
`;
  fs.writeFileSync(path.join(modDir, 'validation', `${mod}.validation.ts`), validationContent);

  // Interface
  const interfaceContent = `export interface ${PascalName}Item {
  id: string;
  createdAt: Date;
}
`;
  fs.writeFileSync(path.join(modDir, 'interfaces', `${mod}.interface.ts`), interfaceContent);

  // Routes
  const routesContent = `import { Router } from 'express';
import { ${mod}Controller } from '../controllers/${mod}.controller';

const router = Router();

router.get('/', (req, res, next) => ${mod}Controller.get${PascalName}(req, res).catch(next));

export const ${mod}Router = router;
`;
  fs.writeFileSync(path.join(modDir, 'routes', `${mod}.routes.ts`), routesContent);

  // Index
  const indexContent = `export * from './controllers/${mod}.controller';
export * from './services/${mod}.service';
export * from './repositories/${mod}.repository';
export * from './dto/${mod}.dto';
export * from './validation/${mod}.validation';
export * from './interfaces/${mod}.interface';
export * from './routes/${mod}.routes';
`;
  fs.writeFileSync(path.join(modDir, 'index.ts'), indexContent);

  console.log(`Generated module: ${mod}`);
});
