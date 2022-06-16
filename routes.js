const express = require('express');
const dotenv = require('dotenv');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db2 = require('ibm_db');
const oracledb = require('oracledb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 3;
const fs = require('fs');
const fastCsv = require('fast-csv');
const ws = fs.createWriteStream('ProcessErrorFile.csv');
const ws2 = fs.createWriteStream('BankUsageReportFile.csv');
const ws3 = fs.createWriteStream('CtcComparisonFile.csv');
const xlsxFile = require('read-excel-file/node');
const nodemailer = require('nodemailer');
const moment = require('moment');
const http = require('http');
let generatedKey;

dotenv.config();

var count = 0;

var secret = Buffer.from(process.env.SECPKey, 'base64').toString('ascii');
var secp = Buffer.from(process.env.SECPDBKey, 'base64').toString('ascii');
var secp_2 = Buffer.from(process.env.SECP2DBKey, 'base64').toString('ascii');
var secp_3 = Buffer.from(process.env.SECP3DBKey, 'base64').toString('ascii');
var secp_4 = Buffer.from(process.env.SECP4DBKey, 'base64').toString('ascii');
var secp_5 = Buffer.from(process.env.SECP5DBKey, 'base64').toString('ascii');
var secp_6 = Buffer.from(process.env.SECP6DBKey, 'base64').toString('ascii');
var oracleUser = Buffer.from(process.env.ORACLEDB_USER, 'base64').toString('ascii');
var oraclePassword = Buffer.from(process.env.ORACLEDB_PASSWORD, 'base64').toString('ascii');
var oracleConnectString = Buffer.from(process.env.ORACLEDB_CONNECT_STRING, 'base64').toString('ascii');

try
{
  oracledb.initOracleClient({libDir: 'C:/instantclient_19_14'});
}
catch(err)
{
  console.log("Error occurred while trying to link to the Oracle Instant Client " + err.message);
  process.exit(1);
}

var transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

router.post('/api/login', async (req, res) => {

    const email = req.body.usermail.toUpperCase();
    const passcode = req.body.passcode;
    const userip = req.ip;
    const searchDB = `SELECT UPPER ("email"), "samaccount", "password", "userrights" FROM USER_CREDENTIALS WHERE UPPER ("email") = ?`;

    db2.open(secp, (err, conn) => {

      if(!err)
      {
        console.log("Connected Successfully");
      }
      else
      {
        console.log("Error occurred while connecting with DB2: " + err.message);
      }
        conn.query(searchDB, [email], async (err, results) => {
          if(!err)
          {
            if(results.length == 0)
            {
              res.send("UnAuthorized");
            }
            else
            {
              samaccount = results[0].samaccount;

              const waitingForResult = await verifyLogin(samaccount, userip);

              if(waitingForResult == 1)
              {
                if (bcrypt.compareSync(passcode, results[0].password))
                {
                  const token = jwt.sign({id: email}, secret, {expiresIn: '1h' });
                  if(results[0].userrights == 'full')
                  {
                    count++;
                    console.log(`The number of users logged in today: ${count}`);
                    res.setHeader('Access-Control-Expose-Headers', 'x-access-token');
                    res.setHeader('x-access-token', token);
                    res.send("Full Authorization");
                  }
                  else if(results[0].userrights == 'partial')
                  {
                    count++;
                    console.log(`The number of users logged in today: ${count}`);
                    res.setHeader('Access-Control-Expose-Headers', 'x-access-token');
                    res.setHeader('x-access-token', token);
                    res.send("Partial Authorization");
                  }
                  else if(results[0].userrights == 'minimum')
                  {
                    count++;
                    console.log(`The number of users logged in today: ${count}`);
                    res.setHeader('Access-Control-Expose-Headers', 'x-access-token');
                    res.setHeader('x-access-token', token);
                    res.send("Minimum Authorization");
                  }
                  else
                  {
                    res.send("Rights have not been granted yet");
                  }
                }
                else
                {
                  res.send("UnAuthorized");
                }
              }
              else
              {
                  res.send("UnAuthorized");
              }
            }
          }
          else
          {
            console.log("Error occurred while searching for all the data: " + err.message);
          }

          conn.close((err) => {

            if(!err)
            {
                console.log("Connection closed with the database");
            }
            else
            {
                console.log("Error occurred while trying to close the connection with the database " + err.message);
            }
          })
        })
    });

});

function verifyLogin(samAccount, ipaddress)
{
  return new Promise((resolve, reject) => {

    const header = {'caller': `${samAccount}`, 'ip-address': `${ipaddress}`};

    http.get(`http://srtstws:8080/RestAd/v1/ad/${samAccount}`, {headers: header}, (res) => {

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        newdata = JSON.parse(data);
        if(newdata.accountStatus == true)
        {
          resolve(1);
        }
        else
        {
          resolve(0);
        }
      });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });

  });

}

router.post('/api/forgotpassword', (req, res) => {

  const email = req.body.userEmail.toUpperCase();
  const searchDB = `SELECT UPPER ("email") FROM USER_CREDENTIALS WHERE UPPER ("email") = ?`;

  db2.open(secp, (err, conn) => {
    if(!err)
      {
        console.log("Connected Successfully");
      }
      else
      {
        console.log("Error occurred while connecting with DB2: " + err.message);
      }


      conn.query(searchDB, [email], (err, results) => {

        if(!err) 
        {
          results.length === 0 ? res.send('Email does not exist'): sendVerificationKey(res, email).catch(console.error);
        } 
        else 
        {
          console.log("Error occurred while searching for all the data: " + err.message);
        }

        conn.close((err) => {

          if(!err)
          {
              console.log("Connection closed with the database");
          }
          else
          {
              console.log("Error occurred while trying to close the connection with the database " + err.message);
          }
        })
      });
  });

});

