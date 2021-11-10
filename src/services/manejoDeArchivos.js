import fs from 'fs/promises'
import path from 'path';

const archivoPath = path.resolve(__dirname, '../data/mensajes.txt')



class Archivo{
    constructor(nombreDeArchivo){
        this.nombreDeArchivo=nombreDeArchivo;
        console.log(this.nombreDeArchivo);   
    }    
    leer=async()=>{    
        try{
            const data=await fs.readFile(this.nombreDeArchivo.toString(),'utf-8')
            const info=JSON.parse(data);
            return info;            
        }
        catch(err){
          console.log("No se encontro Archivo",err);
          return false;
        }
    }
    guardar=async(title,price,photo_url)=>{    
        let id=1;   
        let nuevoProducto={
            title:title,
            price:price,
            photo_url:photo_url,
            id:id
        }      
        try{  
            const data=await fs.readFile(this.nombreDeArchivo,'utf-8')
            let info=JSON.parse(data);
            nuevoProducto.id=info.length+1; 
            info.push(nuevoProducto);

            await fs.writeFile(this.nombreDeArchivo,JSON.stringify(info,null,'\t'));
            console.log("Archivo guardado");
        }        
        catch(err){
            if(err.code=='ENOENT'){
                await fs.writeFile(this.nombreDeArchivo,JSON.stringify([nuevoProducto],null,'\t')); 
                console.log("Archivo creado y producto guardado");           
            }
            else{
                console.log("Error",err);
            }
        }
    }

}

export const archivo=new Archivo(archivoPath);