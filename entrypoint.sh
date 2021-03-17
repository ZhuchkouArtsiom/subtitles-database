#!/bin/bash
cat /etc/hosts
sequelize-cli db:migrate
node dist/main.js
