// 后台脚本
var apiBase = ""
var pageBase = ""
init()

function init() {
    var currUrl = window.location.href;
    var lastInd = currUrl.lastIndexOf('/');
    if (currUrl.substr(lastInd + 1, 5) == "index") {
        pageBase = currUrl.substring(0, lastInd);
        apiBase = pageBase.substring(0, pageBase.lastIndexOf('/')) + "/api/web";
        console.log("pageBase = " + pageBase + "\napiBase = " + apiBase);
        var classroom_ids = searchCourses();
        console.log("classroom_ids: " + classroom_ids);
        var acts = searchHomeworks(classroom_ids);
        showActivities(acts);
    }
}

function searchCourses() {
    var ids = [];
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
                    ids.push(res_list[i].classroom_id)
                }
            }
        }
    });
    return ids;
}


function searchHomeworks(ids) {
    var acts = []
    for (var i = 0; i < ids.length; i++) {
        id = ids[i];
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
                        acts.push(arr[i]);
                        console.log(arr[i]);
                    }
                }
            }
        })
    }
    return acts;
}

function showActivities(acts) {
    var father = $("#app > div.viewContainer > div > div.el-tabs.el-tabs--top > div.el-tabs__header.is-top");
    var tips = "";
    tips += ("<table border='5' cellpadding='10' align='center'><tbody><tr><th>任务</th><th>状态</th><th>DDL</th><th>总分</th><th>得分</th></tr>")
    for (var i = 0; i < acts.length; i++) {
        tips += ("<tr>")
        var beginTime = timestampToString(acts[i].create_time);
        var endTime = timestampToString(acts[i].deadline);
        var stat = activitiesStatusToString(acts[i].status);
        tips += (`<td>${acts[i].title}</td>`);
        tips += (`<td>${stat}</td>`);
        tips += (`<td>${endTime}</td>`);
        tips += (`<td>${acts[i].total_score}</td>`);
        tips += (`<td>${acts[i].score}</td>`);
        tips += ("</tr>")
    }
    tips += ("</tbody></table>")
    father.append(tips);
}

function timestampToString(tsp) {
    var date = new Date(tsp);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getMinutes()}`
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