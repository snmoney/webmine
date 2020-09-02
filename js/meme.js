/**
 * Created by Flamen on 2019-12-27.
 */

var pw,ph,pl,pt,pd, pf,img;
var offset_l = 0; //计算左偏差值
var newFontSize = 16;//初始值

$(function(){
    //
    mAlert_init(600);

    if(file404){
        $("#b_404").show();
        $("#b_form").hide();
    }else{

        $("#link_self").val(location.href);

        $("#btn_getpic").click(function(){
            genPic();
        });

        //初始化加载页面
        $.get("conf/"+cnf+".json",function(res){
            img = res.img;
            pw = res.w;
            ph = res.h;
            pl = res.l;
            pt = res.t;
            pd = res.d;
            pf = res.f; //fontsize Max

            //显示图片
            $("#imgpv").attr("src",img);
            $("#b_pv").removeClass("inactive");

            if(initmsg){
                $("#inp_pvt").val(initmsg);
            }

            setTimeout(function(){
                offset_l = Math.floor(($("#l_pv").width() - $("#imgpv").width()) / 2);
                //初始化显示框
                updatepvt();
            },1000);

        },"json");

    }


});

function genPic(){
    var msg_b64 = Base64.encode($("#inp_pvt").val().trim());

    mAlert("<div style='text-align: center'><img src='img.php?cnf="+cnf+"&fs="+newFontSize+"&b64="+ msg_b64 +"' style='max-width:80%;'/><br/>*右键另存图片</div>");
}

//update pv text
function updatepvt(){
    //var w = $("#r_w").val(), h = $("#r_h").val();
    //var l = $("#r_l").val(), t = $("#r_t").val();
    //var deg = $("#r_deg").val();
    //var fontsizeMax = $("#r_fmax").val();
    var txt = $("#inp_pvt").val().trim();

    //重设预览框的样式位置
    $("#pvtext").css({
        "left": (parseInt(pl)+ parseInt(offset_l))+"px",
        "top":pt+"px",
        "width":pw+"px",
        "height":ph+"px",
        "transform":"rotate(-"+ pd +"deg)"
    });

    //根据宽高改变容纳字数的上限，按字体大小 16x16计算
    var maxchars = Math.floor(pw/16)*Math.floor(ph/16);
    $("#inp_pvt").attr("maxlength",maxchars);
    txt = txt.substr(0,maxchars); //截断

    //如果字数比上线少，改变预览字体的大小(尝试放大)
    if(txt.length < maxchars){
        newFontSize = 16;//初始值
        var oversize = false;
        while(!oversize){
            newFontSize++;
            var rowChars = Math.floor(pw/newFontSize);//每行可以容纳多少字
            var rows = Math.floor(txt.length/rowChars) + ((txt.length)%rowChars?1:0);
            if((rows*(newFontSize+2))>ph){ //+2是行高
                oversize = true;
                break;
            }else if(newFontSize>pf){
                break;
            }
        }
        newFontSize--; //超出大小1次
        //$("#pvtext").css({"font-size":newFontSize+"px","line-height":(newFontSize+2)+"px"});
        $("#pvtext").css({"font-size":newFontSize+"px","line-height":(newFontSize+2)+"px","transform-origin":"left "+newFontSize+"px"});
    }
    $("#pvtext").html(txt);

}