/**
 * Created by Flamen on 2019-12-27.
 */

var game_set; //棋盘定义
var gameover = false;
var s_r = 8, s_c = 8; //棋盘尺寸
var minenum = 16; //地雷数量
var timecount = 0;
var gameid = null; //避免restart游戏计时器混乱

$(function(){
    //...似乎没有需要初始化的

    initGame();
    //$("#btn_newgame").click(function(){initGame();});
    //禁用右键菜单
    document.oncontextmenu = function(){return false;}

    console.log("page init");

    //cheatcode
    $(document).keydown(function(event){
        console.log("keycode",event.keyCode);
        if(event.keyCode==16 && game_set){
            //显示隐藏的地雷
            //.cheat

            $(".blk").each(function(n,item){
                var i_r = parseInt($(item).attr("rval"));
                var i_c = parseInt($(item).attr("cval"));
                if(game_set[i_r][i_c]==1){
                    $(item).addClass("cheat");
                }
            });

        }
    });

    $(document).keyup(function(event){
        if(event.keyCode==16){
            //隐藏的地雷提示
            $(".blk").removeClass("cheat");
        }
    });


});


function gamewin(){
    gameover = true;
    $("#hint").html("YOU WIN.");
}
//判断游戏是否结束、赢
function chkgamewin(){
    if(gameover){
        return false;
    }

    var openblks = $(".opened").length;
    if((s_r*s_c - minenum)==openblks){
        gamewin();
    }else{
        console.log("not finish yet")
    }
}

function gamelose(){
    gameover = true;
    $("#hint").html("YOU LOSE.");
}

function initGame(){
    s_r = arguments[0]?arguments[0]:10;
    s_c = arguments[1]?arguments[1]:10;
    minenum = arguments[2]?arguments[2]:24;

    if(s_r*s_c <= minenum){
        mAlert("地雷数量大于棋盘，游戏无法初始化");
        return false;
    }
    var mineleft = minenum;

    //fixedUI for firefox
    $(".mine_field").width(s_c*44 + 1);

    $("#hint").html('');
    gameover = false;
    $(".mine_field").html("");
    game_set = new Array(s_r);
    for(var i=0;i<s_r;i++){
        game_set[i] = new Array(s_c);
        $(".mine_field").append("<div class='clr'>");
        for(var j=0;j<s_c;j++){
            game_set[i][j]=0; //没有炸弹的置0，有的置1

            //UI输出，顺便
            var html = '<div class="blk" rval="'+i+'" cval="'+j+'"> ' +
                '<i class="fas fa-bomb"></i> ' +
                '<i class="far fa-laugh"></i> ' +
                '<i class="fas fa-flag"></i> ' +
                '<span></span> ' +
                '</div>';

            $(".mine_field").append(html);
        }
        $(".mine_field").append("</div>");
    }

    //布雷
    /* 逻辑代码移到左键点击交互上
    while(mineleft>0){

        //随机抽取一格
        var rnd_r = Math.floor(Math.random()*s_r),
            rnd_c = Math.floor(Math.random()*s_c);
        if(game_set[rnd_r][rnd_c]==0){
            game_set[rnd_r][rnd_c] = 1;
            mineleft--;
        }else{}//已经有雷了跳过继续分配
    }
    */


    //绑定按钮
    bindBtns();

    //开始计时
    $("#mineleft").val(minenum);
    timecount = 0;
    gameid = Math.random();
    tiktok(gameid);

}

function calcFlags(r,c,target){

    var flagnum = 0;
    $(".blk").each(function(n,item){
        var i_r = parseInt($(item).attr("rval"));
        var i_c = parseInt($(item).attr("cval"));

        if(i_r>=(r-1) && i_r<=(r+1) && i_c>=(c-1) && i_c<=(c+1)){ //附近9格计算
             if($(item).hasClass("flag")){
                 flagnum++;
                 //debug
                 //console.log("find flag:",i_r, i_c);
             }
        }
    });
    //console.log("calcFlags flagnum", flagnum); //debug

    if(flagnum>=target){ //打开周边的逐格
        $(".blk").not('.flag').not('.opened').each(function(n,item){
            var i_r = parseInt($(item).attr("rval"));
            var i_c = parseInt($(item).attr("cval"));

            if(i_r>=(r-1) && i_r<=(r+1) && i_c>=(c-1) && i_c<=(c+1)){ //附近9格计算
                $(item).addClass("opened");
                if(game_set[i_r][i_c]==1){
                    gamelose();
                    $(item).addClass("bomb");
                }else{
                    var num = calcAround(i_r,i_c);
                    if(num==0){ //翻开的是0，也就是周边的也可以翻开
                        calcFlags(i_r,i_c,num);
                    }else{
                        $(item).find("span").html(num);
                    }
                    chkgamewin();
                }
            }
        });
    }
}

