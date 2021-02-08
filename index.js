const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const noti = require('./notification');
port = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())

var mysqlConnection = mysql.createConnection({
    host:'us-cdbr-iron-east-04.cleardb.net',
    user: 'bcb6de1529912e',
    password: '78a1c586',
    database: 'heroku_3faeb7f6309f031'
})
mysqlConnection.connect((err) => {
  if(!err)
  console.log('Connect Success !')
  else
  console.log('Failed dbนะ \n Error : ' + JSON.stringify(err))
})


app.listen(port, ()=> console.log('Express server running on port: '+port))

app.get("/", (req, res, next) => {
  
  res.send("ติดๆๆๆๆ")
});



//เข้าสู่ระบบ
app.post("/api/login", (req, res, next) => {
    const body = req.body
    const sql = `SELECT * from user_tbl,sex_tbl,branch_tbl where stu_id='${body.username}' and 
    password='${body.password}' and user_tbl.sex_id=sex_tbl.sex_id and user_tbl.branch_id=branch_tbl.branch_id`
    mysqlConnection.query(sql, (err, rows, fields)=> {
        if(!err&&Object.entries(rows).length != 0){
          res.send(rows)
        }else res.send('0')
  })
});

//เข้าสู่ระบบ Admin
app.post("/api/loginadmin", (req, res, next) => {
  const body = req.body
  const sql = `SELECT * from admin_tbl where username='${body.username}' and password='${body.password}'`
  mysqlConnection.query(sql, (err, rows, fields)=> {
      if(!err&&Object.entries(rows).length != 0){
        res.send('1')
      }else res.send('0')
  })
});

//ดึงข้อมู นศ
app.post("/api/user", (req, res, next) => {
    const body = req.body
    const sql = `SELECT * from user_tbl,sex_tbl,branch_tbl where user_id='${body.user_id}'
    and user_tbl.sex_id=sex_tbl.sex_id and user_tbl.branch_id=branch_tbl.branch`
    mysqlConnection.query(sql, (err, rows, fields)=> {
        if(!err&&Object.entries(rows).length != 0)
        res.send(rows)
  })
});

//ดึงข้อมูลlistกิจกรรม
app.post("/api/getactivitylist", (req, res, next) => {
  const body = req.body
  if(body.activitytype_id=='all'){
  const sql=`SELECT title,date_act_start,people_regis,people,activity_id FROM activity_tbl ORDER BY date_act_start`
  mysqlConnection.query(sql, (err, rows, fields)=> {if(!err){res.send(rows)
  }else{res.send(err)}})
  }
  else if (body.activitytype_id=='uviver'){
  const sql=`SELECT title,date_act_start,people_regis,people,activity_id FROM activity_tbl WHERE maintype_id=1 ORDER BY date_act_start`
  mysqlConnection.query(sql, (err, rows, fields)=> {if(!err){res.send(rows)}else{res.send(err)}})
  }
  else {
  const sql=`SELECT title,date_act_start,people_regis,people,activity_id FROM activity_tbl 
  WHERE subtype_id='${body.activitytype_id}' ORDER BY date_act_start`
  mysqlConnection.query(sql, (err, rows, fields)=> {if(!err){res.send(rows)}else{res.send(err)}})
  }
 
  //mysqlConnection.query(sql, (err, rows, fields)=> {if(!err){res.send(rows)}else{res.send(err)}})
  
});

//ดึงข้อมูลกิจกรรม
app.post("/api/getactivitydetail", (req, res, next) => {
  const body = req.body
  const sql=`SELECT * FROM activity_tbl, maintype_tbl, subtype_tbl where activity_id='${body.activity_id}' and 
  activity_tbl.maintype_id=maintype_tbl.maintype_id and activity_tbl.subtype_id=subtype_tbl.subtype_id `
  mysqlConnection.query(sql, (err, rows, fields)=> {
    if(!err){
      res.send(rows)
    }
    else{
      res.send(err)
    }
  })
})

