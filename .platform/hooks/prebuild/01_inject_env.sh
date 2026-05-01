#!/bin/bash
set -e
# Copy EB environment variables into .env so docker compose can read them
if [ -f /opt/elasticbeanstalk/deployment/env ]; then
  cp /opt/elasticbeanstalk/deployment/env /var/app/staging/.env
fi