
![Logo](http://utils.myportfolio.club/scpanel.png)


## Screenshots

![App Screenshot](http://utils.myportfolio.club/scpanel1.png)
![App Screenshot](http://utils.myportfolio.club/scpanel2.png)
![App Screenshot](http://utils.myportfolio.club/scpanel3.png)
![App Screenshot](http://utils.myportfolio.club/scpanel4.png)


## Installation

Install scpanel

```bash
  npm install scpanel -g
```


## Setup

To setup this package run

```bash
  scpanel setup
```
After setup complete go to [http://scpanel.myportfolio.club](http://scpanel.myportfolio.club) and perform login with your id and password.

## Features

- used for controle file system of aws ec2,lightsail or other server
- Create Folder/File
- Delete Folder/File
- Copy Folder/File
- Move Folder/File
- Rename Folder/File
- Code Editor
- Read Data of Files

## TODO

- [ ] File/Folder download api integration
- [ ] Public File/Folder Download/Upload link generator api
- [ ] File/Folder Upload api integration
- [ ] Nodejs Project initilizer api integration
- [ ] static web hosting like netlify

## Usage/Examples

To setup your account
```bash
  scpanel setup
```
To start server after setup
```bash
  scpanel start
```
To stop server after start
```bash
  scpanel stop
```
To check status of server
```bash
  scpanel status
```
To change login password
```bash
  scpanel changepsswd
```
To remove your account
```bash
  scpanel removeuser
```
For more run
```bash
  scpanel help
```
## Tech Stack

**Client:** Flutter, Getx, http, etc

**Server:** Node, Express, pm2, etc


## Related

Here are some related projects
source code of user-interface scpanel_ui this project used as client-side of scpanel
[scpanel_ui](https://github.com/frenzycoders/scpanel_ui)

