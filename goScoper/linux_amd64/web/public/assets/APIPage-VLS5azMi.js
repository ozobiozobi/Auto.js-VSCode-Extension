import{H as u}from"./Header-WQbM4sA5.js";import{C as c,F as m}from"./Card-5eaP5XeC.js";import{_ as v,r as f,c as n,e as l,b as s,f as a,a as o,j as d,d as r,q as i}from"./index-ByinR5q9.js";const h={class:"container"},b={class:"api-container"},P={class:"api-section"},g={class:"code-tabs"},x={key:0},y={key:1},C={__name:"APIPage",setup(T){const e=f("curl");return(k,t)=>(o(),n("div",h,[l(u),t[14]||(t[14]=s("div",{class:"page-header"},[s("div",{class:"header-title"},[s("h1",null,"API文档"),s("p",{class:"header-description"},"GoScoper提供的RESTful API接口文档")])],-1)),s("div",b,[l(c,null,{header:a(()=>t[2]||(t[2]=[s("h5",null,[s("span",{class:"card-icon"},"📡"),r(" 上传截图和节点信息 API")],-1)])),default:a(()=>[s("div",P,[t[5]||(t[5]=s("div",{class:"api-endpoint"},[s("div",{class:"method-badge"},"POST"),s("div",{class:"endpoint-url"},"/api/screenshots/upload")],-1)),t[6]||(t[6]=s("div",{class:"api-description"},[s("p",null,"以文件形式上传截图和节点信息，服务器会处理这些文件并保存相关数据。")],-1)),t[7]||(t[7]=s("h6",{class:"section-title"},"请求格式",-1)),t[8]||(t[8]=s("p",null,[r("Content-Type: "),s("code",null,"multipart/form-data")],-1)),t[9]||(t[9]=s("h6",{class:"section-title"},"请求参数",-1)),t[10]||(t[10]=s("table",{class:"param-table"},[s("thead",null,[s("tr",null,[s("th",null,"参数名"),s("th",null,"类型"),s("th",null,"必需"),s("th",null,"描述")])]),s("tbody",null,[s("tr",null,[s("td",null,[s("code",null,"screenshot")]),s("td",null,"File"),s("td",null,"是"),s("td",null,"Android设备的截图文件")]),s("tr",null,[s("td",null,[s("code",null,"nodeJson")]),s("td",null,"File"),s("td",null,"是"),s("td",null,"包含节点信息的JSON文件")])])],-1)),t[11]||(t[11]=s("h6",{class:"section-title"},"响应格式",-1)),t[12]||(t[12]=s("pre",{class:"response-example"},`{
  "message": "上传成功",
  "screenshot": {
    "id": 1,
    "filename": "unique-filename.png",
    "upload_time": "2023-04-01T12:34:56Z"
  },
  "screenshot_id": 1
}`,-1)),t[13]||(t[13]=s("h6",{class:"section-title"},"示例代码",-1)),s("div",g,[s("button",{class:i(["code-tab",{active:e.value==="curl"}]),onClick:t[0]||(t[0]=p=>e.value="curl")},"cURL",2),s("button",{class:i(["code-tab",{active:e.value==="python"}]),onClick:t[1]||(t[1]=p=>e.value="python")},"Python",2)]),e.value==="curl"?(o(),n("div",x,t[3]||(t[3]=[s("pre",{class:"code-example"},`curl -X POST http://localhost:8080/api/screenshots/upload \\
  -F "screenshot=@/path/to/screenshot.png" \\
  -F "nodeJson=@/path/to/node_data.json"`,-1)]))):d("",!0),e.value==="python"?(o(),n("div",y,t[4]||(t[4]=[s("pre",{class:"code-example"},`import requests

url = "http://localhost:8080/api/screenshots/upload"
files = {
    "screenshot": open("/path/to/screenshot.png", "rb"),
    "nodeJson": open("/path/to/node_data.json", "rb")
}

response = requests.post(url, files=files)
print(response.json())`,-1)]))):d("",!0)])]),_:1})]),l(m)]))}},N=v(C,[["__scopeId","data-v-85365f52"]]);export{N as default};
