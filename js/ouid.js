var dt;
var clearGNumTimeoutID;
// for duplicate-avoiding purposes and saving without jquery HTML parsing
var usedEvents = [];
var usedStaff = [];
var usedRecordsByGID = {};

function adjustColumnSize() {
    if (dt) {
        dt.columns.adjust();
    }
}

function isNullOrWhitespace(input) {
  return !input || !input.trim();
}

function getDateFormatted() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    month   = month   < 10 ? '0'+month : month;
    day     = day     < 10 ? '0'+day : day;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    seconds = seconds < 10 ? '0'+seconds : seconds;
    return month + "/" + day + "/" + date.getFullYear() + " " +  hours+ ":" + minutes+ ":" + seconds + " " + ampm;
}

function setupCheckboxListeners() {
    $('.delete-checkbox').unbind('change');
    $('.delete-checkbox').on('change', function() {
        if ($('#data-table :checked').length) {
            $('#delete-selected').prop("disabled", false);
        } else {
            $('#delete-selected').prop("disabled", true);
        }
    });
}

function addRecordByData(gnum, date, eventName, staffName) {
	
    dt.row.add([
        gnum,
        getDateFormatted(),
        eventName,
        staffName,
        '<input type="checkbox" class="delete-checkbox">'
    ]).draw(false);
    if (usedRecordsByGID[gnum]) {
        usedRecordsByGID[gnum].push(eventName);
    } else {
        usedRecordsByGID[gnum] = [eventName];
    }
    adjustColumnSize();
    $('#download-swipe-btn').prop("disabled", false);
    setupCheckboxListeners();
	
}

function addSwipeRecord(){
    if($('#gnumber').val().length > 3){
        var gnum = $('#gnumber').val().substring($('#gnumber').val().length - 4, $('#gnumber').val().length); //Always saves last 4 digits
        if(!isNullOrWhitespace(gnum)){
         addRecord(gnum);   
        }
    }
}

function addManualRecord(){
    if(!isNullOrWhitespace($('#manualAddTextInput').val())){
        var gnum = $('#manualAddTextInput').val();
        if(gnum.length > 3){
            $('#modalError').css('visibility', 'hidden');
            $('#myModal').modal('hide');
            addRecord(gnum);
        }else{
            $('#modalError').css('visibility', 'visible');
        }
    }
}

function addRecord(gnumber) {
    if (dt && !(isNullOrWhitespace(gnumber))) {
        cancelClearGNum();
        var gnum = gnumber;
        var eventName = $('#event-name').val();
        var staffName = $('#staff-name').val();

        if (gnum && eventName && staffName) {
            if (!usedRecordsByGID[gnum] || usedRecordsByGID[gnum].indexOf(eventName) == -1) {
                addRecordByData(gnum, getDateFormatted(), eventName, staffName);
                saveSwipes();
            }
            clearGNum();
        } else {
            if (!eventName) {
                $('#event-error').css('visibility', 'visible');
            }

            if (!staffName) {
                $('#staff-error').css('visibility', 'visible');
            }
        }
    }
}

function addEventByName(eventName) {
    if (usedEvents.indexOf(eventName) == -1) {
        var newElement = '<option value="'+eventName+'">'+eventName+'</option>';
        $('#event-manager-list').append(newElement);
        $('#event-name').append(newElement);
        usedEvents.push(eventName);
    }
}

function addEvent() {
    var eventName = $('#new-event').val();
    if (eventName) {
        addEventByName(eventName);
        saveEventNames(usedEvents);
    }
    $('#new-event').val('');
    $('#event-manager-list').val(eventName);
}

function addStaffByName(staffName) {
    if (usedStaff.indexOf(staffName) == -1) {
        var newElement = '<option value="'+staffName+'">'+staffName+'</option>';
        $('#staff-manager-list').append(newElement);
        $('#staff-name').append(newElement);
        usedStaff.push(staffName);
    }
}

function addStaff() {
    var staffName = $('#new-staff').val();
    if (staffName) {
        addStaffByName(staffName);
        saveStaffNames(usedStaff);
    }
    $('#new-staff').val('');
    $('#staff-manager-list').val(staffName);
}

function onEnter(id, callback) {
	console.log(id);
    $(id).keyup(function (e) {
        if (e.keyCode == 13) {
            callback();
        }
    });
	
}


function clearGNum() {
    console.log("Gnum cleared!");
    $('#gnumber').val('');
    $('#manualAddTextInput').val('');
}

function cancelClearGNum() {
    window.clearTimeout(clearGNumTimeoutID);
}

function showReady(){ //Displays ready text	when swipe is ready.
	$('#swipeStatus').css('visibility', 'visible');
}

function hideReady(){ //Hides ready text when swipe won't work.
	$('#swipeStatus').css('visibility', 'hidden');
}

