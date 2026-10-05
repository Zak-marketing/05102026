import assert from 'node:assert/strict';
process.env.GEMINI_API_KEY='test-only';
delete process.env.AURASLIM_ADMIN_PASSWORD;
const realFetch=globalThis.fetch;
let imageOutput=true;
let frameResult=true;
const image='data:image/jpeg;base64,aGVsbG8=';
let requestedImagePrompt='';
globalThis.fetch=async(input:any,init:any)=>{
 if(String(input).startsWith('https://generativelanguage.googleapis.com/')){
  if(String(input).endsWith('/interactions')){const body=JSON.parse(init.body);requestedImagePrompt=body.input[0].text;return Response.json(imageOutput?{output_image:{mime_type:'image/png',data:'aGVsbG8='}}:{output:[]});}
  const body=JSON.parse(init.body);const prompt=body.contents[0].parts[0].text;
  if(prompt.includes('Check only the photo framing'))return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({fullBody:frameResult})}]}}]});
  if(prompt.includes('InBody'))return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({weightKg:94,skeletalMuscleMassKg:35,bodyFatPercent:22,bmrKcal:1800,totalBodyWaterLiters:null,inBodyScore:400,isBlurryOrLowLight:false})}]}}]});
  return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({name:'Riz et poulet',portion:'300 g',calories:420,proteins:30,carbs:50,fats:10,foods:[{name:'Riz',portion:'180 g',calories:220},{name:'Poulet',portion:'120 g',calories:200}]})}]}}]});
 }return realFetch(input,init);
};
const {apiApp}=await import('../server/api.ts');
let testId=0;
const post=async(path:string,body:any)=>{
 const requestPath=`/auraslim-api/${path}`;
 const layer=(apiApp as any)._router.stack.find((item:any)=>item.route&&(Array.isArray(item.route.path)?item.route.path.includes(requestPath):item.route.path===requestPath));
 assert.ok(layer,`Missing API route ${requestPath}`);
 const handler=layer.route.stack.at(-1).handle;
 let status=200,data:any;
 const res={set(){return this;},status(value:number){status=value;return this;},json(value:any){data=value;return this;}};
 await handler({path:requestPath,ip:`192.0.2.${++testId}`,body,get:(name:string)=>name.toLowerCase()==='x-auraslim-request'?'1':undefined,headers:{}},res,()=>{});
 return {status,data};
};
try{
 assert.equal((await post('goal-photo',{image})).status,400);
 const consented={image,goal:'lose',targetWeight:75,startingWeight:95,heightCm:175,consent:true};
 let result=await post('goal-photo',consented);assert.equal(result.status,200);assert.equal(result.data.fullBody,true);assert.match(result.data.image,/data:image\/png/);assert.match(requestedImagePrompt,/height 175 cm/);
 frameResult=false;result=await post('goal-photo',consented);assert.equal(result.status,200);assert.equal(result.data.fullBody,false);assert.match(result.data.warning,/photo entière/);frameResult=true;
 imageOutput=false;assert.equal((await post('goal-photo',consented)).status,502);
 assert.equal((await post('goal-photo',{...consented,goal:'gain'})).status,400);
 assert.equal((await post('inbody-scan',{image})).status,400);
 result=await post('inbody-scan',{image,consent:true});assert.equal(result.status,200);assert.equal(result.data.weightKg,94);assert.equal(result.data.inBodyScore,null);assert.equal(result.data.totalBodyWaterLiters,null);
 result=await post('meal-estimate',{image,language:'fr'});assert.equal(result.status,200);assert.equal(result.data.foods.length,2);assert.equal(result.data.calories,420);
 assert.equal((await post('admin/login',{password:'invalid'})).status,503);
 const bodyParserError=(apiApp as any)._router.stack.find((layer:any)=>layer.handle.length===4&&String(layer.handle).includes('entity.too.large'))?.handle;
 assert.ok(bodyParserError,'Missing JSON body error handler');let bodyErrorStatus=200,bodyErrorData:any;
 bodyParserError({type:'entity.too.large',status:413},{path:'/auraslim-api/goal-photo'},{status(value:number){bodyErrorStatus=value;return this;},json(value:any){bodyErrorData=value;return this;}},()=>{});
 assert.equal(bodyErrorStatus,413);assert.match(bodyErrorData.error,/photo est trop volumineuse/);
 console.log('PASS: API checks (mocked AI): consent, automatic framing detection, optional continuation, JSON payload errors, Interactions image generation, InBody validation, meal scan, disabled admin default.');
}finally{globalThis.fetch=realFetch;}
