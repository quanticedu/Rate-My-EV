# Rate-My-EV
A web application that tracks customer reviews of EVs

Copyright 2021 Quantic School of Business and Technology

To build this app on a single machine for development (N.B.: these instructions aren't sufficient to install on cloud servers):
1. Install NodeJS and npm (https://nodejs.org/en/download/ for download and instructions). We recommend using the Prebuilt Installer.
2. Install MySQL Server (https://dev.mysql.com/downloads/mysql/8.0.html for download and instructions). For Windows, use the MSI Installer. For MacOS, use the DMG archive that applies to your architecture (ARM or x86).
3. Start the MySQL shell
   * Mac: `/usr/local/mysql/bin/mysql --user=root --password`
   * Linux: TBD
   * Windows: open the MySQL Shell app then enter:  `\connect root@localhost`. If the prompt ends with `JS`, enter this command: `\sql`.
4. In the MySQL shell, execute the following commands:
   * `CREATE USER 'Quantic_Dev'@'localhost' IDENTIFIED BY 'Quantic_Dev';`
   * `GRANT ALL ON ev_ratings.* TO 'Quantic_Dev'@'localhost';`
   * `CREATE USER 'ratemyev_user'@'localhost' IDENTIFIED BY 'ratemyev_user';`
   * `GRANT DELETE, INSERT, SELECT, UPDATE ON ev_ratings.* TO 'ratemyev_user'@'localhost';`
5. Exit MySQL then fork and clone the repo using this command: `git clone <url>`
   (find the url in GitHub using the Code button in the repo)
   * If you're asked for a username and password, enter your username as normal
      but then for the password you need to enter your Personal Access Token
      and not your GitHub account password. For more information on PAT see
      https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token.
6. Change to Rate-My-EV directory and install NodeJS dependencies with this
   command: `npm install`
7. Change to the admin directory and install React dependencies with this
   command: `npm install`
8. Now build the admin React app with this command: `npm run build`
9. Change back to the Rate-My-EV directory, then to the client directory.
   Install React dependencies with this command: `npm install`
10. Build the client React app with this command: `npm run build`

To run this app in developer mode (i.e with the clients automatically
refreshing when you make changes to their code):
1. In the Rate-My-EV directory, start the server with this
   command: `node server`
2. In each of the admin and client directories, start the React apps
   with this command: `npm start`
   * A browser window for each app should automatically start.
   * Note that one of the clients will be running on port 3000 and the
      other on port 3001.
  
To run this app in production mode (i.e. with the clients served as
static files):
1. In the Rate-My-EV directory, start the server with this
   command: `node server`
2. Open a browser at http://localhost:5000 to see the user-side
   client, or http://localhost:5000/admin to see the admin options.
