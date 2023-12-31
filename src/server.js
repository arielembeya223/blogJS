import fastifyView from "@fastify/view";
import fastify from "fastify";
import ejs from "ejs"
import fastifyStatic from '@fastify/static';
import {fileURLToPath} from "node:url"
import {dirname ,join } from "node:path"
import fastifyFormBody from "@fastify/formbody"
import {db} from "../src/database.js"
const app = fastify();
const RootDir = dirname(dirname(fileURLToPath(import.meta.url)))
app.register(fastifyView,{
    engine:{
        ejs
    }
})
app.register(fastifyStatic,{
    root: join(RootDir,'public'),
  })
app.register(fastifyFormBody)
app.get("/",(req,res)=>{
    const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all()
    res.view("template/index.ejs",{
        posts
    })
})
app.get("/article/:id",(req,res)=>{
   const post = db.prepare("SELECT * FROM posts where id=?").get(req.params.id)
   res.view("template/single.ejs",{
    post
})
})
app.post('/',(req,res)=>{
    db.prepare("INSERT INTO posts (title,content,created_at) VALUES (?,?,?)")
    .run([
        req.body.title,
        req.body.content,
        Math.round(Date.now()/1000)
    ])
    res.redirect("/")
})
const start = async function(){
    try{
        await app.listen({port:8000})
    }catch(err){
     console.error(err)
     process.exit(1)
    }
}
start()