(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                
                //form.checkValidity()
                
                event.preventDefault()
                event.stopPropagation()

                // form.classList.add('was-validated')
            }, false)
        })
})()



function checkStatus() {
    $.get("/api/status").done(function(data) {
        if (data.inProgress === true) {
            $("#hangup").show()
            $("#call").hide()
        } else {
            $("#call").show()
            $("#hangup").hide()
        }
    })
}

$(document).ready(checkStatus)
setInterval(checkStatus, 1000)

function showError(message=null) {
    if (message === null) {
        $("#errorbox").empty().hide()

    } else {
        $("#errorbox").text(message)
        $("#errorbox").show()
    }
}

function loadFields() {
    $("#phone").val(localStorage.getItem('phone'))
    $("#nums").val(localStorage.getItem('nums'))
}
$(document).ready(loadFields)

function saveFields() {
    if ($("#phone").val()) localStorage.setItem("phone", $("#phone").val())
    if ($("#nums").val()) localStorage.setItem("nums", $("#nums").val())
}

function startCall() {
    saveFields()
    if (validator()) {
        var nums = $("#nums").val().replace(/\s/g, "").split(",")
        if (nums.indexOf("") != -1) nums.splice(nums.indexOf(""), 1)
        $.post("/api/start", {
            phone: $("#phone").val(),
            nums
        }).done(function (data) {
            if (!data.error) {
                $("#hangup").show()
                $("#call").hide()
                showError()
            }
        }).fail(function(jqxhr, errorName, error) {
            showError(jqxhr.responseJSON.message)
        })
    }
}

function hangupCall() {
    $.post("/api/end")
    .done(function (data) {
        if (!data.error) {
            $("#hangup").hide()
            $("#call").show()
            showError()
        }
    }).fail(function(jqxhr, errorName, error) {
        showError(jqxhr.responseJSON.message)
    })
}

function validator() {
    let valid = true;
    if (!/36\d{1,2}\d{6,7}/.test($("#phone").val())) {
        $("#phone").removeClass("is-valid").addClass("is-invalid")
        valid = false;
    } else {
        $("#phone").removeClass("is-invalid").addClass("is-valid")
    }

    var nums = $("#nums").val().replace(/\s/g, "").split(",")
    if (nums.indexOf("") != -1) nums.splice(nums.indexOf(""), 1)
    //console.log(nums)
    if (nums.length > 0 && nums.every(function(v) {return !isNaN(v)})) {
        $("#nums").removeClass("is-invalid").addClass("is-valid")
    } else {
        $("#nums").removeClass("is-valid").addClass("is-invalid")
        valid = false;
    }
    
    return valid
}