document.addEventListener('DOMContentLoaded', function() {
    onEnter('#gnumber', addSwipeRecord); //auto add record on swipe 
    onEnter('#new-event', addEvent);
    onEnter('#new-staff', addStaff);    
    $('#add-event-btn').on('click', addEvent);
    $('#add-staff-btn').on('click', addStaff);
	
    $('#tracker-button').on('click', function() {
        $('#ui-staff').hide();
        $('#ui-event').hide();
        $('#header').text("Event Tracker");
        $('#event-name').val('');
        $('#staff-name').val('');
        $('#gnumber').val('');
        $('#event-error').css('visibility', 'hidden');
        $('#staff-error').css('visibility', 'hidden');
        $('#data-table :checked').attr('checked', false);
        $('#delete-selected').prop("disabled", true);
        $('#ui-tracker').show();        

        // fix to accomodate for lack of resizing table headers when display: none;
        adjustColumnSize();
    });
    
    $('#staff-button').on('click', function() {
        $('#ui-event').hide();
        $('#ui-tracker').hide();
        $('#header').text("Staff Manager");
        $('#staff-manager-list').val('');
        $('#new-staff').val('');
        $('#ui-staff').show();
        $('#new-staff').focus();
    });
    
    $('#event-button').on('click', function() {
        $('#ui-staff').hide();
        $('#ui-tracker').hide();
        $('#header').text("Event Manager");
        $('#event-manager-list').val('');
        $('#new-event').val('');
        $('#ui-event').show();
        $('#new-eventc').focus();
    });

    $('#event-name').on('change', function() {
        if ($('#event-name').val()) {
            $('#event-error').css('visibility', 'hidden');
        }        
    });

    $('#staff-name').on('change', function() {
        if ($('#staff-name').val()) {
            $('#staff-error').css('visibility', 'hidden');
        }        
    });

    $('#gnumber').on('input', function() {
        cancelClearGNum();
        clearGNumTimeoutID = window.setTimeout(clearGNum, 2);
    });

    $('#gnumber').on('change', cancelClearGNum);
	$('#gnumber').on('focus', showReady);
	$('#gnumber').on('blur', hideReady);
    dt = $('#data-table').DataTable({
        "scrollY":        "200px",
        "scrollCollapse": true,
        "paging":         false,
        "order":          [[1, "desc"]]
    });

    $('#delete-staff-btn').on('click', function() {
        var selector = $("#staff-manager-list");
        if (selector.val()) {
            var toremove = selector.find(":selected");
            // Remove from usedStaff array
            usedStaff.splice(usedStaff.indexOf(toremove.val(), 1));
            saveStaffNames(usedStaff);
            $('#staff-name').children("[value='"+toremove.val()+"']").remove();
            toremove.remove();
            selector.val('');
        }
    });

    $('#delete-event-btn').on('click', function() {
        var selector = $("#event-manager-list");
        if (selector.val()) {
            var toremove = selector.find(":selected");
            // Remove from usedEvents array
            usedEvents.splice(usedEvents.indexOf(toremove.val(), 1));
            saveEventNames(usedEvents);
            $('#event-name').children("[value='"+toremove.val()+"']").remove();
            toremove.remove();
            selector.val('');
        }
    });

    $('#download-swipe-btn').on('click', function() {
        if (!$.isEmptyObject(usedRecordsByGID)) {
                chrome.fileSystem.chooseEntry( {
                type: 'saveFile',
                suggestedName: SWIPES_CSV,
                accepts: [ { extensions: ['csv']} ],
                acceptsAllTypes: true
            }, function (fileEntry) { 
                fileEntry.createWriter(function(fileWriter) {

                    var blob = new Blob([getSwipeCSVData()]);

                    fileWriter.onwriteend = function(e) {
                        // truncate will cause a call to onwriteend, so without adjusting this there will be an infinite loop
                        fileWriter.onwriteend = function() {
                            deleteSwipeData();
                            usedRecordsByGID = {};
                            dt.clear().draw();
                            $('#download-swipe-btn').prop("disabled", true);
                            $('#delete-selected').prop("disabled", true);
                        }
                        // truncate to prevent leaving residual content when overwriting a larger file than the csv data
                        e.currentTarget.truncate(e.currentTarget.position);
                    };

                    fileWriter.write(blob);
                });
            });
        }
    });
	
	$('#swipe-add').on('click', function() { 
		document.getElementById('gnumber').focus(); //Allows user to swipe card
	});
    
    $('#manualAddModalButton').on('click', function(){
        addManualRecord();
    });
    
    $('#manual-add').on('click', function() {
       var eventName = $('#event-name').val();
        var staffName = $('#staff-name').val();

        if (eventName && staffName) {
            $('#myModal').modal('show');
        } else {
            if (!eventName) {
                $('#event-error').css('visibility', 'visible');
            }

            if (!staffName) {
                $('#staff-error').css('visibility', 'visible');
            }
        } 
    });
    
    $('#myModal').on('hidden.bs.modal', function () { //On modal close
        $('#manualAddTextInput').val('');
        $('#modalError').css('visibility', 'hidden');
    })

    $('#delete-selected').on('click', function() {
        var rows = $('#data-table :checked').parent().parent()
        rows.toArray().forEach(function(r) {
            var children = r.children;
            var gnum = $(children[0]).text();
            var eventName = $(children[2]).text();
            var eventsForGnum = usedRecordsByGID[gnum];
            if (eventsForGnum.length == 1 && eventsForGnum[0] == eventName) {
                delete usedRecordsByGID[gnum];
            } else {
                usedRecordsByGID[gnum].splice(eventsForGnum.indexOf(eventName), 1);
            }
        });

        dt.rows(rows).remove().draw()
        saveSwipes();
        $('#delete-selected').prop("disabled", true);
        if ($.isEmptyObject(usedRecordsByGID)) {
            $('#download-swipe-btn').prop("disabled", true);
        }
    });
});
