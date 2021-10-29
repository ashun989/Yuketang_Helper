// 后台脚本
var apiBase = ""
var pageBase = ""
var cids = [] // classroom_id
var aids = [] // activities_id
var cnames = {} // classroom_name
var tasks = []
init()

function init() {
    var currUrl = window.location.href;
    var lastInd = currUrl.lastIndexOf('/');
    if (currUrl.substr(lastInd + 1, 5) == "index") {
        pageBase = currUrl.substring(0, lastInd);
        apiBase = pageBase.substring(0, pageBase.lastIndexOf('/')) + "/api/web";
        console.log("pageBase = " + pageBase + "\napiBase = " + apiBase);
        searchCourses();
        searchHomeworks();
        showActivities();
        showButtons();
    }
}

function searchCourses() {
    $.ajax({
        url: apiBase + "/courses/list",
        type: "get",
        data: {
            "identity": "2"
        },
        dataType: "json",
        async: false,
        success: function (result) {
            if (result.errcode == 0) {
                var res_list = result.data.list
                for (var i = 0; i < res_list.length; i++) {
                    var cid = res_list[i].classroom_id
                    cids.push(cid)
                    cnames[cid] = res_list[i].course.name
                }
            }
        }
    });
}


function searchHomeworks() {
    // var acts = []
    for (var i = 0; i < cids.length; i++) {
        id = cids[i];
        $.ajax({
            url: apiBase + "/logs/learn/" + id,
            type: "get",
            data: {
                "actype": "5",
                "page": "0",
                "offset": "100",
                sort: "-1"
            },
            dataType: "json",
            async: false,
            success: function (result) {
                if (result.errcode == 0) {
                    var arr = result.data.activities;
                    for (var i = 0; i < arr.length; i++) {
                        // acts.push(arr[i]);
                        var m = {};
                        m["cid"] = id;
                        m["act"] = arr[i];
                        tasks.push(m);
                        console.log(arr[i]);
                    }
                }
            }
        })
    }
    // return acts;
}

function showActivities() {
    var father = $("#app > div.viewContainer > div > div.el-tabs.el-tabs--top > div.el-tabs__header.is-top");
    var tips = "";
    tips += ("<table id='mytasks' border='5' cellpadding='10' align='center'><tbody><tr><th>课程</th><th>任务</th><th>状态</th><th>DDL</th><th>总分</th><th>得分</th></tr>")
    for (var i = 0; i < tasks.length; i++) {
        var act = tasks[i]["act"];
        var cid = tasks[i]["cid"];
        var cname = cnames[cid];
        tips += ("<tr>")
        var beginTime = timestampToString(act.create_time);
        var endTime = timestampToString(act.deadline);
        var stat = activitiesStatusToString(act.status);
        tips += (`<td>${cname}</td>`)
        tips += (`<td>${act.title}</td>`);
        tips += (`<td>${stat}</td>`);
        tips += (`<td>${endTime}</td>`);
        tips += (`<td>${act.total_score}</td>`);
        tips += (`<td>${act.score}</td>`);
        tips += ("</tr>")
    }
    tips += ("</tbody></table>")
    father.append(tips);
}

function showButtons() {
    $("#app > div.left__menu > div.top > ul").append("<button id='toggletasks' type='button'>隐藏任务</button>");
    $("#toggletasks").on("click", function(event){
        $("#mytasks").toggle();
        if($("#toggletasks").text() == "隐藏任务"){
            $("#toggletasks").text("显示任务");
        }else{
            $("#toggletasks").text("隐藏任务");
        }
    });
    
}



function timestampToString(tsp) {
    var date = new Date(tsp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getMinutes()}`
}

function activitiesStatusToString(stat) {
    switch (stat) {
        case 0:
            return "未作答"
        case 1:
            return "待完成";
        case 2:
            return "不知道"
        case 3:
            return "已提交"

    }
}