function calcAround(r,c){
    if(!game_set){
        console.log("游戏未初始化");
        return;
    }
    num = 0;

    //第一行
    if(r>0 && c>0){
        if(game_set[r-1][c-1]==1) num++;
        //console.log("gs",(r-1),(c-1),game_set[r-1][c-1]); //debug
    }
    if(r>0){
        if(game_set[r-1][c]==1) num++;
        //console.log("gs",(r-1),(c),game_set[r-1][c]);
    }
    if(r>0 && c<(s_c-1)){
        if(game_set[r-1][c+1]==1) num++;
        //console.log("gs",(r-1),(c+1),game_set[r-1][c+1]);
    }
    //第二行
    if(c>0){
        if(game_set[r][c-1]==1) num++;
        //console.log("gs",(r),(c-1),game_set[r][c-1]);
    }
    //自身不用计算
    if(c<(s_c-1)){
        if(game_set[r][c+1]==1) num++;
        //console.log("gs",(r),(c+1),game_set[r][c+1]);
    }
    //第三行
    if(r<(s_r-1) && c>0){
        if(game_set[r+1][c-1]==1) num++;
        //console.log("gs",(r+1),(c-1),game_set[r+1][c-1]);
    }
    if(r<(s_r-1)){
        if(game_set[r+1][c]==1) num++;
       // console.log("gs",(r+1),(c),game_set[r+1][c]);
    }
    if(r<(s_r-1) && c<(s_c-1)){
        if(game_set[r+1][c+1]==1) num++;
        //console.log("gs",(r+1),(c+1),game_set[r+1][c+1]);
    }
    return num;
}

function bindBtns(){
    $(".blk").mousedown(function(event){
        if(gameover){
            console.log("GAME OVER");
            return false;
        }
        if($(this).hasClass("opened") &&  event.button != 1){ //打开了的不处理
            return false;
        }

        //console.log("mousebtn event:", event.button); //左中右 0,1,2
        var btn = $(this);
        var btn_r = parseInt($(this).attr("rval"));
        var btn_c = parseInt($(this).attr("cval"));

        switch(event.button){
            case 0://左键，打开
                // 判断是新游戏进行布雷,
                // 且绕开当前点击的格子避免开局爆
                if($(".opened").length==0){
                    var mineleft = minenum;
                    while(mineleft>0){
                        if(s_r*s_c < mineleft){
                            console.log("地雷数值大于棋盘无法分配");
                            break;
                        }

                        //随机抽取一格
                        var rnd_r = Math.floor(Math.random()*s_r),
                            rnd_c = Math.floor(Math.random()*s_c);
                        if(game_set[rnd_r][rnd_c]==0 && !( btn_c==rnd_c && btn_r==rnd_r )){
                            game_set[rnd_r][rnd_c] = 1;
                            mineleft--;
                        }else{}//已经有雷了跳过继续分配
                    }
                }

                //已经标记的忽略，不满足打开条件
                if($(btn).hasClass("flag")) {
                    $(this).addClass("smile").mouseup(function () {
                        $(this).removeClass("smile");
                    });
                }else{
                    $(btn).addClass("opened");
                    if(game_set[btn_r][btn_c]==1){
                        gamelose();
                        $(btn).addClass("bomb");
                    }else{
                        var num = calcAround(btn_r,btn_c);
                        $(btn).removeClass("flag");
                        if(num==0){ //翻开的是0，也就是周边的也可以翻开
                            calcFlags(btn_r,btn_c,num);
                        }else{
                            $(btn).find("span").html(num);
                        }
                        chkgamewin();
                    }
                }

                break;
            case 1://中键，关联打开

                //如果不满足打开条件
                if(!$(btn).hasClass("opened")) {
                    $(this).addClass("smile").mouseup(function () {
                        $(this).removeClass("smile");
                    });
                }else{
                    calcFlags(btn_r,btn_c,parseInt($(this).find("span").html()));
                }
                break;
            case 2: //右键标记
                $(btn).toggleClass("flag");

                //更新标记的地雷数量
                $("#mineleft").val( minenum - $(".flag").length);
                break;
        }

    });
}

//游戏计时
function tiktok(degameid){
    if(gameover){ //跳出
        return false;
    }
    if(degameid != gameid){ //上一局游戏已经结束，计时跳出
        return false;
    }
    timecount ++;
    var t_min = Math.floor(timecount/60);
    if(t_min<10)
        t_min = '0'+ t_min.toString();
    else
        t_min = t_min.toString();
    var t_sec = timecount % 60;
    if(t_sec<10)
        t_sec = '0'+ t_sec.toString();
    else
        t_sec = t_sec.toString();
    $("#timer").val(t_min+":"+t_sec);
    setTimeout("tiktok("+degameid+")",1000);
}