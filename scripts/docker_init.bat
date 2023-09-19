@echo off
setlocal enabledelayedexpansion

REM /!\ NOT TESTED YET /!\

REM Config variables
set "postgres_user=postgres_user"
set "postgres_password=postgres_password"
set "postgres_db=postgres_db"

REM Build docker network and containers
set /p "docker_network_name=Enter docker network name (24 char max): "
if "!docker_network_name!"=="" (
    echo Docker network name cannot be empty, defaulting to safari_fastify
    set "docker_network_name=safari_fastify"
) else if "!docker_network_name!.">24 (
    echo Docker network name cannot be more than 24 characters
    exit /b 1
)

set "images_tags[0]=!docker_network_name!_server"
set "images_tags[1]=!docker_network_name!_postgres"
set "images_tags[2]=!docker_network_name!_redis"
set "images_tags[3]=!docker_network_name!_dbeaver"

REM Remove all existing containers, images, volumes, and networks prefixed with !docker_network_name!
for %%i in (!images_tags!) do (
    call :remove_container_and_volume "%%i"
)
docker image rm "!images_tags[0]!" >nul 2>&1
if !errorlevel! equ 0 (
    echo Removed image !images_tags[0]!
) else (
    echo Image !images_tags[0]! does not exist, skipping...
)

docker network rm "!docker_network_name!" >nul 2>&1
if !errorlevel! neq 0 (
    echo Network !docker_network_name! does not exist, skipping...
)

REM Build docker images
docker network create "!docker_network_name!"

docker buildx build -f ".\Dockerfile.dev" -t "!images_tags[0]!" "." --pull --rm
docker run -d ^
    -e POSTGRES_USER=!postgres_user! ^
    -e POSTGRES_PASSWORD=!postgres_password! ^
    -e POSTGRES_DB=!postgres_db! ^
    --network "!docker_network_name!" ^
    -v "!images_tags[1]!":/var/lib/postgresql/data ^
    --name "!images_tags[1]!" postgres:latest

docker run -d ^
    --network "!docker_network_name!" ^
    -v "!images_tags[2]!":/data ^
    --name "!images_tags[2]!" redis:latest

docker run -d ^
    -p 8978:8978 ^
    --network "!docker_network_name!" ^
    -v "!images_tags[3]!":/opt/cloudbeaver/workspace ^
    --name "!images_tags[3]!" dbeaver/cloudbeaver:latest

docker run -d ^
    --network "!docker_network_name!" ^
    -p 8081:8080 ^
    -p 9229:9229 ^
    -p 5555:5555 ^
    --name "!images_tags[0]!" ^
    -v ./:/app ^
    "!images_tags[0]!"

REM Prisma commands
docker exec "!images_tags[0]!" npx prisma generate
docker exec "!images_tags[0]!" npx prisma migrate dev

echo Docker network !docker_network_name! created successfully
exit /b

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
