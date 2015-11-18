#!/bin/bash

CONTAINER=$1
devPort="300"

/usr/bin/docker stats --no-stream $CONTAINER > stat

container_cpu=`cat stat | grep $CONTAINER | tr -s [:space:] " " | cut -d" " -f2 | sed -e 's/%//g'`
container_port=`sudo /usr/bin/docker ps | grep $CONTAINER | tr -s [:space:] " " | cut -d" " -f10 | cut -d":" -f2 | cut -d"-" -f1`
comp_cpu="20.00"
if ! echo "$container_cpu $comp_cpu -p" | dc | grep > /dev/null ^-; then
        echo "Its above the threshold"
        echo $container_cpu
        echo $container_port
        if [[ "$container_port" == "$devPort"* ]]; then
                python main.py $container_port RM server
        fi
        node sendmail.js $CONTAINER CPU $container_cpu
fi


comp_mem="6.00"
container_mem=`cat stat | grep $CONTAINER | tr -s [:space:] " " | cut -d" " -f8 | sed -e 's/%//g'`
if ! echo "$container_mem $comp_mem -p" | dc | grep > /dev/null ^-; then
        echo "Its above the threshold"
        echo $container_mem
        echo $container_port
        if [[ "$container_port" == "$devPort"* ]]; then
                python main.py $container_port RM server
        fi
        node sendmail.js $CONTAINER MEMORY $container_mem
fi