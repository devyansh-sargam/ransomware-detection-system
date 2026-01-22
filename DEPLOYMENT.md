# Deployment Guide

This guide covers various deployment options for the Ransomware Detection System.

## Table of Contents
- [Local Development](#local-development)
- [Heroku Deployment](#heroku-deployment)
- [AWS Deployment](#aws-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)

## Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/devyansh-sargam/ransomware-detection-system.git
cd ransomware-detection-system
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
```bash
cp .env.example .env
```

4. **Start the server**:
```bash
npm start
```

5. **Access the application**:
Open `http://localhost:3001` in your browser

## Heroku Deployment

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Login to Heroku**:
```bash
heroku login
```

2. **Create Heroku app**:
```bash
heroku create your-app-name
```

3. **Set environment variables**:
```bash
heroku config:set NODE_ENV=production
heroku config:set AWS_REGION=us-east-1
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
```

4. **Deploy**:
```bash
git push heroku main
```

5. **Open the app**:
```bash
heroku open
```

## AWS Deployment

### Option 1: AWS Elastic Beanstalk

1. **Install EB CLI**:
```bash
pip install awsebcli
```

2. **Initialize EB**:
```bash
eb init -p node.js ransomware-detection
```

3. **Create environment**:
```bash
eb create ransomware-detection-env
```

4. **Set environment variables**:
```bash
eb setenv NODE_ENV=production AWS_REGION=us-east-1
```

5. **Deploy**:
```bash
eb deploy
```

### Option 2: AWS EC2

1. **Launch EC2 instance** (Ubuntu 20.04 LTS recommended)

2. **SSH into instance**:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Clone and setup**:
```bash
git clone https://github.com/devyansh-sargam/ransomware-detection-system.git
cd ransomware-detection-system
npm install
```

5. **Install PM2**:
```bash
sudo npm install -g pm2
```

6. **Start application**:
```bash
pm2 start server.js --name ransomware-detection
pm2 startup
pm2 save
```

7. **Configure Nginx** (optional):
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

### AWS Lambda + API Gateway

For serverless deployment, you'll need to:
1. Package the application
2. Create Lambda function
3. Set up API Gateway
4. Configure environment variables
5. Deploy

Detailed Lambda deployment guide coming soon!

## Docker Deployment

### Create Dockerfile

Create `Dockerfile` in project root:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

### Build and Run

1. **Build image**:
```bash
docker build -t ransomware-detection .
```

2. **Run container**:
```bash
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e AWS_REGION=us-east-1 \
  ransomware-detection
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - AWS_REGION=us-east-1
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

## Environment Variables

### Required Variables
- `PORT`: Server port (default: 3001)

### Optional AWS Variables
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `SNS_TOPIC_ARN`: SNS topic for alerts
- `S3_BUCKET_NAME`: S3 bucket for file storage

### Production Variables
- `NODE_ENV`: Set to 'production'

## Post-Deployment

### Health Check
Visit `/api/health` to verify the application is running

### Monitoring
- Set up CloudWatch (AWS)
- Configure application logging
- Monitor error rates
- Track performance metrics

### Security
- Enable HTTPS
- Configure CORS properly
- Set up rate limiting
- Implement authentication (if needed)
- Regular security updates

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001
# Kill the process
kill -9 <PID>
```

### Module Not Found
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### AWS Credentials Issues
- Verify IAM permissions
- Check environment variables
- Ensure credentials are valid

## Support

For deployment issues, please:
1. Check the logs
2. Review environment variables
3. Open an issue on GitHub
4. Contact: devyanshsargamips@gmail.com

---

**Happy Deploying! 🚀**