//เช็คการลงทะเบียน ในหน้ารายละเอียดกิจกรรมของ นศ
app.post("/api/checkregis", (req, res, next) => {
  const body = req.body
  const sql=`SELECT user_id,activity_id FROM registeractivity_tbl
              WHERE EXISTS (SELECT user_id,activity_id FROM registeractivity_tbl
              WHERE user_id=${body.user_id} AND activity_id=${body.activity_id}); `
    mysqlConnection.query(sql, (err, rows, fields)=> {
      //เช็คว่า ลงทะเบียน กิจกรรมนี้ไปแล้วหรือยัง ถ้ายังค่าที่ได้จะว่างเปล่า
      if(!err&&Object.entries(rows).length!=0){
        res.send('1')
      }
  })
})

//เช็คการบันทึกกิจกรรม ในหน้ารายละเอียดกิจกรรมของ นศ
app.post("/api/checksave", (req, res, next) => {
  const body = req.body
  const sql=`SELECT user_id,activity_id FROM saveactivity_tbl
              WHERE EXISTS (SELECT user_id,activity_id FROM saveactivity_tbl
              WHERE user_id=${body.user_id} AND activity_id=${body.activity_id}); `
    mysqlConnection.query(sql, (err, rows, fields)=> {
      //เช็คว่า บันทึก กิจกรรมนี้ไปแล้วหรือยัง ถ้ายังค่าที่ได้จะว่างเปล่า
      if(!err&&Object.entries(rows).length!=0){
        res.send('1')
      }
  })
})

//ลงทะเบียนกิจกรรม
app.post("/api/regisactivity", (req, res, next) => {
  const body = req.body
  const sql1=`SELECT * FROM registeractivity_tbl WHERE user_id=${body.user_id} and activity_id=${body.activity_id}`
  const sql2=`INSERT INTO registeractivity_tbl (rdate, user_id, activity_id)
              VALUES ( '${body.rdate}','${body.user_id}','${body.activity_id}');`
  const sql3=`UPDATE activity_tbl SET people_regis=people_regis+1 WHERE activity_id=${body.activity_id};`
    mysqlConnection.query(sql1, (err, rows, fields)=> {
        if(!err&&Object.entries(rows).length==0){
          mysqlConnection.query(sql2, (err, rows, fields)=> {
            if(!err){
              mysqlConnection.query(sql3, (err, rows, fields)=> {
                if(!err){res.send('Register Finish!')}
              })
            }else{console.log(err)}
          })
        }
    })
})

//ยกเลิก ลงทะเบียนกิจกรรม
app.post("/api/unregisactivity", (req, res, next) => {
  const body = req.body
  const sql1=`DELETE FROM registeractivity_tbl WHERE user_id=${body.user_id} AND activity_id=${body.activity_id}`
  const sql2=`UPDATE activity_tbl SET people_regis=people_regis-1 WHERE activity_id=${body.activity_id};`
    mysqlConnection.query(sql1, (err, rows, fields)=> {
      if(!err){
        mysqlConnection.query(sql2, (err, rows, fields)=> {
           res.send('UNregis Finish!')
        })
      }else{console.log(err)}
  })
})

//บันทึกกิจกรรม
app.post("/api/saveactivity", (req, res, next) => {
  const body = req.body
  const sql1=`SELECT * FROM saveactivity_tbl WHERE user_id=${body.user_id} and activity_id=${body.activity_id}`
  const sql2=`INSERT INTO saveactivity_tbl (sdate, user_id, activity_id)
              VALUES ( '${body.sdate}','${body.user_id}','${body.activity_id}');`
    mysqlConnection.query(sql1, (err, rows, fields)=> {
        if(!err&&Object.entries(rows).length==0){
          mysqlConnection.query(sql2, (err, rows, fields)=> {
            if(!err){
              res.send('Note Finish!')
            }else{console.log(err)}
        })
      }
    })
})

//ยกเลิก บันทึกกิจกรรม
app.post("/api/unsaveactivity", (req, res, next) => {
  const body = req.body
  const sql=`DELETE FROM saveactivity_tbl WHERE user_id=${body.user_id} AND activity_id=${body.activity_id} `
    mysqlConnection.query(sql, (err, rows, fields)=> {
      if(!err){
        res.send('UNnote Finish!')
      }else{console.log(err)}
  })
})

