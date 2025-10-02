/**
 * ========================================
 * CONFIGURATION GECC SERVER
 * ========================================
 * Configuration centralisée de l'application
 * ========================================
 */

import dotenv from 'dotenv';
import { z } from 'zod';

// Charger les variables d'environnement
dotenv.config();

// Schéma de validation des variables d'environnement
const envSchema = z.object({
  // Serveur
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  APP_URL: z.string().url().default('http://localhost:8000'),

  // Base de données
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_NAME: z.string().default('gecc_db'),
  DB_USER: z.string().default('gecc_user'),
  DB_PASSWORD: z.string().default('gecc_password'),
  DB_SSL: z.string().transform(val => val === 'true').default(false),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit contenir au moins 32 caractères'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET doit contenir au moins 32 caractères'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cookies
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET doit contenir au moins 32 caractères'),
  COOKIE_MAX_AGE: z.string().transform(Number).default('604800000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Upload
  UPLOAD_PATH: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('./logs/app.log'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:8000'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default(true),

  // Email (optionnel)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().default('noreply@gecc.com')
});

// Valider et parser les variables d'environnement
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Erreur de configuration des variables d\'environnement:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const config = parseResult.data;

// Configuration de la base de données
export const dbConfig = {
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum de connexions dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Configuration JWT
export const jwtConfig = {
  secret: config.JWT_SECRET,
  expiresIn: config.JWT_EXPIRES_IN,
  refreshSecret: config.JWT_REFRESH_SECRET,
  refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
};

// Configuration CORS
export const corsConfig = {
  origin: config.CORS_ORIGIN,
  credentials: config.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Configuration du rate limiting
export const rateLimitConfig = {
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
};

// Configuration des uploads
export const uploadConfig = {
  path: config.UPLOAD_PATH,
  maxFileSize: config.MAX_FILE_SIZE,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Configuration des cookies
export const cookieConfig = {
  secret: config.COOKIE_SECRET,
  maxAge: config.COOKIE_MAX_AGE,
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'strict'
};

// Configuration du logging
export const logConfig = {
  level: config.LOG_LEVEL,
  file: config.LOG_FILE,
  pretty: config.NODE_ENV === 'development'
};

// Configuration email (optionnelle)
export const emailConfig = {
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  user: config.SMTP_USER,
  pass: config.SMTP_PASS,
  from: config.SMTP_FROM,
  enabled: !!(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS)
};

export default config;
