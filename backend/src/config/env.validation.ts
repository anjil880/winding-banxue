import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/** 开发环境缺省密钥：仅用于本地开发，生产环境必须通过 JWT_SECRET 覆盖 */
const DEV_JWT_SECRET = 'dev-only-secret-change-me-in-production';

/** 已知不安全占位密钥，生产环境一律拒绝 */
const INSECURE_JWT_SECRETS = [DEV_JWT_SECRET, 'change-me-in-production'];

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @IsOptional()
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  JWT_SECRET: string = DEV_JWT_SECRET;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '30m';

  @IsInt()
  @Min(1)
  @IsOptional()
  REFRESH_TOKEN_DAYS: number = 7;

  /** 逗号分隔的 CORS 允许来源白名单；生产环境必须显式设置 */
  @IsString()
  @IsOptional()
  CORS_ORIGIN: string = '';
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }
  if (
    validated.NODE_ENV === Environment.Production &&
    INSECURE_JWT_SECRETS.includes(validated.JWT_SECRET)
  ) {
    throw new Error(
      'Environment validation failed: JWT_SECRET must be set to a strong value in production',
    );
  }
  if (validated.NODE_ENV === Environment.Production && !validated.CORS_ORIGIN) {
    throw new Error(
      'Environment validation failed: CORS_ORIGIN must be set in production',
    );
  }
  return validated;
}