//อัพเดทโปร์ไฟล์ นศ
app.post("/api/updateprofile", (req, res, next) => {
  const body = req.body
  const sql2 =`SELECT branch_tbl.branch_name,sex_tbl.sex FROM user_tbl,branch_tbl,sex_tbl
               WHERE user_id='${body.user_id}' AND branch_tbl.branch_id=user_tbl.branch_id AND sex_tbl.sex_id=user_tbl.sex_id`

  const sql1=`UPDATE user_tbl SET name='${body.name}',surname='${body.surname}',
  sex_id='${body.sex_id}',religion='${body.religion}',stu_id='${body.stu_id}',
  card_id='${body.card_id}',branch_id='${body.branch_id}',stu_year='${body.stu_year}',
  email='${body.email}',tel='${body.tel}',disease='${body.disease}',
  be_allergic='${body.be_allergic}',food_allergy='${body.food_allergy}' where user_id='${body.user_id}'`
   
  mysqlConnection.query(sql1, (err, rows, fields)=> {
      if(!err){
        mysqlConnection.query(sql2, (err, rows, fields)=> {
          if(!err){ res.send(rows) }
        })
      }
  })
})

//เปลี่ยนรหัสผ่าน นศ
app.post("/api/updatepassword", (req, res, next) => {
  const body = req.body
  const sql1=`UPDATE user_tbl SET password='${body.password}' where user_id='${body.user_id}'`
  mysqlConnection.query(sql1, (err, rows, fields)=> {
    if(!err){
      res.send("Change password complete!")
    }else console.log(err)
  })
})

//เปลี่ยนรหัสผ่าน Admin
app.post("/api/updatepasswordAdmin", (req, res, next) => {
  const body = req.body
  const sql1=`UPDATE admin_tbl SET password='${body.password}' where username='${body.username}'`
  mysqlConnection.query(sql1, (err, rows, fields)=> {
    if(!err){
      res.send("Change password complete!")
    }else console.log(err)
  })
})


//ดึงlist กิจกรรมที่บันทึกไว้
app.post("/api/getsavelist", (req, res, next) => {
  const body = req.body
  const sql=`SELECT activity_tbl.title,activity_tbl.date_act_start,activity_tbl.people_regis,activity_tbl.people,
              activity_tbl.activity_id FROM saveactivity_tbl,activity_tbl 
              WHERE saveactivity_tbl.user_id='${body.user_id}'
              AND activity_tbl.activity_id=saveactivity_tbl.activity_id `
  mysqlConnection.query(sql, (err, rows, fields)=> {
    if(!err){
      res.send(rows)
    }
    else{
      res.send(err)
    }
  })
})

//ดึงlist ที่ลงทะเบียนไว้
app.post("/api/getregislist", (req, res, next) => {
  const body = req.body
  const sql=`SELECT activity_tbl.title,activity_tbl.date_act_start,activity_tbl.people_regis,activity_tbl.people,
              activity_tbl.activity_id FROM registeractivity_tbl,activity_tbl 
              WHERE registeractivity_tbl.user_id='${body.user_id}'
              AND activity_tbl.activity_id=registeractivity_tbl.activity_id `
  mysqlConnection.query(sql, (err, rows, fields)=> {
    if(!err){
      res.send(rows)
    }
    else{
      res.send(err)
    }
  })
})

//ดึงข้อมูล Hourstandard
app.get("/api/gethourstandard", (req, res, next) => {
  const sql=`SELECT * FROM hourstandard_tbl`
  mysqlConnection.query(sql, (err, rows, fields)=> {
    if(!err){
      res.send(rows)
    }
    else{
      res.send(err)
    }
  })
})


//ดึงข้อมูล Transcript
app.post("/api/gettranscript", (req, res, next) => {
  const body=req.body
  const sql=`SELECT * FROM transcript_tbl WHERE user_id='${body.user_id}'`
  mysqlConnection.query(sql, (err, rows, fields)=> {
    if(!err){
      res.send(rows)
    }
    else{
      res.send(err)
    }
  })
})

