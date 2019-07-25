var check_boxes_counter = 0;

function handel_check_box_click(source) {
    if ($(source).attr("name" ) == "select_all") {
        check_boxes = document.getElementsByName('popis');
        for (var i = 0, n = check_boxes.length; i < n; i++) {
            check_boxes[i].checked = source.checked;
        }
        if(source.checked) {
            check_boxes_counter = check_boxes.length;
        }
        else {
            check_boxes_counter = 0;
        }
    }
    else {
        check_boxes = document.getElementsByName('popis');
        select_all_check_box = document.getElementsByName('select_all');
        if(source.checked == true) {
            check_boxes_counter++;
            if(check_boxes_counter == check_boxes.length) {
                select_all_check_box[0].checked = source.checked;
            }
        }
        else {
            check_boxes_counter--;
            select_all_check_box[0].checked = source.checked;
        }
    }
}
function get_ads_from_account_and_display_to_client() {

    window.user_name = document.getElementById("username").value;
    window.user_pass = document.getElementById("password").value;
    $(".lds-hourglass").show(function () {
        var jqXHR = $.ajax({
            type: "POST",
            url: "/main",
            async: false,
            data: { username: window.user_name, password: window.user_pass }
        });
        display_ads_to_client(jqXHR.responseText);
    });
    $("#logindiv").hide();
}

function display_ads_to_client(ads) {
    ads = JSON.parse(ads);
    jQuery.each(ads, function (i, ad) {
        var ad_name = ad.ad_name;
        var ad_next_bounce = ad.ad_next_bounce;
        var ad_status = ad.ad_status;
        var is_bounce_valid = ad.is_bounce_valid;
        var ad_url = ad.ad_url;
        if (!ad_next_bounce && is_bounce_valid)
            ad_next_bounce = "NOW";
        else if (!ad_next_bounce)
            ad_next_bounce = "";
        $('#ads_table tr:last').after('<tr id="' + ad_url + '"><td>' + ad_name + '</td><td>' + ad_status + '</td><td>' + ad_next_bounce + '</td><td><input id="bouncebox' + i + '" type="checkbox" name="popis" onClick="handel_check_box_click(this)"/></td></tr>');
        if (ad_status != "מודעה פעילה" && ad_status != "פג תוקף")
            document.getElementById("bouncebox" + i).disabled = true;
    });
    $(".lds-hourglass").hide();
    $("#ads_div").show();
}

function getDiffTime(next_bounce) {
    if (!next_bounce.includes(':'))
        return next_bounce;
    var return_minutes = return_hours = ""
    var next_hour = Number(next_bounce.split(':')[0]);
    var next_minutes = Number(next_bounce.split(':')[1]);
    var today = new Date();
    var now_hour = Number(today.getHours());
    var now_minutes = Number(today.getMinutes());
    actual_minutes = next_minutes - now_minutes;
    actual_hours = (next_hour - now_hour - 1)
    if (actual_minutes < 0)
        actual_minutes = String(60 + actual_minutes)
    if (actual_hours < 0)
        actual_hours = String(24 + actual_hours)
    return actual_hours + ":" + actual_minutes + ":00";
}

function start_popping_ads() {
    var urls_properties_dict = {};
    $('#ads_table tr').each(function () {
        if (this.id != "tbl_first_tr") {
            var status = this.children[1].innerHTML;
            var next_bounce = this.children[2].innerHTML;
            var pop_ad_checked = this.children[3].children[0].checked;
            if (pop_ad_checked) {
                if (!next_bounce.includes(':'))
                    urls_properties_dict[this.id] = status;
                this.children[2].innerHTML = '<p class="countdown-timer">' + getDiffTime(next_bounce) + '</p>';
            }
        }
    });
    start_countdown();
    var poped_ads_dict = $.ajax({
        type: "POST",
        url: "/pop_ads",
        async: false,
        data: { advertisements: JSON.stringify(urls_properties_dict), username: window.user_name, password: window.user_pass }
    });
    pop_ads_json = JSON.parse(poped_ads_dict.responseText());
    jQuery.each(pop_ads_json, function (url, prop) {
        var status = prop[0]
        var pop_succeeded = prop[1]
    });
}

function handle_pop_or_stop_button() {
    var button_content = document.getElementById("btn_popstop");
    if (button_content.innerHTML == "POP MY ADS!") {
        button_content.innerHTML = "STOP";
        start_popping_ads();
    }
    else {
        button_content.innerHTML = "POP MY ADS!";
    }
}