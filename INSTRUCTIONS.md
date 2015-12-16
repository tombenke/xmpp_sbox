I. Instructions to set up test environment
=============
### 1. Install Ejabberd server

Official installation guide can be found at:
http://docs.ejabberd.im/admin/guide/installation/

### 2. Configure ejabberd server:

Note: backup your original .yml configuration file to a different location for safety and to avoid conflicting configuration settings!

After installation, Ejabberd config file (ejabberd.yml) by default can be found at location:
- linux: path/to/ejabberd-*version*/conf/ejabberd.yml
- windows: C:\Users\\[Username\]\Appdata\Roaming\ejabberd\conf\ejabberd.yml

Always restart the server after modifying the configuration file.

- Replace (backup first) ejabberd.yml configuration file with the supplied configuration file for these tests from:
(https://github.com/tombenke/xmpp_sbox/)

- Edit ejabberd.yml file manually:

  **‘SERVER HOSTNAMES’ settings:**

  ```yaml
  hosts:
    - "localhost"
    - "rebels"
    - "empire"
  ```
      These hosts can be addressed by the domain part of the JID

  **‘LISTENING PORTS’ settings:**
  
  ```yaml
  - 
    port: 5280
    module: ejabberd_http
    request_handlers:
      "/websocket": ejabberd_http_ws
  ```
      Enable port '5280' to listen for websocket requests
==========
      
  ```yaml
  - 
    port: 5281
    module: ejabberd_http
    web_admin: true
  ```
      Enable port '5281' to enable built-in web interface for admin

  **‘ACCESS CONTROL LISTS’ settings:**
  ```yaml
  acl:
    admin:
      user:
        - "admin": "localhost"
  ```
      The 'admin' ACL grants administrative privileges to XMPP accounts.
      
      The user with JID 'admin@localhost' will have access to any host on ejabberd server.
      It can be treated as a 'global' administrator of the server.
  =============
  **Additional ‘HOST CONFIG SETTINGS’ settings:**
  ```yaml
  host_config:
  "rebels":
    acl:
      admin:
        user:
          - "rebels.admin": "rebels"
  "empire":
    acl:
      admin:
        user:
          - "empire.admin": "empire"
  ```
      These users (rebels.admin@rebels, empire.admin@empire) will have access to only a
      host according to their own domain on ejabberd server.
      They can be treated as 'host' administrators of the server.
  
  ```yaml
  "republic":
    acl:
      admin:
        user:
          - "republic.admin": "republic"
    odbc_type: mysql
    odbc_server: "localhost"
    odbc_port: 3306
    odbc_database: "republicdb"
    odbc_username: "ejabberd"
    odbc_password: "pass123"
    auth_method: [odbc]
  "clone.army":
    acl:
      admin:
        user:
          - "clone.admin": "clone.army"
    odbc_type: mysql
    odbc_server: "localhost"
    odbc_port: 3306
    odbc_database: "clonearmy"
    odbc_username: "ejabberd"
    odbc_password: "pass123"
    auth_method: [odbc]
  ```
      With these settings above we set two additional hosts for bulk test.
      These hosts' use MySQL database instead of default Mnesia database.
      It is optional to use any database supported by the ejabberd server.

  **‘MODULES’ settings:**

  // TODO

### 4. Register 'admin' user
Run this command in folder /path/to/ejabberd/bin/
```
ejabberdctl register admin localhost pass123
```

### 3. Install Node.js
Official installation guide can be found at: 
https://nodejs.org/en/download/package-manager/

### 4. Clone xmpp_sbox repository from Github.com
Install and use git from any shell: 
```
git clone https://github.com/tombenke/xmpp_sbox.git
```

### 5. Run populate server
Before using these utils visit ejabberd server's web admin interface at http://localhost:5281/admin. Check that server is up and running. Also check at http://localhost:5281/admin/vhosts/ if hosts (rebels, empire) are configured (available).

After above steps you shall populate ejabberd server with the necessary users for the included tests.
From the root folder of xmpp_sbox run in shell:
```
node utils/populateServer
```