async function sendVerificationKey(res, email) {
  generatedKey = Math.floor(Math.random() * 9999) + 1000;
  email = email.toLowerCase();
  let info = await transporter.sendMail({
    from: '"EServices Assistant" <admin@secp.gov.pk>', // sender address
    to: `${email}`, // list of receivers
    subject: "Password Reset", // Subject line
    html: `<p>Assalam-u-Alaikum, <br />&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; We have received a request to reset the password for your EServices Assistant account. 
    To reset your password, copy and paste the verification code into the EServices Assistant application. <br />
    <br />Your <b>Verification Code</b> is: <h3>${generatedKey}</h3> Or, you can click on the link below: <br /><br />
    <a href="http://srwamp:3000/#/forgotpassword?verificationcodevalid=true&useremail=${email}">http://srwamp:3000/#/forgotpassword?verificationcodevalid=true&useremail=${email}</a>
    <br /><br /><br /><i>
    This is an automatically generated email – 
    please do not reply to it.</i></p>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

  res.send('Email found');
}

router.post('/api/verifycode', (req, res) => {

  const id = req.body.verificationCode;
  id === generatedKey ? res.send('Verified') : res.send('Invalid'); 

});


router.put('/api/createnewpassword', (req, res) => {

  const key = req.query.id;
  const key2 = req.query.id2;
  const key3 = req.query.id3;

  var salt;
  var hash;

  salt = bcrypt.genSaltSync(saltRounds);
  hash = bcrypt.hashSync(key, salt);
 
  const updateData = `UPDATE USER_CREDENTIALS SET "${key3}" = ? WHERE "email" = ?`;

  db2.open(secp, (err, conn) => {
    if(!err)
    {
      console.log("Connected Successfully");
    }
    else
    {
      console.log("Error occurred while connecting to the database" + err.message);
    }

    
    conn.query(updateData, [hash, key2], (err, results) => {

      if(!err)
      {
        res.send("Data updated successfully");
      }
      else
      {
        console.log("Error occurred while updating the user profile data" + err.message);
      }

      conn.close((err) => {
        if(!err)
        {
          console.log("Connection closed with the database");
        }
        else
        {
          console.log("Error occurred while trying to close the connection with the database" + err.message);
        }

      })
    })
          
});

});

router.get('/api/allowUserRights', (req, res) => {

  calculateIP(req.ip, '/api/allowUserRights');

  const token = req.get('key')

  if(!token)
  {
    res.json('No Token Provided');
    return;
  }

  jwt.verify(token, secret, function(err, decoded){

    if(!err)
    {
      const key = req.query.id;

      const fetchRights = `SELECT USER_CREDENTIALS."name", USER_CREDENTIALS_2."roles", USER_CREDENTIALS_2."email", USER_CREDENTIALS_2."routes"
                            FROM ESUSER.USER_CREDENTIALS INNER JOIN USER_CREDENTIALS_2 on USER_CREDENTIALS."email" = USER_CREDENTIALS_2."email"
                            WHERE USER_CREDENTIALS."email" = ? ORDER BY "roles"`;

      db2.open(secp, (err, conn) => {
        if(!err)
        {
          console.log("Connected Successfully");
        }
        else
        {
          console.log("Error occurred while connecting to the database " + err.message);
        }
        conn.query(fetchRights, [key], (err, results) => {
          if(!err)
          {
            res.send(results);
          }
          else
          {
            console.log("Error occurred while fetch user rights " + err.message);
          }

          conn.close((err) => {
            if(!err)
            {
              console.log("Connection closed with the database");
            }
            else
            {
              console.log("Error occurred while trying to close the connection with the database " + err.message);
            }
          })
        })
      })
    }

    else
    {
      res.json('Authorization Failed. Token Expired. Please Login Again.');
    }
  });

});

function verifyEmail(mailToUpper)
{
  const checkEmail = `SELECT UPPER("email") from USER_CREDENTIALS WHERE UPPER("email") = ?`;

  return new Promise((resolve, reject) => {
    db2.open(secp, (err, conn) => {
      if(!err)
      {
          console.log("Connected Successfully");
      }
      else
      {
        console.log("Error occurred while connecting to the database " + err.message);
      }

      conn.query(checkEmail, [mailToUpper], (err, results) => {
        if(!err)
        {
          if(results.length > 0)
          {
            resolve(0);
          }
          else
          {
            resolve(1);
          }
        }

        conn.close((err) => {
          if(!err)
          {
              console.log("Connection closed with the database");
          }
          else
          {
              console.log("Error occurred while trying to close the connection with the database " + err.message);
          }
        })
      })
    })
  })
}


router.post('/api/postData', async (req, res) => {

    calculateIP(req.ip, '/api/postData');

    const name = req.body.fullPersonName;
    const mail = req.body.mailPerson;
    const mailToUpper = req.body.mailPerson.toUpperCase();
    const code = req.body.codePerson;
    const employeeid = req.body.employeeidPerson;
    const samaccount = req.body.samaccountPerson;
    const activedirectory = req.body.activeDirectoryPerson;
    const jobrole = req.body.jobRolePerson;
    const jobstatus = req.body.jobStatusPerson;
    const location = req.body.locationPerson;
    const department = req.body.departmentPerson;
    const adminrights = req.body.adminRightsPerson;
    var additionalrights = req.body.additionalRightsPerson;
    var roles = [];
    var userRoles = [];

    var userAdditionalRights = [];

    if(adminrights != 'minimum')
    {
      for(var i = 0; i < additionalrights.length; i++)
      {
        roles [i] = additionalrights[i].split(',');
      }

      for(var i = 0; i < additionalrights.length; i++)
      {
        userRoles.push(roles[i][0]);
        userAdditionalRights.push(roles[i][1]);
      }
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(code, salt);

    const addData = `INSERT INTO USER_CREDENTIALS ("name", "email", "password", "userdesignation", "userstatus", "activedirectoryaccount", "employeeid", "location", "userrights", "samaccount", "department") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const addData2 = `INSERT INTO USER_CREDENTIALS_2 ("roles", "email", "routes") VALUES (?, ?, ?)`;

    const waitingForResult = await verifyEmail(mailToUpper);

    if(waitingForResult == 1)
    {
      db2.open(secp, (err, conn) => {
        if(!err)
        {
          console.log("Connected Successfully");
        }
        else
        {
          console.log("Error occurred while connecting to the database " + err.message);
        }

          conn.query(addData, [name, mail, hash, jobrole, jobstatus, activedirectory, employeeid, location, adminrights, samaccount, department], (err, results) => {
            if(!err)
            {
              console.log("User data added successfully");
            }
            else
            {
              console.log("Error occurred while adding new user data " + err.message);
            }

            conn.close((err) => {

              if(!err)
              {
                  console.log("Connection closed with the database");
              }
              else
              {
                  console.log("Error occurred while trying to close the connection with the database " + err.message);
              }
            })
          })

          var mailArray = [];
          for(var i = 0; i < userRoles.length; i++)
          {
            mailArray.push(mail);
          }

          if(adminrights != 'minimum')
          {
            for(var i = 0; i < userRoles.length; i++)
            {
              conn.query(addData2, [userRoles[i], mail, userAdditionalRights[i]], (err, results) => {
                if(!err)
                {
                  console.log("User data added successfully");
                }
                else
                {
                  console.log("Error occurred while adding new user data " + err.message);
                }

                conn.close((err) => {
                  if(!err)
                  {
                    console.log("Connection closed with the database");
                  }
                  else
                  {
                    console.log("Error occurred while trying to close the connection with the database " + err.message);
                  }
                })
              })
            }
          }

          res.send('User data added successfully')

      });
    }
    else
    {
      res.send("Email already exists");
    }
});


router.get('/api/totalData', (req, res) => {

    const token = req.get('key');

    if(!token)
    {
      res.json('No Token Provided');
      return;
    }

    jwt.verify(token, secret, function(err, decoded) {

      if(!err)
      {
        const searchCalData = `SELECT COUNT("id") total FROM USER_CREDENTIALS`;

        db2.open(secp, (err, conn) => { 
          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database " + err.message);
          }

          conn.query(searchCalData, (err, results) => {

            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while fetching the total data of users: " + err.message);
            }

            conn.close((err) => {

              if(!err)
              {
                  console.log("Connection closed with the database");
              }
              else
              {
                  console.log("Error occurred while trying to close the connection with the database " + err.message);
              }
            })

          })
        });
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }

    });

});


router.get('/api/adminData', (req, res) => {

  const token = req.get('key');

  if(!token)
  {
    res.json('No Token Provided');
    return;
  }

  jwt.verify(token, secret, function(err, decoded) {

    if(!err)
    {
      var pagLimit = req.query.id;
      var pagData = req.query.id2;

      const searchAdminData = `SELECT "id", "name", "email", "userdesignation", "userstatus", "activedirectoryaccount", "employeeid", "location", "department", "samaccount", "userrights" FROM USER_CREDENTIALS ORDER BY "id" LIMIT ?, ?`;

      db2.open(secp, (err, conn) => {

        if(!err)
        {
          console.log("Connected Successfully");
        }
        else
        {
          console.log("Error occurred while connecting to the database " + err.message);
        }

        conn.query(searchAdminData, [pagData, pagLimit], (err, results) => {
          if(!err)
          {
            res.send(results);
          }
          else
          {
            console.log("Error occurred while fetching administration data " + err.message);
          }

          conn.close((err) => {

            if(!err)
            {
                console.log("Connection closed with the database");
            }
            else
            {
                console.log("Error occurred while trying to close the connection with the database " + err.message);
            }
          })
        })
      });
    }

    else
    {
      res.json('Authorization Failed. Token Expired. Please Login Again.');
    }

  });

});

router.get('/api/subAdminData', (req, res) => {

  const token = req.get('key');

  if(!token)
  {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function(err, decoded){

    if(!err)
    {
      const userMail = req.query.id.toUpperCase();

      const fetchAdminRights = `SELECT USER_CREDENTIALS_2."roles" FROM ESUSER.USER_CREDENTIALS INNER JOIN USER_CREDENTIALS_2 ON
                                USER_CREDENTIALS."email" = USER_CREDENTIALS_2."email" WHERE UPPER(USER_CREDENTIALS."email") = ?`;

      db2.open(secp, (err, conn) => {

        if(!err)
        {
          console.log("Connected Successfully");
        }
        else
        {
          console.log("Error occurred while connecting to the database " + err.message);
        }

        conn.query(fetchAdminRights, [userMail], (err, results) => {
          if(!err)
          {
            res.send(results);
          }
          else
          {
            console.log("Error occurred while fetching sub administrative rights " + err.message);
          }

          conn.close((err) => {
            if(!err)
            {
                console.log("Connection closed with the database");
            }
            else
            {
                console.log("Error occurred while trying to close the connection with the database " + err.message);
            }
          })
        })
      })
    }
  })

});


