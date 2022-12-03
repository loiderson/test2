# 2420 assignment 2
# Important, if you are going to do something to one server, please continue to do the same thing on the other server. (Referring to the two droplets you have created on step 1.)

## Step 1:
Create a DO infrastructure. This can be done be watching and following the steps done in the video called, As2 Infrastructure. 
[The Video is here](https://vimeo.com/775412708/4a219b37e7)
At the end of following these steps you should have:
- At least two Droplets
- A load balancer
- A firewall using the digitalOcean cloud firewall
- And a newly made VPC that is being used by both droplets.
- Make sure to use the "Web" tag while making your droplets.

## Step 2:
Next, create a new regular user on both of the new droplets that you have created. You have the option of using a different username and password for each account.. or you can use the same credentials.
These are the commands to use when making your new users, be sure to use the commands in order:
```
useradd -ms /bin/bash <name>
usermod -aG sudo <name>
rsync --archive --chown=<name>:<name> ~/.ssh /home/<name>
passwd <name>
*you will set the password for each user here*
exit

ssh -i .\.ssh\<key> <name>@<ip>
sudo vim /etc/ssh/sshd_config
SET PermitRootLogin no
*The setting you will need to change above inside the config file will not allow the root user to connect to the droplet. This is good practice.*
sudo systemctl restart ssh
exit
```
You will need to repeat that twice. Once for each droplet, in order to create a user for each droplet.

## Step 3:
Now, lets create a web server on both of the droplets. We can skip the configuration part for now.
These are the commands that you will need to run in both droplets. Must be done in order:
```
wget https://github.com/caddyserver/caddy/releases/download/v2.6.2/caddy_2.6.2_linux_amd64.tar.gz
^This command will download the .tar.gz file for the web server^

tar xvf https://github.com/caddyserver/caddy/releases/download/v2.6.2/caddy_2.6.2_linux_amd64.tar.gz
^This command will unarchive the file, which will allow you to see the executable caddy file.^

sudo chown root:root caddy
^We will need to change the caddy's file owner and group to root^
```
In the end, you directory should look something a little like this:
![image](https://user-images.githubusercontent.com/100608327/205430678-19347429-d50b-426d-b5cb-f9376341b8bd.png)
**Do not mind the red folder/file. It is the file we unarchived.**

## Step 4:
For this step, you will need to write the "web app". 
- On your local machine which is the WSL for the windows users...
- Create a directory inside /var, the directory can be webapp, or a2-2420, I used webapp.
- Inside of this directory, create two more directories named ***html*** and ***src***
- Inside of the ***html*** directory, create a new index.html file.
- Create a simple although, a complete html file. (Everything that an html file/document should have.)
```
<!DOCTYPE html>
<html>
        <head>
                <title>ACIT 2420 Assignment 2</title>
        </head>
        <body>
                <h1>Caddy Server</h1>
                <p>A paragraph tag</p>
        </body>
</html>
```

- Now after that is finished, go back and enter your ***src*** directory.
- Create a new node project.
- Use these commands to do so: **(Be sure to enter them in that exact order and follow the input given when each command is used.)
```
npm init
npm i fastify
```

- Next be sure to create an index.js file inside your ***src*** directory.
- Add the following code to the file:
```
const fs = require('fs');
const fastify = require('fastify')({ logger: true })

fastify.get('/', async (request, reply) => {
        const webappStream = await fs.createReadStream('../html/index.html');
        return reply.type('text/html').send(stream)
})

const start = async () => {
          try {
                      await fastify.listen({ port: 3000 })
                    } catch (err) {
                                fastify.log.error(err)
                                process.exit(1)
                              }
}
start()
```

- Now that you have completed these steps, be sure to send both of the directories into both of your servers. This can be done by using the command:
```
rsync -r <directory_name_in_WSL> "<user_name_in_server>@<ip>:~/" -e "ssh -i /home/<username_here>/.ssh/<key_name> -o StrictHostKeyChecking=no"
```

## Step 5:
In this step we will be creating our Caddyfile block. (Server block)
We can create the file on our local machine and send it to our servers after.
The server block should look something like this: (***THE FILE WILL BE CALLED Caddyfile***)
```
http:// {
        root * /var/webapp/html
        reverse_proxy /api localhost:5050
        file_server
}
```
The formatting of the file can change depending on what you call your directories.
This file can be placed in the /etc/caddy directory that you manually created.

## Step 6:
In this step we are going to be installing node and npm with Volta.
These are the steps in order to do so:
```
curl https://get.volta.sh | bash
source ~/.bashrc
volta install node
which npm
volta install npm
```
**THE SOURCE COMMAND IS VERY IMPORTANT, IT IS WHAT ALLOWS US TO INSTALL NODE.**

## Step 7:
In this step we will need to write and create a service file on our local machine, in order for our node application to start.
The service file should look like this:
```
[Unit]
Description=HTML in /var/webapp
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/caddy run --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile
TimeoutStopSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target
```
This file can go inside your /etc/systemd/system folder. You may use the command:
```sudo mv Caddy.service /etc/systemd/system```

### I will also include this part in step 7 because we are still worrying about service files.
Lastly we need to create another service file in regards to our node.
- Create a service file called Nodemodule.service and put the following code:
```
[Unit]
Description=Making something
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/home/jacoblloyd/.volta/bin/node /var/webapp/src/index.js
User=jacob-final
Group=jacob-final
Restart=always
RestartSec=15
TimeoutStopSec=90
SyslogIdentifier=Hello_web

[Install]
WantedBy=multi-user.target
```
- This file will also be placed inside the /etc/systemd/system directory.
- Be sure to enable the service using sudo. 
- Some useful options for systemctl commands when dealing with service files are:
- [enable, start, and status]
