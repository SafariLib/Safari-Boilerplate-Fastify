#!/bin/bash

# Config variables
postgres_user="postgres_user"
postgres_password="postgres_password"
postgres_db="postgres_db"

# Build docker network and containers
read -p "Enter docker network name (24 char max): " docker_network_name
if [ -z "$docker_network_name" ]; then
    echo "Docker network name cannot be empty, defaulting to safari_fastify"
    docker_network_name="safari_fastify"
elif [ ${#docker_network_name} -gt 24 ]; then
    echo "Docker network name cannot be more than 24 characters"
    exit 1
fi

images_tags=(
    "${docker_network_name}_server" 
    "${docker_network_name}_postgres" 
    "${docker_network_name}_redis" 
    "${docker_network_name}_dbeaver"
)


# Remove all existing containers, images, volumes, and networks prefixed with $docker_network_name
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
for image_tag in "${images_tags[@]}"; do
    remove_container_and_volume "$image_tag"
done
docker image rm "${images_tags[0]}" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Removed image ${images_tags[0]}"
else
    echo "Image ${images_tags[0]} does not exist, skipping..."
fi

docker network rm "$docker_network_name" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Network $docker_network_name does not exist, skipping..."
fi

# Build docker images
docker network create "$docker_network_name"

docker buildx build -f "./Dockerfile.dev" -t "${images_tags[0]}" "." --pull --rm
docker run -d \
    -e POSTGRES_USER="$postgres_user" \
    -e POSTGRES_PASSWORD="$postgres_password" \
    -e POSTGRES_DB="$postgres_db" \
    --network "$docker_network_name" \
    -v "${images_tags[1]}":/var/lib/postgresql/data \
    --name "${images_tags[1]}" postgres:latest

docker run -d \
    --network "$docker_network_name" \
    -v "${images_tags[2]}":/data \
    --name "${images_tags[2]}" redis:latest

docker run -d \
    -p 8978:8978 \
    --network "$docker_network_name" \
    -v "${images_tags[3]}":/opt/cloudbeaver/workspace \
    --name "${images_tags[3]}" dbeaver/cloudbeaver:latest

docker run -d \
    --network "$docker_network_name" \
    -p 8081:8080 \
    -p 9229:9229 \
    -p 5555:5555 \
    --name "${images_tags[0]}" \
    -v ./:/app \
    "${images_tags[0]}"

# Prisma commands
docker exec "${images_tags[0]}" npx prisma generate
docker exec "${images_tags[0]}" npx prisma migrate dev

echo "Docker network $docker_network_name created successfully"