router.put('/api/modifyrights', (req, res) => {

  calculateIP(req.ip, '/api/modifyrights');

  const token = req.get('key');

  if(!token)
  {
    res.json("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function(err, decoded) {

      if(!err)
      {
        const rights = req.query.id;
        const email = req.query.id2;

        const modifyrights = `UPDATE USER_CREDENTIALS SET "userrights" = ?  WHERE "email" = ?`;

        db2.open(secp, (err, conn) => {
          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database " + err.message);
          }
          conn.query(modifyrights, [rights, email], (err, results) => {
            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while updaing administrative rights " + err.message);
            }

            conn.close((err) => {

              if(!err)
              {
                  console.log("Connection closed with the database");
              }
              else
              {
                  console.log("Error occurred while trying to close the connection with the database " + err.message);
              }
            });

          })
        });
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
  });

});

router.post('/api/modifysubrights', (req, res) => {

    calculateIP(req.ip, '/api/modifysubrights');

    const token = req.get('key');

    if(!token)
    {
      res.json('No Token Provided');
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const rightsToAdd = req.body.rights;
        const rolesToAdd = req.body.roles;
        const userMail = req.query.id;


        const insertData = `INSERT INTO USER_CREDENTIALS_2 ("roles", "email", "routes") VALUES (?, ?, ?)`;

        db2.open(secp, (err, conn) => {

          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database " + err.message);
          }


          for(var i = 0; i <= rightsToAdd.length; i++)
          {
            conn.query(insertData, [rightsToAdd[i], userMail, rolesToAdd[i]], (err, results) => {

              if(!err)
              {
                console.log(results);
              }
              else
              {
                console.log("Error occurred while inserting the new roles of the user" + err.message);
              }

              conn.close((err) => {
                if(!err)
                {
                    console.log("Connection closed with the database");
                }
                else
                {
                    console.log("Error occurred while trying to close the connection with the database " + err.message);
                }
              })
            })
          }
          res.json("User data added successfully");
        })
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })

});

router.delete('/api/deletesubrights', (req, res) => {

    calculateIP(req.ip, '/api/deletesubrights');

    const token = req.get('key');

    if(!token)
    {
      res.json('No Token Provided');
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        var deleteRoles = JSON.parse(req.query.id);
        const userMail = req.query.id2;

        const deleteData = `DELETE FROM USER_CREDENTIALS_2 where "roles" = ? AND "email" = ?`;

        db2.open(secp, (err, conn) => {

            if(!err)
            {
              console.log("Connected Successfully");
            }
            else
            {
              console.log("Error occurred while connecting to the database " + err.message);
            }

       for(var i = 0; i <= deleteRoles.length; i++)
       {
         conn.query(deleteData, [deleteRoles[i], userMail], (err, results) => {

           if(!err)
           {
             console.log(results);
           }
           else
           {
             console.log("Error occurred while deleting the user role " + err.message);
           }

           conn.close((err) => {

             if(!err)
             {
               console.log("Connection closed with the database");
             }
             else
             {
                 console.log("Error occurred while trying to close the connection with the database " + err.message);
             }
           })
         })
       }
       res.json("User data added successfully");
      })
    }

    else
    {
      res.json('Authorization Failed. Token Expired. Please Login Again.');
    }
  })
});

router.get('/api/searchData', (req, res) => {

  calculateIP(req.ip, '/api/searchData');

  const token = req.get('key');

  if(!token)
  {
    res.json('No Token Provided');
    return;
  }

  jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const searchElement = req.query.id.toUpperCase();

        const searchData = `SELECT "id", "name", "email", "userdesignation", "userstatus", "activedirectoryaccount", "employeeid", "location", "department", "samaccount", "userrights" FROM USER_CREDENTIALS WHERE UPPER("name") LIKE '%${searchElement}%' OR UPPER("email")
                            LIKE '%${searchElement}%' OR UPPER("userdesignation") LIKE '%${searchElement}%' OR UPPER("userstatus") LIKE '%${searchElement}%' OR UPPER("activedirectoryaccount") LIKE '%${searchElement}%' OR UPPER("employeeid") LIKE '%${searchElement}%' OR UPPER("location") LIKE '%${searchElement}%' OR UPPER("department") LIKE '%${searchElement}%' OR UPPER("samaccount") LIKE '%${searchElement}%' OR  UPPER("userrights") LIKE '%${searchElement}%'`;

        db2.open(secp, (err, conn) => {

          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database " + err.message);
          }

          conn.query(searchData, (err, results) => {

            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while searching for the given data " + err.message);
            }

            conn.close((err) => {
              if(!err)
              {
                  console.log("Connection closed with the database");
              }
              else
              {
                  console.log("Error occurred while trying to close the connection with the database " + err.message);
              }

            })

          })
        });
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
  });

});

router.get('/api/getProfile', (req, res) => {

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

        if(!err)
        {
          const key = req.query.id;

          const fetch = `SELECT "name", "email", "userdesignation", "userstatus", "activedirectoryaccount", "employeeid", "location", "department", "samaccount" FROM USER_CREDENTIALS WHERE "email" = ?`;

          db2.open(secp, (err, conn) => {
            if(!err)
            {
              console.log("Connected Successfully");
            }
            else
            {
              console.log("Error occurred while connecting to the database" + err.message);
            }

            conn.query(fetch, [key], (err, results) => {
              if(!err)
              {
                res.send(results);
              }
              else
              {
                console.log("Error occurred while fetching the user profile data" + err.message);
              }

              conn.close((err) => {
                if(!err)
                {
                  console.log("Connection closed with the database");
                }
                else
                {
                  console.log("Error occurred while trying to close the connection with the database" + err.message);
                }
              })
            })
          })
        }

        else
        {
          res.json('Authorization Failed. Token Expired. Please Login Again.');
        }
    });

});


