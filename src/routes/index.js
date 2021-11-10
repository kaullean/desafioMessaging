import { Router } from 'express'
import { mensajesService } from '../services/mensajes';
import { denormalize } from 'normalizr';
import { schema } from 'normalizr';
import passport from '../middlewares/auth';
import path from 'path'
import { fork } from 'child_process';
import config from '../config';
import os, { cpus } from 'os'
import compression from 'compression';
import { EmailService } from '../services/email';
import { GmailService } from '../services/gmail';
import { SmsService } from '../services/sms';
import twilio from 'twilio';

const author = new schema.Entity('author',
 {}, 
 { idAttribute: 'email' });

const msge = new schema.Entity(
  'message',
  {
    author: author,
  },
  { idAttribute: 'time' }
);

const msgesSchema = new schema.Array(msge);
const scriptPath = path.resolve(__dirname,'../utils/random.js')
const destination = config.ETHEREAL_EMAIL;
const miRouter = Router();

miRouter.get('/', (req, res) => {
  console.log('Resolving / endpoint');
  res.send(
    `HOLA desde puerto ${config.PORT}`,
  );
});

miRouter.get('/login',(req,res) => {

     
      res.render('login')
  
})

miRouter.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

miRouter.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/loginOK',
    failureRedirect: '/loginError',
  })
);
miRouter.get('/loginOK', async (req, res) => {
  let foto = 'noPhoto';
  let email = 'noEmail';
  let normalizedMsj=await mensajesService.leer();
  let denormalizedMsj= await denormalize(normalizedMsj.result,msgesSchema,normalizedMsj.entities)

  if (req.isAuthenticated()) {
    const userData = req.user;

    if (userData.photos) foto = userData.photos[0].value;

    if (userData.emails) email = userData.emails[0].value;

    
    const subject = 'Logeo Exitoso'
    const content = `${email} logeo de forma exitosa con facebook passport`
    const response = await EmailService.sendEmail(
      destination,
      subject,
      content
    );
    res.render('loginOk', {
      layout:'main',
      nombre: userData.displayName,
      contador: userData.contador,
      foto,
      email,
      mensajes:denormalizedMsj
    });
  } else {
    res.redirect('/login');
  }
});


miRouter.get('/logout', async (req, res) => {
  const userData = req.user;
  const email=userData.emails[0].value
  const foto = userData.photos[0].value
  /*Envio via Ethereal*/
  let destination = config.ETHEREAL_EMAIL;
  const subject = 'DesLogeo Exitoso'
  let content = `${email} deslogeo de forma exitosa con facebook passport`
  await EmailService.sendEmail(
      destination,
      subject,
      content
  );
  /********************************/
  /*Envio via Gmail */
  destination = config.GMAIL_EMAIL
  content=`<img src=${foto}></img>`
  await GmailService.sendEmail(
    destination,
    subject,
    content
);
  /********************************/
  destination = config.TWILIO_DESTINATION
  content = `${email} deslogeo de forma exitosa con facebook passport`
  await SmsService.sendMessage(
    destination,
    content
  );
  req.logout();
  res.redirect('/login');
});
miRouter.get('/info', compression(),(req, res) => {

  if(config.MODO=='CLUSTER'){
    let data={
      argumentoEntrada:process.argv0,
      nombrePlataforma:process.platform,
      versionNode:process.version,
      memoria:JSON.stringify(process.memoryUsage()),
      path:process.execPath,
      processID:process.pid,
      carpeta:process.cwd(),
      procesadores:os.cpus().length
    }
    res.render('info',data)
  }
  else{
    let data={
      argumentoEntrada:process.argv0,
      nombrePlataforma:process.platform,
      versionNode:process.version,
      memoria:JSON.stringify(process.memoryUsage()),
      path:process.execPath,
      processID:process.pid,
      carpeta:process.cwd(),
      procesadores:1
    }
    res.render('info',data)
  }
  
});
miRouter.get('/randoms',(req,res)=>{

  const { cant } = req.query; 
  const comp = fork(scriptPath)
  if(!cant){
    //entonces calculo 
    const cant = 100000000
    comp.send(cant)
    comp.on('message',(num)=>{
      res.json({
        pid:process.pid,
        res:num,
      })
    })
  }
  else{
    //le paso el query a la funcion y devuelvo otra cantidad 
    comp.send(cant)
    comp.on('message',(num)=>{
      res.json({
        pid:process.pid,
        res:num,
      })
    })
  }

})

export default miRouter;