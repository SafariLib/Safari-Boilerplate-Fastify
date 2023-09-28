@echo off
setlocal enabledelayedexpansion

REM Set docker network name
set /p "docker_network_name=Enter docker network name (24 char max): "
if "!docker_network_name!"=="" (
    echo Docker network name cannot be empty, defaulting to safari_fastify
    set "docker_network_name=safari_fastify"
) else if "!docker_network_name!." GTR 24 (
    echo Docker network name cannot be more than 24 characters
    exit /b 1
)

REM Set server port
set /p "server_port=Enter server port (default: 8080): "
if "!server_port!"=="" (
    set "server_port=8080"
)

REM Set postgres variables
set "postgres_user=postgres_user"
set "postgres_password=postgres_password"
set "postgres_db=postgres_db"
set "postgres_uri=postgresql://!postgres_user!:!postgres_password!@!docker_network_name!_postgres:5432/!postgres_db!"

REM Function to remove containers and volumes
:remove_container_and_volume
set "image_tag=%~1"
docker stop "!image_tag!" >nul 2>&1
if !errorlevel! equ 0 (
    docker rm "!image_tag!" >nul 2>&1
    if !errorlevel! equ 0 (
        docker volume rm "!image_tag!" >nul 2>&1
        if !errorlevel! equ 0 (
            echo Removed container and volume for !image_tag!
        ) else (
            echo Failed to remove volume for !image_tag!
        )
    ) else (
        echo Failed to remove container for !image_tag!
    )
) else (
    echo !image_tag! does not exist, skipping...
)
exit /b

REM Reset network
docker network rm "!docker_network_name!" >nul 2>&1
if !errorlevel! neq 0 (
    echo Network !docker_network_name! does not exist, skipping...
)
docker network create "!docker_network_name!"

REM Build server image
set "server_img_name=!docker_network_name!_server"
call :remove_container_and_volume "!server_img_name!"
docker image rm "!server_img_name!" >nul 2>&1
if !errorlevel! equ 0 (
    echo Removed image !server_img_name!
) else (
    echo Image !server_img_name! does not exist, skipping...
)
docker buildx build -f ".\Dockerfile.dev" -t "!server_img_name!" "." --pull --rm

REM Postgres container
set "postgres_img_name=!docker_network_name!_postgres"
call :remove_container_and_volume "!postgres_img_name!"
docker run -d ^
    -e POSTGRES_USER=!postgres_user! ^
    -e POSTGRES_PASSWORD=!postgres_password! ^
    -e POSTGRES_DB=!postgres_db! ^
    --network "!docker_network_name!" ^
    -v "!postgres_img_name!":/var/lib/postgresql/data ^
    --name "!postgres_img_name!" postgres:latest

REM Redis container
set "redis_img_name=!docker_network_name!_redis"
docker run -d ^
    --network "!docker_network_name!" ^
    -v "!redis_img_name!":/data ^
    --name "!redis_img_name!" redis:latest

REM Server container
docker run -d ^
    --network "!docker_network_name!" ^
    -e POSTGRES_URI="!postgres_uri!" ^
    -e REDIS_HOST="!redis_img_name!" ^
    -e REDIS_PORT=6379 ^
    -e SERVER_PORT=!server_port! ^
    -p 8081:"!server_port!" ^
    -p 9229:9229 ^
    -p 5555:5555 ^
    --name "!server_img_name!" ^
    -v ./:/app ^
    "!server_img_name!"

REM Prisma commands
docker exec "!server_img_name!" npx prisma generate
docker exec "!server_img_name!" npx prisma migrate dev

echo Docker network !docker_network_name! created successfully
echo Server running on port !server_port!
echo Postgres connection string: !postgres_uri!
echo Redis connection string: !redis_img_name!:6379
echo Happy hacking!
