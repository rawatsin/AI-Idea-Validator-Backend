# Create & apply migration (for development only)
npx prisma migrate dev --name migration_name

# Apply migrations in production 
npx prisma migrate deploy

# Direct schema sync (no migration)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Pull schema from DB
npx prisma db pull

# Reset DB
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio