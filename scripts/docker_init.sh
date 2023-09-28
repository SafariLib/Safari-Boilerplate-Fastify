#!/bin/bash

# Set docker network name
read -p "Enter docker network name (24 char max): " docker_network_name
if [ -z "$docker_network_name" ]; then
    echo "Docker network name cannot be empty, defaulting to safari_fastify"
    docker_network_name="safari_fastify"
elif [ ${#docker_network_name} -gt 24 ]; then
    echo "Docker network name cannot be more than 24 characters"
    exit 1
fi

# Set server port
read -p "Enter server port (default: 8080): " server_port
if [ -z "$server_port" ]; then
    server_port="8080"
fi

# Set postgres variables
read -p "Enter postgres user (default: postgres_user): " postgres_user
if [ -z "$postgres_user" ]; then
    postgres_user="postgres_user"
fi
read -p "Enter postgres password (default: postgres_password): " postgres_password
if [ -z "$postgres_password" ]; then
    postgres_password="postgres_password"
fi
read -p "Enter postgres database (default: postgres_db): " postgres_db
if [ -z "$postgres_db" ]; then
    postgres_db="postgres_db"
fi
postgres_uri="postgresql://$postgres_user:$postgres_password@${docker_network_name}_postgres:5432/$postgres_db"

# Remove existing containers and volumes prefixed with $docker_network_name
remove_container_and_volume() {
    local image_tag="$1"
    docker stop "$image_tag" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        docker rm "$image_tag" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            docker volume rm "$image_tag" > /dev/null 2>&1
            if [ $? -eq 0 ]; then
                echo "Removed container and volume for $image_tag"
            else
                echo "Failed to remove volume for $image_tag"
            fi
        else
            echo "Failed to remove container for $image_tag"
        fi
    else
        echo "$image_tag does not exist, skipping..."
    fi
}

# Reset network
docker network rm "$docker_network_name" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Network $docker_network_name does not exist, skipping..."
fi
docker network create "$docker_network_name"

# Build server image
server_img_name="${docker_network_name}_server"
remove_container_and_volume "$server_img_name"
docker image rm "${server_img_name}" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Removed image ${server_img_name}"
else
    echo "Image ${server_img_name} does not exist, skipping..."
fi
docker buildx build -f "./Dockerfile.dev" -t "${server_img_name}" "." --pull --rm

# Postgres container
postgres_img_name="${docker_network_name}_postgres"
remove_container_and_volume "${postgres_img_name}"
docker run -d \
    -e POSTGRES_USER="$postgres_user" \
    -e POSTGRES_PASSWORD="$postgres_password" \
    -e POSTGRES_DB="$postgres_db" \
    -p 5432:5432 \
    --network "$docker_network_name" \
    -v "${postgres_img_name}":/var/lib/postgresql/data \
    --name "${postgres_img_name}" postgres:latest

# Redis container
redis_img_name="${docker_network_name}_redis"
docker run -d \
    --network "$docker_network_name" \
    -v "${redis_img_name}":/data \
    --name "${redis_img_name}" redis:latest

# Server container
docker run -d \
    --network "$docker_network_name" \
    -e POSTGRES_URI="$postgres_uri" \
    -e REDIS_HOST="${redis_img_name}" \
    -e REDIS_PORT=6379 \
    -e SERVER_PORT="$server_port" \
    -p 8081:"$server_port" \
    -p 9229:9229 \
    -p 5555:5555 \
    --name "${server_img_name}" \
    -v ./:/app \
    "${server_img_name}"

# Prisma commands
docker exec "${server_img_name}" npx prisma generate
docker exec "${server_img_name}" npx prisma migrate dev

echo "Docker network $docker_network_name created successfully"
echo "Server running on port $server_port"
echo "Postgres connection string: $postgres_uri"
echo "Redis connection string: $redis_img_name:6379"
echo "Happy hacking!"