router.get('/api/getLogRequests', (req, res) => {

    const token = req.get('key');

    if(!token) {
      res.send("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const fetch = `SELECT * FROM ESUSER.REQUESTS_LOG`;

        db2.open(secp, (err, conn) => {
          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message);
          }

          conn.query(fetch, (err, results) => {
            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while fetching the log requests" + err.message);
            }

            conn.close((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
  });


});


router.post('/api/postLogRequests', (req, res) => {

  const token = req.get('key');

  if(!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function(err, decoded){

    if(!err)
    {
      const id1 = req.body.email;
      const id2 = req.body.message;

      const fetch = `INSERT INTO ESUSER.REQUESTS_LOG("USEREMAIL", "USERMESSAGE") VALUES (?, ?)`;

      db2.open(secp, (err, conn) => {
        if(!err)
        {
          console.log("Connected Successfully");
        }
        else
        {
          console.log("Error occurred while connecting to the database" + err.message);
        }

        conn.query(fetch, [id1, id2], (err, results) => {
          if(!err)
          {
            res.send('Data inserted successfully');
          }
          else
          {
            console.log("Error occurred while inserting the data in log requests" + err.message);
          }

          conn.close((err) => {
            if(!err)
            {
              console.log("Connection closed with the database");
            }
            else
            {
              console.log("Error occurred while trying to close the connection with the database" + err.message);
            }
          })
        })
      })
    }

    else
    {
      res.json('Authorization Failed. Token Expired. Please Login Again.');
    }
  });


});

router.delete('/api/deleteLogRequests', (req, res) => {
  
  const token = req.get('key');

  if(!token)
  {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function(err, decoded){

    if(!err)
    {
      const id1 = req.query.email;
      const id2 = req.query.message;

      const fetch = `DELETE FROM ESUSER.REQUESTS_LOG WHERE "USEREMAIL" = ? AND "USERMESSAGE" = ?`;

      db2.open(secp, (err, conn) => {
        if(!err)
        {
          console.log("Connected Successfully");
        }
        else
        {
          console.log("Error occurred while connecting to the database" + err.message);
        }

        conn.query(fetch, [id1, id2], (err, results) => {
          if(!err)
          {
            response = {
              status: 'ok'
            };
            res.send(response);
          }
          else
          {
            console.log("Error occurred while deleting the data in log requests" + err.message);
          }

          conn.close((err) => {
            if(!err)
            {
              console.log("Connection closed with the database");
            }
            else
            {
              console.log("Error occurred while trying to close the connection with the database" + err.message);
            }
          })
        })
      })
    }

    else
    {
      res.json('Authorization Failed. Token Expired. Please Login Again.');
    }
  });

})

router.get('/api/combinedctcreport', (req, res) => {

  const token = req.get('key');

  if(!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function(err, decoded){

    const startDate = req.query.id;
    const endDate = req.query.id2;

    console.log(startDate, endDate);

    const ctcReport = [];
    if(!err)
    {
      const digitalCtc = `select (COALESCE(b.ApplyDate,a.ApplyDate)) as date,
      MONTHNAME(date(b.ApplyDate)) Invoice_Month,
      COALESCE(DigitalTotalFiled,0) Dig_Issued,COALESCE(DigitalPaidAmount,0) Dig_Amt,
      COALESCE(StandTotalFiled,0) Stand_Issued,COALESCE(StandPaidAmount,0) as Stand_Amt
      from (
      SELECT DATE(USER.DT) as ApplyDate, SUM(BCF.FEEPD) as StandPaidAmount, Count(*) StandTotalFiled 
      FROM SECP.BANK_CHALLAN_FORM BCF  INNER JOIN 
      (
      SELECT UP.USER_PROCESS_ID, DATE(UP.END_DATE) AS DT from SECP.USER_PROCESSES UP WHERE UP.STATUS = 'Closed' 
      and DATE(UP.END_DATE) >= DATE('${startDate}') AND DATE(UP.END_DATE) <= DATE('${endDate}') and UP.PROCESS_ID = 17001
      )
      USER
      ON BCF.USER_PROCESS_ID = USER.USER_PROCESS_ID
      GROUP BY DATE(USER.DT)
      ) a right outer join (
            SELECT DATE(USER.DT) as ApplyDate, SUM(BCF.FEEPD) as DigitalPaidAmount , Count(*) as DigitalTotalFiled 
            FROM SECP.BANK_CHALLAN_FORM BCF  INNER JOIN (
            SELECT UP.USER_PROCESS_ID,DATE(UP.END_DATE) AS DT from SECP.USER_PROCESSES UP WHERE UP.STATUS = 'Closed' 
            and DATE(UP.END_DATE) >= DATE('${startDate}') AND DATE(UP.END_DATE) <= DATE('${endDate}') and UP.PROCESS_ID = 17003
      )
      USER
      ON BCF.USER_PROCESS_ID = USER.USER_PROCESS_ID
      GROUP BY USER.DT
      ) b
      on a.APPLYDATE = b.APPLYDATE
      order by 1 asc
      for fetch only with UR`;

      const bankPortal = `select BL.ENTITY_NAME,monthname(date(BI.INVOICE_DATE)-1 month) Invoice_Month,BI.INVOICE_AMOUNT, BI.CHALLAN_NO,
      date(BI.INVOICE_PERIOD_FROM) Invoice_Period_From, date(BI.INVOICE_PERIOD_TO) Invoice_Period_To,UP.USER_NAME,UP.USER_EMAIL,UP.USER_CELL
      from ESUSER.BANK_INVOICE_SUMMARY BI, ESUSER.BANK_ENTITY_LOOKUP BL, ESUSER.USER_PROFILE_BANKS_OTHR_ENTITIES up
      WHERE 
      BI.IS_PAID !=1
      AND BI.ENTITY_ID=BL.ENTITY_ID
      AND BL.ENTITY_NAME=UP.NAME_OF_ENTITY
      AND BL.ENTITY_NAME !='THE BANK'
      AND UP.CREATED_BY in ('Hammad','Samreen','SECP')
      AND date(BI.INVOICE_PERIOD_FROM) >= '${startDate}' 
      AND date(BI.INVOICE_PERIOD_TO) <= '${endDate}'
      ORDER BY BI.CHALLAN_NO`;

      db2.open(secp_5, (err, conn) => {
        if(!err)
        {
          console.log("Connected Successfully");
        }
        else
        {
          console.log("Error occurred while connecting to the database" + err.message);
        }

        conn.query(digitalCtc, (err, results) => {
          if(!err)
          {
            ctcReport.push(results);
            
            db2.open(secp_6, (err, conn) => {
              if(!err) {
                console.log("Connected Successfully");
              }
              else {
                console.log("Error occurred while connecting to the database" + err.message);
              }

              conn.query(bankPortal, (err, results) => {
                if(!err) {
                  ctcReport.push(results);
                  res.send(ctcReport);
                }
                else
                {
                  console.log("Error occurred while querying bank portal" + err.message);
                }
              })

              conn.close((err) => {
                if(!err)
                {
                  console.log("Connection closed with the database");
                }
                else
                {
                  console.log("Error occurred while trying to close the connection with the database" + err.message);
                }
              })
            });
          }
          else
          {
            console.log("Error occurred while querying digital ctc" + err.message);
          }

          conn.close((err) => {
            if(!err)
            {
              console.log("Connection closed with the database");
            }
            else
            {
              console.log("Error occurred while trying to close the connection with the database" + err.message);
            }
          })
        })
      })
    }

    else
    {
      res.json('Authorization Failed. Token Expired. Please Login Again.');
    }
  });
  
});

router.post('/api/getbankusagereport', (req, res) => {
  
  const token = req.get('key');

  if(!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function(err, decoded){
    if(!err)
    { 
      const { startDate, endDate } = req.body;

      const bankPortal = `select B.ENTITY_NAME,count(*) Total_Searches from 
      ESUSER.BANK_ENTITY_LOOKUP BE
      left outer join
      ESUSER.BANK_COMPANY_LOG B
      ON BE.ENTITY_NAME=B.ENTITY_NAME
      where  B.ENTITY_NAME !='The Bank' --AND B.COMPANY_TYPE='Public Limited Company'
      and DATE(B.VIEW_COMPANY_WHEN) BETWEEN DATE('${startDate}') and DATE('${endDate}') 
      group by b.ENTITY_NAME`;

      db2.open(secp_6, (err, conn) => {
        if(!err)
        {
          console.log("Connected Successfully");
        }
        else
        {
          console.log("Error occurred while connecting to the database" + err.message);
        }

        conn.query(bankPortal, (err, results) => {
          if(!err)
          {
           res.send(results);
          }
          else
          {
            console.log("Error occurred while deleting the data in log requests" + err.message);
          }

          conn.close((err) => {
            if(!err)
            {
              console.log("Connection closed with the database");
            }
            else
            {
              console.log("Error occurred while trying to close the connection with the database" + err.message);
            }
          })
        })
      })
    }

    else
    {
      res.json('Authorization Failed. Token Expired. Please Login Again.');
    }

  });

});


router.get('/api/getdatasharingreport', (req, res) => {
  
  const token = req.get('key');

  if(!token) {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function(err, decoded){
    if(!err)
    { 
      queryResult = [];
      const dataSharingMonitorDB2 = `SELECT * FROM (

        SELECT MAX(EOBI_PUSHING_DATE) as "DATES", 'EOBI PUSH DATE' as "ENTITIES" FROM SECP.EOBI_DATA WHERE IS_POSTED_TO_EOBI = 1 AND POSTING_STATUS = 1
        UNION ALL
        SELECT MAX(CREATED_WHEN), 'EOBI RECEIVE DATE' FROM SECP.API_CALL_LOG WHERE CALL_TYPE = 'EOBI'
        UNION ALL
        SELECT MAX(CREATED_WHEN), 'PITB PUSH DATE' FROM SECP.FBR_COMPANY_DATA_FOR_INTEGRATION WHERE IS_PITB_POSTED = 1
        UNION ALL
        SELECT MAX(CREATED_WHEN), 'PITB RECEIVE DATE' FROM SECP.PITB_REG_INFO
        UNION ALL
        SELECT MAX(CREATED_WHEN), 'FBR PUSH DATE' FROM SECP.FBR_COMPANY_DATA_FOR_INTEGRATION WHERE IS_FBR_POSTED = 1
        
        ) FOR FETCH ONLY WITH UR`;

      const dataSharingMonitorOracle = `SELECT * FROM (

        SELECT MAX(TIMESTAMP) as "DATES", 'FBR RECEIVE DATE' as "ENTITIES" FROM WEBSERVICE.FBR_COMPANY_NTN WHERE INFO_TYPE ='Company' AND COMPANY_NTN IS NOT NULL
        UNION ALL
        SELECT MAX(CREATED_WHEN), 'FMU DATE' FROM API_CALL_LOG LOGG WHERE USER_NAME = 'FMU'
        UNION ALL
        SELECT MAX(CREATED_WHEN), 'BOI DATE' FROM API_CALL_LOG LOGG WHERE USER_NAME = 'BOI'
        UNION ALL
        SELECT MAX(CREATED_WHEN), 'STR MORTGAGE DATE' FROM API_CALL_LOG LOGG WHERE USER_NAME =  'STR'
        
        )`;


      db2.open(secp_5, (err, conn) => {
        if(!err)
        {
          console.log("Connected Successfully");
        }
        else
        {
          console.log("Error occurred while connecting to the database" + err.message);
        }

        conn.query(dataSharingMonitorDB2, (err, results) => {
          if(!err)
          {
           queryResult.push(results);

            var connection = oracledb.getConnection({
              user: oracleUser,
              password: oraclePassword,
              connectString: oracleConnectString
            }, (err, conn) => {

              if(!err)
              {
                console.log("Connected to the database successfully");
              }
              else
              {
                console.log("Error occurred while trying to connect to the database: " + err.message);
              }

            conn.execute(dataSharingMonitorOracle, (err, results) => {

              if(!err)
              {
                queryResult.push(results.rows);
                res.send(queryResult);
              }
              else
              {
                console.log("Error occurred while searching the company record by number in Oracle " + err.message);
              }

              conn.release((err) => {
                if(!err)
                {
                  console.log("Connection closed with the database");
                }
                else
                {
                  console.log("Error occurred while closing the connection with the database " + err.message);
                }
              })
            })
          })

          }
          else
          {
            console.log("Error occurred while deleting the data in log requests" + err.message);
          }

          conn.close((err) => {
            if(!err)
            {
              console.log("Connection closed with the database");
            }
            else
            {
              console.log("Error occurred while trying to close the connection with the database" + err.message);
            }
          })
        })
      })
    }

    else
    {
      res.json('Authorization Failed. Token Expired. Please Login Again.');
    }

  });
});

router.put('/api/updateProfile', (req, res) => {

  const token = req.get('key');

  if(!token)
  {
    res.send("No Token Provided");
    return;
  }

  jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const key = req.query.id;
        const key2 = req.query.id2;
        const key3 = req.query.id3;

        var salt;
        var hash;

        if(key3 == 'password')
        {
          salt = bcrypt.genSaltSync(saltRounds);
          hash = bcrypt.hashSync(key, salt);
        }

        const updateData = `UPDATE USER_CREDENTIALS SET "${key3}" = ? WHERE "email" = ?`;

        db2.open(secp, (err, conn) => {
          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message);
          }

          if(key3 == 'password')
          {
            conn.query(updateData, [hash, key2], (err, results) => {

              if(!err)
              {
                res.send("Data updated successfully");
              }
              else
              {
                console.log("Error occurred while updating the user profile data" + err.message);
              }

              conn.close((err) => {
                if(!err)
                {
                  console.log("Connection closed with the database");
                }
                else
                {
                  console.log("Error occurred while trying to close the connection with the database" + err.message);
                }

              })
            })
          }
          else
          {
            conn.query(updateData, [key, key2], (err, results) => {
              if(!err)
              {
                res.send("Data updated successfully");
              }
              else
              {
                console.log("Error occurred while updating the user profile data" + err.message);
              }

              conn.close((err) => {
                if(!err)
                {
                  console.log("Connection closed with the database");
                }
                else
                {
                  console.log("Error occurred while trying to close the connection with the database" + err.message);
                }
              })
            })
          }
        })
      }

      else
      {
        res.send('Authorization Failed. Token Expired. Please Login Again.');
      }
  });

});

