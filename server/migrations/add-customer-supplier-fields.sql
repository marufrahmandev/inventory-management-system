-- Migration: Add paymentTerms to customers and bankDetails to suppliers
-- Run this script to add missing fields to existing tables

-- Add paymentTerms to customers table if it doesn't exist
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS paymentTerms VARCHAR(100) NULL;

-- Add bankDetails to suppliers table if it doesn't exist
ALTER TABLE suppliers
ADD COLUMN IF NOT EXISTS bankDetails TEXT NULL;

