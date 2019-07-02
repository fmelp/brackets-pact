set -e

JSON="Content-Type: application/json"

if [ -z "$1" ];
then
  echo 'Server port must be supplied; ex: ./initialize-brackets.sh 9001'
  exit 1
fi

pact -a load-brackets.yaml | curl -H "$JSON" -d @- http://localhost:$1/api/v1/send

#this is to try to connect to chainweb

# set -e
#
# JSON="Content-Type: application/json"
#
# if [ -z "$1" ];
# then
#   echo 'Server port must be supplied; ex: ./initialize-brackets.sh 9001'
#   exit 1
# fi
#
# pact -a load-messari.yaml | curl -H "$JSON" -d @- https://us1.chainweb.com
