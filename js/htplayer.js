let $c = function (e) {
    return document.querySelector('.' + e);
}

let hasClass = (elements, cName) => {
    return !!elements.className.match(new RegExp("(\\s|^)" + cName + "(\\s|$)"));
}

let addClass = (elements, cName) => {
    if (!hasClass(elements, cName)) {
        elements.className += " " + cName;
    }
}

let removeClass = (elements, cName) => {
    if (hasClass(elements, cName)) {
        elements.className = elements.className.replace(new RegExp("(\\s|^)" + cName + "(\\s|$)"), " ");
    }
}
class htplayer {
    constructor(options) {
        this.options = options
        this.init()
    }
    init() {
        this.ele = {
			'css': $c('css'),
            'video': $c('ht-video'),
            'wrap': $c('htplayer-w'),
            'main': $c('htplayer'),
            'play': $c('icon-play'),
            'nowtime': $c('time-now'),
            'alltime': $c('time-all'),
            'htr1': $c('ht-r1'), //进度条
            'htr2': $c('ht-r2'),
            'htrtip': $c('ht-r-tip'),
            'htr': $c('ht-r'),
            'yltm': $c('yl-t-m'), //音量
            'yl1': $c('yl-t1'),
            'yl2': $c('yl-t2'),
            'yln': $c('yl-number'),
            'ylbtn': $c('yl-n'),
            'vloop': $c('icon-xunhuan'), //循环
            'dm': $c('ht-dm'), //弹幕层
            'full': $c('full-btn'),
			'dm_s':$c('dm-s'),//弹幕开关
			'hcx':[$c('hcx1'),$c('hcx2'),$c('hcx3'),$c('hcx4'),$c('hcx5')],
			'alldm':$c('dm-n'),//弹幕总开关
			'hre1':$c('hre1'),//ranger
			'hre2':$c('hre2'),
			'htbar':$c('ht-con'),//控制菜单
			'right':$c('htplayer-right'),//右侧栏
			'dmlist':$c('ht-danmaku-list'),//弹幕列表
			'rightclose':$c('htplayer-right-close'),//关闭侧边栏
			'rightclose2':$c('htplayer-right-c2'),//关闭侧边栏
			'end':$c('ht-end'),//结束
			'rightmenu':{
				main:$c('ht-rightmenu'),//右键菜单
				copy:$c("ht-copy-warp"),
				copytext:$c("ht-copy-input"),
				deldanmu:$c('ht-deldanmu'),
				speendw:$c('ht-speend-con'),
				speend:$c('ht-speend'),
				video_ratio:$c('ht-ratio'),//视频比例
				screenshot:$c('ht-screenshot'),//截图
			}
				
      }
		//非全屏htbar显示
		
		
		this.ele.htbar.style.bottom=-this.ele.htbar.offsetHeight+'px';
		this.ele.htbar.a=true
		//高度
		this.ele.wrap.style.height=this.ele.wrap.offsetWidth*0.5625+'px'
		
		//right
		if(this.options.showright){
			this.ele.right.style.width='360px'
		}else{
			this.ele.right.style.display='none'
		}
		
		
		//配置
		if(localStorage.getItem('htconfig') && localStorage.getItem('htconfig') != "undefined") {
			
			for (let i = 0; i < this.ele.hcx.length; i++) {
				this.ele.hcx[i].checked=true
			}
			
        	this.config = JSON.parse(localStorage.getItem('htconfig'))
        	console.log('加载设置成功')
        } else {
			this.config = new Object()

        }
		
		this.changerconfig()
        //设置音量
        this.setsound(this.config.sound)
		
		
        this.data = this.initdata()
				
				//侧边栏
				if(this.options.showright){
					this.ele.right.style.minHeight=this.data.height+'px'
					this.ele.dmlist.style.maxHeight=this.data.height-94+'px'
				}
				
				
        this.danmaku = []//bak弹幕库
		
		this.danmakuarr={}
        this.danmakuarr.leftarr = {
            t: [],
            v: [],
            leaving: [],
            width: []
        }
        this.danmakuarr.toparr = []
		this.danmakuarr.bottomarr=[]
		
        this.dmheight = 37
        this.dmplace = 1
        this.nowdm = []

        if (this.options.danmaku) {
            for (let i = 0; i < this.options.danmaku.length; i++) {
                this.adddanmaku(this.options.danmaku[i])
            }
        }


       



        //播放
        this.ele.play.addEventListener('click', () => {
            this.playswitch()
        })


        //行走器
        this.ele.video.addEventListener('timeupdate', () => {
            let t = this.ele.video.currentTime
            if (!this.alltime) {
                this.alltime = this.ele.video.duration
                let t3 = this.getvideotime(this.alltime)
                // console.log(t3)
                this.ele.alltime.innerHTML = `${t3.m}:${t3.s}`

            }
            let t2 = this.getvideotime(t)
            this.ele.nowtime.innerHTML = `${t2.m}:${t2.s}`

            //console.log(this.alltime,' now '+t)
            this.ele.htr1.style.width = t / this.alltime * 100 + '%'

            let buff = this.ele.video.buffered
            let b = buff.end(buff.length - 1)
            this.ele.htr2.style.width = b / this.alltime * 100 + "%";


        })

        //进度条
        this.ele.htr.addEventListener('click', (e) => {
            let l = e.pageX - this.data.left
            let t = l / this.data.width

            let t2 = this.alltime * t
            //console.log(t,t2)
            this.tiao(t2)
        })
        this.ele.htr.addEventListener('mousemove', (e) => {
            let t = this.alltime * (e.pageX - this.data.left) / this.data.width
            let t2 = this.getvideotime(t)

            this.ele.htrtip.innerHTML = `${t2.m}:${t2.s}`
            this.ele.htrtip.style.left = e.pageX - this.data.left + 'px';

        })


        //音量
        this.ele.yltm.addEventListener('click', (e) => {
            let h = e.pageY - this.data.ytop
            let t = 1 - h / this.data.yheight
            //console.log(t)
            if (t > 0.95) {
                t = 1
            } else if (t < 0.05) {
                t = 0
            }

            this.setsound(t)
        })
        //时长
        this.ele.video.addEventListener('durationchange', () => {
            this.alltime = this.ele.video.duration
            console.log('all:', this.alltime)
        })

        this.ele.ylbtn.addEventListener('click', () => {
            if (this.config.sound) {
                this.setsound(0)
            } else {
                this.setsound(0.6)
            }

        })

        //循环播放
        this.ele.vloop.addEventListener('click', () => {
            if (this.loop) {
                this.ele.vloop.className = 'btn iconfont icon-xunhuan small'
                this.loop = false
            } else {
                this.ele.vloop.className = 'btn iconfont icon-xunhuan small active'
                this.loop = true
            }
        })

				this.ele.video.addEventListener('ended', () => {
					if(this.loop){
						this.tiao(0)
					}else{
						this.ele.end.style.display='block'
						this.ele.play.className = 'btn iconfont icon-play'
						this.ele.play.end=true
						setTimeout(()=>{
							this.ele.end.style.opacity=1
						},100)
					}
				})
				this.ele.end.addEventListener('click',()=>{
					this.tiao(0)
					this.ele.end.style.display='none';
				})
				
        this.ele.dm.addEventListener('click', () => {
					if(this.ele.rightmenu.main.style.display!='block'){
						 this.playswitch()
					}else{
						this.ele.rightmenu.main.style.display='none'
					}
           
        })

        this.ele.full.addEventListener("click", () => {
            //全屏切换
            let e = this.ele.wrap
            if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen()
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen()
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen()
                }

            } else {
                if (e.requestFullscreen) {
                    e.requestFullscreen()
                } else if (e.mozRequestFullScreen) {
                    e.mozRequestFullScreen()
                } else if (e.webkitRequestFullscreen) {
                    e.webkitRequestFullscreen()
                }
            }

        });
        let screenChange = 'webkitfullscreenchange' || 'mozfullscreenchange' || 'fullscreenchange'
        this.ele.wrap.addEventListener(screenChange, () => {
            this.joinfull()
        }, false);
		
		//弹幕菜单
		this.ele.dm_s.addEventListener('mouseenter',function(){
			if(this.t){
				clearTimeout(this.t)
			}
			this.querySelector('.dm-s-m').style.display='block'
		})
		
		this.ele.dm_s.addEventListener('mouseleave',function(){
			this.t=setTimeout(()=>{
				 this.querySelector('.dm-s-m').style.display='none'
			},300)
			
		})
		
		
		for (let i = 0; i < this.ele.hcx.length; i++) {
			this.ele.hcx[i].addEventListener('click',(a)=>{
				this.changerconfig()
			})
		}
		
		//弹幕总开关
		this.ele.alldm.a=true;
		this.ele.alldm.addEventListener('click',()=>{
			if(!this.ele.alldm.a){
					this.ele.alldm.a=true;
				for (let i = 0; i < this.ele.hcx.length; i++) {
					this.ele.hcx[i].checked=true
				}
			}else{
					this.ele.alldm.a=false;
				for (let i = 0; i < this.ele.hcx.length; i++) {
					this.ele.hcx[i].checked=false
				}
			}
			this.changerconfig()
		})
		
		//透明度条
		this.ele.hre1.addEventListener('change',()=>{
			let t=this.ele.hre1.value/100;
			this.config.dmopacity=t+' ';
			this.ele.dm.style.opacity=t;
			console.log(t)
			this.changerconfig()
		})
		this.ele.hre2.addEventListener('change',()=>{
			let t=this.ele.hre2.value/50;
			this.config.danmakusize=t;
			console.log(t)
			this.changerconfig()
			let e=this.ele.dm.querySelectorAll('.ht-left')
			for (let i = 0; i < e.length; i++) {
				e[i].style.transform =  "translateX(-" + this.data.width / this.config.danmakusize + "px)"
			}
		})
		
		//鼠标隐藏
		this.ele.dm.addEventListener('mousemove',()=>{
			if(!this.ele.htbar.a){
				if(this.mt){
					clearTimeout(this.mt)
				}
				if(this.ele.htbar.style.opacity!='1'){
					this.ele.htbar.style.opacity='1'
					this.ele.dm.style.cursor="default"
				}
				this.mt=setTimeout(()=>{
					this.ele.htbar.style.opacity='0'
					this.ele.dm.style.cursor="none"
				},2000)
			}else{
				this.ele.htbar.style.opacity='1'
				this.ele.dm.style.cursor="default"
			}
		})
		
		this.ele.rightclose.addEventListener('click',()=>{
			if(this.ele.right.style.display!="none"){
				this.ele.right.style.display	='none'
			}else{
				this.ele.right.style.display	='block'
			}
		
		})
		this.ele.rightclose2.addEventListener('click',()=>{
			this.ele.rightclose.click()
		})
		
		//右键菜单
		this.ele.dm.oncontextmenu = (e)=>{
			console.log('右键菜单')
			let ele=this.ele.rightmenu
			ele.main.style.display='block'
			let top=e.pageY-this.data.top
			let left=e.pageX-this.data.left
			let h=ele.main.offsetHeight;
			let w=ele.main.offsetWidth;
			if(top>this.data.height-h){
				top=this.data.height-h
			}
			
			if(left>this.ele.dm.offsetWidth*this.config.danmakusize-w){
				left=this.ele.dm.offsetWidth*this.config.danmakusize-w
			}
			if(hasClass(e.target,'danmaku')){
				ele.copytext.value=e.target.innerText
				ele.copy.style.display='block'
				ele.deldanmu.style.display='block'
				this.ele.rightmenu.deldanmu.onclick =()=> {
					e.target.parentNode.removeChild(e.target)
					this.ele.rightmenu.main.style.display = "none";
				}
			}else{
				ele.deldanmu.style.display='none'
				ele.copy.style.display='none'
			}
			ele.main.style.top=top+'px'
			ele.main.style.left=left+'px'
			return false
		}
		this.ele.rightmenu.copy.onclick =()=> {
						this.ele.rightmenu.copytext.select();
						document.execCommand("Copy");
						this.ele.rightmenu.main.style.display = "none";
		}
		
		this.ele.rightmenu.speendw.addEventListener('click',()=>{
			let r=this.ele.rightmenu.speend
			if(r.style.display!='block'){
				r.style.display='block'
			}else{
				r.style.display='none'
			}
		})
		this.ele.rightmenu.speend.addEventListener('click',(e)=>{
			if(e.target.innerText>0){
				console.log(e.target.innerText)
				this.ele.video.playbackRate=e.target.innerText
			}else{
				this.ele.video.playbackRate=1
			}
		});
		//视频比例设置
		this.ele.rightmenu.video_ratio.ratio = 1;
		this.ele.rightmenu.video_ratio.addEventListener('click', ()=>{
					let vh=this.ele.video.videoHeight
		      let vw=this.ele.video.videoWidth
					if(this.ele.rightmenu.video_ratio.ratio == 1) {
						this.ele.rightmenu.video_ratio.ratio = 2;
			      let vb= vw*0.75/vh
			      if(vb>1){
			        this.ele.video.style.transform=`scale(${1/vb},1)`
			        this.ele.video.style.webkitTransform=`scale(${1/vb},1)`
			      }else{
			        this.ele.video.style.transform=`scale(1,${vb})`
			        this.ele.video.style.webkitTransform=`scale(1,${vb})`
			       }
						this.ele.rightmenu.video_ratio.innerText = `视频比例 4:3`
					} else if(this.ele.rightmenu.video_ratio.ratio == 2) {
						this.ele.rightmenu.video_ratio.ratio = 3
						let vb= vw*0.5625/vh
			       if(vb>1){
			           		this.ele.video.style.transform=`scale(${1/vb},1)`
			            	this.ele.video.style.webkitTransform=`scale(${1/vb},1)`
			       }else{
			           		this.ele.video.style.transform=`scale(1,${vb})`
			            	this.ele.video.style.webkitTransform=`scale(1,${vb})`
			       }
						this.ele.rightmenu.video_ratio.innerText = `视频比例 16:9`
					} else if(this.ele.rightmenu.video_ratio.ratio == 3) {
						this.ele.rightmenu.video_ratio.ratio = 4
						this.ele.rightmenu.video_ratio.innerText = `视频比例 全屏`
						this.ele.video.style.transform = `none`
						this.ele.video.style.webkitTransform = `none`
						
						this.ele.video.style.height = 'auto';
						this.ele.video.style.width = 'auto';
						
					
							let w1=this.ele.video.parentNode.offsetWidth
							let w2=this.ele.video.offsetWidth
							let h1=this.ele.video.parentNode.offsetHeight
							let h2=this.ele.video.offsetHeight
						
							this.ele.video.style.transform = `scale(${w1/w2},${h1/h2})`
							this.ele.video.style.webkitTransform = `scale(${w1/w2},${h1/h2})`
						
						this.ele.video.style.transformOrigin = 'left top'
						this.ele.video.style.webkitTransformOrigin = 'left top'
					
					} else {
						
							this.ele.video.style.height = '100%';
							this.ele.video.style.width = '100%';
							this.ele.video.style.webkitTransformOrigin = 'center'
						
						this.ele.rightmenu.video_ratio.ratio = 1
						this.ele.rightmenu.video_ratio.innerText = `视频比例 默认`
						this.ele.video.style.transform = `none`
						this.ele.video.style.webkitTransform = `none`
					}
		
				})
				this.ele.rightmenu.screenshot.addEventListener('click',()=>{
					this.ele.rightmenu.main.style.display = "none";
					let c = document.createElement('canvas');
					c.width = this.ele.video.videoWidth
					c.height = this.ele.video.videoHeight
					c.getContext('2d').drawImage(this.ele.video, 0, 0, c.width, c.height);
					c.className = 'ht-screenshot-canvas'
					let warp = document.createElement("div");
					warp.innerHTML = '<p style="padding-bottom:10px">请右键保存截图</p>'
					warp.appendChild(c)
					this.msgbox({m:warp})
					
					
				})
				
				
				
        //弹幕循环
        setInterval(() => {
            if (this.playing) {
                let nowtime = parseInt(this.ele.video.currentTime * 10)
                for (let i = 0; i < this.nowdanmaku.length; i++) {
                    if (this.nowdanmaku[i]) {
                        if (this.nowdanmaku[i].time == nowtime) {
                            //console.log('send',this.nowdanmaku[i])
                            let t = this.nowdanmaku[i]
                            this.send(t.text, t.color, t.place, false, t.user, t.size);
                            delete this.nowdanmaku[i]
                        } else if (nowtime > this.nowdanmaku[i].time) {
                            delete this.nowdanmaku[i]
                        }
                    }
                }

                //弹幕定时器
                for (let i = 0; i < this.nowdm.length; i++) {
                    if (this.nowdm[i] && this.nowdm[i].time && this.nowdm[i].time <= parseInt(this.ele.video
                            .currentTime * 10)) {
                        this.nowdm[i].call()
                        delete this.nowdm[i];
                    }
                }
            }
        }, 100)

    }



    send(text, color, wz, me, user, size) {
        let _this = this;
        let dm = document.createElement("div")
        let videotime = this.ele.video.currentTime;

        let inttime = parseInt(videotime * 10)
        dm.user = user
        dm.style.color = color
        dm.style.fontSize = size + 'px'
        if (me) {
            dm.style.border = "1px solid #fff"
        }
        if (wz == 1) {
            //left 弹幕
            dm.appendChild(document.createTextNode(text))
            dm.className = "danmaku ht-left"
            dm.style.animation = `dmleft ${this.data.speedt}s linear`
            //this.config.danmakusize
            dm.style.transform = "translateX(-" + this.data.width / this.config.danmakusize + "px)"
            this.ele.dm.appendChild(dm)

            let twidth = dm.offsetWidth * this.config.danmakusize;
            let time = this.data.width / 100
            let v = (twidth + this.data.width) / time
            let dmtop = this.getlefttop(v, twidth)
            let leavetime = twidth / v
            

            if ((dmtop + 1) * this.dmheight * this.config.danmakusize < this.data.height) {
								//console.log('leavetime',leavetime)
                this.nowdm.push({
                    time: inttime + leavetime.toFixed(1) * 10,
                    call: function () {
                        _this.danmakuarr.leftarr.leaving[dmtop] = false
                    }
                })
				this.danmakuarr.leftarr.leaving[dmtop] = true
				 
                dm.style.top = dmtop * this.dmheight + "px"

                dm.addEventListener("webkitAnimationEnd", function () {
                    _this.dmend(dm)
                })
                dm.addEventListener("animationend", function () {
                    _this.dmend(dm)
                })
            } else {
                this.danmakuarr.leftarr.leaving[dmtop] = false
                this.dmend(dm)
                console.log('超出屏幕范围')
            }


        } else if (wz == 2) {
            //顶部弹幕
            dm.appendChild(document.createTextNode(text))

            dm.className = "danmaku ht-top"
            let dtop = this.getcansendtop()
            dm.style.top = dtop * this.dmheight + "px"
            this.danmakuarr.toparr[dtop] = true
            let e = this.ele.dm.appendChild(dm)
            this.nowdm.push({
                time: inttime + 50,
                call: () => {
                    if (e && e.parentNode) {
                        e.parentNode.removeChild(e)
                    }
                    if (this.danmakuarr.toparr[dtop]) {
                        this.danmakuarr.toparr[dtop] = false
                    }
                },
                g: true
            })

        } else if (wz == 3) {
            //底部弹幕
            dm.appendChild(document.createTextNode(text))
            dm.className = "danmaku ht-bottom"
            let dbottom = this.getcansendbottom()
            dm.style.bottom = dbottom * this.dmheight + "px"
            this.danmakuarr.bottomarr[dbottom] = true
            let e = this.ele.dm.appendChild(dm)
            this.nowdm.push({
                time: inttime + 50,
                call: () => {
                    if (e && e.parentNode) {
                        e.parentNode.removeChild(e)
                    }
                    if (this.danmakuarr.bottomarr[dbottom]) {
                        this.danmakuarr.bottomarr[dbottom] = false
                    }
                },
                g: true
            })

        } else if (wz == 7) {
            let tj = JSON.parse(text);
            console.log('高级弹幕', tj);
            //时间如果为0
            if (!tj.l || tj.l.toFixed(2) == 0) {
                tj.l = 0;
            }
            let nowtime = tj.l;
            if (tj.z) {
                //console.log('z存在', tj.z);
                for (let i = 0; i < tj.z.length; i++) {
                    let a = i;
                    this.nowdm.push({
                        "call": function () {
                            dm.style.transition = "all " + tj.z[a].l + 's';
                            //console.log('到达动画时间',a,dm);
                            setTimeout(function () {
                                if (tj.z[a].x) {
                                    //console.log('x2存在',tj.z[a].x)
                                    dm.style.right = (1000 - tj.z[a].x) / 10 + '%';
                                }
                                if (tj.z[a].y) {
                                    //console.log('y2存在',tj.z[a].y)
                                    dm.style.bottom = (1000 - tj.z[a].y) / 10 + '%';
                                }
                                if (tj.z[a].t) {
                                    dm.style.opacity = tj.z[a].t
                                }
                                if (tj.z[a].f || tj.z[a].g || tj.z[a].rx || tj.z[a].e) {
                                    tj.z[a].f = tj.z[a].f || 0;
                                    tj.z[a].g = tj.z[a].g || 0;
                                    tj.z[a].rx = tj.z[a].rx || 0;
                                    tj.z[a].e = tj.z[a].e || 0;
                                    dm.style.transform =
                                        `scale(${tj.z[a].f},${tj.z[a].g}) skew(${tj.z[a].rx}deg,${tj.z[a].e}deg) translate(50%,50%)`
                                }
                            }, 0)
                        },
                        "time": inttime + nowtime.toFixed(1) * 10,
                        g: true
                    })
                    if (tj.z[i].l) {
                        nowtime = nowtime + tj.z[i].l;
                    }
                }
            } else {
                tj.l = 2;
            }



            //高级弹幕 test 
            //{"e":0.52,"w":{"b":false,"l":[[1,16777215,1,2.7,2.7,5,3,false,false],[2,0,0,16777215,0.5,32,32,2,2,false,false,false]],"f":"黑体"},"l":5.551115123125783e-17,"f":0.52,"z":[{"t":0,"g":0.8,"l":0.2,"y":930,"f":0.8},{"t":1,"g":0.52,"l":0.2,"y":940,"f":0.52},{"l":1.3099999999999998},{"c":16776960,"x":-2,"t":0,"l":0.3,"v":2}],"t":0,"a":0,"n":"但是那样不行哦","ver":2,"b":false,"c":3,"p":{"x":35,"y":950},"ovph":false}
            dm.className = "danmaku danmaku-ad";
            if (tj.w) {
                dm.style.fontFamily = tj.w.f;
            }
            if (tj.n) {
                dm.appendChild(document.createTextNode(tj.n))
            }
            if (tj.p) {
                dm.style.right = (1000 - tj.p.x) / 10 + '%';
                dm.style.bottom = (1000 - tj.p.y) / 10 + '%';
            }
            if (tj.a) {
                dm.style.opacity = tj.a;
            }
            if (tj.e || tj.f || tj.rx || tj.rx || tj.k) {
                tj.e = tj.e || 0;
                tj.f = tj.f || 0;
                tj.rx = tj.rx || 0;
                tj.k = tj.k || 0;
                dm.style.transform = `scale(${tj.e},${tj.f}) skew(${tj.rx}deg,${tj.k}deg) translate(50%,50%)`
            }

            let e = this.ele.dm.appendChild(dm);
            this.nowdm.push({
                "call": function () {
                    if (e && e.parentNode) {
                        e.parentNode.removeChild(e)
                    }
                },
                "time": inttime + nowtime.toFixed(1) * 10,
                g: true
            })
        }
    }
    getlefttop(v, dmwidth) {
        let h
        let t = this.ele.video.currentTime
        let allt = this.data.width / 100
        for (let i = 0; i <= this.danmakuarr.leftarr.t.length; i++) {
            //leaving是否正在移动
            if (!this.danmakuarr.leftarr.leaving[i]) {
                if (this.danmakuarr.leftarr.v[i] >= v) {
                    h = i;
                    break;
                } else {
                    if (!this.danmakuarr.leftarr.t[i]) {
                        break
                    }
                    //追上的时间和距离
                    let tt = this.data.width / 100 - t + this.danmakuarr.leftarr.t[i];
                    let sz = tt * (v - this.danmakuarr.leftarr.v[i]);
                    //间隔距离 这里-20是为了防止跟太紧
                    let so = (t - this.danmakuarr.leftarr.t[i]) * this.danmakuarr.leftarr.v[i] - this.danmakuarr.leftarr.width[i] - 20;
                    //console.log(`${i}弹幕会在上一弹幕尾部飞行${tt}秒 速度差${v-this.danmakuarr.leftarr.v[i]} 会追上路程 ${sz}  判断时距离 ${so}`)
                    if (sz < so) {
                        h = i;
                        break;
                    }
                }
            }
        }
        if (typeof (h) == 'undefined') {
            h = this.danmakuarr.leftarr.t.length;
            //console.log('开辟新通道');
        }
        this.danmakuarr.leftarr.t[h] = t;
        this.danmakuarr.leftarr.v[h] = v;
        this.danmakuarr.leftarr.leaving[h] = true;
        this.danmakuarr.leftarr.width[h] = dmwidth;
        return h;
    };

    getcansendtop() {
        let h;
        for (let i = 0; i <= this.danmakuarr.toparr.length; i++) {
            if (!this.danmakuarr.toparr[i]) {
                //console.log('第'+i+'可以发射弹幕');
                h = i;
                break;
            }
        }
        return h;
    };

    getcansendbottom() {
        let h;
        for (let i = 0; i <= this.danmakuarr.bottomarr.length; i++) {
            if (!this.danmakuarr.bottomarr[i]) {
                //console.log('第'+i+'可以发射弹幕');
                h = i;
                break;
            }
        }
        return h;
    };


    dmend(a) {
        a.parentNode.removeChild(a)
    }
    setsound(i) {
        this.config.sound = i;
        this.ele.yln.innerHTML = parseInt(i * 100)
        this.ele.yl1.style.height = i * 100 + '%'
        this.ele.yl2.style.bottom = i * 100 + '%'
        this.ele.video.volume = i
        localStorage.setItem('htconfig', JSON.stringify(this.config))
        if (i === 0) {
            this.ele.ylbtn.className = 'yl-n btn iconfont icon-jingyin  small'
        } else {
            this.ele.ylbtn.className = 'yl-n btn iconfont  icon-yinliang small'
        }
    }

    tiao(time) {
		let nowtime=this.ele.video.currentTime*10
		
        this.ele.video.currentTime = time;
        if (this.ele.video.paused) {
            this.play()
        }
        this.nowdanmaku = this.danmaku.slice(0)
		
		for (let i = 0; i < this.nowdm.length; i++) {
			if(this.nowdm[i]&&this.nowdm[i].call){
				if(nowtime>=time*10){
					let tt=(nowtime-this.nowdm[i].time)*100;
					if(tt<0){
						tt=0
					}
					setTimeout(()=>{
						if(this.nowdm[i]&&this.nowdm[i].call){
							this.nowdm[i].call()
						}
						delete this.nowdm[i]
					},tt)
				}else{
					
					if(this.nowdm[i].call){
						this.nowdm[i].call()
					}
					delete this.nowdm[i]
				}
				
				
			}
		}
    }


    playswitch() {
        if (this.ele.video.paused) {
            this.play();
        } else {
            this.pause()

        }
    }

    play() {
				if(this.ele.play.end){
					this.ele.end.style.display='none';
					this.ele.play.end=false
					this.tiao(0)
				}
        let e = document.querySelectorAll('.danmaku')
        for (let i = e.length - 1; i >= 0; i--) {
            removeClass(e[i], "ht-suspend");
        }
        this.ele.video.play()
        this.playing = true
        this.ele.play.className = 'btn iconfont icon-zanting'
    }

    pause() {
        let e = document.querySelectorAll('.danmaku');

        for (let i = e.length - 1; i >= 0; i--) {
            addClass(e[i], "ht-suspend")
        }
        this.ele.video.pause()
        this.playing = false
        this.ele.play.className = 'btn iconfont icon-play'
    }

    getvideotime(time) {
        let tm;
        let m = parseInt(time / 60);
        if (parseInt(time % 60) >= 10) {
            tm = parseInt(time % 60);
        } else {
            tm = "0" + parseInt(time % 60);
        }
        return {
            m: m,
            s: tm
        };
    }

    //获取元素的纵坐标（相对于窗口）
    getTop(e) {
        let offset = e.offsetTop;
        if (e.offsetParent != null) offset += this.getTop(e.offsetParent);
        return offset;
    }

    getLeft(e) {
        let offset = e.offsetLeft;
        if (e.offsetParent != null) offset += this.getLeft(e.offsetParent);
        return offset;
    }


    initdata() {
        $c('yl-m').style.display = 'block'
				
        let obj = {
            left: this.getLeft(this.ele.wrap),
            top: this.getTop(this.ele.wrap),
            height: this.ele.wrap.offsetHeight,
            width: this.ele.wrap.offsetWidth,
            ytop: this.getTop(this.ele.yltm),//音量条
            yheight: this.ele.yltm.offsetHeight,
            speedt: this.ele.wrap.offsetWidth / 100, //速度
        }
        $c('yl-m').style.display = 'none'
		
        return obj
    }
    //全屏
    joinfull() {
			
			//缩放回归
			this.ele.video.style.height = '100%';
			this.ele.video.style.width = '100%';
			this.ele.video.style.webkitTransformOrigin = 'center'
			
			this.ele.rightmenu.video_ratio.ratio = 1
			this.ele.rightmenu.video_ratio.innerText = `视频比例 默认`
			this.ele.video.style.transform = `none`
			this.ele.video.style.webkitTransform = `none`
				
        let isfull = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement
        if (isfull) {
            if (this.ele.wrap == isfull) {
                console.log('进入全屏')
								addClass(this.ele.wrap,'full')
				this.ele.htbar.style.bottom='0px';
				this.ele.htbar.a=false
                this.data = this.initdata()
				let e=this.ele.dm.querySelectorAll('.ht-left')
				for (let i = 0; i < e.length; i++) {
					e[i].style.transform =  "translateX(-" + this.data.width / this.config.danmakusize + "px)"
				}
				
				
				
				setTimeout(()=>{
					this.data = this.initdata()
				},2000)
				//防止卡住 出现奇怪bug
				
            }
        } else {
            console.log('退出')
						
					 removeClass(this.ele.wrap,'full')
			this.ele.htbar.style.bottom=-this.ele.htbar.offsetHeight+'px'
			this.ele.htbar.style.opacity='1'
			this.ele.htbar.a=true
            this.data = this.initdata()
			setTimeout(()=>{
				this.data = this.initdata()
			},2000)
			//防止卡住 出现奇怪bug
			
        }

    }
    //获取弹幕
    adddanmaku(url = 'https://api.haotown.cn/danmaku/get/?id=1') {
        fetch(url).then((t) => t.json()).then((json) => {
            if (json.data) {
							  let html=''
                for (let i = 0; i < json.data.length; i++) {
                    this.danmaku.push(json.data[i])
										if(this.options.showright){
											let t=this.getvideotime(json.data[i].time/10)
											html+=`<li class="htdli">
															<div class="htdli-time">${t.m}:${t.s}</div>
															<div class='htdlit'>${json.data[i].text}</div>
														</li>
														`
										}
                }
                console.log('add danmuka success')
								if(html){
									 this.ele.dmlist.innerHTML+=html
								}
								
                this.nowdanmaku = this.danmaku.slice(0)
            }
        })
    }
	changerconfig(){
		this.config.definition=this.config.definition||1
        this.config.danmakusize=this.config.danmakusize||1
        this.config.dmweight=this.config.dmweight||600
        this.config.sound=this.config.sound||0.8
		
		
		this.config.s0=this.ele.hcx[0].checked //滚动
		this.config.s1=this.ele.hcx[1].checked //顶部
		this.config.s2=this.ele.hcx[2].checked //底部
		this.config.s3=this.ele.hcx[3].checked //高级
		
		this.config.dmshadow=this.ele.hcx[4].checked //阴影
		
		if(this.config.dmshadow) {
			this.config.dmshadowcss = `text-shadow: rgb(0, 0, 0) 1px 0px 1px, rgb(0, 0, 0) 0px 1px 1px, rgb(0, 0, 0) 0px -1px 1px, rgb(0, 0, 0) -1px 0px 1px;`
		}else{
			this.config.dmshadowcss=''
		}
		
		
		
		
		localStorage.setItem('htconfig', JSON.stringify(this.config));
		this.changercss()
	}
	msgbox(a){
		let e0=document.createElement('div')
		e0.className='ht-box-w'
		let e1=document.createElement('div')
		e1.className='ht-box-w2'
		let e2=document.createElement('div')
		e2.className='ht-box-m'
		let e3=document.createElement('div')
		e3.className='ht-box-b'
		e3.onclick=function (e) {
			e1.parentNode.removeChild(e1);
		}
		e0.onclick=function (e) {
			if(e.target==this){
				this.parentNode.removeChild(this)
			}	
		}
		e3.innerText=a.b||'确定'
		
		e2.appendChild(a.m);
		e1.appendChild(e2)
		e1.appendChild(e3)
		e0.appendChild(e1)
		if(a.width){
			e1.style.width=a.width
		}
		
		if(a.height){
			e1.style.height=a.height
		}
		this.ele.main.appendChild(e0)
	}
	
	changercss(){
		let t=this.options.Element||'body'
		function opacity(a) {
			if(a){
				return 'opacity:1';
			}else{
				return 'opacity:0';
			}
		}
		this.ele.css.innerHTML  = `
				${t} .ht-dm{font-weight:${this.config.dmweight};transform:scale(${this.config.danmakusize});-webkit-transform:scale(${this.config.danmakusize});-moz-transform:scale(${this.config.danmakusize});width:${100/this.config.danmakusize}%;height:${100/this.config.danmakusize}%;}
				${t} .danmaku{${this.config.dmshadowcss}}
				${t} .ht-left{${opacity(this.config.s0)}}
				${t} .ht-top{${opacity(this.config.s1)}}
				${t} .ht-bottom{${opacity(this.config.s2)}}
				${t} .danmaku-ad{${opacity(this.config.s3)}}
				`;
	}
	
	
}
