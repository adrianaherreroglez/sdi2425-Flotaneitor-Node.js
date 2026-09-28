const express = require('express');
const logsRepository = require('../repositories/logsRepository');
const logRequestRouter = express.Router();

const excludedPaths = ['/apiclient/', '/images/', '/javascript/', '/stylesheets/', '/favicon.ico'];

/**
 * Middleware de seguridad que registra logs de peticiones que se realizan en la aplicación.
 */
logRequestRouter.use(function(req, res, next){
   console.log("logging request...");
   let url = req.baseUrl;
   let method = req.method;
   let params = req.url;

   let excludedPath = false;

   for(let i=0; i<excludedPaths.length; i++ ){
       if(url.startsWith(excludedPaths[i])){
           excludedPath = true;
           break;
       }
   }
   if(!excludedPath){
       let content = url + " - " + method + " -  ";
       if(Object.keys(req.query).length === 0) {
           content += "no params"
       }else{
           content += params;
       }

       let log = {
           type: "PET",
           date: new Date().toLocaleString('es-ES', {
               day: '2-digit', month: '2-digit', year: 'numeric',
               hour: '2-digit', minute: '2-digit'}),
           content: content
       };

       try{
           logsRepository.insertLog(log).then(result =>{
               if(result){
                   next();
               }else{
                   console.log("Ha ocurrido un error");
               }
           });
       }catch(error) {
           console.log("Ha ocurrido un error de logger: "+error);
       }
   }else{
       next();
   }
});
module.exports = logRequestRouter;