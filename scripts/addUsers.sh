#!/bin/bash

filename="$1"
domain="$2"
ejabber="$3"

if [ $# -lt 3 ]
then 
    echo "Script parameters:"
    echo "  1 - file containing users and passwords"
    echo "  2 - xmpp domain"
    echo "  3 - ejabber location"
    exit 1
fi 

while read -r line
do
    data=( $line )
    user=${data[0]}
    pass=${data[1]}
    bash "${ejabber}bin/ejabberdctl" "register $user $domain $pass" 
done < "$filename"