var appRoutes = express();
var filenameUploaded;

appRoutes.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    filenameUploaded = req.query.id;
    if(file.mimetype == 'image/jpeg')
    {
        cb(null, filenameUploaded+ '.jpg')
    }
    else if(file.mimetype == 'image/png')
    {
      cb(null, filenameUploaded+ '.png')
    }
    else
    {
      console.log("Error occurred as the file type is incorrect");
    }
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png')
  {
    cb(null, true);
  }
  else
  {
    cb(null, false);
    console.log(req.ip + " User is trying to upload incorrect file type");
  }
}

const upload = multer({storage: storage, limits: {fileSize: 5000000}, fileFilter: fileFilter});


router.post('/api/updateImage', upload.single('file'), (req, res, next) => {

    const token = req.get('key');

    if(!token)
    {
      res.send("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

        if(!err)
        {
          try
          {
            return res.status(201).json({
              message: "Image Uploaded Successfully"
            });
          }
          catch(e)
          {
            console.log("Error occurred while uploading image" + e.message);
          }
        }

        else
        {
            res.send('Authorization Failed. Token Expired. Please Login Again.');
        }

    });
});

router.get('/api/getProfilePhoto', (req, res) => {

    const token = req.get('key');

    if(!token)
    {
      res.send("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

        if(!err)
        {
          const testFolder = '/uploads';
          var fileDetails = [];
          const key = req.query.id + '.jpg';
          const key2 = req.query.id + '.png';
          const options = {
            root: path.join(__dirname, testFolder),
            dotFiles: 'deny',
            headers: {
              'x-timestamp': Date.now(),
              'x-sent': true
            }
          }

          res.sendFile(key, options, function(err) {
            if(!err)
            {
              console.log('Image sent successfully');
            }
            else
            {
              res.sendFile(key2, options, function(err) {
                if(!err)
                {
                  console.log("Image sent successfully");
                }
                else
                {
                  const key3 = 'demo.jpg';
                  res.sendFile(key3, options, function(err) {
                    if(!err)
                    {
                      console.log("Image sent successfully");
                    } 
                    else 
                    {
                      console.log("Error occurred while sending the image" + err.message);
                    }  
                  })
                }
              })
            }
          })
        }

        else
        {
          res.send('Authorization Failed. Token Expired. Please Login Again.');
        }
    });

});

