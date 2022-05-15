const electron = require('electron'),
	{app,BrowserWindow,Menu,Tray,ipcMain} = require('electron'),
	fs=require('fs'),
	path=require('path');

myWindow=null;
global.tray=null;
app.whenReady().then(()=>{

	//get display. if default config isnt too small. use configs size.
	let primaryscreen=electron.screen.getPrimaryDisplay()
	let config=JSON.parse(fs.readFileSync(path.join(__dirname,"config.json")));
	let setsize=[]
	if(config["default_size"][0]<150&config["default_size"][1]<150){
		setsize=[Math.round(primaryscreen.bounds.width/2.8),Math.round(primaryscreen.bounds.height/1.2)]
	} else {
		setsize=config["default_size"]
	}

	myWindow=new BrowserWindow({
		width: setsize[0],
		height: setsize[1],
		frame: false,
		transparent:true,
		resizable:true,
		useContentSize: true,
		webPreferences:{
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: false,
		}
	});
	myWindow.loadFile('src/index.html');

	//change default size on delay so config isnt spammed
	let window_size_forc=myWindow.getSize()
	myWindow.on('resize', function () {
		window_size_forc = myWindow.getSize();

		if(typeof window_size_forc[0]=="object"|typeof window_size_forc[0]=="array"){
			window_size_forc=window_size_forc[0]
		}
	});

	function set_conf_size_loop(){
		let config=JSON.parse(fs.readFileSync(path.join(__dirname,"config.json")));

		if(config["default_size"][0]!=window_size_forc[0]|config["default_size"][1]!=window_size_forc[1]){
			config["default_size"]=window_size_forc
			fs.writeFileSync(path.join(__dirname,"config.json"),JSON.stringify(config,null,2))
		}

		setTimeout(set_conf_size_loop,3000)
	}
	set_conf_size_loop()
});

stop_cursor=false
let win_size=[]
ipcMain.on("setpos",(req,data)=>{
	stop_cursor=false
	win_size=myWindow.getSize();
	function move_loop(){
		if(stop_cursor==true){
			return
		}
		let cursor_pos=electron.screen.getCursorScreenPoint()

		myWindow.setPosition(cursor_pos.x-data.x,cursor_pos.y-data.y)
		myWindow.setSize(win_size[0],win_size[1])
		setTimeout(move_loop,20)
	}
	move_loop()
})

ipcMain.on("stoppos",(req,data)=>{
	stop_cursor=true
	myWindow.setSize(win_size[0],win_size[1])
})

