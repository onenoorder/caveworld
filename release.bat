docker build --pull -t es-castle:5000/epicsoft_caveworld/frontend:stage -f CWFrontend/docker/stage.Dockerfile ./CWFrontend
docker push es-castle:5000/epicsoft_caveworld/frontend:stage
#ssh castle@es-castle docker stack deploy --compose-file docker-compose-stage.yml epicsoft_food_stage

docker build --pull -t es-castle:5000/epicsoft_caveworld/frontend:latest -f CWFrontend/docker/prod.Dockerfile ./CWFrontend
docker push es-castle:5000/epicsoft_caveworld/frontend:latest
#ssh castle@es-castle docker stack deploy --compose-file docker-compose-prod.yml epicsoft_caveworld
pause