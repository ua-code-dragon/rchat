var current_chat = undefined;
var current_user = undefined;
var current_message = 0;
var msg_blocksize = 16;
var c_mtx = false;

function mkpre( txt ){
    const sanitize = html => html.replace(/<[^>]*>/g, found =>
        found.indexOf('<br') === 0 || found.indexOf('<font') === 0 ?
        found : found.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    return sanitize(txt)
        .replace(/[\t]/g,"&nbsp;&nbsp;&nbsp;&nbsp;")
        .replace(/[\r\n]+/g,"<br/>")
        ;
}

function refresh_user(){
    $.ajax({
        url: "user",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function(res) {
            current_user = res;
            $("#i_username").text(current_user.name);
            $("#i_useremail").text(current_user.email);
        },
        error:function (xhr, ajaxOptions, thrownError){
            console.log(xhr.responseText);
        }
    });       
}

function refresh_chats(){
    $.ajax({
        url: "chat",
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        success: function(res) {
            $('#t_chatlist').empty();
            if(current_chat == undefined){ 
                current_chat = res[0]; 
                $("#i_chatname").text(current_chat.name);
                $("#i_chatid").text(current_chat.id);
            }
            for(var i in res){
                var c = res[i];
                $('#t_chatlist').append($('<option>',{
                    value: c.id,
                    text: c.name
                }));
            }
            $('#t_chatlist option[value='+current_chat.id+']').attr('selected', 'selected');
        },
        error:function (xhr, ajaxOptions, thrownError){
            console.log(xhr.responseText);
        }
    });       
}

function refresh_posts(){
    $.ajax({
        url: 'messages',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
            chat: current_chat.id,
            last: msg_blocksize
        }),
        dataType: "json",
        success: function(res) {
            for(let i = res.length - 1; i >= 0; i--) {
                var m = res[i];
                var off = "";
                var bgc = "has-background-white-ter";
                if(m.author_email == current_user.email){
                    off = '<div class="tile is-child"></div>';
                    bgc = 'has-background-primary-light';
                }    
                var imc = "";
                if(m.image != undefined && m.image != ""){
                    imc = `
                        <div class="card-image">
                            <figure class="image">
                                <img src="`+m.image+`" alt="Image placeholder...">
                            </figure>
                        </div>
                    `;
                }
                var dt = new Date(m.timestamp);
                var datestr = dt.toLocaleDateString("uk-UA",{ weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric', });
                var timestr = dt.toLocaleTimeString("uk-UA");
                if(m.timestamp > current_message){
                    current_message = m.timestamp;
                    var mcard = `<div class="tile is-parent ">`+off+`<div class="card my-2 tile is-child is-8 `+bgc+`">
                        <div class="card-content">
                            <div class="content">
                                <p class="has-text-info"><strong>`+m.author_name+`</strong> <small>(`+m.author_email+`) <i>`+datestr+' '+timestr+`</i></small></p>
                                <p>`+mkpre(m.text)+`</p>
                            </div>
                        </div>
                        `+imc+`
                    </div></div>`;
                    $("#chatbody").append(mcard);
                    $("#chatscroll").animate({ scrollTop: $('#chatscroll').get(0).scrollHeight }, 200);
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError){
            console.log(xhr.responseText);
        }
    });        
}

function do_newchat(){
    var data = {
        name: $("#t_chatname").val()
    };
    $.ajax({
        url: 'chat',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        dataType: "json",
        success: function(res) {
             console.log("ok");
        },
        error: function (xhr, ajaxOptions, thrownError){
            console.log(xhr.responseText);
        }
    });        
}

function do_post(){
    var text = $("#t_post").val();
    var files = $('#t_image').prop("files");
    $("#t_post").val("");
    if(text == "" && files.length == 0){
        return;
    }
    var data = {
        chat: current_chat.id,
        timestamp: new Date().valueOf(),
        author_name: current_user.name,
        author_email: current_user.email, 
        text: text
    };
    const sendit = obj => 
        $.ajax({
            url: 'message',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(obj),
            dataType: "json",
            success: function(res) {
                 console.log("ok");
            },
            error: function (xhr, ajaxOptions, thrownError){
                console.log(xhr.responseText);
            }
        });        
    if(files.length > 0){
        var r = new FileReader();    
        r.onload = () => {
            data['image'] = r.result;
            sendit(data);
            $("#t_image").val(null);
            $("#i_filename").text("");
        }; 
        r.readAsDataURL(files[0]);
    }else{
        sendit(data);
    }
}


function do_loadimage(){
    var files = $('#t_image').prop("files");
    if(files.length > 0){
        $("#i_filename").text(files[0].name);
    }
}


$(function() {
    refresh_user();
    refresh_chats();
    setInterval(refresh_chats, 4000);
    setTimeout(() => {
        refresh_posts();
        setInterval(refresh_posts, 3000);
    },2000);        
    $('#t_chatlist').on('change', function(){
        current_chat = { id: this.value, name: this.text() };
        $("#i_chatname").text(current_chat.name);
        $("#i_chatid").text(current_chat.id);
    });
});