//แก้ไขกิจกรรม updateactivity ของ Admin
app.post("/api/updateactivity", (req, res, next) => {
  const body=req.body
  const sql=`UPDATE activity_tbl SET maintype_id='${body.maintype_id}',subtype_id='${body.subtype_id}',
  title='${body.title}',hours='${body.hours}',place:='${body.place}',
  people='${body.people}',learn_year='${body.learn_year}',term='${body.term}',
  detail='${body.detail}',date_act_start='${body.date_act_start}',
  time_act_start='${body.time_act_start}' WHERE activity_id=${body.activity_id}`
  mysqlConnection.query(sql, (err, rows, fields)=> {
    if(!err){
      res.send("Update Activity Finish!")
    }
  })
  //
  let sql3=``
  let subtype=''
  
  if(body.subtype_id==1){subtype='transcript_tbl.technical_act'}else
  if(body.subtype_id==2){subtype='transcript_tbl.sport_act'}else
  if(body.subtype_id==3){subtype='transcript_tbl.perform_act'}else
  if(body.subtype_id==4){subtype='transcript_tbl.moral_act'}else
  if(body.subtype_id==5){subtype='transcript_tbl.cultural_act'}

  const sql_university=`SELECT DISTINCT device_code FROM devices_tbl WHERE user_id IN 
  (SELECT DISTINCT transcript_tbl.user_id FROM user_tbl,transcript_tbl,hourstandard_tbl WHERE
  (transcript_tbl.university_act<hourstandard_tbl.stand_university_act OR 
  transcript_tbl.university_hour<hourstandard_tbl.stand_university_hour) OR 
  ${subtype}=0) `

  const sql_devstudent=`SELECT DISTINCT device_code FROM devices_tbl WHERE user_id IN (SELECT DISTINCT transcript_tbl.user_id FROM user_tbl,transcript_tbl,hourstandard_tbl 
    WHERE (transcript_tbl.devstudent_hour<hourstandard_tbl.stand_devstudent_hour) OR 
    ((transcript_tbl.technical_act+transcript_tbl.sport_act+transcript_tbl.perform_act+
    transcript_tbl.moral_act+transcript_tbl.cultural_act)<hourstandard_tbl.stand_devstudent_act) OR 
    ${subtype}=0)`

    if(body.maintype_id==1){sql3=sql_university}else
    if(body.maintype_id==2){sql3=sql_devstudent}


  mysqlConnection.query(sql3, (err, rows, fields)=> {
    if(!err){
      let=item=''

      for (const item in rows) {
        //device_id_all.push(rows[item].device_code.toString())
        var message = { 
          app_id: "dce6d046-6675-4327-90bb-1ef10445a2bc",
          contents: {"en":"กิจกรรมมีการแก้ไข ! "+body.title},
          include_player_ids:[`${rows[item].device_code.toString()}`],
          url:"https://sharp-hopper-bb82c5.netlify.com"
        };
        noti.sendNotification(message);
        
      }
    }else console.log(err)
  })
  //
})

//ลบกิจกรรม Admin
app.post("/api/deleteActivity", (req, res, next) => {
  const body = req.body
  const sql1=`DELETE FROM activity_tbl WHERE activity_id=${body.activity_id}`
    mysqlConnection.query(sql1, (err, rows, fields)=> {
      if(!err){
        res.send('Delete Activity Finish!')
      }
    })
})



