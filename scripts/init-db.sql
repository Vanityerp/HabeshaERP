-- Vanity Hub Database Initialization Script
-- This script contains initialization commands for the Neon PostgreSQL database

-- Enable required extensions (these are typically already enabled in Neon)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'Asia/Qatar';

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just examples of what we might need

-- Create a function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: In Neon, database and user creation is handled through the Neon console
-- The connection details are:
-- Host: ep-crimson-lake-agstmll3-pooler.c-2.eu-central-1.aws.neon.tech
-- Database: neondb
-- User: neondb_owner
-- Password: npg_o5bQaY4wdfFu

-- For local development with Neon, we connect directly using the connection string:
-- postgresql://neondb_owner:npg_o5bQaY4wdfFu@ep-crimson-lake-agstmll3-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
