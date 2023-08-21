# Database management

## Using prisma in development

Database manipulations such as _Migrations_ are done using the [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference).

### Client generation
Generate the prisma client, will be available in the *node_modules* folder.
```
npx prisma generate
```

### Migration
Use the following command to create a migration and update your database with _schema.prisma_. The MIGRATION_NAME will be prefixed with a date.

```
npx prisma migrate dev --name MIGRATION_NAME
```

## Production environnement