//สร้างกิจกรรม Admin
app.post("/api/createActivity", (req, res, next) => {
  const body=req.body
  
  const sql2=`SELECT activity_id FROM activity_tbl ORDER BY activity_id DESC LIMIT 1`
  const sql1=`INSERT INTO activity_tbl (maintype_id,subtype_id,title,hours,place,people,learn_year,term,stusend_year,
    detail,date_act_start,time_act_start,date_regis_start,date_regis_end,date_post,people_regis)
    VALUES (${body.maintype_id},${body.subtype_id},'${body.title}','${body.hours}','${body.place}',
    ${body.people},${body.learn_year},${body.term},'${body.stusend_year}','${body.detail}','${body.date_act_start}',
    '${body.time_act_start}','${body.date_regis_start}','${body.date_regis_end}','${body.date_post}',${body.people_regis})`
    mysqlConnection.query(sql1, (err, rows, fields)=> {
    if(!err){
      mysqlConnection.query(sql2, (err, rows, fields)=> {
        if(!err){
          res.send(rows)
        }else console.log(err)
      })
    }else console.log(err)
  })
 
  let sql3=``
  let subtype=''
  
  if(body.subtype_id==1){subtype='transcript_tbl.technical_act'}else
  if(body.subtype_id==2){subtype='transcript_tbl.sport_act'}else
  if(body.subtype_id==3){subtype='transcript_tbl.perform_act'}else
  if(body.subtype_id==4){subtype='transcript_tbl.moral_act'}else
  if(body.subtype_id==5){subtype='transcript_tbl.cultural_act'}

  const sql_university=`SELECT DISTINCT device_code FROM devices_tbl WHERE user_id IN 
  (SELECT DISTINCT transcript_tbl.user_id FROM user_tbl,transcript_tbl,hourstandard_tbl WHERE
  (transcript_tbl.university_act<hourstandard_tbl.stand_university_act OR 
  transcript_tbl.university_hour<hourstandard_tbl.stand_university_hour) OR 
  ${subtype}=0) `

  const sql_devstudent=`SELECT DISTINCT device_code FROM devices_tbl WHERE user_id IN (SELECT DISTINCT transcript_tbl.user_id FROM user_tbl,transcript_tbl,hourstandard_tbl 
    WHERE (transcript_tbl.devstudent_hour<hourstandard_tbl.stand_devstudent_hour) OR 
    ((transcript_tbl.technical_act+transcript_tbl.sport_act+transcript_tbl.perform_act+
    transcript_tbl.moral_act+transcript_tbl.cultural_act)<hourstandard_tbl.stand_devstudent_act) OR 
    ${subtype}=0)`

    if(body.maintype_id==1){sql3=sql_university}else
    if(body.maintype_id==2){sql3=sql_devstudent}
  
  mysqlConnection.query(sql3, (err, rows, fields)=> {
    if(!err){
      let=item=''
      for (const item in rows) {
        //device_id_all.push(rows[item].device_code.toString())
        var message = { 
          app_id: "dce6d046-6675-4327-90bb-1ef10445a2bc",
          contents: {"en":"กิจกรรมมาใหม่ ! "+body.title},
          include_player_ids:[`${rows[item].device_code.toString()}`],
          url:"https://sharp-hopper-bb82c5.netlify.com"
        };
        noti.sendNotification(message);
        
      }
    }else console.log(err)
  })


})


//ดึงข้้อมูลจำนวน ชาย หญิง ที่ลงทะเบียนกิจกรรมนั้นๆ
app.post("/api/getreportsex", (req, res, next) => {
  const body = req.body
  const sql1=`SELECT
  COUNT(CASE WHEN sex_id=1 THEN 1  END) As male,
  COUNT(CASE WHEN sex_id=2 THEN 1  END) As female 
  FROM user_tbl WHERE user_id IN(SELECT user_id FROM registeractivity_tbl WHERE activity_id=${body.activity_id})`
    mysqlConnection.query(sql1, (err, rows, fields)=> {
      if(!err){
        res.send(rows)
      }
    })
})

//ดึงข้อมูลlist ในหน้า report
app.post("/api/getreportlist", (req, res, next) => {
  const body = req.body
  const sql1=`SELECT name,surname,stu_id,branch_id,stu_year,tel FROM user_tbl
  WHERE user_id IN(SELECT user_id FROM registeractivity_tbl WHERE activity_id=${body.activity_id})`
    mysqlConnection.query(sql1, (err, rows, fields)=> {
      if(!err){
        res.send(rows)
      }else res.send(err)
    })
})


//บันทึก devie_code ลง db
app.post("/api/savedevice", (req,res, next)=>{
  const body = req.body
  const sql1 =`SELECT user_id from devices_tbl where user_id='${body.user_id}'`
  const sql2 =`UPDATE devices_tbl SET device_code='${body.device_code}' where user_id='${body.user_id}'`
  const sql3 = `INSERT INTO devices_tbl (device_code,user_id) VALUES('${body.device_code}','${body.user_id}')`
  mysqlConnection.query(sql1, (err, rows, fields)=> {
    if(!err&&Object.entries(rows).length != 0){
      mysqlConnection.query(sql2, (err, rows, fields)=> {
        res.send("update device_code แล้ว")
      })
    }else{
      mysqlConnection.query(sql3, (err, rows, fields)=> {
        res.send("insert device_code แล้ว")
      })
    }
    
  })

})
