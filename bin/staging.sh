npm i

# Install pm2 if not found
{
  pm2 stop link-payment
} || {
  npm i -g pm2
}

npm run start:server