router.get('/api/fetchBankData', (req, res) => {

    calculateIP(req.ip, '/api/fetchBankData');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided")
      return;
    }

    jwt.verify(token, secret, function (err, decoded) {

      if(!err)
      {
        const dataToSearch = `SELECT "ACTIVITY_LOG_ID", "USER_ID_FK", "USER_TYPE", "ENTITY_TYPE", "USER_NAME", "COMPANY_NAME", "VIEW_COMPANY_WHEN", "COMPANY_ID", "COMPANY_INC_NO", "ENTITY_NAME" FROM BANK_COMPANY_LOG`;

        db2.open(secp, (err, conn) => {
          if(!err)
          {
            console.log("Connected Successfully")
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(dataToSearch, (err, results) => {
            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while fetching bank company log data" + err.message)
            }

            conn.close((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }

      else
      {
          res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })
});

router.get('/api/searchBankDataEntity', (req, res) => {

    calculateIP(req.ip, '/api/searchBankDataEntity');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const key = req.query.id.toUpperCase();

        const dataToSearch = `SELECT "ACTIVITY_LOG_ID", "USER_ID_FK", "USER_TYPE", "ENTITY_TYPE", "USER_NAME", "COMPANY_NAME", "VIEW_COMPANY_WHEN", "COMPANY_ID", "COMPANY_INC_NO", "ENTITY_NAME" FROM BANK_COMPANY_LOG WHERE UPPER("ENTITY_NAME") LIKE '%${key}%' OR UPPER("VIEW_COMPANY_WHEN") LIKE '%${key}%'`;

        db2.open(secp, (err, conn) => {
          if(!err)
          {
            console.log("Connected Successfully")
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(dataToSearch, (err, results) => {
            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while searching bank company log data by entity name" + err.message)
            }

            conn.close((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })

});

router.get('/api/searchBankDataDate', (req, res) => {

    calculateIP(req.ip, '/api/searchBankDataDate');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){
      if(!err)
      {
          const startDate = req.query.id;
          const endDate = req.query.id2;

          const dataToSearch = `SELECT "ACTIVITY_LOG_ID", "USER_ID_FK", "USER_TYPE", "ENTITY_TYPE", "USER_NAME", "COMPANY_NAME", "VIEW_COMPANY_WHEN", "COMPANY_ID", "COMPANY_INC_NO", "ENTITY_NAME" FROM BANK_COMPANY_LOG WHERE "VIEW_COMPANY_WHEN" >= '${startDate}' AND "VIEW_COMPANY_WHEN" <= '${endDate}'`;

          db2.open(secp, (err, conn) => {
            if(!err)
            {
              console.log("Connected Successfully")
            }
            else
            {
              console.log("Error occurred while connecting to the database" + err.message)
            }

            conn.query(dataToSearch, (err, results) => {
              if(!err)
              {
                res.send(results);
              }
              else
              {
                console.log("Error occurred while searching bank company log data by date" + err.message)
              }

              conn.close((err) => {
                if(!err)
                {
                  console.log("Connection closed with the database");
                }
                else
                {
                  console.log("Error occurred while trying to close the connection with the database" + err.message);
                }
              })
            })
          })
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })

});

router.get('/api/ctctablesummary', (req, res) => {

    calculateIP(req.ip, '/api/ctctablesummary');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const fetchTableSummary = `Select COUNT("SIGNATORY_NIC1") AS Total, "STATUS", SUM("CHALLAN_AMMOUNT") as Amount FROM SECP.DIGITAL_CERTIFIED_COPY_FORM DCTC left outer join SECP.USER_PROCESSES UP on DCTC."USER_PROCESS_ID" = UP."USER_PROCESS_ID" WHERE "STATUS" not in ('Rejected') GROUP BY "STATUS"`;

        db2.open(secp_2, (err, conn) => {

          if(!err)
          {
            console.log("Connected Successfully")
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(fetchTableSummary, (err, results) => {

            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while fetching ctc table summary" + err.message)
            }

            conn.close((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }
      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })
});

router.get('/api/fetchctctable', (req, res) => {

    calculateIP(req.ip, '/api/fetchctctable');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
          // const fetchProcessList = `SELECT DCTC."CMPNYNAME", DCTC."CMPNY_NIC_NUM", DCTC."FORM_SUB_DATE", DCTC."USER_PROCESS_ID", DCTC."SIGNATORY_NAME", DCTC."SIGNATORY_NIC1", DCTC."MODE_OF_PAYMENT", DCTC."CHALLAN_AMMOUNT", DCTC."EMAIL_ADDRESS", UP."STATUS" FROM SECP.DIGITAL_CERTIFIED_COPY_FORM DCTC, SECP.USER_PROCESSES UP WHERE DCTC."USER_PROCESS_ID" = UP."USER_PROCESS_ID" AND UP."PROCESS_ID" = '17003'`;

          const fetchProcessList = `SELECT DCTC."CMPNYNAME", DCTC."CMPNY_NIC_NUM", DCTC."FORM_SUB_DATE", DCTC."USER_PROCESS_ID", DCTC."SIGNATORY_NAME", DCTC."SIGNATORY_NIC1", DCTC."MODE_OF_PAYMENT", DCTC."CHALLAN_AMMOUNT", DCTC."EMAIL_ADDRESS", UP."STATUS" FROM SECP.DIGITAL_CERTIFIED_COPY_FORM DCTC LEFT OUTER JOIN SECP.USER_PROCESSES UP ON DCTC.USER_PROCESS_ID=UP.USER_PROCESS_ID`;

          db2.open(secp_2, (err, conn) => {

            if(!err)
            {
              console.log("Connected Successfully")
            }
            else
            {
              console.log("Error occurred while connecting to the database" + err.message)
            }

            conn.query(fetchProcessList, (err, results) => {
              if(!err)
              {
                res.send(results);
              }
              else
              {
                console.log("Error occurred while fetching ctc table list" + err.message)
              }

              conn.close((err) => {
                if(!err)
                {
                  console.log("Connection closed with the database");
                }
                else
                {
                  console.log("Error occurred while trying to close the connection with the database" + err.message);
                }
              })
            })
          })
        }
        else
        {
          res.json('Authorization Failed. Token Expired. Please Login Again.');
        }
    })

});

router.get('/api/searchctctable', (req, res) => {

    calculateIP(req.ip, '/api/searchctctable');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const searchElement = req.query.id.toUpperCase();

        const searchDB = `SELECT DCTC."CMPNYNAME", DCTC."CMPNY_NIC_NUM", DCTC."FORM_SUB_DATE", DCTC."USER_PROCESS_ID", DCTC."SIGNATORY_NAME",
                          DCTC."SIGNATORY_NIC1", DCTC."MODE_OF_PAYMENT", DCTC."CHALLAN_AMMOUNT", DCTC."EMAIL_ADDRESS", UP."STATUS"
                          FROM SECP.DIGITAL_CERTIFIED_COPY_FORM DCTC LEFT OUTER JOIN SECP.USER_PROCESSES UP ON  DCTC."USER_PROCESS_ID" = UP."USER_PROCESS_ID"
                          WHERE (UPPER(DCTC."CMPNYNAME") LIKE '%${searchElement}%' OR UPPER(DCTC."CMPNY_NIC_NUM")
                          LIKE '%${searchElement}%' OR UPPER(DCTC."FORM_SUB_DATE") LIKE '%${searchElement}%' OR UPPER(DCTC."USER_PROCESS_ID")
                          LIKE '%${searchElement}%' OR UPPER(DCTC."SIGNATORY_NAME") LIKE '%${searchElement}%' OR UPPER(DCTC."SIGNATORY_NIC1")
                          LIKE '%${searchElement}%' OR UPPER(DCTC."MODE_OF_PAYMENT") LIKE '%${searchElement}%' OR UPPER(DCTC."CHALLAN_AMMOUNT")
                          LIKE '%${searchElement}%' OR UPPER(DCTC."EMAIL_ADDRESS") LIKE '%${searchElement}%' OR UPPER(UP."STATUS") LIKE
                          '%${searchElement}%')`;

        db2.open(secp_2, (err, conn) => {

          if(!err)
          {
            console.log("Connected Successfully")
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(searchDB, (err, results) => {

            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while searching ctc table list" + err.message)
            }

            conn.close((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }
      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })
});


router.get('/api/fetchappliedctctable', (req, res) => {

    calculateIP(req.ip, '/api/fetchappliedctctable');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided")
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const searchDB = `SELECT "FORM_NAME", "FORM_FEE", "DATE", "USER_ID" FROM SECP.DIGITAL_CERTIFIED_COPY_FORM_INFO DCTC LEFT OUTER JOIN
                          SECP.USER_PROCESSES UP ON DCTC."USER_PROCESS_ID" = UP."USER_PROCESS_ID"`;

        db2.open(secp_2, (err, conn) => {
          if(!err)
          {
            console.log("Connected Successfully")
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(searchDB, (err, results) => {
            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while searching ctc applied table list" + err.message)
            }

            conn.close((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })

          })
        })
      }
      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })
});


router.get('/api/errorproceeds', (req, res) => {

    calculateIP(req.ip, '/api/errorproceeds');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const searchDB = `SELECT PROCESS, NAME, RECEIVED, LAST_MODIFIED FROM FMC.WORK_ITEM WHERE "OWNER" = 'ADMIN' AND "STATE"=128 for fetch only with ur`;

        db2.open(secp_3, (err, conn) => {

          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(searchDB, (err, results) => {
            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while fetching error proceeds data " + err.message)
            }

            conn.close((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })
});


router.get('/api/errorprocesses', (req, res) => {

    calculateIP(req.ip, '/api/errorprocesses');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const searchDB = `SELECT PROCESS, NAME, RECEIVED, LAST_MODIFIED FROM FMC.WORK_ITEM WHERE PROCESS LIKE '%=%' for fetch only with ur`;

        db2.open(secp_3, (err, conn)=>{

          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(searchDB, (err, results) => {

            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while fetching error processes data " + err.message)
            }

            conn.close((err) =>{
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })
});

router.get('/api/fetchDataByNameInEServices', (req, res) => {

    calculateIP(req.ip, '/api/fetchDataByNameInEServices');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const companyName = req.query.id.toUpperCase();
        var documentStatus;
        var sortBy;
        var processName;
        var startDate;
        var endDate;

        if(req.query.id2 != "Select Document Status")
        {
            documentStatus = req.query.id2;
        }
        else
        {
          documentStatus = '';
        }

        if(req.query.id3 != "Sort by")
        {
            sortBy = req.query.id3;
            if(sortBy == 'Start Date')
            {
              sortBy = 'ASC';
            }
            else
            {
              sortBy = 'DESC';
            }
        }
        else
        {
          sortBy = 'DESC';
        }


        if(req.query.id4 != "Select Process Name")
        {
            processName = req.query.id4;
        }
        else
        {
          processName = '';
        }

        if(req.query.id5 != "start date")
        {
            startDate = req.query.id5;
        }
        else
        {
            startDate = '12/31/1995';
        }


        if(req.query.id6 != "end date")
        {
            endDate = req.query.id6;
        }
        else
        {
            endDate = '12/31/2025';
        }

        const searchDB = `SELECT A.*, ICM."CMPNYINCNO", ICM."CMPNYNAME" FROM (SELECT PROCESS_DEF."PROCESS_ID",  COALESCE(PROCESS_DEF."PROCESS_NAME",'')
        || '  ( ' || SUBSTR(CHAR(USER_PROCESSES."USER_PROCESS_ID"),9,7) || ' )' || USER_PROCESSES."STATUS" AS PROCESS_NAME, USER_PROCESS_DOCS."CM_DOC_PID" AS DOCUMENT_NAME,
        DOCUMENT_DEF.DESCRIPTION AS DOCUMENT_DESC, USER_PROCESSES."COMP_PID", USER_PROCESS_DOCS."DATE_SUBMITTED", USER_PROCESSES."STATUS", USER_PROCESSES."USER_PROCESS_ID", "CM_DOC_PID",
        USER_PROCESSES."PROCESS_FLDR_ID", "START_DATE", "END_DATE" FROM PROCESS_DEF INNER JOIN USER_PROCESS_DOCS on
        PROCESS_DEF."PROCESS_ID" = USER_PROCESS_DOCS."PROCESS_ID" INNER JOIN USER_PROCESSES on USER_PROCESS_DOCS."USER_PROCESS_ID" = USER_PROCESSES."USER_PROCESS_ID"
        INNER JOIN DOCUMENT_DEF on USER_PROCESS_DOCS."DOCUMENT_ID" = DOCUMENT_DEF."DOCUMENT_ID") A INNER JOIN ICM_COMPANY ICM on
        A."COMP_PID" = ICM."CMPNYID"
        WHERE "CMPNYNAME" LIKE '%${companyName}%'
        AND A."STATUS" LIKE '%${documentStatus}%'
        AND A."PROCESS_NAME" LIKE '%${processName}%'
        AND A."START_DATE" >= '${startDate}'
        AND A."END_DATE" <= '${endDate}'
        ORDER BY A."USER_PROCESS_ID" ${sortBy},
        A."DATE_SUBMITTED" ${sortBy}
        FOR FETCH ONLY WITH UR `;

        db2.open(secp_2, (err, conn) => {

          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(searchDB, (err, results) => {

            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while searching for company records " + err.message)
            }

            conn.close((err) =>{
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }
      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }

    })
});


router.get('/api/fetchDataByNumberInEServices', (req, res) => {

    calculateIP(req.ip, '/api/fetchDataByNumberInEServices');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const companyNumber = req.query.id;
        var documentStatus = req.query.id2;
        var sortBy = req.query.id3;
        var processName = req.query.id4;
        var startDate = req.query.id5;
        var endDate = req.query.id6;

        if(req.query.id2 != "Select Document Status")
        {
            documentStatus = req.query.id2;
        }
        else
        {
          documentStatus = '';
        }

        if(req.query.id3 != "Sort by")
        {
            sortBy = req.query.id3;
            if(sortBy == 'Start Date')
            {
              sortBy = 'ASC';
            }
            else
            {
              sortBy = 'DESC';
            }
        }
        else
        {
          sortBy = 'DESC';
        }


        if(req.query.id4 != "Select Process Name")
        {
            processName = req.query.id4;
        }
        else
        {
          processName = '';
        }

        if(req.query.id5 != "start date")
        {
            startDate = req.query.id5;
        }
        else
        {
            startDate = '12/31/1995'
        }

        if(req.query.id6 != "end date")
        {
            endDate = req.query.id6;
        }
        else
        {
            endDate = '12/31/2025';
        }

        const searchDB = `SELECT A.*, ICM."CMPNYINCNO", ICM."CMPNYNAME" FROM (SELECT PROCESS_DEF."PROCESS_ID",  COALESCE(PROCESS_DEF."PROCESS_NAME",'')
        || '  ( ' || SUBSTR(CHAR(USER_PROCESSES."USER_PROCESS_ID"),9,7) || ' )' || USER_PROCESSES."STATUS" AS PROCESS_NAME, USER_PROCESS_DOCS."CM_DOC_PID" AS DOCUMENT_NAME,
        DOCUMENT_DEF.DESCRIPTION AS DOCUMENT_DESC, USER_PROCESSES."COMP_PID", USER_PROCESS_DOCS."DATE_SUBMITTED", USER_PROCESSES."STATUS", USER_PROCESSES."USER_PROCESS_ID", "CM_DOC_PID",
        USER_PROCESSES."PROCESS_FLDR_ID", "START_DATE", "END_DATE" FROM PROCESS_DEF INNER JOIN USER_PROCESS_DOCS on
        PROCESS_DEF."PROCESS_ID" = USER_PROCESS_DOCS."PROCESS_ID" INNER JOIN USER_PROCESSES on USER_PROCESS_DOCS."USER_PROCESS_ID" = USER_PROCESSES."USER_PROCESS_ID"
        INNER JOIN DOCUMENT_DEF on USER_PROCESS_DOCS."DOCUMENT_ID" = DOCUMENT_DEF."DOCUMENT_ID") A INNER JOIN ICM_COMPANY ICM on
        A."COMP_PID" = ICM."CMPNYID"
        WHERE "CMPNYINCNO" = '${companyNumber}'
        AND A."STATUS" LIKE '%${documentStatus}%'
        AND A."PROCESS_NAME" LIKE '%${processName}%'
        AND A."START_DATE" >= '${startDate}'
        AND A."END_DATE" <= '${endDate}'
        ORDER BY A."USER_PROCESS_ID" ${sortBy},
        A."DATE_SUBMITTED" ${sortBy}
        FOR FETCH ONLY WITH UR `;

        db2.open(secp_2, (err, conn) => {

          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(searchDB, (err, results) => {

            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while searching for company records " + err.message)
            }

            conn.close((err) =>{
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }
      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })

});

router.get('/api/fetchDataByNameInArchive', (req, res) => {

    calculateIP(req.ip, '/api/fetchDataByNameInArchive');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
          const companyName = req.query.id.toUpperCase();
          const archiveData = req.query.id2;

          const searchDB = `SELECT A."TARGETITEMID" COMP_PID,  A."SOURCECOMPID"  CM_DOC_PID, B."ITEMID" DOCUMENT_NAME4, D."CMPNYNAME" CMPNYNAME,
                            D."REGISTRATIONNO" USER_PROCESS_ID, B."FILEREFERENCENO" , B."CATEGORY"  PROCESS_FLDR_ID, C."TARGETITEMID" AS
                            DOCUMENTID FROM (SELECT * FROM ICMADMIN.ICMSTRI001001) A, (SELECT * FROM ICMADMIN.${archiveData}001 ) B,
                            (SELECT * FROM ICMADMIN.ICMSTRI001001) C, (SELECT * FROM ICMADMIN.CmpnyArchiveFld001 Y WHERE Y.CMPNYNAME
                            LIKE '%${companyName}%') D WHERE A.SOURCEITEMID=B.ITEMID  AND B.ITEMID=C.SOURCEITEMID AND
                            B.REGISTRATIONNO=D.REGISTRATIONNO FOR FETCH ONLY WITH UR;`;

          db2.open(secp_4, (err, conn) => {

            if(!err)
            {
              console.log("Connected Successfully");
            }
            else
            {
              console.log("Error occurred while connecting to the database" + err.message)
            }

            conn.query(searchDB, (err, results) => {

              if(!err)
              {
                res.send(results);
              }
              else
              {
                console.log("Error occurred while searching for company records " + err.message)
              }

              conn.close((err) => {

                if(!err)
                {
                  console.log("Connection closed with the database");
                }
                else
                {
                  console.log("Error occurred while trying to close the connection with the database" + err.message);
                }
              })
            })
          })
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })
});

router.get('/api/fetchDataByNumberInArchive', (req, res) => {

    calculateIP(req.ip, '/api/fetchDataByNumberInArchive');

    const token = req.get('key');

    if(!token)
    {
      res.send("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
        const companyNumber = req.query.id;
        const archiveData = req.query.id2;

        const searchDB = `SELECT A."TARGETITEMID" COMP_PID,  A."SOURCECOMPID"  CM_DOC_PID, B."ITEMID" DOCUMENT_NAME4, D."CMPNYNAME" CMPNYNAME,
                          D."REGISTRATIONNO" USER_PROCESS_ID, B."FILEREFERENCENO" , B."CATEGORY"  PROCESS_FLDR_ID, C."TARGETITEMID" AS
                          DOCUMENTID FROM (SELECT * FROM ICMADMIN.ICMSTRI001001) A, (SELECT * FROM ICMADMIN.${archiveData}001 ) B,
                          (SELECT * FROM ICMADMIN.ICMSTRI001001) C, (SELECT * FROM ICMADMIN.CmpnyArchiveFld001 Y WHERE Y.REGISTRATIONNO
                          = '${companyNumber}') D WHERE A.SOURCEITEMID=B.ITEMID  AND B.ITEMID=C.SOURCEITEMID AND
                          B.REGISTRATIONNO=D.REGISTRATIONNO FOR FETCH ONLY WITH UR;`;

        db2.open(secp_4, (err, conn) => {

          if(!err)
          {
            console.log("Connected Successfully");
          }
          else
          {
            console.log("Error occurred while connecting to the database" + err.message)
          }

          conn.query(searchDB, (err, results) => {

            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while searching for company records " + err.message)
            }

            conn.close((err) => {

              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while trying to close the connection with the database" + err.message);
              }
            })
          })
        })
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })
});

router.get('/api/searchCompanyByNo', (req, res) => {

    calculateIP(req.ip, '/api/searchCompanyByNo');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

        if(!err)
        {
          const userKey = JSON.parse(req.query.id);

          var connection = oracledb.getConnection({
            user: oracleUser,
            password: oraclePassword,
            connectString: oracleConnectString
          }, (err, conn) => {

            if(!err)
            {
              console.log("Connected to the database successfully");
            }
            else
            {
              console.log("Error occurred while trying to connect to the database: " + err.message);
            }


          // var fetchData = "select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION  CRO  from cr_company_master COMP INNER JOIN  CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE  where posted in('P', 'C') or posted is null";

          var fetchData = `select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION  CRO  from cr_company_master COMP INNER JOIN  CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE  where COMP.company_code = ${userKey}`;

          conn.execute(fetchData, (err, results) => {

            if(!err)
            {
              res.send(results);
            }
            else
            {
              console.log("Error occurred while searching the company record by number in Oracle " + err.message);
            }

            conn.release((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while closing the connection with the database " + err.message);
              }
            })
          })
        })

        }

        else
        {
          res.json('Authorization Failed. Token Expired. Please Login Again.');
        }

    });

});


router.get('/api/searchCompanyByName', (req, res) => {

    calculateIP(req.ip, '/api/searchCompanyByName');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

        if(!err)
        {
          const userKey = req.query.id.toUpperCase();

          var connection = oracledb.getConnection({
            user: oracleUser,
            password: oraclePassword,
            connectString: oracleConnectString
          }, (err, conn) => {
            if(!err)
            {
              console.log("Connected to the database successfully");
            }
            else
            {
              console.log("Error occurred while trying to connect to the database: " + err.message);
            }

            var fetchData = `select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION  CRO  from cr_company_master COMP INNER JOIN  CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE  where UPPER(COMP.name) LIKE '${userKey}%' fetch first 250 rows only`;

            conn.execute(fetchData, (err, results) => {
              if(!err)
              {
                res.send(results);
              }
              else
              {
                console.log("Error occurred while searching the company record by name in Oracle " + err.message);
              }

            conn.release((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while closing the connection with the database " + err.message);
              }
            })
          })
        })
        }

        else
        {
          res.json('Authorization Failed. Token Expired. Please Login Again.');
        }
    });

});

router.get('/api/getCompaniesList', (req, res) => {
  
  calculateIP(req.ip, '/api/getCompaniesList');

  const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

        if(!err)
        {
          var connection = oracledb.getConnection({
            user: oracleUser,
            password: oraclePassword,
            connectString: oracleConnectString
          }, (err, conn) => {
            if(!err)
            {
              console.log("Connected to the database successfully");
            }
            else
            {
              console.log("Error occurred while trying to connect to the database: " + err.message);
            }

            var fetchData = `select COMP.company_code, COMP.name, COMP.comp_sub_mode, 'CRO ' || COMP_CRO.DESCRIPTION  CRO  from cr_company_master COMP INNER JOIN  CR_CRO_SETUP COMP_CRO ON COMP.CRO_CODE = COMP_CRO.CRO_CODE`;

            conn.execute(fetchData, (err, results) => {
              if(!err)
              {
                res.send(results);
              }
              else
              {
                console.log("Error occurred while fetcing the companies list in Oracle " + err.message);
              }

            conn.release((err) => {
              if(!err)
              {
                console.log("Connection closed with the database");
              }
              else
              {
                console.log("Error occurred while closing the connection with the database " + err.message);
              }
            })
          })
        })
        }

        else
        {
          res.json('Authorization Failed. Token Expired. Please Login Again.');
        }
    });

});

router.post('/api/exporttoExcel', (req, res) => {

    calculateIP(req.ip, '/api/exporttoExcel');

    const token = req.get('key');

    if(!token)
    {
      res.json("No Token Provided");
      return;
    }

    jwt.verify(token, secret, function(err, decoded){

      if(!err)
      {
          const exportData = req.body.value;
          const file = req.body.fileName;
          
          if(file === 'BankReport') {
            fastCsv.write(exportData, {headers: true}).on("finish", function(){
              res.send("Written to Excel Successfully");
            }).pipe(ws2);
          } else if(file === 'CtcComparisonReport') {
            fastCsv.write(exportData, {headers: true}).on("finish", function(){
              res.send("Written to Excel Successfully");
            }).pipe(ws3);
          } 
          else{
            fastCsv.write(exportData, {headers: true}).on("finish", function(){
              res.send("Written to Excel Successfully");
            }).pipe(ws);
          }
      }

      else
      {
        res.json('Authorization Failed. Token Expired. Please Login Again.');
      }
    })
});

router.get('/api/downloadExcelFile', (req, res) => {
  var options = {
    root: path.join(__dirname),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }

  var fileName = req.query.id;
  res.sendFile(fileName, options, function (err) {
    if (!err)
    {
      console.log('File sent successfully');
    }
    else
    {
      console.log('Error occurred while sending file: ' + err.message)
    }
  })
});


router.get('/api/createDataBase', (req, res) => {

    var excelDataName = [];
    var excelDataEmail = [];
    var excelDataPassword = [];
    var excelDataDesignation = [];
    var excelDataStatus = [];
    var excelDataDirectory = [];
    var excelDataEmployee = [];
    var excelDataLocation = [];
    var excelDataDept = [];
    var excelDataSam = [];
    var excelDataUser = [];

    xlsxFile('AD_User_list.xlsx').then((rows) => {
    console.log(rows.length);
    for(var x = 1; x < rows.length; x++)
    {
        excelDataName.push(rows[x][0]);
        excelDataEmail.push(rows[x][1]);
        excelDataPassword.push('Password');
        excelDataDesignation.push(rows[x][3]);
        excelDataStatus.push('InActive');
        excelDataDirectory.push('Yes');
        excelDataEmployee.push(rows[x][6]);
        excelDataLocation.push(rows[x][2]);
        excelDataDept.push(rows[x][4]);
        excelDataSam.push(rows[x][5]);
        excelDataUser.push('minimum');
    }

  })

  db2.open(secp, (err, conn) => {
    if(!err)
    {
      console.log('Connected to Database');
    }
    else
    {
      console.log(err.message);
    }


    for(var y = 0; y < excelDataName.length; y++)
    {
      salt = bcrypt.genSaltSync(saltRounds);
      hash = bcrypt.hashSync(excelDataPassword[y], salt);
      const insertValues = `INSERT INTO USER_CREDENTIALS("name", "email", "password", "userdesignation", "userstatus", "activedirectoryaccount", "employeeid", "location", "department", "samaccount", "userrights") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      conn.query(insertValues, [excelDataName[y], excelDataEmail[y], hash, excelDataDesignation[y], excelDataStatus[y], excelDataDirectory[y], excelDataEmployee[y], excelDataLocation[y], excelDataDept[y], excelDataSam[y], excelDataUser[y]], (err, results) => {

          if(!err)
          {
            console.log(results);
          }
          else
          {
            console.log(err.message);
          }

      })
    }
    })

    res.send(excelData);

});

function calculateIP(ip, service)
{
    const ipaddress = ip;
    const date = moment().format();
    const dateToInsert = date.slice(0, 19).replace('T', ' ');

    db2.open(secp_2, (err, conn) => {

      if(!err)
      {
        console.log("Connected Successfully");
      }
      else
      {
        console.log("Error occurred while connecting with DB2: " + err.message);
      }

      const insertIPAddress = `INSERT INTO IP_LOGGING("IP_ADDRESS", "SERVICE_CALLED", "TIME_OF_SERVICE") VALUES (?, ?, ?)`;

      conn.query(insertIPAddress, [ipaddress, service, dateToInsert], (err, results) => {
          if(!err)
          {
            console.log("Data written to Database successfully");
          }
          else
          {
            console.log("Error occurred while inserting IP data in database" + err.message);
          }

          conn.close((err) => {
            if(!err)
            {
              console.log("Connection closed with the database");
            }
            else
            {
              console.log("Error occurred while trying to close the connection with the database" + err.message);
            }
          })
      })

    });
}


module.exports = router;
