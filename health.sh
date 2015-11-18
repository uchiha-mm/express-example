#!/bin/bash

CONTAINER=$1

/usr/bin/docker stats --no-stream $CONTAINER > stat

container_cpu=`cat stat | grep $CONTAINER | tr -s [:space:] " " | cut -d" " -f2 | sed -e 's/%//g'`
#container_cpu=$((container_cpu*100))
comp_cpu="0.00"
if ! echo "$container_cpu $comp_cpu -p" | dc | grep > /dev/null ^-; then
#if [ $container_cpu > 0.00 ]; then
	echo "Its above zero"
	echo $container_cpu
	node sendmail.js $CONTAINER CPU $container_cpu
fi


comp_mem="0.00"
container_mem=`cat stat | grep $CONTAINER | tr -s [:space:] " " | cut -d" " -f8 | sed -e 's/%//g'`
#if [ $container_mem > 0.00 ]; then
if ! echo "$container_mem $comp_mem -p" | dc | grep > /dev/null ^-; then 
       	echo "Its above zero"
        echo $container_mem
	node sendmail.js $CONTAINER MEMORY $container_mem
fi