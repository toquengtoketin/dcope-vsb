// hey
// quit looking at my source code
// jk feel free to save this offline - it doesn't need internet to work - you'll need the 3 html, css, and js files
// some of the code that VSB generates was written by other people but I changed it
// specifically, the regex code was modified from the Status Board script from http://thefinalfrontier.se/
// special thanks to /u/Meridius_IX for the inspiration to create this tool, and to /u/3nj0yc0k3 for helping with extensive testing
// check out /r/VisualScriptBuilder to discuss, share ideas, report bugs, or ask questions
//
//   love,
//     King Baggot

// TO DO:
// Update to use new getters/setters
// FINISH FIXING TEXT AREAS - public text get&save (GetPublicText()), change custom data to use text area, fix sizing for shorter and smaller textareas, if/set code for general textareas (not just public text)
//  - all left is handling new lines on IF GetPublicText() == "asdfkja"
// Grey out propertynames that have no get/set (IF logic, color)
// test negative values in power/energy functions (saved Negative Power/Energy Test Script)
// fix clickCheckBoxButton/inputUpdated conflict where button is clicked twice
// add space ball, parachute hatch
// fix timing so it can be set to multiple, and implement automatic timing for 
// weld new rotorhead small/ large
// fix images - add to list, remove from list, etc



// DONE:
// Added in-browser script saving/loading functionality, including autosave and overwrite protection
// Updated homepage UI to include pretty icons
// Added Custom Code section to allow direct user input of code (IF and DO)
// Fixed empty color values - now defaults to 0
// Fixed colors not updating on script load
// Fixed large textareas displaying behind other elements
// Fix Oxygen level regex
// Fixed issue where switching logic types permanently disabled saving Properties (bug introduced in 1.0.7)
// Fixed issue where saved properties sometimes didn't load correctly
// Changed GetOxygenLevel() to FilledRatio
// Added automatic performance adjustments
// Added CustomData
// Refactor - replaced "$('#stage1 .logicblock:nth-of-type('+(i+1)+') " with "$logicblock.find('" in getCode and setCode
// Fixed power/energy functions to handle negative values
// Added rotor.Angle
// Added getDegrees function



  $(document).ready(function(){
    $('.checkboxbutton').click(function(){
      clickCheckboxButton(this);
    });
    
    $(document).mouseup(function (e) {
      var container = $('.multiselectdata, .multiselect, .helpbox, .helpboxdata');
      if(!container.is(e.target) && container.has(e.target).length === 0) {
        hideAllMultiselectMenus();
      }
    });
    
    $(".imageswap").mouseover(function () {
      $(this).attr('src', $(this).data("hover"));
    }).mouseout(function () {
      $(this).attr('src', $(this).data("src"));
    });
    
    slideDrawer = function() {
      if($('.importdrawer').is(':visible')) {
        $('.importdrawer').slideUp(150);
      }
      else {
        $('.importdrawer').slideDown(150, function() {
          $('#import').focus();
        });
      }
    };
    
    // cookie saving scripts
    
    loadCookieScripts = function() {
      
      autosavedScript = localStorage['vsb_autosave'];
      
      var vsb_data = localStorage['vsb_data'];
      var savedScripts;
      if(vsb_data) {
        savedScripts = JSON.parse(vsb_data);
      }
      populateSavedScriptDropdown(savedScripts);
      
      if(autosavedScript != undefined) {
        $('.autosaved').show();
        $('.loadsaved').hide();
        $('.sidebyside').hide();
        $('.manage').hide();
      }
      else {
        $('.autosaved').hide();
        $('.loadsaved').show();
        $('.sidebyside').show();
        $('.manage').hide();
      }
    };
    
    populateSavedScriptDropdown = function(savedScripts) {
      var managetable = $('#managetable tbody');
      savedScriptNames = [];
      savedScriptLoadLines = [];
      savedScriptDates = [];
      $.each($(managetable).children('.scriptrow'), function(i, e) {
        $(this).remove();
      });
      if(savedScripts) {
        $.each(savedScripts.scripts, function(i, e) {
          var lastUpdated = e.date;
          
          var $today = new Date();
          var $yesterday = new Date($today);
          $yesterday.setDate($today.getDate() - 1);
          
          var today = $.datepicker.formatDate('d-M-yy', $today);
          var yesterday = $.datepicker.formatDate('d-M-yy', $yesterday);
          if(lastUpdated == today) {
            lastUpdated = 'Today';
          }
          else if (lastUpdated == yesterday) {
            lastUpdated = 'Yesterday';
          }
          //$(managetable).append('<tr class=\"scriptrow\"><td class=\"scriptname bold\" title=\"'+e.name+'\">'+e.name+'</td><td class=\"lastupdate bold\">'+lastUpdated+'</td><td class=\"load\"><button onmouseover=\"mouseOverLoadScript(this);\" onmouseout=\"mouseOutLoadDeleteScript(this);\" onclick=\"loadScriptById('+i+');\">Load</button></td><td class=\"deletesaved\"><button onmouseover=\"mouseOverDeleteScript(this);\" onmouseout=\"mouseOutLoadDeleteScript(this);\" onclick=\"deleteScript('+i+');\">Delete</button></td></tr>');
          $(managetable).append('<tr class=\"scriptrow\"><td class=\"scriptname bold\" title=\"'+e.name+'\" onmouseover=\"mouseOverLoadScript(this);\" onmouseout=\"mouseOutLoadDeleteScript(this);\" onclick=\"loadScriptById('+i+');\">'+e.name+'</td><td class=\"lastupdate bold\" onmouseover=\"mouseOverLoadScript(this);\" onmouseout=\"mouseOutLoadDeleteScript(this);\" onclick=\"loadScriptById('+i+');\">'+lastUpdated+'</td><td class=\"deletesaved\"><button onmouseover=\"mouseOverDeleteScript(this);\" onmouseout=\"mouseOutLoadDeleteScript(this);\" onclick=\"deleteScript('+i+');\">Delete</button></td></tr>');
          savedScriptNames.push(e.name);
          savedScriptLoadLines.push(e.loadline);
          savedScriptDates.push(e.date);
        });
      }
      if(savedScriptNames.length == 0) {
        // disable load dropdown and load/delete buttons
        $('#savedScriptSelect').attr('disabled', 'disabled');
        $('.load button').attr('disabled', 'disabled');
        $('.deletesaved button').attr('disabled', 'disabled');
        $('.load').addClass('disabled');
        $('.deletesaved').addClass('disabled');
        $('.loaddesc').hide();
        $('.loaddescempty').show();
        $('.loadicon').addClass('disabled');
        $('.loadtitle').addClass('disabled');
      }
      else {
        // enable load dropdown and load/delete buttons
        $('#savedScriptSelect').removeAttr('disabled');
        $('.load button').removeAttr('disabled');
        $('.deletesaved button').removeAttr('disabled');
        $('.load').removeClass('disabled');
        $('.deletesaved').removeClass('disabled');
        $('.loaddesc').show();
        $('.loaddescempty').hide();
        $('.loadicon').removeClass('disabled');
        $('.loadtitle').removeClass('disabled');
      }
    };
    
    saveToCookie = function(name, loadline, date) {
      savedScriptNames = [];
      savedScriptLoadLines = [];
      savedScriptDates = [];
      var newScripts = {
        "scripts": []
      };
      newScripts.scripts.push({"name":name, "loadline":loadline.replace(/\0/g, '\\\\0').replace(/\1/g, '\\\\1').replace(/\2/g, '\\\\2').replace(/\3/g, '\\\\3').replace(/\4/g, '\\\\4').replace(/\5/g, '\\\\5').replace(/\6/g, '\\\\6'), "date":date});
      savedScriptNames.push(name);
      savedScriptLoadLines.push(loadline);
      savedScriptDates.push(date);
      
      // TODO: make a function to load current data
      var vsb_data = localStorage['vsb_data'];
      var loadedScripts;
      if(vsb_data) {
        loadedScripts = JSON.parse(vsb_data);
        $.each(loadedScripts.scripts, function(i, e) {
          if(e.name != name) {
            savedScriptNames.push(e.name);
            savedScriptLoadLines.push(e.loadline);
            savedScriptDates.push(e.date);
            newScripts.scripts.push({"name":e.name, "loadline":e.loadline.replace(/\0/g, '\\\\0').replace(/\1/g, '\\\\1').replace(/\2/g, '\\\\2').replace(/\3/g, '\\\\3').replace(/\4/g, '\\\\4').replace(/\5/g, '\\\\5').replace(/\6/g, '\\\\6'), "date":e.date});
          }
        });
      }
      localStorage['vsb_data'] = JSON.stringify(newScripts);
      // delete autosave if script is saved manually
      localStorage.removeItem('vsb_autosave');
    };
    
    getSavedLoadLine = function(i) {
      if(savedScriptLoadLines.length > i) {
        return savedScriptLoadLines[i];
      }
      return "";
    };
    
    getSavedName = function(i) {
      if(savedScriptNames.length > i) {
        return savedScriptNames[i];
      }
      return "";
    };
    
    getSavedDate = function(i) {
      if(savedScriptDates.length > i) {
        return savedScriptDates[i];
      }
      return "";
    };
    
    saveScriptAs = function() {
      var saveName = $('#savename').val();
      var saveDate = $.datepicker.formatDate('d-M-yy', new Date());
      hideSaved();
      if($.trim(saveName) != "") {
        if(savedScriptNames.indexOf(saveName) > -1) {
          // overwrite script
          promptOverwriteScript(saveName);
        }
        else {
          saveToCookie(saveName, "//" + saved, saveDate);
          $('#saved').show(200);
          $('#savebutton').addClass('saved');
        }
      }
      else {
        $('#savename').addClass("saveempty");
      }
    };
    
    saveScriptAsOverwrite = function() {
      hideOverwriteScriptPrompt();
      var saveName = $('#savename').val();
      var saveDate = $.datepicker.formatDate('d-M-yy', new Date());
      if(saveName != "") {
        saveToCookie(saveName, "//" + saved, saveDate);
        $('#saved').show(200);
        $('#savebutton').addClass('saved');
      }
    };
    
    promptOverwriteScript = function(saveName) {
      hideHelp();
      var $temp = $('<div class="overlay" onClick="hideOverwriteScriptPrompt();" hidden="hidden"></div><div class="overwritePopup" hidden="hidden"><div class="deleteTitle">There is already a saved script with the name:<br>"'+saveName+'"</div><div class="deleteContent">Do you want to overwrite this script?<br>This cannot be undone!</div><div class="helpX unselectable" onClick="hideOverwriteScriptPrompt();">X</div><div class="confirmDelete"><button class="actualDeleteButton" onclick="saveScriptAsOverwrite();">Yes, Save Over Old Script</button></div><div class="confirmDelete"><button class="cancelDeleteButton" onclick="hideOverwriteScriptPrompt();">No, Choose Another Name</button></div></div>');
      $('.resultsection').append($temp);
      $('.overlay').fadeIn(200);
      $('.overwritePopup').fadeIn(200);
    };
    
    hideOverwriteScriptPrompt = function() {
      $('.overlay').fadeOut(200, function() {
        $('.overlay').remove();
      });
      $('.overwritePopup').fadeOut(200, function() {
        $('.overwritePopup').remove();
      });
    };
    
    promptDeleteScript = function(saveName) {
      hideHelp();
      var $temp = $('<div class="overlay" onClick="hideDeleteScriptPrompt();" hidden="hidden"></div><div class="deleteScriptPopup" hidden="hidden"><div class="deleteTitle">Are you sure you want to delete this script?<br>"'+saveName+'"</div><div class="deleteContent">This script will be permanently deleted!<br>This cannot be undone!</div><div class="helpX unselectable" onClick="hideDeleteScriptPrompt();">X</div><div class="confirmDelete"><button class="actualDeleteButton" onclick="deleteScriptByName(\''+saveName+'\');">Yes, Delete This Script</button></div><div class="confirmDelete"><button class="cancelDeleteButton" onclick="hideDeleteScriptPrompt();">No, Keep This Script</button></div></div>');
      $('.manage').append($temp);
      $('.overlay').fadeIn(200);
      $('.deleteScriptPopup').fadeIn(200);
    };
    
    hideDeleteScriptPrompt = function() {
      $('.overlay').fadeOut(200, function() {
        $('.overlay').remove();
      });
      $('.deleteScriptPopup').fadeOut(200, function() {
        $('.deleteScriptPopup').remove();
      });
    };
    
    autosave = function(loadLine) {
      if(!isLoading) {
        autosavedScript = loadLine;
        localStorage['vsb_autosave'] = loadLine;
      }
    };
    
    loadAutosave = function() {
      var loadLine = localStorage['vsb_autosave'];
      if(loadLine != undefined) {
        $('.autosaved').hide();
        loadSavedScript(loadLine);
      }
    };
    
    discardScript = function() {
      $('.autosaved').fadeOut(200, function() {
        $('.autosaved').hide();
        $('.loadsaved').show();
        $('.sidebyside').show();
        localStorage.removeItem('vsb_autosave');
      });
    };
    
    deleteScript = function(i) {
      var saveName = getSavedName(i);
      if(savedScriptNames.length > i && savedScriptNames.indexOf(saveName) > -1) {
        promptDeleteScript(saveName);
      }
    };
    
    deleteScriptByName = function(name) {
      hideDeleteScriptPrompt();
      savedScriptNames = [];
      savedScriptLoadLines = [];
      savedScriptDates = [];
      var newScripts = {
        "scripts": []
      };
      
      // TODO: make a function to load current data
      var vsb_data = localStorage['vsb_data'];
      var loadedScripts;
      if(vsb_data) {
        loadedScripts = JSON.parse(vsb_data);
        $.each(loadedScripts.scripts, function(i, e) {
          if(e.name != name) {
            savedScriptNames.push(e.name);
            savedScriptLoadLines.push(e.loadline);
            savedScriptDates.push(e.date);
            newScripts.scripts.push({"name":e.name, "loadline":e.loadline.replace(/\0/g, '\\\\0').replace(/\1/g, '\\\\1').replace(/\2/g, '\\\\2').replace(/\3/g, '\\\\3').replace(/\4/g, '\\\\4').replace(/\5/g, '\\\\5').replace(/\6/g, '\\\\6'), "date":e.date});
          }
        });
      }
      localStorage['vsb_data'] = JSON.stringify(newScripts);
      loadCookieScripts();
      if(newScripts.scripts.length > 0) {
        showManage();
      }
      else {
        hideManage();
      }
    };
    
    newScript = function() {
      transitionToScriptingScreen();
      $('.thisGridButton').addClass('selected');
    };
    
    importScript = function() {
      if($('#import').val().trim() != "") {
        transitionToScriptingScreen();
        loadShort($('#import').val());
      }
    };
    
    loadScript = function() {
      if(savedScriptNames.length > 0) {
        $('#savename').val(getSavedName($('#savedScriptSelect').val()));
        loadSavedScript(getSavedLoadLine($('#savedScriptSelect').val()));
      }
    };
    
    loadScriptById = function(i) {
      if(savedScriptNames.length > i) {
        $('#savename').val(getSavedName(i));
        loadSavedScript(getSavedLoadLine(i));
      }
    };
    
    loadSavedScript = function(loadLine) {
      transitionToScriptingScreen();
      loadShort(loadLine);
    };
    
    transitionToScriptingScreen = function() {
      $('.autosaved').hide();
      $('.sidebyside').hide();
      $('.manage').hide();
      $('.scriptcreation').show();
      $('.resultsection').show();
      $('.forceLeft').show();
    };
    
    showManage = function() {
      if(savedScriptNames.length > 0) {
        $('.manage').show();
        $('.sidebyside').hide();
      }
      else {
        hideManage();
      }
    };
    
    hideManage = function() {
      $('.manage').hide();
      $('.sidebyside').show();
      $('.importdrawer').hide();
    };
    
    // end cookie saving scripts
    
    hideAllMultiselectMenus = function() {
      $('.multiselectdata').each(function (i) {
        $(this).attr('hidden', 'hidden');
      });
      hideAllHelpBoxData();
    };
    
    hideAllHelpBoxData = function() {
      $('.helpboxdata').each(function (i) {
        $(this).fadeOut(100);
      });
    };
    
    showSubRow = function(e) {
      hideAllMultiselectMenus();
      if($($(e).next()).find('.multiselectOption').length > 1) {
        $(e).next().removeAttr('hidden');
      }
    };
    
    showHelpBox = function(e) {
      if(!$(e).is(':focus')) {
        $(e).focus();
      }
      if($(e).next().is(':visible') == false) {
        hideAllMultiselectMenus();
        $(e).next().fadeIn(100);
      }
    };
    
    hideInstructions = function() {
      $('.hide').hide();
      $('.show').show();
      $('.instructions').hide();
    };
    
    showInstructions = function() {
      $('.show').hide();
      $('.hide').show();
      $('.instructions').show();
    };
    
    showHideLoadBox = function() {
      if($('#stage1 .logicblock').length == 0) {
        $('.sidebyside').show();
        $('.scriptcreation').hide();
        $('.resultsection').hide();
        $('.forceLeft').hide();
      }
      else {
        $('.sidebyside').hide();
        $('.scriptcreation').show();
        $('.resultsection').show();
        $('.forceLeft').show();
      }
    };
    
    showCopyToClipboardButton = function() {
      $('#generate').hide();
      //$('#copy').show();
      $('.copysavesection').show();
      needsUpdate = false;
      $('#result').removeAttr('disabled');
    };
    
    showGenerateScriptButton = function() {
      //$('#copy').hide();
      $('.copysavesection').hide();
      $('#generate').show();
      needsUpdate = true;
      $('#result').attr('disabled', 'disabled');
    };
    
    stateChanged = function() {
      if(autoRecompile == true) {
        generateScript();
      }
      else {
        var startTime = window.performance.now();
        if(!needsUpdate) {
          showGenerateScriptButton();
        }
        updateInventories();
        updateOverview();
        $('#copied').hide(200);
        $('#copy').removeClass('copied');
        hideSaved();
        var compileTime = Math.floor(window.performance.now() - startTime);
        console.log("partial compile time "+compileTime);
      }
    };
    
    hideSaved = function() {
      $('#saved').hide(200);
      $('#savebutton').removeClass('saved');
      $('#savename').removeClass('saveempty');
    };
    
    inputUpdated = function(e) {
      //var value = $(e).val().replace(/ /g, '').replace(/\./g, '').replace(/\=/g, '').replace(/\</g, '').replace(/\>/g, '').replace(/\,/g, '');
      //$(e).val(value);
      lockBlockTypeChange(e);
      var button = $(e).parent().find('button');
      if(button.length == 0) {
        button = $(e).parent().siblings('button');
      }
      if(button.length > 0) {
        if(!button.hasClass('selected') && $(e).val() != "") {
          button.click();
        }
        else if(button.hasClass('selected') && $(e).val() == "") {
          button.click();
        }
        else {
          stateChanged();
          //generateScript();
        }
      }
      else {
        stateChanged();
        //generateScript();
      }
    };
    
    doubleInputUpdated = function(e) {
      lockBlockTypeChange(e);
      var button = $(e).parents('td').find('button');
      var inputs = $(e).parents('td').find('input');
      if(button.length > 0) {
        if(!button.hasClass('selected') && ($($(inputs)[0]).val() != "" || $($(inputs)[1]).val() != "")) {
          button.click();
        }
        else if(button.hasClass('selected') && $($(inputs)[0]).val() == "" && $($(inputs)[1]).val() == "") {
          button.click();
        }
        else {
          stateChanged();
          //generateScript();
        }
      }
      else {
        stateChanged();
        //generateScript();
      }
    };
    
    doubleRequiredInputUpdated = function(e) {
      lockBlockTypeChange(e);
      var button = $(e).parents('td').find('button');
      var inputs = $(e).parents('td').find('input');
      if(button.length > 0) {
        if(!button.hasClass('selected') && $($(inputs)[0]).val() != "" && $($(inputs)[1]).val() != "") {
          button.click();
        }
        else if(button.hasClass('selected') && ($($(inputs)[0]).val() == "" || $($(inputs)[1]).val() == "")) {
          button.click();
        }
        else {
          stateChanged();
          //generateScript();
        }
      }
      else {
        stateChanged();
        //generateScript();
      }
    };
    
    boolSelectUpdated = function(e) {
      //var value = $(e).val().replace(/ /g, '').replace(/\./g, '').replace(/\=/g, '').replace(/\+/g, '').replace(/-/g, '').replace(/\</g, '').replace(/\>/g, '').replace(/\,/g, '');
      //$(e).val(value);
      lockBlockTypeChange(e);
      var button = $(e).parent().find('button');
      if(button.length > 0) {
        if(!button.hasClass('selected') && $(e).val() != "") {
          button.click();
        }
        else if(button.hasClass('selected') && $(e).val() == "") {
          button.click();
        }
        else {
          stateChanged();
          //generateScript();
        }
      }
      else {
        stateChanged();
        //generateScript();
      }
    };
    
    hideShowFields = function(e) {
      if(!$('.popup').is(':visible')) {
        if($(e).html() == "[hide]") {
          $(e).html("[show]");
          /*$.each($(e).parents('.blocktable').find('.field'), function() {
            $(this).hide();
          });*/
          $(e).parents('.blocktable').find('.field').hide();
        }
        else {
          $(e).html("[hide]");
          /*$.each($(e).parents('.blocktable').find('.field'), function() {
            //$(this).show();
          });*/
          $(e).parents('.blocktable').find('.field').show();
        }
        if(!isLoading) {
          //generateScript();
          stateChanged();
        }
      }
    };
    
    hideShowExtraFields = function(e) {
      if(!$('.popup').is(':visible')) {
        if($(e).html() == "[hide]") {
          $(e).html("[show]");
          $(e).parents('.blocktable').find('.extrafield').hide();
        }
        else {
          $(e).html("[hide]");
          $(e).parents('.blocktable').find('.extrafield').show();
        }
        if(!isLoading) {
          //generateScript();
          stateChanged();
        }
      }
    };
    
    hideShowProps = function(e) {
      if(!$('.popup').is(':visible')) {
        if($(e).html() == "[hide]") {
          $(e).html("[show]");
          $.each($(e).parents('.blocktable').find('.property'), function() {
            $(this).hide();
          });
        }
        else {
          $(e).html("[hide]");
          $.each($(e).parents('.blocktable').find('.property'), function() {
            $(this).show();
          });
        }
        if(!isLoading) {
          //generateScript();
          stateChanged();
        }
      }
    };
    
    hideShowActions = function(e) {
      if(!$('.popup').is(':visible')) {
        if($(e).html() == "[hide]") {
          $(e).html("[show]");
          $.each($(e).parents('.blocktable').find('.action'), function() {
            $(this).hide();
          });
        }
        else {
          $(e).html("[hide]");
          $.each($(e).parents('.blocktable').find('.action'), function() {
            $(this).show();
          });
        }
        if(!isLoading) {
          //generateScript();
          stateChanged();
        }
      }
    };
    
    hideShowInventory = function(e, i) {
      if(!$('.popup').is(':visible')) {
        if($(e).html() == "[hide]") {
          $(e).html("[show]");
          $.each($(e).parents('.blocktable').find('.inv'+i), function() {
            $(this).hide();
          });
        }
        else {
          $(e).html("[hide]");
          $.each($(e).parents('.blocktable').find('.inv'+i), function() {
            $(this).show();
          });
        }
        if(!isLoading) {
          //generateScript();
          stateChanged();
        }
      }
    };
    
    hideShowMath = function(e) {
      if(!$('.popup').is(':visible')) {
        if($(e).html() == "[hide]") {
          $(e).html("[show]");
          $.each($(e).parents('.blocktable').find('.math'), function() {
            $(this).hide();
          });
        }
        else {
          $(e).html("[hide]");
          $.each($(e).parents('.blocktable').find('.math'), function() {
            $(this).show();
          });
        }
        if(!isLoading) {
          //generateScript();
          stateChanged();
        }
      }
    };
    
    hideShowCode = function(e) {
      if(!$('.popup').is(':visible')) {
        if($(e).html() == "[hide]") {
          $(e).html("[show]");
          $.each($(e).parents('.blocktable').find('.code'), function() {
            $(this).hide();
          });
        }
        else {
          $(e).html("[hide]");
          $.each($(e).parents('.blocktable').find('.code'), function() {
            $(this).show();
          });
        }
        if(!isLoading) {
          //generateScript();
          stateChanged();
        }
      }
    };
    
    /*
    mouseOverColor = function(e) {
      $(e).css('padding-bottom', '211px');
      //$(e).css('border', '1px solid black');
    };
    
    mouseOutColor = function(e) {
      $(e).css('padding-bottom', '');
      //$(e).css('border', '');
    };
    */
    
    mouseOverLoadScript = function(e) {
      $(e).parents('tr').css('background-color', '#6bf0fd');
      //$(e).css('background-color', '#6bf0fd');
    };
    
    mouseOverDeleteScript = function(e) {
      $(e).parents('tr').css('background-color', '#f34747');
    };
    
    mouseOutLoadDeleteScript = function(e) {
      $(e).parents('tr').css('background-color', '');
      //$(e).css('background-color', '');
    };
    
    mouseOverDelete = function(e) {
      $(e).parents('.logicblock').css('background-color', '#FFFF7F');
    };
    
    mouseOutDelete = function(e) {
      if($(e).parent().find('.deletePopup').length == 0) {
        $(e).parents('.logicblock').css('background-color', '');
      }
    };
    
    mouseOverHighlight = function(i) {
      $('.logicblock:nth-of-type('+(i+1)+')').css('background-color', '#92ffe4');
      //$('.overviewitem'+i).css('background-color', '#92ffe4');
      //$('.overviewitem'+i).css('color', '#0000FF');
      $('.overviewitem'+i).addClass('mouseOverHighlight');
      //$('.logicblock:nth-of-type('+(i+1)+')').addClass('mouseOverHighlight');
      //$(e).css('background-color', '#FFFFFF');
    };
    
    mouseOutHighlight = function(i) {
      $('.logicblock:nth-of-type('+(i+1)+')').css('background-color', '');
      //$('.overviewitem'+i).css('background-color', '');
      //$('.overviewitem'+i).css('color', '');
      $('.overviewitem'+i).removeClass('mouseOverHighlight');
      //$('.logicblock:nth-of-type('+(i+1)+')').removeClass('mouseOverHighlight');
      //$(e).css('background-color', '');
    };
    
    mouseOverAppend = function(e) {
      $(e).parents('.logicblock').css('border-bottom', '4px solid #41CA4F');
      $(e).parents('.logicblock').css('margin-bottom', '8px');
      $(e).parents('.logicblock').css('padding-bottom', '0px');
      //$(e).css('color', '#41CA4F');
      //$(e).parents('.logicblock').css('box-shadow', '#41CA4F 0px 4px 5px -3px');
    };
    
    mouseOutAppend = function(e) {
      $(e).parents('.logicblock').css('border-bottom', '');
      $(e).parents('.logicblock').css('margin-bottom', '');
      $(e).parents('.logicblock').css('padding-bottom', '');
      //$(e).css('color', '');
      //$(e).parents('.logicblock').css('box-shadow', '');
    };
    
    mouseOverFirst = function() {
      $('.headerButtons').css('border-bottom', '4px solid #41CA4F');
      $('.headerButtons').css('margin-bottom', '0px');
      $('.headerButtons').css('padding-bottom', '8px');
      //$('.headerButtons').css('box-shadow', '#41CA4F 0px 4px 5px -3px');
    };
    
    mouseOutFirst = function() {
      $('.headerButtons').css('border-bottom', '');
      $('.headerButtons').css('margin-bottom', '');
      $('.headerButtons').css('padding-bottom', '');
      //$('.headerButtons').css('box-shadow', '');
    };
    
    copyScriptToClipboard = function () {
      var $temp = $("<textarea>");
      $("body").append($temp);
      $temp.val(result).select();
      document.execCommand("copy");
      $temp.remove();
      $('#copied').show(200);
      $('#copy').addClass('copied');
    };

    /*
    $.each(items, function(){
        $("<option />").attr("value", this.value).html(this.name).appendTo("#blockmenu");
        temp[this.value] = this.subitems;
    });*/
    var savedScriptNames = [];
    var savedScriptLoadLines = [];
    var savedScriptDates = [];
    var autosavedScript = "";
    var saved = "";
    
    var versionNumber = "1.1.1";
    var tempActions = {};
    var tempFields = {};
    var tempFieldTypes = {};
    var tempProperties = {};
    var tempPropertyTypes = {};
    var tempExtraFields = {};
    var tempExtraFieldTypes = {};
    var tempInventories = {};
    var script = [];
    var errorlines = [];
    var errors = [];
    var result = "";
    // list of all block types, starting with a blank block
    var domainBlocks = [];
    // list of indexes mapping the blocks used in the script to the variable numbers
    // i.e. [0, 1, 0, 2, 2, 3, 0] - the first, third, and last chunks all are the same block, v0.
    var namedBlockIndexes = [];
    // list of blocks used in the script
    // each block appears once
    // ordered by first appearance of the block
    var blocks = [];
    var logicIndexes = [];
    var userVariables = [];
    var userVariableTypes = [];
    var userBools = [];
    var userStrings = [];
    var userFloats = [];
    var userInventories = [];
    var userPowers = [];
    var userEnergies = [];
    // list of Block Name input values, no duplicates
    var blockNameList = [];
    // list of Group Name input values, no duplicates
    var groupNameList = [];
    var chunks = 0;
    var indent = 1;
    var inIfBlock = 0;
    var doneCode = 0;
    var indentColor = 'lightblue';
    var initialHideInstructions = true;
    var fieldButtonText = 'Check Field';
    var propButtonText = 'Set Prop';
    var actionButtonText = 'Apply Action';
    var extraFieldFunctionNeededString = false;
    var extraFieldFunctionNeededFloat = false;
    var extraFieldFunctionNeededDegrees = false;
    var countItemFunctionNeeded = false;
    var transferItemToFunctionNeeded = false;
    var transferItemFromFunctionNeeded = false;
    var transferItemFunctionNeeded = false;
    //var getAmountFunctionNeeded = false;
    var powerFormatFunctionNeeded = false;
    var energyFormatFunctionNeeded = false;
    var thisGridOnlyFunctionNeeded = false;
    var thisOxygenFilterFunctionNeeded = false;
    var thisHydrogenFilterFunctionNeeded = false;
    var oxygenFilterFunctionNeeded = false;
    var hydrogenFilterFunctionNeeded = false;
    var MAX_POWER_PRECISION = 9;
    var MAX_ENERGY_PRECISION = 9;
    var usetooltips = true;
    //var gridName = "";
    var thisGridOnly = false;
    var filter = "";
    var isLoading = false;
    var needsUpdate = false;
    var allowMissingBlocks = false;
    
    // auto-recompile
    // script will automatically compile/generate until compile time is above AUTO_RECOMPILE_HIGH
    // auto-compile will turn back on when compile time drops below AUTO_RECOMPILE_LOW
    var autoRecompile = true;
    var AUTO_RECOMPILE_HIGH = 75;
    var AUTO_RECOMPILE_LOW = 50;
    
    var lcdHelp = '<b>LCD/Text Panel Formatting</b><br>'+
                  '<br>'+
                  'Use brackets to display variables.<br>'+
                  'Some text <b>[variableName]</b> some more text<br>'+
                  'Example:  Battery Power: <b>[power]</b><br>'+
                  'Result:  Battery Power: 3.00MWh<br>'+
                  '<br>'+
                  'Boolean variables can display conditional text.<br>'+
                  '<b>[variableName?TEXT IF TRUE:TEXT IF FALSE]</b><br>'+
                  'Example:  <b>[lightsOn?Lights are On:Lights are Off]</b><br>'+
                  'Result:  Lights are On<br>'+
                  '<br>'+
                  'Double brackets allow any logic to be performed.<br>'+
                  'WARNING: This has no validation. Anything entered will be run.<br>'+
                  'Text <b>[[any code/variables/math you want to use]]</b> more text<br>'+
                  'Example: Power Remaining: <b>[[100*currentPower/maxPower]]</b>%<br>'+
                  'Result:  Power Remaining: 75.1482%<br>'+
                  '<br>'+
                  '<a target=\"_blank\" href=\"http://dco.pe#LCD\">Detailed Formatting Help (opens in new tab)</a>';
                  
    var ifCodeHelp = '<b>Conditional Code</b><br>'+
                  '<br>'+
                  'This section allows you to write custom IF code.<br>'+
                  'Conditional Code is executed inside an IF statement.<br>'+
                  'if(<b>your custom code<b>) {<br><br>'+
                  'Example:  myVariable == "something"<br>'+
                  'Code:     if(myVariable == "something") {<br>'+
                  '<br>'+
                  'This custom code can also be mixed in with other logic.<br>'+
                  'You could use a standard IF block to check if a block<br>'+
                  'is enabled, then use AND to add your custom code.<br>'+
                  'Both conditions will be checked inside the same IF.<br><br>'+
                  'The result would look something like this:<br>'+
                  'if(v0.Enabled == true && myVariable == "something") {<br>'+
                  '...<br>'+
                  '}';
                  
    var doCodeHelp = '<b>Action Code</b><br>'+
                  '<br>'+
                  'This section allows you to write custom DO code.<br>'+
                  'Code will be executed just like applying actions,<br>'+
                  'setting properties, and saving values.<br><br>'+
                  'This Action Code is different from the '+
                  'Conditional Code in that this code doesn\'t '+
                  'need to resolve to a boolean, and it won\'t '+
                  'be run inside an IF block.<br><br>'+
                  'Example:  myVariable == "something";<br>'+
                  'Code:     myVariable == "something";<br>'+
                  '<br>'+
                  'This custom code can be mixed in with other logic.<br>'+
                  'You could use a standard IF block to check if a block<br>'+
                  'is enabled, then use DO to add your custom code.<br>'+
                  'Your code will only be run if the condition is true.<br><br>'+
                  'The result would look something like this:<br>'+
                  'if(v0.Enabled == true) {<br>'+
                  'myVariable == "something";<br>'+
                  '}';
                  
    //var invComponents = {[], []};
    //this.inventory = {};
    //this.inventory.push(invComponents);
    
    var componentsInventory = [];
    componentsInventory.push(new Item("Construction Component", "Component", "Construction"));
    componentsInventory.push(new Item("Metal Grid", "Component", "MetalGrid"));
    componentsInventory.push(new Item("Interior Plate", "Component", "InteriorPlate"));
    componentsInventory.push(new Item("Steel Plate", "Component", "SteelPlate"));
    componentsInventory.push(new Item("Girder", "Component", "Girder"));
    componentsInventory.push(new Item("Small Tube", "Component", "SmallTube"));
    componentsInventory.push(new Item("Large Tube", "Component", "LargeTube"));
    componentsInventory.push(new Item("Motor", "Component", "Motor"));
    componentsInventory.push(new Item("Display", "Component", "Display"));
    componentsInventory.push(new Item("Bulletproof Glass", "Component", "BulletproofGlass"));
    componentsInventory.push(new Item("Superconductor Conduit", "Component", "Superconductor"));
    componentsInventory.push(new Item("Computer", "Component", "Computer"));
    componentsInventory.push(new Item("Reactor", "Component", "Reactor"));
    componentsInventory.push(new Item("Thruster Component", "Component", "Thrust"));
    componentsInventory.push(new Item("Gravity Generator Component", "Component", "GravityGenerator"));
    componentsInventory.push(new Item("Medical Component", "Component", "Medical"));
    componentsInventory.push(new Item("Radio-communication Component", "Component", "RadioCommunication"));
    componentsInventory.push(new Item("Detector Component", "Component", "Detector"));
    componentsInventory.push(new Item("Explosives", "Component", "Explosives"));
    componentsInventory.push(new Item("Solar Cell", "Component", "SolarCell"));
    componentsInventory.push(new Item("Power Cell", "Component", "PowerCell"));
    componentsInventory.push(new Item("Welder", "PhysicalGunObject", "WelderItem"));
    componentsInventory.push(new Item("Enhanced Welder", "PhysicalGunObject", "Welder2Item"));
    componentsInventory.push(new Item("Proficient Welder", "PhysicalGunObject", "Welder3Item"));
    componentsInventory.push(new Item("Elite Welder", "PhysicalGunObject", "Welder4Item"));
    componentsInventory.push(new Item("Grinder", "PhysicalGunObject", "AngleGrinderItem"));
    componentsInventory.push(new Item("Enhanced Grinder", "PhysicalGunObject", "AngleGrinder2Item"));
    componentsInventory.push(new Item("Proficient Grinder", "PhysicalGunObject", "AngleGrinder3Item"));
    componentsInventory.push(new Item("Elite Grinder", "PhysicalGunObject", "AngleGrinder4Item"));
    componentsInventory.push(new Item("Drill", "PhysicalGunObject", "HandDrillItem"));
    componentsInventory.push(new Item("Enhanced Drill", "PhysicalGunObject", "HandDrill2Item"));
    componentsInventory.push(new Item("Proficient Drill", "PhysicalGunObject", "HandDrill3Item"));
    componentsInventory.push(new Item("Elite Drill", "PhysicalGunObject", "HandDrill4Item"));
    componentsInventory.push(new Item("Oxygen Bottle", "OxygenContainerObject", "OxygenBottle"));
    componentsInventory.push(new Item("Hydrogen Bottle", "GasContainerObject", "HydrogenBottle"));
    componentsInventory.push(new Item("Missile Container", "AmmoMagazine", "Missile200mm"));
    componentsInventory.push(new Item("Ammo Container", "AmmoMagazine", "NATO_25x184mm"));
    componentsInventory.push(new Item("Magazine", "AmmoMagazine", "NATO_5p56x45mm"));
    
    var missilesInventory = [];
    missilesInventory.push(new Item("Missile Container", "AmmoMagazine", "Missile200mm"));
    
    var largeBulletsInventory = [];
    largeBulletsInventory.push(new Item("Ammo Container", "AmmoMagazine", "NATO_25x184mm"));
    
    var smallBulletsInventory = [];
    smallBulletsInventory.push(new Item("Magazine", "AmmoMagazine", "NATO_5p56x45mm"));
    
    var toolsInventory = [];
    toolsInventory.push(new Item("Welder", "PhysicalGunObject", "WelderItem"));
    toolsInventory.push(new Item("Enhanced Welder", "PhysicalGunObject", "Welder2Item"));
    toolsInventory.push(new Item("Proficient Welder", "PhysicalGunObject", "Welder3Item"));
    toolsInventory.push(new Item("Elite Welder", "PhysicalGunObject", "Welder4Item"));
    toolsInventory.push(new Item("Grinder", "PhysicalGunObject", "AngleGrinderItem"));
    toolsInventory.push(new Item("Enhanced Grinder", "PhysicalGunObject", "AngleGrinder2Item"));
    toolsInventory.push(new Item("Proficient Grinder", "PhysicalGunObject", "AngleGrinder3Item"));
    toolsInventory.push(new Item("Elite Grinder", "PhysicalGunObject", "AngleGrinder4Item"));
    toolsInventory.push(new Item("Drill", "PhysicalGunObject", "HandDrillItem"));
    toolsInventory.push(new Item("Enhanced Drill", "PhysicalGunObject", "HandDrill2Item"));
    toolsInventory.push(new Item("Proficient Drill", "PhysicalGunObject", "HandDrill3Item"));
    toolsInventory.push(new Item("Elite Drill", "PhysicalGunObject", "HandDrill4Item"));
    
    var oresInventory = [];
    oresInventory.push(new Item("Cobalt Ore", "Ore", "Cobalt"));
    oresInventory.push(new Item("Gold Ore", "Ore", "Gold"));
    oresInventory.push(new Item("Iron Ore", "Ore", "Iron"));
    oresInventory.push(new Item("Magnesium Ore", "Ore", "Magnesium"));
    oresInventory.push(new Item("Nickel Ore", "Ore", "Nickel"));
    oresInventory.push(new Item("Platinum Ore", "Ore", "Platinum"));
    oresInventory.push(new Item("Silicon Ore", "Ore", "Silicon"));
    oresInventory.push(new Item("Silver Ore", "Ore", "Silver"));
    oresInventory.push(new Item("Stone", "Ore", "Stone"));
    oresInventory.push(new Item("Uranium Ore", "Ore", "Uranium"));
    
    var ingotsInventory = [];
    ingotsInventory.push(new Item("Cobalt Ingot", "Ingot", "Cobalt"));
    ingotsInventory.push(new Item("Gold Ingot", "Ingot", "Gold"));
    ingotsInventory.push(new Item("Iron Ingot", "Ingot", "Iron"));
    ingotsInventory.push(new Item("Magnesium Powder", "Ingot", "Magnesium"));
    ingotsInventory.push(new Item("Nickel Ingot", "Ingot", "Nickel"));
    ingotsInventory.push(new Item("Platinum Ingot", "Ingot", "Platinum"));
    ingotsInventory.push(new Item("Silicon Wafer", "Ingot", "Silicon"));
    ingotsInventory.push(new Item("Silver Ingot", "Ingot", "Silver"));
    ingotsInventory.push(new Item("Gravel", "Ingot", "Stone"));
    ingotsInventory.push(new Item("Uranium Ingot", "Ingot", "Uranium"));
    
    var uraniumInventory = [];
    uraniumInventory.push(new Item("Uranium Ingot", "Ingot", "Uranium"));
    
    var iceInventory = [];
    iceInventory.push(new Item("Ice", "Ore", "Ice"));
    iceInventory.push(new Item("Oxygen Bottle", "OxygenContainerObject", "OxygenBottle"));
    iceInventory.push(new Item("Hydrogen Bottle", "GasContainerObject", "HydrogenBottle"));
    
    var oxyInventory = [];
    oxyInventory.push(new Item("Oxygen Bottle", "OxygenContainerObject", "OxygenBottle"));
    
    var hydrogenInventory = [];
    hydrogenInventory.push(new Item("Hydrogen Bottle", "GasContainerObject", "HydrogenBottle"));
    
    var allInventory = [];
    allInventory.push(new Item("Cobalt Ore", "Ore", "Cobalt"));
    allInventory.push(new Item("Gold Ore", "Ore", "Gold"));
    allInventory.push(new Item("Iron Ore", "Ore", "Iron"));
    allInventory.push(new Item("Magnesium Ore", "Ore", "Magnesium"));
    allInventory.push(new Item("Nickel Ore", "Ore", "Nickel"));
    allInventory.push(new Item("Platinum Ore", "Ore", "Platinum"));
    allInventory.push(new Item("Silicon Ore", "Ore", "Silicon"));
    allInventory.push(new Item("Silver Ore", "Ore", "Silver"));
    allInventory.push(new Item("Stone", "Ore", "Stone"));
    allInventory.push(new Item("Uranium Ore", "Ore", "Uranium"));
    allInventory.push(new Item("Cobalt Ingot", "Ingot", "Cobalt"));
    allInventory.push(new Item("Gold Ingot", "Ingot", "Gold"));
    allInventory.push(new Item("Iron Ingot", "Ingot", "Iron"));
    allInventory.push(new Item("Magnesium Powder", "Ingot", "Magnesium"));
    allInventory.push(new Item("Nickel Ingot", "Ingot", "Nickel"));
    allInventory.push(new Item("Platinum Ingot", "Ingot", "Platinum"));
    allInventory.push(new Item("Silicon Wafer", "Ingot", "Silicon"));
    allInventory.push(new Item("Silver Ingot", "Ingot", "Silver"));
    allInventory.push(new Item("Gravel", "Ingot", "Stone"));
    allInventory.push(new Item("Uranium Ingot", "Ingot", "Uranium"));
    allInventory.push(new Item("Ice", "Ore", "Ice"));
    allInventory.push(new Item("Oxygen Bottle", "OxygenContainerObject", "OxygenBottle"));
    allInventory.push(new Item("Hydrogen Bottle", "GasContainerObject", "HydrogenBottle"));
    allInventory.push(new Item("Construction Component", "Component", "Construction"));
    allInventory.push(new Item("Metal Grid", "Component", "MetalGrid"));
    allInventory.push(new Item("Interior Plate", "Component", "InteriorPlate"));
    allInventory.push(new Item("Steel Plate", "Component", "SteelPlate"));
    allInventory.push(new Item("Girder", "Component", "Girder"));
    allInventory.push(new Item("Small Tube", "Component", "SmallTube"));
    allInventory.push(new Item("Large Tube", "Component", "LargeTube"));
    allInventory.push(new Item("Motor", "Component", "Motor"));
    allInventory.push(new Item("Display", "Component", "Display"));
    allInventory.push(new Item("Bulletproof Glass", "Component", "BulletproofGlass"));
    allInventory.push(new Item("Superconductor Conduit", "Component", "Superconductor"));
    allInventory.push(new Item("Computer", "Component", "Computer"));
    allInventory.push(new Item("Reactor", "Component", "Reactor"));
    allInventory.push(new Item("Thruster Component", "Component", "Thrust"));
    allInventory.push(new Item("Gravity Generator Component", "Component", "GravityGenerator"));
    allInventory.push(new Item("Medical Component", "Component", "Medical"));
    allInventory.push(new Item("Radio-communication Component", "Component", "RadioCommunication"));
    allInventory.push(new Item("Detector Component", "Component", "Detector"));
    allInventory.push(new Item("Explosives", "Component", "Explosives"));
    allInventory.push(new Item("Solar Cell", "Component", "SolarCell"));
    allInventory.push(new Item("Power Cell", "Component", "PowerCell"));
    allInventory.push(new Item("Welder", "PhysicalGunObject", "WelderItem"));
    allInventory.push(new Item("Enhanced Welder", "PhysicalGunObject", "Welder2Item"));
    allInventory.push(new Item("Proficient Welder", "PhysicalGunObject", "Welder3Item"));
    allInventory.push(new Item("Elite Welder", "PhysicalGunObject", "Welder4Item"));
    allInventory.push(new Item("Grinder", "PhysicalGunObject", "AngleGrinderItem"));
    allInventory.push(new Item("Enhanced Grinder", "PhysicalGunObject", "AngleGrinder2Item"));
    allInventory.push(new Item("Proficient Grinder", "PhysicalGunObject", "AngleGrinder3Item"));
    allInventory.push(new Item("Elite Grinder", "PhysicalGunObject", "AngleGrinder4Item"));
    allInventory.push(new Item("Drill", "PhysicalGunObject", "HandDrillItem"));
    allInventory.push(new Item("Enhanced Drill", "PhysicalGunObject", "HandDrill2Item"));
    allInventory.push(new Item("Proficient Drill", "PhysicalGunObject", "HandDrill3Item"));
    allInventory.push(new Item("Elite Drill", "PhysicalGunObject", "HandDrill4Item"));
    allInventory.push(new Item("Missile Container", "AmmoMagazine", "Missile200mm"));
    allInventory.push(new Item("Ammo Container", "AmmoMagazine", "NATO_25x184mm"));
    allInventory.push(new Item("Magazine", "AmmoMagazine", "NATO_5p56x45mm"));
    
    //block.inventory(0).items(i).name;
    
    //function saveData(rawdata) {
    //  this.
    //}
    
    function Inventory(items) {
      this.items = items;
      this.fields = ["IsFull", "CurrentMass", "MaxVolume", "CurrentVolume", "IsConnectedTo"];
      this.fieldTypes = ["bool", "floatcast", "floatcast", "floatcast", "connected"];
    };
    
    function Item(name, typeId, subTypeId) {
      this.name = name;
      this.typeId = typeId;
      this.subTypeId = subTypeId;
    };
    
    // representation of a type of block
    // each type of block should appear once in this domain data list
    function DomainBlock(id, name, type, fields, fieldTypes, properties, propertyTypes, actions) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.fields = fields;
      this.fieldTypes = fieldTypes;
      if(name != "") {
        //this.fields.push("Enabled");
        this.fields.push("IsBeingHacked");
        this.fields.push("IsFunctional");
        this.fields.push("IsWorking");
        //this.fieldTypes.push("bool");
        this.fieldTypes.push("bool");
        this.fieldTypes.push("bool");
        this.fieldTypes.push("bool");
      }
      this.properties = properties;
      this.propertyTypes = propertyTypes;
      this.actions = actions;
      this.extraFields = [];
      this.extraFieldTypes = [];
      this.extraFieldRegexes = [];
      this.inventories = [];
    };
    
    // constructor with extraFields that can be found in the DetailedInfo, types, and the regex needed for each
    function DomainBlock(id, name, type, fields, fieldTypes, properties, propertyTypes, actions, extraFields, extraFieldTypes, extraFieldRegexes) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.fields = fields;
      this.fieldTypes = fieldTypes;
      if(name != "") {
        //this.fields.push("Enabled");
        this.fields.push("IsBeingHacked");
        this.fields.push("IsFunctional");
        this.fields.push("IsWorking");
        //this.fieldTypes.push("bool");
        this.fieldTypes.push("bool");
        this.fieldTypes.push("bool");
        this.fieldTypes.push("bool");
      }
      this.properties = properties;
      this.propertyTypes = propertyTypes;
      this.properties.push("OnOff");
      this.propertyTypes.push("bool");
      this.actions = actions;
      if(extraFields != undefined) {
        this.extraFields = extraFields;
      }
      else {
        this.extraFields = [];
      }
      if(extraFieldTypes != undefined) {
        this.extraFieldTypes = extraFieldTypes;
      }
      else {
        this.extraFieldTypes = [];
      }
      if(extraFieldRegexes != undefined) {
        this.extraFieldRegexes = extraFieldRegexes;
      }
      else {
        this.extraFieldRegexes = [];
      }
      this.inventories = [];
    };
    
    // constructor with extraFields that can be found in the DetailedInfo, types, and the regex needed for each
    // also includes cargo information
    function DomainBlock(id, name, type, fields, fieldTypes, properties, propertyTypes, actions, extraFields, extraFieldTypes, extraFieldRegexes, inventoryType) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.fields = fields;
      this.fieldTypes = fieldTypes;
      this.properties = properties;
      this.properties.unshift("CustomData");
      this.propertyTypes = propertyTypes;
      this.propertyTypes.unshift("string");
      if(name != "(Block)") {
        //this.fields.push("Enabled");
        this.fields.push("IsBeingHacked");
        this.fields.push("IsFunctional");
        this.fields.push("IsWorking");
        //this.fieldTypes.push("bool");
        this.fieldTypes.push("bool");
        this.fieldTypes.push("bool");
        this.fieldTypes.push("bool");
        //this.properties.push("OnOff");
        //this.properties.push("Enabled");
        //this.propertyTypes.push("bool");
        //this.propertyTypes.push("bool");
      }
      this.actions = actions;
      if(extraFields != undefined) {
        this.extraFields = extraFields;
      }
      else {
        this.extraFields = [];
      }
      if(extraFieldTypes != undefined) {
        this.extraFieldTypes = extraFieldTypes;
      }
      else {
        this.extraFieldTypes = [];
      }
      if(extraFieldRegexes != undefined) {
        this.extraFieldRegexes = extraFieldRegexes;
      }
      else {
        this.extraFieldRegexes = [];
      }
      this.inventories = [];
      if(inventoryType != undefined) {
        for(var i = 0; i < inventoryType.length; i++) {
          if(inventoryType[i] == "ores") {
            this.inventories.push(new Inventory(oresInventory));
          }
          else if(inventoryType[i] == "ingots") {
            this.inventories.push(new Inventory(ingotsInventory));
          }
          else if(inventoryType[i] == "uranium") {
            this.inventories.push(new Inventory(uraniumInventory));
          }
          else if(inventoryType[i] == "components") {
            this.inventories.push(new Inventory(componentsInventory));
          }
          else if(inventoryType[i] == "missiles") {
            this.inventories.push(new Inventory(missilesInventory));
          }
          else if(inventoryType[i] == "largeBullets") {
            this.inventories.push(new Inventory(largeBulletsInventory));
          }
          else if(inventoryType[i] == "smallBullets") {
            this.inventories.push(new Inventory(smallBulletsInventory));
          }
          else if(inventoryType[i] == "ice") {
            this.inventories.push(new Inventory(iceInventory));
          }
          else if(inventoryType[i] == "oxy") {
            this.inventories.push(new Inventory(oxyInventory));
          }
          else if(inventoryType[i] == "hydrogen") {
            this.inventories.push(new Inventory(hydrogenInventory));
          }
          else if(inventoryType[i] == "all") {
            this.inventories.push(new Inventory(allInventory));
          }
        }
      }
    };
    
    // representation of an instance of a block used in the script
    function Block(variable, domainBlockIndex, customName, affect, groupName) {
      this.variable = variable;
      this.domainBlockIndex = domainBlockIndex;
      this.customName = customName;
      this.single = (affect == "0" || affect == "3");
      this.isCustom = (affect == "3");
      this.groupName = groupName;
      this.domainBlock = domainBlocks[domainBlockIndex];
      this.type = this.domainBlock.type;
      this.fields = this.domainBlock.fields;
      this.fieldTypes = this.domainBlock.fieldTypes;
      this.properties = this.domainBlock.properties;
      this.propertyTypes = this.domainBlock.propertyTypes;
      this.actions = this.domainBlock.actions;
      this.extraFields = this.domainBlock.extraFields;
      this.extraFieldTypes = this.domainBlock.extraFieldTypes;
      this.extraFieldRegexes = this.domainBlock.extraFieldRegexes;
      this.inventories = this.domainBlock.inventories;
    };

    // push line for each block type
    domainBlocks.push(new DomainBlock(0, "Functional Block", "IMyFunctionalBlock", [], [], ["Enabled"], ["bool"], []));
    domainBlocks.push(new DomainBlock(68, "Lighting Block", "IMyLightingBlock", ["Enabled", "Radius", "Intensity", "BlinkIntervalSeconds", "BlinkLength", "BlinkOffset"], ["bool", "float", "float", "float", "float", "float"], ["Enabled", "Color", "Radius", "Falloff", "Intensity", "BlinkIntervalSeconds", "BlinkLength", "BlinkOffset"], ["bool", "color", "float", "float", "float", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseRadius", "DecreaseRadius", "IncreaseFalloff", "DecreaseFalloff", "IncreaseIntensity", "DecreaseIntensity", "IncreaseBlinkIntervalSeconds", "DecreaseBlinkIntervalSeconds", "IncreaseBlinkLength", "DecreaseBlinkLength", "IncreaseBlinkOffset", "DecreaseBlinkOffset"]));
    domainBlocks.push(new DomainBlock(69, "Advanced Rotor", "IMyMotorAdvancedStator", ["Enabled", "IsAttached", "Torque", "BrakingTorque", "TargetVelocityRPM", "LowerLimitDeg", "UpperLimitDeg", "Displacement", "Angle"], ["bool", "bool", "float", "float", "float", "float", "float", "float", "float"], ["Enabled", "Torque", "BrakingTorque", "TargetVelocityRPM", "LowerLimitDeg", "UpperLimitDeg", "Displacement"], ["bool", "float", "float", "float", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "Reverse", "Detach", "Attach", "IncreaseTorque", "DecreaseTorque", "IncreaseBrakingTorque", "DecreaseBrakingTorque", "IncreaseVelocity", "DecreaseVelocity", "ResetVelocity", "IncreaseLowerLimit", "DecreaseLowerLimit", "IncreaseUpperLimit", "DecreaseUpperLimit", "IncreaseDisplacement", "DecreaseDisplacement", "IncreaseWeld speed", "DecreaseWeld speed", "Force weld"], ["Angle (degrees)"], ["degrees"], ["Angle"]));
    domainBlocks.push(new DomainBlock(1, "Air Vent", "IMyAirVent", ["Enabled", "CanPressurize", "GetOxygenLevel()", "Depressurize", "Status"], ["bool", "bool", "float", "bool", "VentStatus"], ["Enabled", "Depressurize"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Depressurize", "Depressurize_On", "Depressurize_Off"]));
    domainBlocks.push(new DomainBlock(2, "Airtight Hangar Door", "IMyDoor", ["Enabled", "Open", "Status"], ["bool", "bool", "DoorStatus"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Open", "Open_On", "Open_Off"]));
    domainBlocks.push(new DomainBlock(3, "Antenna", "IMyRadioAntenna", ["Enabled", "Radius"], ["bool", "float"], ["Enabled", "Radius", "EnableBroadcasting", "ShowShipName", "CustomName"], ["bool", "float", "bool", "bool", "string"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseRadius", "DecreaseRadius", "EnableBroadcast", "ShowShipName"], ["Current Input"], ["power"], ["Current Input: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W"]));
    domainBlocks.push(new DomainBlock(4, "Arc furnace", "IMyRefinery", ["Enabled", "IsProducing", "IsQueueEmpty", "UseConveyorSystem"], ["bool", "bool", "bool", "bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyor"]));
    domainBlocks.push(new DomainBlock(5, "Artificial Mass", "IMyVirtualMass", ["Enabled"], ["bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off"], ["Current Input"], ["power"], ["Current Input: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W"]));
    domainBlocks.push(new DomainBlock(6, "Assembler", "IMyAssembler", ["Enabled", "IsProducing", "IsQueueEmpty", "UseConveyorSystem"], ["bool", "bool", "bool", "bool"], ["Enabled", "UseConveyorSystem", "Mode"], ["bool", "bool", "MyAssemblerMode"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyor"], [], [], [], ["ingots", "components"]));
    domainBlocks.push(new DomainBlock(7, "Battery", "IMyBatteryBlock", ["Enabled", "HasCapacityRemaining"], ["bool", "bool"], ["Enabled", "ChargeMode"], ["bool", "ChargeMode"], ["OnOff", "OnOff_On", "OnOff_Off", "Recharge", "Discharge", "SemiAuto"], ["Max Power (text)", "Stored Power (text)", "Max Power (num)", "Stored Power (num)", "Current Input", "Current Output"], ["string", "string", "energy", "energy", "power", "power"], ["Max Stored Power: (\\\\d+\\\\.?\\\\d* \\\\w?Wh)", "Max Stored Power:.*Stored power: (\\\\d+\\\\.?\\\\d* \\\\w?Wh)", "Max Stored Power: (\\\\d+\\\\.?\\\\d*) (\\\\w?)Wh", "Max Stored Power:.*Stored power: (\\\\d+\\\\.?\\\\d*) (\\\\w?)Wh", "Current Input: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W", "Current Output: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W"]));
    //domainBlocks.push(new DomainBlock(, "Battery", "IMyBatteryBlock", ["HasCapacityRemaining"], ["bool"], ["Enabled", "Recharge", "Discharge", "SemiAuto", "TimeRemaining", "HasCapacityRemaining", "MaxPowerOutput", "CurrentPowerOutput", "MaxStoredPower", "CurrentStoredPower", "RemainingCapacity", "SemiautoEnabled"], ["bool", "bool", "bool", "bool", "float", "bool", "float", "float", "float", "float", "float", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Recharge"]));
    domainBlocks.push(new DomainBlock(8, "Beacon", "IMyBeacon", ["Enabled"], ["bool"], ["Enabled", "Radius"], ["bool", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseRadius", "DecreaseRadius"]));
    domainBlocks.push(new DomainBlock(9, "Button Panel", "IMyButtonPanel", [], [], ["AnyoneCanUse"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "AnyoneCanUse"]));
    domainBlocks.push(new DomainBlock(10, "Camera", "IMyCameraBlock", ["Enabled"], ["bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off"]));
    domainBlocks.push(new DomainBlock(11, "Cockpit", "IMyCockpit", ["IsUnderControl", "CanControlShip", "HasWheels", "OxygenCapacity", "OxygenFilledRatio"], ["bool", "bool", "bool", "float", "float"], ["ControlThrusters", "ControlWheels", "HandBrake", "DampenersOverride", "IsMainCockpit", "ShowHorizonIndicator"], ["bool", "bool", "bool", "bool", "bool", "bool"], ["ControlThrusters", "ControlWheels", "HandBrake", "DampenersOverride", "MainCockpit", "HorizonIndicator"]));
    domainBlocks.push(new DomainBlock(12, "Collector", "IMyCollector", ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyor"], [], [], [], ["all"]));
    domainBlocks.push(new DomainBlock(13, "Connector", "IMyShipConnector", ["ThrowOut", "CollectAll", "IsLocked", "IsConnected", "Status"], ["bool", "bool", "bool", "bool", "ConnectorStatus"], ["Enabled", "ThrowOut", "CollectAll", "PullStrength"], ["bool", "bool", "bool", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "ThrowOut", "CollectAll", "Lock", "Unlock", "SwitchLock", "IncreaseStrength", "DecreaseStrength"], [], [], [], ["all"]));
    //domainBlocks.push(new DomainBlock(, "Control Panel", "IMyControlPanel", [], [], [], [], []));
    domainBlocks.push(new DomainBlock(14, "Control Station", "IMyCockpit", ["IsUnderControl", "CanControlShip", "HasWheels", "OxygenCapacity", "OxygenFilledRatio"], ["bool", "bool", "bool", "float", "float"], ["ControlThrusters", "ControlWheels", "HandBrake", "DampenersOverride", "IsMainCockpit", "ShowHorizonIndicator"], ["bool", "bool", "bool", "bool", "bool", "bool"], ["ControlThrusters", "ControlWheels", "HandBrake", "DampenersOverride", "MainCockpit", "HorizonIndicator"]));
    domainBlocks.push(new DomainBlock(71, "Conveyor Sorter", "IMyConveyorSorter", [], [], ["Enabled", "DrainAll"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "DrainAll"], [], [], [], ["all"]));
    //domainBlocks.push(new DomainBlock(, "Decoy", "IMyDecoy", ["Enabled"], ["bool"], ["Enabled"], ["bool"], []));
    domainBlocks.push(new DomainBlock(15, "Door", "IMyDoor", ["Enabled", "Open", "Status"], ["bool", "bool", "DoorStatus"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Open", "Open_On", "Open_Off"]));
    domainBlocks.push(new DomainBlock(16, "Drill", "IMyShipDrill", ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyor"], [], [], [], ["ores"]));
    domainBlocks.push(new DomainBlock(17, "Flight Seat", "IMyCockpit", ["IsUnderControl", "CanControlShip", "HasWheels", "OxygenCapacity", "OxygenFilledRatio"], ["bool", "bool", "bool", "float", "float"], ["ControlThrusters", "ControlWheels", "HandBrake", "DampenersOverride", "IsMainCockpit", "ShowHorizonIndicator"], ["bool", "bool", "bool", "bool", "bool", "bool"], ["ControlThrusters", "ControlWheels", "HandBrake", "DampenersOverride", "MainCockpit", "HorizonIndicator"]));
    domainBlocks.push(new DomainBlock(67, "Gatling Gun", "IMySmallGatlingGun", ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "ShootOnce", "Shoot", "Shoot_On", "Shoot_Off", "UseConveyor"], [], [], [], ["smallBullets"]));
    domainBlocks.push(new DomainBlock(18, "Gatling Turret", "IMyLargeGatlingTurret", ["Enabled", "UseConveyorSystem", "CanControl", "Range"], ["bool", "bool", "bool", "float"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "ShootOnce", "Shoot", "Shoot_On", "Shoot_Off", "IncreaseRange", "DecreaseRange", "EnableIdleMovement", "EnableIdleMovement_On", "EnableIdleMovement_Off", "TargetMeteors", "TargetMeteors_On", "TargetMeteors_Off", "TargetMoving", "TargetMoving_On", "TargetMoving_Off", "TargetMissiles", "TargetMissiles_On", "TargetMissiles_Off", "TargetSmallShips", "TargetSmallShips_On", "TargetSmallShips_Off", "TargetLargeShips", "TargetLargeShips_On", "TargetLargeShips_Off", "TargetCharacters", "TargetCharacters_On", "TargetCharacters_Off", "TargetStations", "TargetStations_On", "TargetStations_Off", "TargetNeutrals", "TargetNeutrals_On", "TargetNeutrals_Off", "UseConveyor"], [], [], [], ["largeBullets"]));
    domainBlocks.push(new DomainBlock(19, "Gravity Generator", "IMyGravityGenerator", ["Enabled", "FieldSize.X", "FieldSize.Y", "FieldSize.Z"], ["bool", "float", "float", "float"], ["Enabled", "GravityAcceleration"], ["bool", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseWidth", "DecreaseWidth", "IncreaseHeight", "DecreaseHeight", "IncreaseDepth", "DecreaseDepth", "IncreaseGravity", "DecreaseGravity"]));
    domainBlocks.push(new DomainBlock(20, "Grinder", "IMyShipGrinder", ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyor"], [], [], [], ["components"]));
    domainBlocks.push(new DomainBlock(21, "Gyroscope", "IMyGyro", ["Enabled"], ["bool"], ["Enabled", "GyroPower", "GyroOverride", "Yaw", "Pitch", "Roll"], ["bool", "float", "bool", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreasePower", "DecreasePower", "Override", "IncreaseYaw", "DecreaseYaw", "IncreasePitch", "DecreasePitch", "IncreaseRoll", "DecreaseRoll"]));
    domainBlocks.push(new DomainBlock(70, "Hydrogen Tank", "IMyGasTank", ["Enabled", "FilledRatio", "Capacity"], ["bool", "float", "float"], ["Enabled", "Stockpile", "AutoRefillBottles"], ["bool", "bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Stockpile", "Stockpile_On", "Stockpile_Off", "Refill", "Auto-Refill"], ["Percent Full"], ["float"], ["Filled: (\\\\d+\\\\.?\\\\d*)%"], ["hydrogen"]));
    domainBlocks.push(new DomainBlock(22, "Interior Light", "IMyInteriorLight", ["Enabled", "Radius", "Intensity", "BlinkIntervalSeconds", "BlinkLength", "BlinkOffset"], ["bool", "float", "float", "float", "float", "float"], ["Enabled", "Color", "Radius", "Falloff", "Intensity", "BlinkIntervalSeconds", "BlinkLength", "BlinkOffset"], ["bool", "color", "float", "float", "float", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseRadius", "DecreaseRadius", "IncreaseFalloff", "DecreaseFalloff", "IncreaseIntensity", "DecreaseIntensity", "IncreaseBlinkIntervalSeconds", "DecreaseBlinkIntervalSeconds", "IncreaseBlinkLength", "DecreaseBlinkLength", "IncreaseBlinkOffset", "DecreaseBlinkOffset"]));
    domainBlocks.push(new DomainBlock(23, "Interior Turret", "IMyLargeInteriorTurret", ["Enabled", "CanControl", "Range"], ["bool", "bool", "float"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "ShootOnce", "Shoot", "Shoot_On", "Shoot_Off", "IncreaseRange", "DecreaseRange", "EnableIdleMovement", "EnableIdleMovement_On", "EnableIdleMovement_Off", "TargetMeteors", "TargetMeteors_On", "TargetMeteors_Off", "TargetMoving", "TargetMoving_On", "TargetMoving_Off", "TargetMissiles", "TargetMissiles_On", "TargetMissiles_Off", "TargetSmallShips", "TargetSmallShips_On", "TargetSmallShips_Off", "TargetLargeShips", "TargetLargeShips_On", "TargetLargeShips_Off", "TargetCharacters", "TargetCharacters_On", "TargetCharacters_Off", "TargetStations", "TargetStations_On", "TargetStations_Off", "TargetNeutrals", "TargetNeutrals_On", "TargetNeutrals_Off", "UseConveyor"], [], [], [], ["smallBullets"]));
    domainBlocks.push(new DomainBlock(24, "Landing Gear", "IMyLandingGear", ["Enabled", "IsLocked", "LockMode"], ["bool", "bool", "string"], ["Enabled", "AutoLock"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Lock", "Unlock", "SwitchLock", "Autolock"], ["Lock State"], ["string"], ["Lock State: (\\\\w*)"]));
    domainBlocks.push(new DomainBlock(25, "Large Atmospheric Thruster", "IMyThrust", ["Enabled", "ThrustOverride", "MaxThrust", "CurrentThrust"], ["bool", "float", "float", "float"], ["Enabled", "ThrustOverride", "ThrustOverridePercentage"], ["bool", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseOverride", "DecreaseOverride"]));
    domainBlocks.push(new DomainBlock(26, "Large Cargo Container", "IMyCargoContainer", [], [], [], [], [], [], [], [], ["all"]));
    domainBlocks.push(new DomainBlock(27, "Large Hydrogen Thruster", "IMyThrust", ["Enabled", "ThrustOverride", "MaxThrust", "CurrentThrust"], ["bool", "float", "float", "float"], ["Enabled", "ThrustOverride", "ThrustOverridePercentage"], ["bool", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseOverride", "DecreaseOverride"]));
    domainBlocks.push(new DomainBlock(28, "Large Ion Thruster", "IMyThrust", ["Enabled", "ThrustOverride", "MaxThrust", "CurrentThrust"], ["bool", "float", "float", "float"], ["Enabled", "ThrustOverride", "ThrustOverridePercentage"], ["bool", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseOverride", "DecreaseOverride"]));
    domainBlocks.push(new DomainBlock(29, "Large Reactor", "IMyReactor", ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyor"], ["Max Output (text)", "Current Output (text)", "Max Output (num)", "Current Output (num)"], ["string", "string", "power", "power"], ["Max Output: (\\\\d+\\\\.?\\\\d* \\\\w?W)", "Max Output:.*Current Output: (\\\\d+\\\\.?\\\\d* \\\\w?W)", "Max Output: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W", "Max Output:.*Current Output: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W"], ["uranium"]));
    domainBlocks.push(new DomainBlock(30, "Laser Antenna", "IMyLaserAntenna", ["Enabled", "TargetCoords", "Status"], ["bool", "string", "MyLaserAntennaStatus"], ["Enabled", "IsPermanent"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Idle", "PasteGpsCoords", "ConnectGPS"]));
    domainBlocks.push(new DomainBlock(31, "LCD Panel", "IMyTextPanel", ["Enabled"], ["bool"], ["Enabled", "FontSize", "FontColor", "BackgroundColor", "Public Text", "ChangeInterval", "Image"], ["bool", "float", "color", "color", "textarea", "float", "image"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseFontSize", "DecreaseFontSize", "IncreaseChangeIntervalSlider", "DecreaseChangeIntervalSlider"], ["Current Input"], ["power"], ["Current Input: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W"]));
    domainBlocks.push(new DomainBlock(32, "Medical Room", "IMyMedicalRoom", ["Enabled"], ["bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off"]));
    domainBlocks.push(new DomainBlock(33, "Medium Cargo Container", "IMyCargoContainer", [], [], [], [], [], [], [], [], ["all"]));
    domainBlocks.push(new DomainBlock(34, "Merge Block", "IMyShipMergeBlock", ["Enabled"], ["bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off"]));
    domainBlocks.push(new DomainBlock(35, "Missile Turret", "IMyLargeMissileTurret", ["Enabled", "UseConveyorSystem", "CanControl", "Range"], ["bool", "bool", "bool", "float"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "ShootOnce", "Shoot", "Shoot_On", "Shoot_Off", "IncreaseRange", "DecreaseRange", "EnableIdleMovement", "EnableIdleMovement_On", "EnableIdleMovement_Off", "TargetMeteors", "TargetMeteors_On", "TargetMeteors_Off", "TargetMoving", "TargetMoving_On", "TargetMoving_Off", "TargetMissiles", "TargetMissiles_On", "TargetMissiles_Off", "TargetSmallShips", "TargetSmallShips_On", "TargetSmallShips_Off", "TargetLargeShips", "TargetLargeShips_On", "TargetLargeShips_Off", "TargetCharacters", "TargetCharacters_On", "TargetCharacters_Off", "TargetStations", "TargetStations_On", "TargetStations_Off", "TargetNeutrals", "TargetNeutrals_On", "TargetNeutrals_Off", "UseConveyor"], [], [], [], ["missiles"]));
    domainBlocks.push(new DomainBlock(36, "Ore Detector", "IMyOreDetector", ["Enabled", "Range"], ["bool", "float"], ["Enabled", "BroadcastUsingAntennas"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "BroadcastUsingAntennas"]));
    domainBlocks.push(new DomainBlock(37, "Oxygen Generator", "IMyGasGenerator", ["Enabled"], ["bool"], ["Enabled", "UseConveyorSystem", "AutoRefill"], ["bool", "bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyor", "Refill", "Auto-Refill"], [], [], [], ["ice"]));
    domainBlocks.push(new DomainBlock(38, "Oxygen Tank", "IMyGasTank", ["Enabled", "FilledRatio", "Capacity"], ["bool", "float", "float"], ["Enabled", "Stockpile", "AutoRefillBottles"], ["bool", "bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Stockpile", "Stockpile_On", "Stockpile_Off", "Refill", "Auto-Refill"], ["Percent Full"], ["float"], ["Filled: (\\\\d+\\\\.?\\\\d*)%"], ["oxy"]));
    domainBlocks.push(new DomainBlock(39, "Passenger Seat", "IMyCockpit", ["IsUnderControl", "CanControlShip", "HasWheels", "OxygenCapacity", "OxygenFilledRatio"], ["bool", "bool", "bool", "float", "float"], ["ShowHorizonIndicator"], ["bool"], ["HorizonIndicator"]));
    domainBlocks.push(new DomainBlock(40, "Piston", "IMyPistonBase", ["Enabled", "Velocity", "LowestPosition", "HighestPosition"], ["bool", "float", "float", "float"], ["Enabled", "Velocity", "MinLimit", "MaxLimit"], ["bool", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "Reverse", "Extend", "Retract", "IncreaseVelocity", "DecreaseVelocity", "ResetVelocity", "IncreaseUpperLimit", "DecreaseUpperLimit", "IncreaseLowerLimit", "DecreaseLowerLimit", "IncreaseWeld speed", "DecreaseWeld speed", "Force weld", "Add Piston Head"], ["Current Position"], ["float"], ["Current position: (\\\\d+\\\\.?\\\\d*)"]));
    domainBlocks.push(new DomainBlock(41, "Programmable block", "IMyProgrammableBlock", ["Enabled", "IsRunning", "TerminalRunArgument"], ["bool", "bool", "string"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Run", "RunWithDefaultArgument"]));                                              
    domainBlocks.push(new DomainBlock(42, "Projector", "IMyProjector", ["Enabled", "ProjectionOffsetX", "ProjectionOffsetY", "ProjectionOffsetZ", "ProjectionRotX", "ProjectionRotY", "ProjectionRotZ", "IsProjecting", "TotalBlocks", "RemainingBlocks", "RemainingArmorBlocks", "BuildableBlocksCount"], ["bool", "int", "int", "int", "int", "int", "int", "bool", "int", "int", "int", "int"], ["Enabled", "ShowOnlyBuildable"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "KeepProjection", "IncreaseX", "DecreaseX", "IncreaseY", "DecreaseY", "IncreaseZ", "DecreaseZ", "IncreaseRotX", "DecreaseRotX", "IncreaseRotY", "DecreaseRotY", "IncreaseRotZ", "DecreaseRotZ", "SpawnProjection"]));
    domainBlocks.push(new DomainBlock(43, "Refinery", "IMyRefinery", ["Enabled", "IsProducing", "IsQueueEmpty", "UseConveyorSystem"], ["bool", "bool", "bool", "bool"], ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyor"], [], [], [], ["ores", "ingots"]));
    domainBlocks.push(new DomainBlock(44, "Reloadable Rocket Launcher", "IMySmallMissileLauncherReload", ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "ShootOnce", "Shoot", "Shoot_On", "Shoot_Off", "UseConveyor"], [], [], [], ["missiles"]));
    domainBlocks.push(new DomainBlock(45, "Remote Control", "IMyRemoteControl", ["IsAutoPilotEnabled"], ["bool"], ["ControlThrusters", "ControlWheels", "HandBrake", "DampenersOverride", "IsMainCockpit", "ShowHorizonIndicator", "FlightMode", "SpeedLimit"], ["bool", "bool", "bool", "bool", "bool", "bool", "FlightMode", "float"], ["ControlThrusters", "ControlWheels", "HandBrake", "DampenersOverride", "MainCockpit", "HorizonIndicator", "AutoPilot", "AutoPilot_On", "AutoPilot_Off", "CollisionAvoidance", "CollisionAvoidance_On", "CollisionAvoidance_Off", "DockingMode", "DockingMode_On", "DockingMode_Off", "Forward", "Backward", "Left", "Right", "Up", "Down"]));
    domainBlocks.push(new DomainBlock(46, "Rocket Launcher", "IMySmallMissileLauncher", ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "ShootOnce", "Shoot", "Shoot_On", "Shoot_Off", "UseConveyor"], [], [], [], ["missiles"]));
    domainBlocks.push(new DomainBlock(47, "Rotor", "IMyMotorStator", ["Enabled", "IsAttached", "Torque", "BrakingTorque", "TargetVelocityRPM", "LowerLimitDeg", "UpperLimitDeg", "Displacement", "Angle"], ["bool", "bool", "float", "float", "float", "float", "float", "float", "float"], ["Enabled", "Torque", "BrakingTorque", "TargetVelocityRPM", "LowerLimitDeg", "UpperLimitDeg", "Displacement"], ["bool", "float", "float", "float", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "Reverse", "Detach", "Attach", "IncreaseTorque", "DecreaseTorque", "IncreaseBrakingTorque", "DecreaseBrakingTorque", "IncreaseVelocity", "DecreaseVelocity", "ResetVelocity", "IncreaseLowerLimit", "DecreaseLowerLimit", "IncreaseUpperLimit", "DecreaseUpperLimit", "IncreaseDisplacement", "DecreaseDisplacement", "IncreaseWeld speed", "DecreaseWeld speed", "Force weld"], ["Angle (degrees)"], ["degrees"], ["Angle"]));
    domainBlocks.push(new DomainBlock(48, "Sensor", "IMySensorBlock", ["LeftExtend", "RightExtend", "TopExtend", "BottomExtend", "FrontExtend", "BackExtend", "DetectPlayers", "DetectFloatingObjects", "DetectSmallShips", "DetectLargeShips", "DetectStations", "DetectAsteroids", "DetectOwner", "DetectFriendly", "DetectNeutral", "DetectEnemy", "IsActive"], ["float", "float", "float", "float", "float", "float", "bool", "bool", "bool", "bool", "bool", "bool", "bool", "bool", "bool", "bool", "bool"], ["Enabled", "LeftExtend", "RightExtend", "BottomExtend", "TopExtend", "BackExtend", "FrontExtend", "PlayProximitySound", "DetectPlayers", "DetectFloatingObjects", "DetectSmallShips", "DetectLargeShips", "DetectStations", "DetectAsteroids", "DetectOwner", "DetectFriendly", "DetectNeutral", "DetectEnemy", "DetectSubgrids"], ["bool", "float", "float", "float", "float", "float", "float", "bool", "bool", "bool", "bool", "bool", "bool", "bool", "bool", "bool", "bool", "bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseLeft", "DecreaseLeft", "IncreaseRight", "DecreaseRight", "IncreaseBottom", "DecreaseBottom", "IncreaseTop", "DecreaseTop", "IncreaseBack", "DecreaseBack", "IncreaseFront", "DecreaseFront", "Detect Players", "Detect Players_On", "Detect Players_Off", "Detect Floating Objects", "Detect Floating Objects_On", "Detect Floating Objects_Off", "Detect Small Ships", "Detect Small Ships_On", "Detect Small Ships_Off", "Detect Large Ships", "Detect Large Ships_On", "Detect Large Ships_Off", "Detect Stations", "Detect Stations_On", "Detect Stations_Off", "Detect Asteroids", "Detect Asteroids_On", "Detect Asteroids_Off", "Detect Owner", "Detect Owner_On", "Detect Owner_Off", "Detect Friendly", "Detect Friendly_On", "Detect Friendly_Off", "Detect Neutral", "Detect Neutral_On", "Detect Neutral_Off", "Detect Enemy", "Detect Enemy_On", "Detect Enemy_Off"]));
    domainBlocks.push(new DomainBlock(49, "Sliding Door", "IMyDoor", ["Enabled", "Open", "Status"], ["bool", "bool", "DoorStatus"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "Open", "Open_On", "Open_Off"]));
    domainBlocks.push(new DomainBlock(50, "Small Atmospheric Thruster", "IMyThrust", ["Enabled", "ThrustOverride", "MaxThrust", "CurrentThrust"], ["bool", "float", "float", "float"], ["Enabled", "ThrustOverride", "ThrustOverridePercentage"], ["bool", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseOverride", "DecreaseOverride"]));
    domainBlocks.push(new DomainBlock(51, "Small Cargo Container", "IMyCargoContainer", [], [], [], [], [], [], [], [], ["all"]));
    domainBlocks.push(new DomainBlock(52, "Small Hydrogen Thruster", "IMyThrust", ["Enabled", "ThrustOverride", "MaxThrust", "CurrentThrust"], ["bool", "float", "float", "float"], ["Enabled", "ThrustOverride", "ThrustOverridePercentage"], ["bool", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseOverride", "DecreaseOverride"]));
    domainBlocks.push(new DomainBlock(53, "Small Ion Thruster", "IMyThrust", ["Enabled", "ThrustOverride", "MaxThrust", "CurrentThrust"], ["bool", "float", "float", "float"], ["Enabled", "ThrustOverride", "ThrustOverridePercentage"], ["bool", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseOverride", "DecreaseOverride"]));
    domainBlocks.push(new DomainBlock(54, "Small Reactor", "IMyReactor", ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["Enabled", "UseConveyorSystem"], ["bool", "bool"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyor"], ["Max Output (text)", "Current Output (text)", "Max Output (num)", "Current Output (num)"], ["string", "string", "power", "power"], ["Max Output: (\\\\d+\\\\.?\\\\d* \\\\w?W)", "Max Output:.*Current Output: (\\\\d+\\\\.?\\\\d* \\\\w?W)", "Max Output: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W", "Max Output:.*Current Output: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W"], ["uranium"]));
    domainBlocks.push(new DomainBlock(55, "Solar Panel", "IMySolarPanel", ["Enabled"], ["bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off"], ["Max Output (text)", "Current Output (text)", "Max Output (num)", "Current Output (num)"], ["string", "string", "power", "power"], ["Max Output: (\\\\d+\\\\.?\\\\d* \\\\w?W)", "Max Output:.*Current Output: (\\\\d+\\\\.?\\\\d* \\\\w?W)", "Max Output: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W", "Max Output:.*Current Output: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W"]));
    domainBlocks.push(new DomainBlock(56, "Sound Block", "IMySoundBlock", ["Enabled", "Volume", "Range", "IsSoundSelected", "LoopPeriod"], ["bool", "float", "float", "bool", "float"], ["Enabled", "Volume", "Range", "LoopPeriod"], ["bool", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseVolumeSlider", "DecreaseVolumeSlider", "IncreaseRangeSlider", "DecreaseRangeSlider", "PlaySound", "StopSound", "IncreaseLoopableSlider", "DecreaseLoopableSlider"]));
    domainBlocks.push(new DomainBlock(57, "Spherical Gravity Generator", "IMyGravityGeneratorSphere", ["Enabled", "Radius", "GravityAcceleration"], ["bool", "float", "float"], ["Enabled", "Radius", "GravityAcceleration"], ["bool", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseRadius", "DecreaseRadius", "IncreaseGravity", "DecreaseGravity"]));
    domainBlocks.push(new DomainBlock(58, "Spotlight", "IMyReflectorLight", ["Enabled", "Radius", "Intensity", "BlinkIntervalSeconds", "BlinkLength", "BlinkOffset"], ["bool", "float", "float", "float", "float", "float"], ["Enabled", "Color", "Radius", "Falloff", "Intensity", "BlinkIntervalSeconds", "BlinkLength", "BlinkOffset"], ["bool", "color", "float", "float", "float", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseRadius", "DecreaseRadius", "IncreaseFalloff", "DecreaseFalloff", "IncreaseIntensity", "DecreaseIntensity", "IncreaseBlinkIntervalSeconds", "DecreaseBlinkIntervalSeconds", "IncreaseBlinkLength", "DecreaseBlinkLength", "IncreaseBlinkOffset", "DecreaseBlinkOffset"]));
    domainBlocks.push(new DomainBlock(59, "Text Panel", "IMyTextPanel", ["Enabled"], ["bool"], ["Enabled", "FontSize", "FontColor", "BackgroundColor", "Public Text", "ChangeInterval"], ["bool", "float", "color", "color", "textarea", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseFontSize", "DecreaseFontSize", "IncreaseChangeIntervalSlider", "DecreaseChangeIntervalSlider"], ["Current Input"], ["power"], ["Current Input: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W"]));
    domainBlocks.push(new DomainBlock(60, "Timer Block", "IMyTimerBlock", ["IsCountingDown", "TriggerDelay"], ["bool", "float"], ["TriggerDelay"], ["float"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseTriggerDelay", "DecreaseTriggerDelay", "TriggerNow", "Start", "Stop"]));
    domainBlocks.push(new DomainBlock(61, "Warhead", "IMyWarhead", ["IsCountingDown", "DetonationTime"], ["bool", "float"], ["DetonationTime"], ["float"], ["IncreaseDetonationTime", "DecreaseDetonationTime", "StartCountdown", "StopCountdown", "Safety", "Detonate"]));
    domainBlocks.push(new DomainBlock(62, "Welder", "IMyShipWelder", ["Enabled"], ["bool"], ["Enabled"], ["bool"], ["OnOff", "OnOff_On", "OnOff_Off", "UseConveyorSystem"], [], [], [], ["components"]));
    domainBlocks.push(new DomainBlock(63, "Wheel Suspension 1x1", "IMyMotorSuspension", ["Steering", "Propulsion", "Damping", "Strength", "Friction", "Power", "Height", "SteerAngle", "MaxSteerAngle", "SteerSpeed", "SteerReturnSpeed", "SuspensionTravel", "Brake"], ["bool", "bool", "float", "float", "float", "float", "float", "float", "float", "float", "float", "float", "bool"], ["Strength", "Friction", "Power", "MaxSteerAngle",], ["float", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "Steering", "Propulsion", "IncreaseDamping", "DecreaseDamping", "IncreaseStrength", "DecreaseStrength", "IncreaseFriction", "DecreaseFriction", "IncreasePower", "DecreasePower"]));
    domainBlocks.push(new DomainBlock(64, "Wheel Suspension 3x3", "IMyMotorSuspension", ["Steering", "Propulsion", "Damping", "Strength", "Friction", "Power", "Height", "SteerAngle", "MaxSteerAngle", "SteerSpeed", "SteerReturnSpeed", "SuspensionTravel", "Brake"], ["bool", "bool", "float", "float", "float", "float", "float", "float", "float", "float", "float", "float", "bool"], ["Strength", "Friction", "Power", "MaxSteerAngle",], ["float", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "Steering", "Propulsion", "IncreaseDamping", "DecreaseDamping", "IncreaseStrength", "DecreaseStrength", "IncreaseFriction", "DecreaseFriction", "IncreasePower", "DecreasePower"]));
    domainBlocks.push(new DomainBlock(65, "Wheel Suspension 5x5", "IMyMotorSuspension", ["Steering", "Propulsion", "Damping", "Strength", "Friction", "Power", "Height", "SteerAngle", "MaxSteerAngle", "SteerSpeed", "SteerReturnSpeed", "SuspensionTravel", "Brake"], ["bool", "bool", "float", "float", "float", "float", "float", "float", "float", "float", "float", "float", "bool"], ["Strength", "Friction", "Power", "MaxSteerAngle",], ["float", "float", "float", "float"], ["OnOff", "OnOff_On", "OnOff_Off", "Steering", "Propulsion", "IncreaseDamping", "DecreaseDamping", "IncreaseStrength", "DecreaseStrength", "IncreaseFriction", "DecreaseFriction", "IncreasePower", "DecreasePower"]));
    domainBlocks.push(new DomainBlock(66, "Wide LCD panel", "IMyTextPanel", ["Enabled"], ["bool"], ["Enabled", "FontSize", "FontColor", "BackgroundColor", "Public Text", "ChangeInterval", "Image"], ["bool", "float", "color", "color", "textarea", "float", "image"], ["OnOff", "OnOff_On", "OnOff_Off", "IncreaseFontSize", "DecreaseFontSize", "IncreaseChangeIntervalSlider", "DecreaseChangeIntervalSlider"], ["Current Input"], ["power"], ["Current Input: (\\\\d+\\\\.?\\\\d*) (\\\\w?)W"]));

    //domainBlocks.push(new DomainBlock("", "IMy", [""], ["bool"], [], [], ["OnOff", "OnOff_On", "OnOff_Off"]));
    
    $.each(domainBlocks, function(i) {
      var value = i;
      var m_this = this;
      $.each($(".blockmenu"), function() {
        $("<option />").attr("value", value).html(m_this.name).appendTo(this);
      });
      tempActions[i] = this.actions;
      tempFields[i] = this.fields;
      tempFieldTypes[i] = this.fieldTypes;
      tempProperties[i] = this.properties;
      tempPropertyTypes[i] = this.propertyTypes;
      tempExtraFields[i] = this.extraFields;
      tempExtraFieldTypes[i] = this.extraFieldTypes;
      tempInventories[i] = this.inventories;
    });
    
    blockmenuchanged = function(e) {
      var value = $(e).val();
      //var thisrow = $($(e).parent().parent());
      var thisrow = $(e).closest('tr');
      $.each(thisrow.siblings('.dyn'), function(i) {
        $(this).remove();
      });
      // fields
      if(tempFields[value].length > 0) {
        $("<tr class=\"dyn fieldheader darkrow\"><td class=\"bold\">Fields<span class=\"infolink\" onClick=\"showHelp(this, 12);\"></span></td><td></td><td><span class=\"hideshow\" onclick=\"hideShowFields(this);\">[hide]</span></td></tr>").appendTo(thisrow.parent());
      }
      $.each(tempFields[value], function(i) {
        var inputType = "";
        var save = "";
        var tooltip = "";
        if(tempFieldTypes[value][i]=="bool") {
          //inputType = "<label class=\"sign\"></label><select onchange=\"boolSelectUpdated(this);\"><option value=\"\"></option><option value=\"true\">true</option><option value=\"false\">false</option></select>";
          inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"bool\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"true\">true</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"false\">false</div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"bool\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"true/false\"";
        }
        else if(tempFieldTypes[value][i]=="float" || tempFieldTypes[value][i]=="int") {
          //inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"float\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"decimal number\"";
        }
        else if(tempFieldTypes[value][i]=="string") {
          //inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"string\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"string\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"text\"";
        }
        else if(tempFieldTypes[value][i]=="color") {
          inputType = "<input type=\"text\" onchange=\"generateScript();\"></input><input type=\"text\" onchange=\"generateScript();\"></input><input type=\"text\" onchange=\"generateScript();\"></input>";
          tooltip = "title=\"color\"";
        }
        else if(tempFieldTypes[value][i]=="VentStatus") {
          //inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"VentStatus\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Pressurized\">Pressurized</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Pressurizing\">Pressurizing</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Depressurized\">Depressurized</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Depressurizing\">Depressurizing</div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"string\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          //tooltip = "title=\"decimal number\"";
        }
        else if(tempFieldTypes[value][i]=="DoorStatus") {
          //inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"DoorStatus\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Open\">Open</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Closed\">Closed</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Opening\">Opening</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Closing\">Closing</div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"string\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          //tooltip = "title=\"decimal number\"";
        }
        else if(tempFieldTypes[value][i]=="ConnectorStatus") {
          //inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"MyShipConnectorStatus\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Connected\">Connected</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Unconnected\">Unconnected</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Connectable\">Connectable</div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"string\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          //tooltip = "title=\"decimal number\"";
        }
        else if(tempFieldTypes[value][i]=="MyLaserAntennaStatus") {
          //inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"MyLaserAntennaStatus\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Idle\">Idle</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"RotatingToTarget\">RotatingToTarget</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"SearchingTargetForAntenna\">SearchingTargetForAntenna</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Connecting\">Connecting</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Connected\">Connected</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"OutOfRange\">OutOfRange</div></div></div></td>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"string\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          //tooltip = "title=\"decimal number\"";
        }
        else {
          inputType = "<input type=\"text\" onchange=\"generateScript();\"></input>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
        }
        if(usetooltips == false) {
          tooltip = "";
        }
        tooltip = "title=\""+tempFields[value][i]+"\"";
        //$("<tr class=\"dyn field\"><td><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">"+fieldButtonText+"</button></td><td class=\"fieldname\">Field: "+tempFields[value][i]+"</td><td class=\"fieldvalue\">"+inputType+"</td><td class=\"save small\">Save As:<input type=\"text\" onkeyup=\"generateScript();\"></input></td></tr>").appendTo(thisrow.parent());
        $("<tr class=\"dyn field\"><td class=\"fieldname\" "+tooltip+"><div>"+tempFields[value][i]+"</div></td><td class=\"fieldvalue\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button>"+inputType+"</td>"+save+"</tr>").appendTo(thisrow.parent());
      });
      // extra fields
      if(tempExtraFields[value].length > 0) {
        $("<tr class=\"dyn extrafieldheader darkrow\"><td class=\"bold\"><div>Extra Fields<span class=\"infolink\" onClick=\"showHelp(this, 13);\"></span></div></td><td></td><td><span class=\"hideshow\" onclick=\"hideShowExtraFields(this);\">[hide]</span></td></tr>").appendTo(thisrow.parent());
      }
      $.each(tempExtraFields[value], function(i) {
        var inputType = "";
        var save = "";
        var tooltip = "";
        if(tempExtraFieldTypes[value][i]=="bool") {
          //inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><select onchange=\"boolSelectUpdated(this);\"><option value=\"\"></option><option value=\"true\">true</option><option value=\"false\">false</option></select>";
          inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"bool\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"true\">true</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"false\">false</div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"bool\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"true/false\"";
        }
        else if(tempExtraFieldTypes[value][i]=="float") {
          //inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"float\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"decimal number\"";
        }
        else if(tempExtraFieldTypes[value][i]=="degrees") {
          //inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"float\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"decimal number\"";
        }
        else if(tempExtraFieldTypes[value][i]=="power") {
          //inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"power\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"power\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"decimal number\"";
        }
        else if(tempExtraFieldTypes[value][i]=="energy") {
          //inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"energy\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"energy\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"decimal number\"";
        }
        else if(tempExtraFieldTypes[value][i]=="string") {
          //inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input>";
          inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"string\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"string\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"text\"";
        }
        else {
          inputType = "<label class=\"sign\"></label><input type=\"text\" onchange=\"generateScript();\" placeholder=\"value\"></input>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"string\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
        }
        if(usetooltips == false) {
          tooltip = "";
        }
        tooltip = "title=\""+tempExtraFields[value][i]+"\"";
        $("<tr class=\"dyn extrafield\"><td class=\"extrafieldname\" "+tooltip+"><div>"+tempExtraFields[value][i]+"</div></td><td class=\"extrafieldvalue\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button>"+inputType+"</td>"+save+"</tr>").appendTo(thisrow.parent());
      });
      // properties
      if(tempProperties[value].length > 0) {
        $("<tr class=\"dyn propheader darkrow\"><td class=\"bold\"><div>Properties<span class=\"infolink\" onClick=\"showHelp(this, 14);\"></span></div></td><td></td><td><span class=\"hideshow\" onclick=\"hideShowProps(this);\">[hide]</span></td></tr>").appendTo(thisrow.parent());
      }
      $.each(tempProperties[value], function(i) {
        var inputValue = "";
        var inputType = "";
        var save = "";
        var tooltip = "";
        if(tempPropertyTypes[value][i]=="bool") {
          //inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><select onchange=\"boolSelectUpdated(this);\"><option value=\"\"></option><option value=\"true\">true</option><option value=\"false\">false</option></select></td>";
          inputValue = "<td class=\"propertyvalue\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button><label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"bool\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"true\">true</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"false\">false</div></div></div></td>";
          inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"bool\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"true\">true</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"false\">false</div></div></div></td>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"bool\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"true/false\"";
        }
        else if(tempPropertyTypes[value][i]=="float") {
          //inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input></td>";
          inputValue = "<td class=\"propertyvalue\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button><label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div></td>";
          inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div></td>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"float\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"decimal number\"";
        }
        else if(tempPropertyTypes[value][i]=="string") {
          //inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><input type=\"text\" onkeyup=\"inputUpdated(this);\"></input></td>";
          inputValue = "<td class=\"propertyvalue\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button><label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"string\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div></td>";
          inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"string\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div></td>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"string\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"decimal number\"";
        }
        else if(tempPropertyTypes[value][i]=="int") {
          inputValue = "<td class=\"propertyvalue\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button><label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div></td>";
          inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div></td>";;
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"int\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"whole number\"";
        }
        else if(tempPropertyTypes[value][i]=="color") {
          //inputType = "<td colspan=\"2\" class=\"propertyset\" style=\"background-color: white;\" onmouseover=\"mouseOverColor(this);\" onmouseout=\"mouseOutColor(this);\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button>R<input class=\"colorbox red\" type=\"number\" min=\"0\" max=\"255\" value=\"255\" onkeyup=\"updateColor(this);\" onchange=\"updateColor(this);\"></input>G<input class=\"colorbox green\" type=\"number\" min=\"0\" max=\"255\" value=\"255\" onkeyup=\"updateColor(this);\" onchange=\"updateColor(this);\"></input>B<input class=\"colorbox blue\" type=\"number\" min=\"0\" max=\"255\" value=\"255\" onkeyup=\"updateColor(this);\" onchange=\"updateColor(this);\"></input></td>";
          //inputType = "<td colspan=\"2\" class=\"propertyset\" style=\"background-color: white;\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button>R<input class=\"colorbox red\" type=\"number\" min=\"0\" max=\"255\" value=\"255\" onkeyup=\"updateColor(this);\" onchange=\"updateColor(this);\"></input>G<input class=\"colorbox green\" type=\"number\" min=\"0\" max=\"255\" value=\"255\" onkeyup=\"updateColor(this);\" onchange=\"updateColor(this);\"></input>B<input class=\"colorbox blue\" type=\"number\" min=\"0\" max=\"255\" value=\"255\" onkeyup=\"updateColor(this);\" onchange=\"updateColor(this);\"></input></td>";
          inputType = "<td colspan=\"1\" class=\"propertyset\" style=\"background-color: white;\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button>R<input class=\"colorbox red\" type=\"number\" min=\"0\" max=\"255\" value=\"255\" onkeyup=\"updateColor(this);\" onchange=\"updateColor(this);\"></input>G<input class=\"colorbox green\" type=\"number\" min=\"0\" max=\"255\" value=\"255\" onkeyup=\"updateColor(this);\" onchange=\"updateColor(this);\"></input>B<input class=\"colorbox blue\" type=\"number\" min=\"0\" max=\"255\" value=\"255\" onkeyup=\"updateColor(this);\" onchange=\"updateColor(this);\"></input></td>";
          tooltip = "title=\"color\"";
        }
        else if(tempPropertyTypes[value][i]=="textarea") {
          //inputType = "<td colspan=\"2\" class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><textarea onkeyup=\"inputUpdated(this);\" placeholder=\"text [your variable]\nmore text [your variable]\" title=\"Variables can be used like [this] by surrounding with brackets\"></textarea><a target=\"_blank\" href=\"http://dco.pe#LCD\" >Formatting Help</a></td>";
          //inputType = "<td colspan=\"2\" class=\"propertyset textareaparent\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><textarea class=\"helpbox\" onclick=\"showHelpBox(this);\" onchange=\"inputUpdated(this);\" placeholder=\"text [your variable]\nmore text [your variable]\" title=\"Variables can be used like [this] by surrounding with brackets\"></textarea><div class=\"helpboxdata mono\" style=\"display: none;\">"+lcdHelp+"</div></td>";
          inputValue = "<td class=\"propertyvalue textareaparent\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button><label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><textarea onchange=\"inputUpdated(this);\" placeholder=\"text [your variable]\nmore text [your variable]\" title=\"Variables can be used like [this] by surrounding with brackets\"></textarea></td>";
          inputType = "<td colspan=\"1\" class=\"propertyset textareaparent\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><textarea class=\"helpbox\" onclick=\"showHelpBox(this);\" onchange=\"inputUpdated(this);\" placeholder=\"text [your variable]\nmore text [your variable]\" title=\"Variables can be used like [this] by surrounding with brackets\"></textarea><div class=\"helpboxdata mono\" style=\"display: none;\">"+lcdHelp+"</div></td>";
          save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"string\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"text\"";
        }
        if(tempPropertyTypes[value][i]=="image") {
          inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"image\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Offline\">Offline</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Online\">Online</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Arrow\">Arrow</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Cross\">Cross</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Danger\">Danger</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"No Entry\">No Entry</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Construction\">Construction</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"White Screen\">White Screen</div></div></div></td>";
        }
        if(tempPropertyTypes[value][i]=="ChargeMode") {
          inputValue = "<td class=\"propertyvalue\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button><label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"ChargeMode\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Auto\">Auto</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Recharge\">Recharge</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Discharge\">Discharge</div></div></div></td>";
          inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"ChargeMode\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Auto\">Auto</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Recharge\">Recharge</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Discharge\">Discharge</div></div></div></td>";
          //save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"bool\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"ChargeMode\"";
          //inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"image\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Offline\">Offline</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Online\">Online</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Arrow\">Arrow</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Cross\">Cross</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Danger\">Danger</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"No Entry\">No Entry</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Construction\">Construction</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"White Screen\">White Screen</div></div></div></td>";
        }
        if(tempPropertyTypes[value][i]=="MyAssemblerMode") {
          inputValue = "<td class=\"propertyvalue\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button><label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"MyAssemblerMode\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Assembly\">Assembly</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Disassembly\">Disassembly</div></div></div></td>";
          inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"MyAssemblerMode\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Assembly\">Assembly</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Disassembly\">Disassembly</div></div></div></td>";
          //save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"bool\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"MyAssemblerMode\"";
        }
        if(tempPropertyTypes[value][i]=="FlightMode") {
          inputValue = "<td class=\"propertyvalue\"><button class=\"checkboxbutton left\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">If</button><label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"MyLaserAntennaStatus\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Patrol\">Patrol</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Circle\">Circle</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"OneWay\">OneWay</div></div></div></td>";
          inputType = "<td class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\" statustype=\"FlightMode\"><div class=\"multiselectdata\" varType=\"\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Patrol\">Patrol</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"Circle\">Circle</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"OneWay\">OneWay</div></div></div></td>";
          //save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"bool\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          tooltip = "title=\"FlightMode\"";
        }
        
        if(usetooltips == false) {
          tooltip = "";
        }
        tooltip = "title=\""+tempProperties[value][i]+"\"";
        $("<tr class=\"dyn property\"><td class=\"propertyname\" "+tooltip+"><div>"+tempProperties[value][i]+"</div></td>"+inputValue+inputType+""+save+"</tr>").appendTo(thisrow.parent());
      });
      // actions
      if(tempActions[value].length > 0) {
        $("<tr class=\"dyn actionheader darkrow\"><td class=\"bold\"><div>Actions<span class=\"infolink\" onClick=\"showHelp(this, 15);\"></span></div></td><td></td><td><span class=\"hideshow\" onclick=\"hideShowActions(this);\">[hide]</span></td></tr>").appendTo(thisrow.parent());
      }
      $.each(tempActions[value], function(i) {
        $//("<tr class=\"dyn action\"><td><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">"+actionButtonText+"</button></td><td class=\"actionname\">Action: "+tempActions[value][i]+"</td><td class=\"actionvalue\"></td></tr>").appendTo(thisrow.parent());
        $("<tr class=\"dyn action\"><td class=\"actionname\" title=\""+tempActions[value][i]+"\"><div>"+tempActions[value][i]+"</div></td><td><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">"+actionButtonText+"</button></td></tr>").appendTo(thisrow.parent());
      });
      $.each(tempInventories[value], function(i) {
        $("<tr class=\"dyn inventoryheader darkrow\"><td class=\"bold\"><div>Inventory "+(i+1)+"<span class=\"infolink\" onClick=\"showHelp(this, 16);\"></span></div></td><td title=\"give this inventory a name so other blocks can transfer items to/from it\">Inventory Name <input type=\"text\" onchange=\"generateScript();\"></input></td><td><span class=\"hideshow\" onclick=\"hideShowInventory(this, "+i+");\">[hide]</span></td></tr>").appendTo(thisrow.parent());
        //$("<tr class=\"dyn inventoryvariable\"><td>Inventory Name</td><td><input type=\"text\" onchange=\"generateScript();\"></input></td></tr>").appendTo(thisrow.parent());
        // 1.0.3
        $.each(tempInventories[value][i].fields, function(j) {
          var inputType;
          var save;
          var tooltip = "title=\""+tempInventories[value][i].fields[j]+"\"";
          if(tempInventories[value][i].fieldTypes[j] == "bool") {
            inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"bool\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"true\">true</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"false\">false</div></div></div>";
            save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+j+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"bool\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          }
          else if(tempInventories[value][i].fieldTypes[j] == "floatcast") {
            inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
            save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+j+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"float\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          }
          else if(tempInventories[value][i].fieldTypes[j] == "connected") {
            inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"inventory\"><div class=\"multiselectdata\" varType=\"inventory\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          }
          $("<tr class=\"dyn invfield inv"+i+"\"><td class=\"fieldname\" "+tooltip+"><div>"+tempInventories[value][i].fields[j]+"</div></td><td class=\"fieldvalue\"><button class=\"checkboxbutton left\" value=\""+j+"\" onclick=\"clickCheckboxButton(this);\">If</button>"+inputType+"</td>"+save+"</tr>").appendTo(thisrow.parent());
        });
        // IsFull
        /*var inputType = "<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onkeyup=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"bool\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"true\">true</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"false\">false</div></div></div>";
        var save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\"0\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"bool\" onkeyup=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
        var tooltip = "title=\"IsFull\"";
        $("<tr class=\"dyn invfield inv"+i+"\"><td class=\"fieldname\" "+tooltip+"><div>IsFull</div></td><td class=\"fieldvalue\"><button class=\"checkboxbutton left\" value=\"0\" onclick=\"clickCheckboxButton(this);\">If</button>"+inputType+"</td>"+save+"</tr>").appendTo(thisrow.parent());
        // CurrentMass
        inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onkeyup=\"inputUpdated(this);\" placeholder=\"value\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
        save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\"1\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"float\" onkeyup=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
        tooltip = "title=\"CurrentMass\"";
        $("<tr class=\"dyn invfield inv"+i+"\"><td class=\"fieldname\" "+tooltip+"><div>CurrentMass</div></td><td class=\"fieldvalue\"><button class=\"checkboxbutton left\" value=\"1\" onclick=\"clickCheckboxButton(this);\">If</button>"+inputType+"</td>"+save+"</tr>").appendTo(thisrow.parent());
        // MaxVolume
        save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\"2\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"float\" onkeyup=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
        tooltip = "title=\"MaxVolume\"";
        $("<tr class=\"dyn invfield inv"+i+"\"><td class=\"fieldname\" "+tooltip+"><div>MaxVolume</div></td><td class=\"fieldvalue\"><button class=\"checkboxbutton left\" value=\"2\" onclick=\"clickCheckboxButton(this);\">If</button>"+inputType+"</td>"+save+"</tr>").appendTo(thisrow.parent());
        // CurrentVolume
        save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\"3\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"float\" onkeyup=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
        tooltip = "title=\"CurrentVolume\"";
        $("<tr class=\"dyn invfield inv"+i+"\"><td class=\"fieldname\" "+tooltip+"><div>CurrentVolume</div></td><td class=\"fieldvalue\"><button class=\"checkboxbutton left\" value=\"3\" onclick=\"clickCheckboxButton(this);\">If</button>"+inputType+"</td>"+save+"</tr>").appendTo(thisrow.parent());
        */
        $.each(tempInventories[value][i].items, function(j) {
          //$("<tr class=\"dyn item\"><td class=\"itemname\">"+tempInventories[value][i].items[j]+"</td>"+inputType+""+save+"</tr>").appendTo(thisrow.parent());
          var inputType = "<label class=\"sign\" onclick=\"clickSign(this);\">=</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"inputUpdated(this);\" placeholder=\"amount\" title=\"enter a number or a numeric variable\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          var transfer = "<button class=\"checkboxbutton left\" value=\""+j+"\" onclick=\"clickCheckboxButton(this);\">Send</button><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onkeyup=\"doubleInputUpdated(this);\" placeholder=\"amount\" title=\"enter a number, a numeric variable, or a percentage\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div><label class=\"inlineblock unselectable\" onclick=\"toFrom(this);\">to</label><div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onkeyup=\"doubleInputUpdated(this);\" placeholder=\"inventory\" title=\"enter the name given to another inventory\"><div class=\"multiselectdata\" varType=\"inventory\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
          var save = "<td class=\"save\"><button class=\"checkboxbutton\" value=\""+j+"\" onclick=\"clickCheckboxButton(this);\">Save As</button><input type=\"text\" varType=\"float\" onchange=\"inputUpdated(this);\" placeholder=\"your variable\"></input></td>";
          $("<tr class=\"dyn item inv"+i+"\"><td class=\"itemname\" title=\""+tempInventories[value][i].items[j].name+"\"><div>"+tempInventories[value][i].items[j].name+"</div></td><td class=\"itemvalue\"><button class=\"checkboxbutton left\" value=\""+j+"\" onclick=\"clickCheckboxButton(this);\">If</button>"+inputType+"</td><td class=\"transfer\">"+transfer+"</td>"+save+"</tr>").appendTo(thisrow.parent());
        });
      });
      $("<tr class=\"dyn mathheader darkrow\"><td class=\"bold\"><div>User Variables<span class=\"infolink\" onClick=\"showHelp(this, 17);\"></span></div></td><td></td><td><span class=\"hideshow\" onclick=\"hideShowMath(this);\">[hide]</span></td></tr>").appendTo(thisrow.parent());
      // Boolean Variables
      var variableinput = "<div class=\"inlineblock left\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"doubleRequiredInputUpdated(this);\" onkeyup=\"doubleRequiredInputUpdated(this);\" placeholder=\"variable\" title=\"choose a variable\"><div class=\"multiselectdata\" varType=\"bool\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
      var valueinput = "<div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"doubleRequiredInputUpdated(this);\" onkeyup=\"doubleRequiredInputUpdated(this);\" placeholder=\"value/var\" title=\"enter a value or choose a variable\"><div class=\"multiselectdata\" varType=\"bool\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"true\">true</div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"false\">false</div></div></div>";
      $("<tr class=\"dyn math\"><td class=\"variablename\"><div title=\"True/False Variables\">True/False Variables</div></td><td class=\"mathvalue\"><button class=\"checkboxbutton left\" value=\"0\" onclick=\"clickCheckboxButton(this);\">If</button>"+variableinput+"<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label>"+valueinput+"</td><td class=\"mathset\"><button class=\"checkboxbutton left\" value=\"0\" onclick=\"clickCheckboxButton(this);\">Set</button>"+variableinput+"<label class=\"tolabel\">to</label>"+valueinput+"</td></tr>").appendTo(thisrow.parent());
      // Numeric Variables
      variableinput = "<div class=\"inlineblock left\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"doubleRequiredInputUpdated(this);\" onkeyup=\"doubleRequiredInputUpdated(this);\" placeholder=\"variable\" title=\"choose a variable\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
      valueinput = "<div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"doubleRequiredInputUpdated(this);\" onkeyup=\"doubleRequiredInputUpdated(this);\" placeholder=\"value/var\" title=\"enter a value or choose a variable\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
      $("<tr class=\"dyn math\"><td class=\"variablename\"><div title=\"Numeric Variables\">Numeric Variables</div></td><td class=\"mathvalue\"><button class=\"checkboxbutton left\" value=\"1\" onclick=\"clickCheckboxButton(this);\">If</button>"+variableinput+"<label class=\"sign\" onclick=\"clickSign(this);\">=</label>"+valueinput+"</td><td class=\"mathset\"><button class=\"checkboxbutton left\" value=\"1\" onclick=\"clickCheckboxButton(this);\">Set</button>"+variableinput+"<label class=\"tolabel\">to</label>"+valueinput+"</td></tr>").appendTo(thisrow.parent());
      // Text Variables
      variableinput = "<div class=\"inlineblock left\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"doubleRequiredInputUpdated(this);\" onkeyup=\"doubleRequiredInputUpdated(this);\" placeholder=\"variable\" title=\"choose a variable\"><div class=\"multiselectdata\" varType=\"string\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"argument\">argument</div></div></div>";
      valueinput = "<div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"doubleRequiredInputUpdated(this);\" onkeyup=\"doubleRequiredInputUpdated(this);\" placeholder=\"text\" title=\"enter a value or choose a variable\"><div class=\"multiselectdata\" varType=\"string\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"argument\">argument</div></div></div>";
      $("<tr class=\"dyn math\"><td class=\"variablename\"><div title=\"Text Variables\">Text Variables</div></td><td class=\"mathvalue\"><button class=\"checkboxbutton left\" value=\"2\" onclick=\"clickCheckboxButton(this);\">If</button>"+variableinput+"<label class=\"sign\" onclick=\"clickSignSimple(this);\">=</label>"+valueinput+"</td><td class=\"mathset\"><button class=\"checkboxbutton left\" value=\"2\" onclick=\"clickCheckboxButton(this);\">Set</button>"+variableinput+"<label class=\"tolabel\">to</label>"+valueinput+"</td></tr>").appendTo(thisrow.parent());
      
      // Arbitrary Code (1.1.0)
      $("<tr class=\"dyn codeheader darkrow\"><td class=\"bold\"><div>Custom Code<span class=\"infolink\" onClick=\"showHelp(this, 22);\"></span></div></td><td></td><td><span class=\"hideshow\" onclick=\"hideShowCode(this);\">[hide]</span></td></tr>").appendTo(thisrow.parent());
      var codeinput = "<textarea class=\"helpbox\" onclick=\"showHelpBox(this);\" onchange=\"inputUpdated(this);\" placeholder=\"Code entered here will be run exactly as typed\"></textarea>";
      //var valueinput = "<div class=\"inlineblock\"><input class=\"multiselect\" type=\"text\" onclick=\"showSubRow(this);\" onchange=\"doubleRequiredInputUpdated(this);\" onkeyup=\"doubleRequiredInputUpdated(this);\" placeholder=\"value/var\" title=\"enter a value or choose a variable\"><div class=\"multiselectdata\" varType=\"float\" hidden=\"hidden\"><div class=\"multiselectOption\" onclick=\"clickMultiselectOption(this);\" value=\"\"> </div></div></div>";
      $("<tr class=\"dyn code\"><td class=\"ifcodename\"><div title=\"Conditional Code\">Conditional Code</div></td><td class=\"setcodename\"><div title=\"Action Code\">Action Code</div></td><td colspan=\"2\" class=\"codevalue textareaparent\"><button class=\"checkboxbutton left\" value=\"0\" onclick=\"clickCheckboxButton(this);\">If</button>"+codeinput+"<div class=\"helpboxdata mono\" style=\"display: none;\">"+ifCodeHelp+"</div></td><td colspan=\"2\" class=\"codeset textareaparent\"><button class=\"checkboxbutton left\" value=\"0\" onclick=\"clickCheckboxButton(this);\">Do</button>"+codeinput+"<div class=\"helpboxdata mono\" style=\"display: none;\">"+doCodeHelp+"</div></td></tr>").appendTo(thisrow.parent());

      /*
      <td colspan=\"2\" class=\"codeset textareaparent\">
        <button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button>
        <textarea class=\"helpbox\" onclick=\"showHelpBox(this);\" onchange=\"inputUpdated(this);\" placeholder=\"Code entered here will be run exactly as typed\"></textarea>
        <div class=\"helpboxdata mono\" style=\"display: none;\">"+ifCodeHelp+"</div>
      </td>";
      */
      
      //else if(tempPropertyTypes[value][i]=="textarea") {
          //inputType = "<td colspan=\"2\" class=\"propertyset\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><textarea onkeyup=\"inputUpdated(this);\" placeholder=\"text [your variable]\nmore text [your variable]\" title=\"Variables can be used like [this] by surrounding with brackets\"></textarea><a target=\"_blank\" href=\"http://dco.pe#LCD\" >Formatting Help</a></td>";
          //inputType = "<td colspan=\"2\" class=\"propertyset textareaparent\"><button class=\"checkboxbutton\" value=\""+i+"\" onclick=\"clickCheckboxButton(this);\">Set To</button><textarea class=\"helpbox\" onclick=\"showHelpBox(this);\" onchange=\"inputUpdated(this);\" placeholder=\"text [your variable]\nmore text [your variable]\" title=\"Variables can be used like [this] by surrounding with brackets\"></textarea><div class=\"helpboxdata mono\" style=\"display: none;\">"+lcdHelp+"</div></td>";
        //  tooltip = "title=\"text\"";
       // }
      
      //lockBlockTypeChange(e);
      //stateChanged();
      generateScript();
    };
    
    activateOption = function(value) {
      $('.blockmenu option[value="'+value+'"]').addClass('activeBlock');
    };
    
    deactivateOptions = function() {
      $('.blockmenu option').removeClass('activeBlock');
    };
    
    addBlockNameToList = function(name) {
      if(name.indexOf('"') == -1 && blockNameList.indexOf(name) == -1) {
        $("<option value=\""+name+"\">").appendTo('#blocknamelist');
        blockNameList.push(name);
      }
    };
    
    clearBlockNameList = function() {
      $('#blocknamelist').children().remove();
      blockNameList = [];
    };
    
    addGroupNameToList = function(name) {
      if(name.indexOf('"') == -1 && groupNameList.indexOf(name) == -1) {
        $("<option value=\""+name+"\">").appendTo('#groupnamelist');
        groupNameList.push(name);
      }
    };
    
    clearGroupNameList = function() {
      $('#groupnamelist').children().remove();
      groupNameList = [];
    };
    
    generateScript = function() {
      //console.log('----------------------- START -------------------------------');
      //console.time('generateScript');
      var startTime = window.performance.now();
      //showLoadingAnimation();
      $('#copied').hide(200);
      $('#copy').removeClass('copied');
      $('#saved').hide(200);
      $('#savebutton').removeClass('saved');
      errors = [];
      errorlines = [];
      script = [];
      allowMissingBlocks = $('.allowMissingBlocks').hasClass('selected');
      //console.time('saveShort');
      saved = saveShort();
      //console.timeEnd('saveShort');
      
      // 1.1.0
      autosave("//" + saved);
      
      script.push("//" + saved);
      
      //script.push("//" + $.param(saved));
      script.push("// Above is your LOAD LINE. Copy it into Visual Script Builder to load your script.");
      script.push("// dco.pe/vsb");
      script.push("");
      //gridName = "";
      thisGridOnly = $('.thisGridButton').hasClass('selected');
      //if($('.thisGridButton').hasClass('selected')) {
        //thisGridOnly = true;
        //gridName = $('.thisGridName').val();
        //add("IMyProgrammableBlock thisBlock = Me;");
        //script.push("");
      //}
      addFrequency();
      script.push("void Main(string argument)");
      script.push("{");
      indent = 1;
      //console.time('addStartFunctions');
      // main bulk of script generation - pushing lines to the script
      addStartFunctions();
      //console.timeEnd('addStartFunctions');
      
      //console.time('declareBlocks');
      declareBlocks();
      //console.timeEnd('declareBlocks');
      
      //console.time('checkErrors');
      checkErrors();
      //console.timeEnd('checkErrors');
      
      //console.time('buildLogic');
      buildLogic();
      //console.timeEnd('buildLogic');
      
      //console.time('addExtraFunctions');
      indent--;
      script.push("}");
      addExtraFunctions();
      //console.timeEnd('addExtraFunctions');
      
      //console.time('replace');
      result = "";
      for(var i = 0; i < script.length; i++){
        result += (script[i] + "\n");
      }
      result = result.replace(/if\(\)/g, "if(true)").replace(/if\(\(\)\)/g, "if((true))").replace(/if\(\!\(\)\)/g, "if(!(true))");
      $('#result').val(result);
      $('.resultsection textarea').each(function () {
        this.style.height = (this.scrollHeight - 4) + 'px';
      });
      //console.timeEnd('replace');
      
      
      //console.time('updateScreen');
      updateScreen();
      //console.timeEnd('updateScreen');
      
      //showHideLoadBox();
      //console.time('updateOverview');
      updateOverview();
      //console.timeEnd('updateOverview');
      
      showErrors();
      
      showCopyToClipboardButton();
      //hideLoadingAnimation();
      //console.timeEnd('generateScript');
      //var endTime = window.performance.now();
      var compileTime = Math.floor(window.performance.now() - startTime);
      console.log("compile time " + (compileTime));
      if(autoRecompile == false && compileTime < AUTO_RECOMPILE_LOW) {
        autoRecompile = true;
        console.log("auto-recompile activated");
      }
      else if(autoRecompile == true && compileTime > AUTO_RECOMPILE_HIGH) {
        autoRecompile = false;
        console.log("auto-recompile deactivated");
      }
    };
    
    addFrequency = function() {
      var frequencyId = $('.frequencySelect').val();
      if(frequencyId != '0') {
        script.push("public Program()");
        script.push("{");
        script.push("  Runtime.UpdateFrequency = UpdateFrequency."+getUpdateFrequencyValue(frequencyId)+";");
        script.push("}");
        script.push("");
      }
    };
    
    getUpdateFrequencyValue = function(frequencyId) {
      switch(frequencyId) {
        case '1':
          return 'Update1';
        case '2':
          return 'Update10';
        case '3':
          return 'Update100';
      }
      return 'None';
    };
    addStartFunctions = function() {
      thisGridOnlyFunctionNeeded = false;
      thisOxygenFilterFunctionNeeded = false;
      thisHydrogenFilterFunctionNeeded = false;
      oxygenFilterFunctionNeeded = false;
      hydrogenFilterFunctionNeeded = false;
      if(thisGridOnly) {
        filter = ", filterThis";
        /*if(gridName == "") {
          add("// this grid only");
          add("List<IMyTerminalBlock> l_this = new List<IMyTerminalBlock>();");
          add("GridTerminalSystem.GetBlocksOfType<IMyProgrammableBlock>(l_this, filterRunning);");
          add("if (l_this.Count == 1 && l_this[0] is IMyProgrammableBlock) {thisBlock = (l_this[0] as IMyProgrammableBlock);}");
          add("");
        }
        else if (gridName != "") {
          add("// this grid only");
          add("IMyTerminalBlock thisBlock = GridTerminalSystem.GetBlockWithName(\""+gridName+"\");");
          add("");
        }*/
      }
      else {
        filter = "";
      }
    };
    
    
    // creates the namedBlocks and namedBlockIndexes arrays
    // creates a single declaration for each block needed in the script
    // duplicate names will cause issues
    declareBlocks = function() {
      namedBlockIndexes = [];
      blocks = [];
      deactivateOptions();
      clearBlockNameList();
      clearGroupNameList();
      userVariables = [];
      userVariableTypes = [];
      userBools = [];
      userStrings = [];
      userFloats = [];
      userInventories = [];
      userPowers = [];
      userEnergies = [];
      var userInventoryChunks = [];
      var userInventoryIndexes = [];
      logicIndexes = [];
      $.each($('#stage1 .logic'), function(i) {
        var logicChoice = $(this).find('.selected').attr('value');
        if(logicChoice == undefined) {
          logicChoice = "3";
        }
        logicIndexes.push(parseInt(logicChoice, 10));
      });

      $.each($('#stage1 .logicblock'), function(i) {
        var bCustomName = $(this).find('.blockname').val();
        var bGroup = $(this).find('.groupname').val();
        var bType = $(this).find('.blockmenu option:selected').val();
        var bAffect = $(this).find('.blockoptions .selected').val();
        var m_this = $(this);
        //if(bType == "0") {
        //  addError(i, "you must select a block type");
        //}
        var defaultName = false;
        if(bCustomName == "" && bAffect == "0") {
          bCustomName = domainBlocks[bType].name;
          defaultName = true;
        }
        var inArray = false;
        // Always add Variable Block as new block, don't check if it's in array
        if(bAffect != "3") {
          $.each(blocks, function(i) {
            if(blocks[i].customName == bCustomName && blocks[i].domainBlockIndex == bType && blocks[i].single == (bAffect == "0") && blocks[i].groupName == bGroup && !blocks[i].isCustom) {
              inArray = true;
              namedBlockIndexes.push(i);
            }
          });
        }
        if(!inArray) {
          blocks.push(new Block("v"+(blocks.length), bType, bCustomName, bAffect, bGroup));
          namedBlockIndexes.push(blocks.length-1);
          // highlight the selected option for all blockmenus
          if(bAffect != "3") {
            activateOption(bType);
            if(!defaultName) {
              addBlockNameToList(bCustomName);
            }
            if(bGroup != "") {
              addGroupNameToList(bGroup);
            }
          }
        }
        var canSave = true;
        var logic = $(this).find('.logic button.selected').val();
        if(logic == 0) {
          var previousIf = false;
          for(var j = i-1; j >= 0; j--) {
            if(logicIndexes[j]==2 || logicIndexes[j]==4) {
              previousIf = true;
              break;
            }
            else if(logicIndexes[j]==3 || logicIndexes[j]==5) {
              previousIf = false;
              break;
            }
          }
          if(previousIf) {
            canSave = false;
          }
        }
        if(logic == 2 || logic == 4) {
          canSave = false;
        }
        $.each($(this).find('.field, .extrafield, .property, .item, .invfield'), function() {
          //if($(this).children('.save').length > 0 && !($(this).children('.save').is(':hidden')) && !($(this).children('.save').css('visibility') == 'hidden') && $(this).children('.save').find('button').hasClass('selected')) {
          if(canSave && $(this).children('.save').length > 0 && $(this).children('.save').find('button').hasClass('selected')) {
            var variableName = $(this).children('.save').find('input').val();
            validateVariableName(i, variableName, "variable name");
            if(variableName.startsWith("+") || variableName.startsWith("-")) {
              variableName = variableName.substring(1);
            }
            var varIndex = userVariables.indexOf(variableName);
            var variableType = $(this).children('.save').find('input').attr('varType');
            if(varIndex == -1) {
              if(variableName != "") {
                userVariables.push(variableName);
                userVariableTypes.push(variableType);
                if(variableType == "bool") {
                  userBools.push(variableName);
                }
                else if(variableType == "string") {
                  userStrings.push(variableName);
                }
                else if(variableType == "float") {
                  userFloats.push(variableName);
                }
                else if(variableType == "power") {
                  userPowers.push(variableName);
                }
                else if(variableType == "energy") {
                  userEnergies.push(variableName);
                }
              }
            }
            else if(userVariableTypes[varIndex] != variableType) {
              addError(i, "mismatched variable types for variable: "+variableName);
            }
          }
        });
        // added in 1.0.3 to declare from math section
        $.each($(this).find('.math'), function() {
          if(canSave && $(this).children('.mathset').length > 0 && $(this).children('.mathset').find('button').hasClass('selected')) {
            var variableName = $($(this).children('.mathset').find('input').get(0)).val();
            validateVariableName(i, variableName, "variable name");
            if(variableName.startsWith("+") || variableName.startsWith("-")) {
              variableName = variableName.substring(1);
            }
            // only add the variable if it isn't already included
            var varIndex = userVariables.indexOf(variableName);
            var variableType = $($($(this).children('.mathset').find('.inlineblock').get(0)).children()[1]).attr('vartype');
            if(varIndex == -1) {
              if(variableName != "") {
                userVariables.push(variableName);
                userVariableTypes.push(variableType);
                if(variableType == "bool") {
                  userBools.push(variableName);
                }
                else if(variableType == "float") {
                  userFloats.push(variableName);
                }
              }
            }
            // add error if this variable name is used for a different variable type
            else if(userVariableTypes[varIndex] != variableType) {
              addError(i, "mismatched variable types for variable: "+variableName);
            }
          }
        });
        // end added in 1.0.3
        $.each($(this).find('.inventoryheader'), function(j) {
          if($(this).find('input').val() != "" && $(m_this).find('.blockoptions .selected').val() == "0") {
            userInventories.push($(this).find('input').val());
            userInventoryChunks.push(i);
            userInventoryIndexes.push(j);
          }
        });
      });
      // 1.0.3 addition - error tracking
      add('// block declarations');
      add('string ERR_TXT = "";');
      $.each(blocks, function(i) {
        if(!this.isCustom) {
          var result = '';
          var group = '';
          var thisFilter = getFilter(this.domainBlock.id);
          if(this.groupName != "") {
            group = '.GetBlockGroupWithName("'+this.groupName+'")';
          }
          if(this.single == true) {
            if(this.customName != "Functional Block" && this.customName != "Lighting Block") {
              if(group != '') { // single block, custom name, in group
                add('List<IMyTerminalBlock> l'+i+' = new List<IMyTerminalBlock>();');
                add(''+this.type+' v'+i+' = null;');
                add('if(GridTerminalSystem'+group+' != null) {');
                add('  GridTerminalSystem'+group+'.GetBlocksOfType<'+this.type+'>(l'+i+thisFilter+');');
                add('  if(l'+i+'.Count == 0) {');
                add('    ERR_TXT += "group '+this.groupName+' has no '+this.domainBlock.name+' blocks\\n";');
                add('  }');
                add('  else {');
                add('    for(int i = 0; i < l'+i+'.Count; i++) {');
                add('      if(l'+i+'[i].CustomName == "'+this.customName+'") {');
                add('        v'+i+' = ('+this.type+')l'+i+'[i];');
                add('        break;');
                add('      }');
                add('    }');
                add('    if(v'+i+' == null) {');
                add('      ERR_TXT += "group '+this.groupName+' has no '+this.domainBlock.name+' block named '+this.customName+'\\n";');
                add('    }');
                add('  }');
                add('}');
                add('else {');
                add('  ERR_TXT += "group '+this.groupName+' not found\\n";');
                add('}');
              }
              else { // single block, custom name, not in group
                add('List<IMyTerminalBlock> l'+i+' = new List<IMyTerminalBlock>();');
                add(''+this.type+' v'+i+' = null;');
                add('GridTerminalSystem.GetBlocksOfType<'+this.type+'>(l'+i+thisFilter+');');
                add('if(l'+i+'.Count == 0) {');
                add('  ERR_TXT += "no '+this.domainBlock.name+' blocks found\\n";');
                add('}');
                add('else {');
                add('  for(int i = 0; i < l'+i+'.Count; i++) {');
                add('    if(l'+i+'[i].CustomName == "'+this.customName+'") {');
                add('      v'+i+' = ('+this.type+')l'+i+'[i];');
                add('      break;');
                add('    }');
                add('  }');
                add('  if(v'+i+' == null) {');
                add('    ERR_TXT += "no '+this.domainBlock.name+' block named '+this.customName+' found\\n";');
                add('  }');
                add('}');
              }
            }
            //else {
            //  addError(i, this.customName + " needs defined name for Single Block logic");
            //}
          }
          else {
            if(this.customName == "") {
              if(group != '') { // multiple blocks, no name filter, in group
                add('List<IMyTerminalBlock> v'+i+' = new List<IMyTerminalBlock>();');
                add('if(GridTerminalSystem'+group+' != null) {');
                add('  GridTerminalSystem'+group+'.GetBlocksOfType<'+this.type+'>(v'+i+thisFilter+');');
                add('  if(v'+i+'.Count == 0) {');
                add('    ERR_TXT += "group '+this.groupName+' has no '+this.domainBlock.name+' blocks\\n";');
                add('  }');
                add('}');
                add('else {');
                add('  ERR_TXT += "group '+this.groupName+' not found\\n";');
                add('}');
              }
              else { // multiple blocks, no name filter, not in group
                add('List<IMyTerminalBlock> v'+i+' = new List<IMyTerminalBlock>();');
                add('GridTerminalSystem.GetBlocksOfType<'+this.type+'>(v'+i+thisFilter+');');
                add('if(v'+i+'.Count == 0) {');
                add('  ERR_TXT += "no '+this.domainBlock.name+' blocks found\\n";');
                add('}');
              }
            }
            else {
              if(group != '') { // multiple blocks, name filter, in group
                add('List<IMyTerminalBlock> v'+i+'a = new List<IMyTerminalBlock>();');
                add('List<IMyTerminalBlock> v'+i+' = new List<IMyTerminalBlock>();');
                add('if(GridTerminalSystem'+group+' != null) {');
                add('  GridTerminalSystem'+group+'.GetBlocksOfType<'+this.type+'>(v'+i+'a'+thisFilter+');');
                add('  if(v'+i+'a.Count > 0) {');
                add('    for(int i = 0; i < v'+i+'a.Count; i++) {');
                add('      if(v'+i+'a[i].CustomName.IndexOf(\"'+this.customName+'\") > -1) {');
                add('        v'+i+'.Add(v'+i+'a[i]);');
                add('      }');
                add('    }');
                add('    if(v'+i+'.Count == 0) {');
                add('      ERR_TXT += "group '+this.groupName+' has no '+this.domainBlock.name+' blocks with name including '+this.customName+'\\n";');
                add('    }');
                add('  }');
                add('  else {');
                add('    ERR_TXT += "group '+this.groupName+' has no '+this.domainBlock.name+' blocks\\n";');
                add('  }');
                add('}');
                add('else {');
                add('  ERR_TXT += "group '+this.groupName+' not found\\n";');
                add('}');
              }
              else { // multiple blocks, name filter, not in group
                add('List<IMyTerminalBlock> v'+i+'a = new List<IMyTerminalBlock>();');
                add('List<IMyTerminalBlock> v'+i+' = new List<IMyTerminalBlock>();');
                add('GridTerminalSystem.GetBlocksOfType<'+this.type+'>(v'+i+'a'+thisFilter+');');
                add('if(v'+i+'a.Count > 0) {');
                add('  for(int i = 0; i < v'+i+'a.Count; i++) {');
                add('    if(v'+i+'a[i].CustomName.IndexOf(\"'+this.customName+'\") > -1) {');
                add('      v'+i+'.Add(v'+i+'a[i]);');
                add('    }');
                add('  }');
                add('  if(v'+i+'.Count == 0) {');
                add('    ERR_TXT += "no '+this.domainBlock.name+' blocks with name including '+this.customName+' found\\n";');
                add('  }');
                add('}');
                add('else {');
                add('  ERR_TXT += "no '+this.domainBlock.name+' blocks found\\n";');
                add('}');
              }
            }
          }
        }
      });
      if(userVariables.length > 0) {
        add("");
        add("// user variable declarations");
      }
      $.each(userVariables, function(i) {
        var initialValue = "";
        var type = userVariableTypes[i];
        if(type == "energy" || type == "power") {
          type = "float";
        }
        if(type == "bool") {
          initialValue = "false";
        }
        else if (type == "float") {
          initialValue = "0.0f";
        }
        else if (type == "int") {
          initialValue = "0";
        }
        else if (type == "string") {
          initialValue = "\"\"";
        }
        else {
          initialValue = "null";
        }
        if(userVariables[i] != "argument") {
          add(type + " " + userVariables[i] + " = " + initialValue + ";");
        }
      });
      if(userInventories.length > 0) {
        add("");
        add("// inventory declarations");
      }
      $.each(userInventories, function(i) {
        add("IMyInventory "+userInventories[i]+" = v"+namedBlockIndexes[userInventoryChunks[i]]+".GetInventory("+userInventoryIndexes[i]+");");
      });
      add("");
    };
    
    
    // , filterThis
    // , filterOxy
    // , filterHyd
    // , filterThisOxy
    // , filterThisHyd
    // e.domainBlock.id 70-hyd, 38-oxy
    getFilter = function(id) {
      var result = "";
      if (thisGridOnly) {
        // Oxygen Tank + This Grid Only
        if(id == 38) {
          thisOxygenFilterFunctionNeeded = true;
          result = ", filterThisOxy";
        }
        // Hydrogen Tank + This Grid Only
        else if(id == 70) {
          thisHydrogenFilterFunctionNeeded = true;
          result = ", filterThisHyd";
        }
        // Other Block + This Grid Only
        else {
          thisGridOnlyFunctionNeeded = true;
          result = ", filterThis";
        }
      }
      else {
        // Oxygen Tank
        if(id == 38) {
          oxygenFilterFunctionNeeded = true;
          result = ", filterOxy";
        }
        // Hydrogen Tank
        else if(id == 70) {
          hydrogenFilterFunctionNeeded = true;
          result = ", filterHyd";
        }
        // Other Block
        else {
          result = "";
        }
      }
      return result;
    };
    
    // adds the block that displays errors on the programmable block's DetailedInfo
    // and skips all the logic if there are errors
    checkErrors = function() {
      add('// display errors');
      add('if(ERR_TXT != "") {');
      add('  Echo("Script Errors:\\n"+ERR_TXT+"(make sure block ownership is set correctly)");');
      if(!allowMissingBlocks) {
        add('  return;');
      }
      add('}');
      add('else {Echo("");}');
      add('');
    };
    
    // adds all the logic to the script
    buildLogic = function() {
      chunks = namedBlockIndexes.length;
      indent = 1;
      inIfBlock = 0;
      doneCode = 0;
      extraFieldFunctionNeededString = false;
      extraFieldFunctionNeededFloat = false;
      extraFieldFunctionNeededDegrees = false;
      countItemFunctionNeeded = false;
      transferItemToFunctionNeeded = false;
      transferItemFromFunctionNeeded = false;
      transferItemFunctionNeeded = false;
      //getAmountFunctionNeeded = false;
      powerFormatFunctionNeeded = false;
      energyFormatFunctionNeeded = false;
      add("// logic");
      addLogic(0);
    };
    
    // adds necessary functions after main method
    addExtraFunctions = function() {
      var itemRounding = $('.itemprecision input').val();
      if(extraFieldFunctionNeededFloat || powerFormatFunctionNeeded || energyFormatFunctionNeeded) {
        add("");
        add("const string MULTIPLIERS = \".kMGTPEZY\";");
      }
      if(powerFormatFunctionNeeded) {
        add("int POWER_PRECISION = " + $('.powerprecision input').val() + ";");
      }
      if(energyFormatFunctionNeeded) {
        add("int ENERGY_PRECISION = " + $('.energyprecision input').val() + ";");
      }
      if(countItemFunctionNeeded && itemRounding < 4) {
        add("int ITEM_PRECISION = " + itemRounding + ";");
      }
      if(thisGridOnlyFunctionNeeded) {
        add("");
        add("bool filterThis(IMyTerminalBlock block) {");
        add("  return block.CubeGrid == Me.CubeGrid;");
        add("}");
      }
      if(thisOxygenFilterFunctionNeeded) {
        add("");
        add("bool filterThisOxy(IMyTerminalBlock block) {");
        add("  return (block.CubeGrid == Me.CubeGrid && !block.BlockDefinition.SubtypeId.Contains(\"Hydrogen\"));");
        add("}");
      }
      if(thisHydrogenFilterFunctionNeeded) {
        add("");
        add("bool filterThisHyd(IMyTerminalBlock block) {");
        add("  return (block.CubeGrid == Me.CubeGrid && block.BlockDefinition.SubtypeId.Contains(\"Hydrogen\"));");
        add("}");
      }
      if(oxygenFilterFunctionNeeded) {
        add("");
        add("bool filterOxy(IMyTerminalBlock block) {");
        add("  return !block.BlockDefinition.SubtypeId.Contains(\"Hydrogen\");");
        add("}");
      }
      if(hydrogenFilterFunctionNeeded) {
        add("");
        add("bool filterHyd(IMyTerminalBlock block) {");
        add("  return block.BlockDefinition.SubtypeId.Contains(\"Hydrogen\");");
        add("}");
      }
      /*if(thisGridOnly && gridName == "") {
        add("");
        add("bool filterRunning(IMyTerminalBlock block) {return (block as IMyProgrammableBlock).IsRunning;}");
        add("");
        add("bool filterThis(IMyTerminalBlock block) {return (thisBlock == null || block.CubeGrid == thisBlock.CubeGrid);}");
      }
      else if (thisGridOnly && gridName != "") {
        add("");
        add("bool filterThis(IMyTerminalBlock block) {return (thisBlock == null || block.CubeGrid == thisBlock.CubeGrid);}");
      }*/
      if(extraFieldFunctionNeededString) {
        add("");
        add("string getExtraField(IMyTerminalBlock block, string regexString) {");
        add("  System.Text.RegularExpressions.Regex regex = new System.Text.RegularExpressions.Regex(regexString, System.Text.RegularExpressions.RegexOptions.Singleline);");
        add("  string result = \"\";");
        add("  System.Text.RegularExpressions.Match match = regex.Match(block.DetailedInfo);");
        add("  if(match.Success) {");
        add("    result = match.Groups[1].Value;");
        add("  }");
        add("  return result;");
        add("}");
      }
      if(extraFieldFunctionNeededFloat) {
        add("");
        add("float getExtraFieldFloat(IMyTerminalBlock block, string regexString) {");
        add("  System.Text.RegularExpressions.Regex regex = new System.Text.RegularExpressions.Regex(regexString, System.Text.RegularExpressions.RegexOptions.Singleline);");
        add("  float result = 0.0f;");
        add("  double parsedDouble;");
        add("  System.Text.RegularExpressions.Match match = regex.Match(block.DetailedInfo);");
        add("  if (match.Success) {");
        add("    if (Double.TryParse(match.Groups[1].Value, out parsedDouble)) {");
        add("      result = (float) parsedDouble;");
        add("    }");
        add("    if(MULTIPLIERS.IndexOf(match.Groups[2].Value) > -1) {");
        add("      result = result * (float) Math.Pow(1000.0, MULTIPLIERS.IndexOf(match.Groups[2].Value));");
        add("    }");
        add("  }");
        add("  return result;");
        add("}");
      }
      if(extraFieldFunctionNeededDegrees) {
        add("");
        add("float getDegrees(float rad) {");
        add("  return (float) (rad * (180/Math.PI));");
        add("}");
      }
      if(countItemFunctionNeeded) {
        add("");
        add("float countItem(IMyInventory inv, string itemType, string itemSubType) {");
        add("  var items = new List<MyInventoryItem>();");
        add("  inv.GetItems(items, null);");
        add("  float total = 0.0f;");
        add("  for(int i = 0; i < items.Count; i++) {");
        add("    if(items[i].Type.TypeId.ToString().EndsWith(itemType) && items[i].Type.SubtypeId.ToString() == itemSubType) {");
        //add("      total += getAmount(items[i]);");
        add("      total += (float)items[i].Amount;");
        add("    }");
        add("  }");
        if(itemRounding < 4) {
          add("  return (float)Math.Round((double)total,ITEM_PRECISION);");
        }
        else {
          add("  return total;");
        }
        add("}");
        //getAmountFunctionNeeded = true;
      }
      if(transferItemFunctionNeeded) {
        add("");
        add("void transfer(IMyInventory a, IMyInventory b, string type, string sType, float amount) {");
        add("  var items = a.GetItems();");
        add("  float left = amount;");
        add("  for(int i = items.Count - 1; i >= 0; i--) {");
        add("    if(left > 0 && items[i].Content.TypeId.ToString().EndsWith(type) && items[i].Content.SubtypeId.ToString() == sType) {");
        add("      if((float)items[i].Amount > left) {");
        add("        // transfer remaining and break");
        add("        a.TransferItemTo(b, i, null, true, (VRage.MyFixedPoint)amount);");
        add("        left = 0;");
        add("        break;");
        add("      }");
        add("      else {");
        add("        left -= (float)items[i].Amount;");
        add("        // transfer all");
        add("        a.TransferItemTo(b, i, null, true, null);");
        add("      }");
        add("    }");
        add("  }");
        add("}");
        //getAmountFunctionNeeded = true;
      }
      /*if(getAmountFunctionNeeded) {
        add("");
        add("float getAmount(IMyInventoryItem item) {");
        add("  string type = item.Content.TypeId.ToString();");
        add("  if(type.EndsWith(\"_Ore\") || type.EndsWith(\"_Ingot\")) {");
        add("    return (item.Amount.RawValue)/1000000;");
        add("  }");
        add("  return item.Amount.RawValue;");
        add("}");
      }*/
      if(powerFormatFunctionNeeded) {
        add("");
        add("string powerFormat(float power) {");
        add("  bool n = (power < 0.0);");
        add("  power = Math.Abs(power);");
        add("  int counter = 0;");
        add("  string mult = \"\";");
        add("  while (power > 1000.0) {");
        add("    power = power / 1000;");
        add("    counter++;");
        add("    mult = MULTIPLIERS.Substring(counter,1);");
        add("  }");
        add("  string zeroes = \"\";");
        add("  for (int i = 0; i < POWER_PRECISION && i < " + MAX_POWER_PRECISION + "; i++) {");
        add("    zeroes += \"0\";");
        add("  }");
        add("  return (n?\"-\":\"\") + Math.Round((double)power,POWER_PRECISION).ToString(\"##0.\"+zeroes) + \" \" + mult + \"W\";");
        add("}");
      }
      if(energyFormatFunctionNeeded) {
        add("");
        add("string energyFormat(float energy) {");
        add("  bool n = (energy < 0.0);");
        add("  energy = Math.Abs(energy);");
        add("  int counter = 0;");
        add("  string mult = \"\";");
        add("  while (energy > 1000.0) {");
        add("    energy = energy / 1000;");
        add("    counter++;");
        add("    mult = MULTIPLIERS.Substring(counter,1);");
        add("  }");
        add("  string zeroes = \"\";");
        add("  for (int i = 0; i < ENERGY_PRECISION && i < " + MAX_ENERGY_PRECISION + "; i++) {");
        add("    zeroes += \"0\";");
        add("  }");
        add("  return (n?\"-\":\"\") + Math.Round((double)energy,ENERGY_PRECISION).ToString(\"##0.\"+zeroes) + \" \" + mult + \"Wh\";");
        add("}");
      }
    };
    
    
    // adds logic lines based on previous logic and current logic
    addLogic = function(i) {
      var a = logicIndexes[i];
      switch(a) {
        // and
        case 0:
          var previousIf = false;
          for(var j = i-1; j >= 0; j--) {
            if(logicIndexes[j]==2 || logicIndexes[j]==4) {
              previousIf = true;
              break;
            }
            else if(logicIndexes[j]==3 || logicIndexes[j]==5) {
              previousIf = false;
              break;
            }
          }
          if(previousIf) {
            return (" && "+getCode(i)+((logicIndexes[i+1]==0||logicIndexes[i+1]==1)?addLogic(i+1):""));
          }
          else {
            setCode(i);
            if(inIfBlock > 0 && logicIndexes[i+1]!=0) {
              indent--;
              inIfBlock--;
              add("}");
            }
            addLogic(doneCode+1);
          }
          break;
          
        // or
        case 1:
          return (" || ("+getCode(i)+")"+((logicIndexes[i+1]==0||logicIndexes[i+1]==1)?addLogic(i+1):""));
          break;
          
        // if
        case 2:
          inIfBlock++;
          //add("if("+getCode(i)+ (logicIndexes[i+i]==0?"":"")+") {");
          var moreLogic = (logicIndexes[i+1]==0||logicIndexes[i+1]==1);
          add("if("+getCode(i)+(moreLogic?addLogic(i+1):"")+") {");
          indent++;
          addLogic(doneCode+1);
          break;
          
        // do/set
        case 3:
          setCode(i);
          
          // detect end if
          if(inIfBlock > 0 && logicIndexes[i+1]!=0) {
            indent--;
            inIfBlock--;
            add("}");
          }
          addLogic(doneCode+1);
          break;
          
        // else if
        case 4:
          var previousElse = false;
          for(var j = i-1; j >= 0; j--) {
            if(logicIndexes[j]==5) {
              previousElse = true;
              break;
            }
            else if(logicIndexes[j]==3) {
              previousElse = false;
              break;
            }
          }
          if(previousElse && inIfBlock > 0) {
            indent--;
            inIfBlock--;
            add("}");
          }
          inIfBlock++;
          //add("if("+getCode(i)+ (logicIndexes[i+i]==0?"":"")+") {");
          var moreLogic = (logicIndexes[i+1]==0||logicIndexes[i+1]==1);
          add("else if("+getCode(i)+(moreLogic?addLogic(i+1):"")+") {");
          indent++;
          addLogic(doneCode+1);
          break;
          
        // else
        case 5:
          var previousElse = false;
          for(var j = i-1; j >= 0; j--) {
            if(logicIndexes[j]==5) {
              previousElse = true;
              break;
            }
            else if(logicIndexes[j]==3) {
              previousElse = false;
              break;
            }
          }
          if(previousElse && inIfBlock > 0) {
            indent--;
            inIfBlock--;
            add("}");
          }
          inIfBlock++;
          add("else {");
          indent++;
          setCode(i);
          if(inIfBlock > 0 && logicIndexes[i+1]!=0) {
            indent--;
            inIfBlock--;
            add("}");
          }
          addLogic(doneCode+1);
          break;
      }
      while(inIfBlock > 0) {
        indent--;
        inIfBlock--;
        add("}");
      }
      return "";
    };
    
    // returns code to check against value(s) for chunk i
    getCode = function(i) {
      if(i > doneCode) {
        doneCode = i;
      }
      var $logicblock = $('#stage1 .logicblock:nth-of-type('+(i+1)+')');
      var block = getBlockByChunk(i);
      var appliedFields = getAppliedFieldsForChunk(i);
      var appliedExtraFields = getAppliedExtraFieldsForChunk(i);
      var itemApplied = false;
      var result = "";
      var listindex = '';
      var logicchoice = $logicblock.find('.logic .selected').val();
      // previousElseIf checks to see if the most recent non-and/or is an elseif - used for knowing if we're in an elseif logic check for multiple blocks
      var previousElseIf = false;
      for(var j = i-1; j > 0; j--) {
        var jLogic = $('#stage1 .logicblock:nth-of-type('+(j+1)+') .logic .selected').val();
        if(jLogic == 4) {
          previousElseIf = true;
          break;
        }
        else if(jLogic == 2 || jLogic == 3 || jLogic == 5) {
          previousElseIf = false;
          break;
        }
      }
      // single, all, any block of type
      var blockchoice = $logicblock.find('.blockoptions .selected').val();
      //if(blockchoice == 0 && $(logicblock).find('.blockname').val() == '' && ($(logicblock).find('.blockmenu').val() == '0' || $(logicblock).find('.blockmenu').val() == '1')) {
      //  addError(i, block.customName + " needs defined name for Single Block logic");
      //}
      // all blocks of type
      if(blockchoice == 1) {
        listindex = '[i]';
        // elseif, elseif followed by and/or should put their loops before the if
        if(logicchoice == 4 || ((logicchoice == 0 || logicchoice == 1) && previousElseIf == true)) {
          addBeforeLastIf("bool result" + i + block.variable + " = true;");
          addBeforeLastIf("for(int i = 0; i < " + block.variable + ".Count; i++) {");
          result += "  if(!(";
        }
        else {
          add("bool result" + i + block.variable + " = true;");
          add("for(int i = 0; i < " + block.variable + ".Count; i++) {");
          result += "  if(!(";
        }
      }
      // any blocks of type
      if(blockchoice == 2) {
        listindex = '[i]';
        if(logicchoice == 4 || ((logicchoice == 0 || logicchoice == 1) && previousElseIf == true)) {
          addBeforeLastIf("bool result" + i + block.variable + " = false;");
          addBeforeLastIf("for(int i = 0; i < " + block.variable + ".Count; i++) {");
          result += "  if(";
        }
        else {
          add("bool result" + i + block.variable + " = false;");
          add("for(int i = 0; i < " + block.variable + ".Count; i++) {");
          result += "  if(";
        }
      }
      if(blockchoice != 3) {
        for(var j = 0; j < appliedFields.length; j++) {
          var operatorhtml = $($logicblock.children().find('.field').get(appliedFields[j])).find('.sign').html();
          var operator = '==';
          if(operatorhtml == undefined) {
          // operator = '==';
          }
          else if(operatorhtml == '!=') {
            operator = '!=';
          }
          else if(operatorhtml == '&gt;') {
            operator = '>';
          }
          else if(operatorhtml == '&lt;') {
            operator = '<';
          }
          else if(operatorhtml == '&gt;=') {
            operator = '>=';
          }
          else if(operatorhtml == '&lt;=') {
            operator = '<=';
          }
          if(itemApplied){
            result += " && ";
          }
          //result += (block.variable+listindex+'.'+block.fields[appliedFields[j]]+' '+operator+' '+getValueByChunkAndField(i, appliedFields[j]));
          result += ('(('+block.domainBlock.type+')'+block.variable+listindex+').'+block.fields[appliedFields[j]]+' '+operator+' '+getValueByChunkAndField(i, appliedFields[j]));
          itemApplied = true;
        }
        for(var j = 0; j < appliedExtraFields.length; j++) {
          var operatorhtml = $($logicblock.find('.extrafield').get(appliedExtraFields[j])).find('.sign').html();
          var operator = '==';
          if(operatorhtml == undefined) {
          // operator = '==';
          }
          else if(operatorhtml == '!=') {
            operator = '!=';
          }
          else if(operatorhtml == '&gt;') {
            operator = '>';
          }
          else if(operatorhtml == '&lt;') {
            operator = '<';
          }
          else if(operatorhtml == '&gt;=') {
            operator = '>=';
          }
          else if(operatorhtml == '&lt;=') {
            operator = '<=';
          }
          if(itemApplied) {
            result += " && ";
          }
          if(block.extraFieldTypes[appliedExtraFields[j]] == "string") {
            result += ('getExtraField('+block.variable+listindex+', "'+block.extraFieldRegexes[appliedExtraFields[j]]+'") '+operator+' "'+getValueByChunkAndExtraField(i, appliedExtraFields[j])+'"');
            extraFieldFunctionNeededString = true;
            itemApplied = true;
          }
          else if(block.extraFieldTypes[appliedExtraFields[j]] == "float" || block.extraFieldTypes[appliedExtraFields[j]] == "power" || block.extraFieldTypes[appliedExtraFields[j]] == "energy") {
            result += ('getExtraFieldFloat('+block.variable+listindex+', "'+block.extraFieldRegexes[appliedExtraFields[j]]+'") '+operator+' '+getValueByChunkAndExtraField(i, appliedExtraFields[j]));
            extraFieldFunctionNeededFloat = true;
            itemApplied = true;
          }
          else if(block.extraFieldTypes[appliedExtraFields[j]] == "degrees"){
            result += ('getDegrees('+block.variable+listindex+'.'+block.extraFieldRegexes[appliedExtraFields[j]]+') '+operator+' '+getValueByChunkAndExtraField(i, appliedExtraFields[j]));
            extraFieldFunctionNeededDegrees = true;
            itemApplied = true;
          }
        }
        // if properties
        $.each($logicblock.find('.property'), function(j) {
          if($(this).find('.propertyvalue').length > 0 && $(this).find('.propertyvalue').find('button').hasClass('selected')) {
            var value = $(this).find('.propertyvalue input').val();
            if(value == undefined) {
              value = $(this).find('.propertyvalue textarea').val();
            }
            else {
              // don't validate for textareas
              if(value == "") {
                addError(i, "no value entered for " + block.properties[j]);
              }
              else {
                validateInput(i, value, "property");
              }
            }
            var operatorhtml = $(this).find('.propertyvalue .sign').html();
            var operator = '==';
            if(operatorhtml == undefined) {
            // operator = '==';
            }
            else if(operatorhtml == '!=') {
              operator = '!=';
            }
            else if(operatorhtml == '&gt;') {
              operator = '>';
            }
            else if(operatorhtml == '&lt;') {
              operator = '<';
            }
            else if(operatorhtml == '&gt;=') {
              operator = '>=';
            }
            else if(operatorhtml == '&lt;=') {
              operator = '<=';
            }
            if(itemApplied) {
              result += " && ";
            }
            if(value != "") {
              var setType = getSetType(block.propertyTypes[j]);
              if(setType == "string") {
                var trimmedValue = value;
                var trimmed = false;
                if(value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
                  trimmedValue = value.substring(1, value.length-1);
                  trimmed = true;
                }
                if((userStrings.indexOf(trimmedValue) == -1 && trimmedValue != 'argument') || trimmed == true) {
                  result += (block.variable+listindex + '.'+block.properties[j]+' ' + operator + ' ' + '"' + trimmedValue + '"');
                }
                else {
                  result += (block.variable+listindex + '.'+block.properties[j]+' ' + operator + ' ' + trimmedValue);
                }
              }
              else if(setType == "textarea") {
                // TODO: Verify IF textarea works - fix newlines
                result += (block.variable+listindex + '.GetPublicText() ' + operator + ' (\"' + replaceVariables(value.replace(/\n/g, "\\n")) + '\")');
              }
              else if(setType == "ChargeMode") {
                result += (block.variable+listindex + '.' + block.properties[j] + ' ' + operator + ' ChargeMode.' + value);
              }
              else if(setType == "MyAssemblerMode") {
                result += (block.variable+listindex + '.' + block.properties[j] + ' ' + operator + ' MyAssemblerMode.' + value);
              }
              else if(setType == "FlightMode") {
                result += (block.variable+listindex + '.' + block.properties[j] + ' ' + operator + ' FlightMode.' + value);
              }
              else {
                // 1.1.1 - removing GetValue
                //result += (block.variable+listindex + '.GetValue'+setType+'(\"'+block.properties[j]+'\") ' + operator + ' ' + value);
                result += (block.variable+listindex + '.' + block.properties[j] + ' ' + operator + ' ' + value);
              }
              itemApplied = true;
            }
          }
        });
        
        if(block.inventories != undefined) {
          for(var j = 0; j < block.inventories.length; j++) {
            for(var k = 0; k < block.inventories[j].fields.length; k++) {
              var invfieldrow = $logicblock.find('.invfield.inv'+j)[k];
              if($(invfieldrow).find('.fieldvalue button').hasClass('selected')) {
                var value = $(invfieldrow).find('.fieldvalue input').val();
                if(value == "") {
                  addError(i, "no value entered for " + $(invfieldrow).find('.fieldname').html());
                }
                else {
                  validateInput(i, value, "item");
                }
                var operatorhtml = $(invfieldrow).find('.fieldvalue .sign').html();
                var operator = '==';
                if(operatorhtml == undefined) {
                // operator = '==';
                }
                else if(operatorhtml == '!=') {
                  operator = '!=';
                }
                else if(operatorhtml == '&gt;') {
                  operator = '>';
                }
                else if(operatorhtml == '&lt;') {
                  operator = '<';
                }
                else if(operatorhtml == '&gt;=') {
                  operator = '>=';
                }
                else if(operatorhtml == '&lt;=') {
                  operator = '<=';
                }
                if(itemApplied) {
                  result += " && ";
                }
                var cast = '';
                if(block.inventories[j].fieldTypes[k] == 'floatcast') {
                  cast = '(float)';
                }
                if(block.inventories[j].fieldTypes[k] == 'connected') {
                  result += ('(('+block.domainBlock.type+')'+block.variable+listindex+').GetInventory('+j+').'+block.inventories[j].fields[k]+'('+value+') '+operator+' true');
                }
                else {
                  result += (cast+'(('+block.domainBlock.type+')'+block.variable+listindex+').GetInventory('+j+').'+block.inventories[j].fields[k]+' '+operator+' '+value);
                }
                itemApplied = true;
              }
            }
            for(var k = 0; k < block.inventories[j].items.length; k++) {
              var itemrow = $logicblock.find('.item.inv'+j)[k];
              if($(itemrow).find('.itemvalue button').hasClass('selected')) {
                var value = $(itemrow).find('.itemvalue input').val();
                if(value == "") {
                  addError(i, "no value entered for " + $(itemrow).find('.itemname').html());
                }
                else {
                  validateInput(i, value, "item");
                }
                var operatorhtml = $(itemrow).find('.itemvalue .sign').html();
                var operator = '==';
                if(operatorhtml == undefined) {
                // operator = '==';
                }
                else if(operatorhtml == '!=') {
                  operator = '!=';
                }
                else if(operatorhtml == '&gt;') {
                  operator = '>';
                }
                else if(operatorhtml == '&lt;') {
                  operator = '<';
                }
                else if(operatorhtml == '&gt;=') {
                  operator = '>=';
                }
                else if(operatorhtml == '&lt;=') {
                  operator = '<=';
                }
                if(itemApplied) {
                  result += " && ";
                }
                result += ('countItem('+block.variable+listindex+'.GetInventory('+j+'), "'+block.inventories[j].items[k].typeId+'", "'+block.inventories[j].items[k].subTypeId+'") '+operator+' '+value);
                countItemFunctionNeeded = true;
                itemApplied = true;
              }
            }
          }
        }
      }
      else {
        // variable logic
        $.each($logicblock.find('.math'), function(j) {
          if($(this).find('.mathvalue').find('button').hasClass('selected')) {
            var variable = $($(this).find('.mathvalue input')[0]).val();
            var value = $($(this).find('.mathvalue input')[1]).val();
            var inputType = $($(this).find('.multiselectdata')[0]).attr('vartype');
            if(variable == "" || value == "") {
              addError(i, "missing variable value");
            }
            else {
              validateVariableName(i, variable, "variable");
              validateInput(i, value, "variable value");
            }
            var trimmedValue = value;
            var trimmed = false;
            if(value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
              trimmedValue = value.substring(1, value.length-1);
              trimmed = true;
            }
            var operatorhtml = $(this).find('.mathvalue .sign').html();
            var operator = '==';
            if(operatorhtml == undefined) {
            // operator = '==';
            }
            else if(operatorhtml == '!=') {
              operator = '!=';
            }
            else if(operatorhtml == '&gt;') {
              operator = '>';
            }
            else if(operatorhtml == '&lt;') {
              operator = '<';
            }
            else if(operatorhtml == '&gt;=') {
              operator = '>=';
            }
            else if(operatorhtml == '&lt;=') {
              operator = '<=';
            }
            if(itemApplied) {
              result += " && ";
            }
            if(variable != "" && trimmedValue != "") {
              if(inputType == "string" && ((userStrings.indexOf(trimmedValue) == -1 && trimmedValue != 'argument') || trimmed == true)) {
                result += (variable + ' ' + operator + ' "' + trimmedValue + '"');
              }
              else {
                result += (variable + ' ' + operator + ' ' + trimmedValue);
              }
              itemApplied = true;
            }
          }
        });
        
        // custom code
        if($logicblock.find('.code .codevalue button').hasClass('selected')) {
          if(itemApplied) {
            result += " && ";
          }
          result += $logicblock.find('.code .codevalue textarea').val();
        }
      }
      // all blocks of type
      if(blockchoice == 1) {
        if(logicchoice == 4 || ((logicchoice == 0 || logicchoice == 1) && previousElseIf == true)) {
          result += ")) {";
          addBeforeLastIf(result);
          addBeforeLastIf("    result" + i + block.variable + " = false;");
          addBeforeLastIf("    break;");
          addBeforeLastIf("  }");
          addBeforeLastIf("}");
          result = ("result" + i + block.variable);
        }
        else {
          result += ")) {";
          add(result);
          add("    result" + i + block.variable + " = false;");
          add("    break;");
          add("  }");
          add("}");
          result = ("result" + i + block.variable);
        }
      }
      // any blocks of type
      if(blockchoice == 2) {
        if(logicchoice == 4 || ((logicchoice == 0 || logicchoice == 1) && previousElseIf == true)) {
          result += ") {";
          addBeforeLastIf(result);
          addBeforeLastIf("    result" + i + block.variable + " = true;");
          addBeforeLastIf("    break;");
          addBeforeLastIf("  }");
          addBeforeLastIf("}");
          result = ("result" + i + block.variable);
        }
        else {
          result += ") {";
          add(result);
          add("    result" + i + block.variable + " = true;");
          add("    break;");
          add("  }");
          add("}");
          result = ("result" + i + block.variable);
        }
      }
      
      $logicblock.attr('indent', indent);
      return result;
    };
    
    // adds code to set properties and perform action(s) for chunk i
    // does add the props/actions to the script
    setCode = function(i) {
      if(i > doneCode) {
        doneCode = i;
      }
      var $logicblock = $('#stage1 .logicblock:nth-of-type('+(i+1)+')');
      var block = getBlockByChunk(i);
      var appliedProperties = getAppliedPropertiesForChunk(i);
      var appliedActions = getAppliedActionsForChunk(i);
      //var setVariables = getSetVariablesForChunk(i);
      var listindex = '';
      var singleBlock = block.single;
      if(!singleBlock) {
        listindex = '[i]';
        add('for(int i = 0; i < '+block.variable+'.Count; i++) {');
        indent++;
      }
      if(!block.isCustom) {
        for(var j = 0; j < appliedProperties.length; j++) {
          if(block.propertyTypes[appliedProperties[j]] == "color") {
            var red = $($($logicblock.find('.propertyset')[appliedProperties[j]]).find('.red')).val();
            var green = $($($logicblock.find('.propertyset')[appliedProperties[j]]).find('.green')).val();
            var blue = $($($logicblock.find('.propertyset')[appliedProperties[j]]).find('.blue')).val();
            // 1.1.1 - removing SetValue
            //add(block.variable+listindex+'.SetValueColor(\"'+block.properties[appliedProperties[j]]+'\", new Color('+red+', '+green+', '+blue+'));');
            add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' = new Color('+red+', '+green+', '+blue+');');
          }
          else if(block.propertyTypes[appliedProperties[j]] == "textarea") {
            var value = getValueByChunkAndProperty(i, appliedProperties[j], block.propertyTypes[appliedProperties[j]]).replace(/\n/g, "\\n");
            value = replaceVariables(value);
            addMultiLine('(('+block.domainBlock.type+')'+block.variable+listindex+').WritePublicText(\"'+value+'\", false);');
            add('(('+block.domainBlock.type+')'+block.variable+listindex+').ShowPublicTextOnScreen();');
          }
          else if(block.propertyTypes[appliedProperties[j]] == "string") {
            var value = getValueByChunkAndProperty(i, appliedProperties[j], block.propertyTypes[appliedProperties[j]]);
            var trimmedValue = value;
            var trimmed = false;
            if(value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
              trimmedValue = value.substring(1, value.length-1);
              trimmed = true;
            }
            if(userVariables.indexOf(trimmedValue) > -1) {
              // 1.1.1 - removing SetValue
              //add(block.variable+listindex+'.SetValue(\"'+block.properties[appliedProperties[j]]+'\", '+trimmedValue+');');
              add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' = '+trimmedValue+';');
            }
            else {
              //add(block.variable+listindex+'.SetValue(\"'+block.properties[appliedProperties[j]]+'\", \"'+value+'\");');
              // 1.1.1 - removing SetValue
              //add(block.variable+listindex+'.SetValue(\"'+block.properties[appliedProperties[j]]+'\", new StringBuilder(\"'+trimmedValue+'\"));');
              add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' = new StringBuilder(\"'+trimmedValue+'\").ToString();');
            }
          }
          else if(block.propertyTypes[appliedProperties[j]] == "bool") {
            var value = getValueByChunkAndProperty(i, appliedProperties[j], block.propertyTypes[appliedProperties[j]]);
            // 1.1.1 - removing SetValue
            //add(block.variable+listindex+'.SetValue(\"'+block.properties[appliedProperties[j]]+'\", '+value+');');
            add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' = '+value+';');
          }
          else if(block.propertyTypes[appliedProperties[j]] == "image") {
            var value = getValueByChunkAndProperty(i, appliedProperties[j], block.propertyTypes[appliedProperties[j]]);
            add('(('+block.domainBlock.type+')'+block.variable+listindex+').ClearImagesFromSelection();');
            add('(('+block.domainBlock.type+')'+block.variable+listindex+').AddImageToSelection(\"'+value+'\");');
            add('(('+block.domainBlock.type+')'+block.variable+listindex+').ShowTextureOnScreen();');
          }
          else if(block.propertyTypes[appliedProperties[j]] == "ChargeMode") {
            var value = getValueByChunkAndProperty(i, appliedProperties[j], block.propertyTypes[appliedProperties[j]]);
            add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' = ChargeMode.'+value+';');
          }
          else if(block.propertyTypes[appliedProperties[j]] == "MyAssemblerMode") {
            var value = getValueByChunkAndProperty(i, appliedProperties[j], block.propertyTypes[appliedProperties[j]]);
            add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' = MyAssemblerMode.'+value+';');
          }
          else if(block.propertyTypes[appliedProperties[j]] == "FlightMode") {
            var value = getValueByChunkAndProperty(i, appliedProperties[j], block.propertyTypes[appliedProperties[j]]);
            add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' = FlightMode.'+value+';');
          }
          else {
            var value = getValueByChunkAndProperty(i, appliedProperties[j], block.propertyTypes[appliedProperties[j]]);
            var operator = '';
            if(value.match(/^\+\+/) != null) {
              operator = '+';
              value = $.trim(value.substring(2));
              // 1.1.1 - removing SetValue
              //add(block.variable+listindex+'.SetValue(\"'+block.properties[appliedProperties[j]]+'\", '+block.variable+listindex+'.GetValue'+getSetType(block.propertyTypes[appliedProperties[j]])+'(\"'+block.properties[appliedProperties[j]]+'") '+operator+' (float)'+value+');');
              add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' += (float)'+value+';');
            }
            else if(value.match(/^\+/) != null) {
              operator = '+';
              value = $.trim(value.substring(1));
              // 1.1.1 - removing SetValue
              //add(block.variable+listindex+'.SetValue(\"'+block.properties[appliedProperties[j]]+'\", '+block.variable+listindex+'.GetValue'+getSetType(block.propertyTypes[appliedProperties[j]])+'(\"'+block.properties[appliedProperties[j]]+'") '+operator+' (float)'+value+');');
              add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' += (float)'+value+';');
            }
            else if(value.match(/^\-\-/) != null) {
              operator = '-';
              value = $.trim(value.substring(2));
              // 1.1.1 - removing SetValue
              //add(block.variable+listindex+'.SetValue(\"'+block.properties[appliedProperties[j]]+'\", '+block.variable+listindex+'.GetValue'+getSetType(block.propertyTypes[appliedProperties[j]])+'(\"'+block.properties[appliedProperties[j]]+'") '+operator+' (float)'+value+');');
              add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' -= (float)'+value+';');
            }
            else {
              // 1.1.1 - removing SetValue
              //add(block.variable+listindex+'.SetValue(\"'+block.properties[appliedProperties[j]]+'\", (float)'+value+');');
              add(block.variable+listindex+'.'+block.properties[appliedProperties[j]]+' = (float)'+value+';');
            }
          }
        }
        for(var j = 0; j < appliedActions.length; j++) {
          add(block.variable+listindex+'.ApplyAction(\"'+block.actions[appliedActions[j]]+'\");');
        }
        for(var j = 0; j < block.inventories.length; j++) {
          for(var k = 0; k < block.inventories[j].items.length; k++) {
            var itemrow = $logicblock.find('.item.inv'+j)[k];
            //var itemrow = $(logicblock).find('.inv'+j)[k];
            var transfer = $(itemrow).find('.transfer');
            if($(transfer).find('button').hasClass('selected')) {
              var amount = $.trim($($(transfer).find('input')[0]).val());
              var percentage = false;
              if(amount != "" && amount.endsWith("%")) {
                amount = amount.substring(0, amount.length-1);
                percentage = true;
                if($.isNumeric(parseFloat(amount))) {
                  if(parseFloat(amount) >= 100) {
                    amount = "";
                  }
                  else if(parseFloat(amount) < 0) {
                    amount = "0";
                  }
                }
              }
              if(amount == "") {
                amount = "float.MaxValue";
                percentage = false;
              }
              if($(transfer).find('label').html() == "to") {
                if(percentage) {
                  add('transfer('+block.variable+listindex+'.GetInventory('+j+'), '+$($(transfer).find('input')[1]).val()+', "'+block.inventories[j].items[k].typeId+'", "'+block.inventories[j].items[k].subTypeId+'", (countItem('+block.variable+listindex+'.GetInventory('+j+'), "'+block.inventories[j].items[k].typeId+'", "'+block.inventories[j].items[k].subTypeId+'")*'+amount+')/100);');
                }
                else {
                  add('transfer('+block.variable+listindex+'.GetInventory('+j+'), '+$($(transfer).find('input')[1]).val()+', "'+block.inventories[j].items[k].typeId+'", "'+block.inventories[j].items[k].subTypeId+'", '+amount+');');
                }
                transferItemFunctionNeeded = true;
              }
              else if($(transfer).find('label').html() == "from") {
                if(percentage) {
                  add('transfer('+$($(transfer).find('input')[1]).val()+', '+block.variable+listindex+'.GetInventory('+j+'), "'+block.inventories[j].items[k].typeId+'", "'+block.inventories[j].items[k].subTypeId+'", (countItem('+$($(transfer).find('input')[1]).val()+', "'+block.inventories[j].items[k].typeId+'", "'+block.inventories[j].items[k].subTypeId+'")*'+amount+')/100);');
                }
                else {
                  add('transfer('+$($(transfer).find('input')[1]).val()+', '+block.variable+listindex+'.GetInventory('+j+'), "'+block.inventories[j].items[k].typeId+'", "'+block.inventories[j].items[k].subTypeId+'", '+amount+');');
                }
                transferItemFunctionNeeded = true;
              }
            }
          }
        }
        $.each($logicblock.find('.field'), function(j) {
          var $save = $(this).find('.save');
          if($save.length > 0 && $save.find('button').hasClass('selected')) {
            var value = $save.find('input').val();
            var sign = "=";
            var tostring = "";
            var cast = "";
            if(value.startsWith("+")) {
              value = value.substring(1);
              sign = "+=";
            }
            else if(value.startsWith("-")) {
              value = value.substring(1);
              sign = "-=";
            }
            if(value != "") {
              //add(value + ' ' + sign + ' ' + block.variable+listindex + '.GetValue'+getSetType(block.fieldTypes[j])+'(\"'+block.fields[j]+'\");');
              //add(value + ' ' + sign + ' ' + block.variable+listindex + '.' + block.fields[j]+';');
              var vartype = $save.find('input').attr('vartype');
              if(vartype == "string") {
                tostring = '.ToString()';
              }
              else if(vartype == "float") {
                cast = '(float)';
              }
              add(value + ' ' + sign + ' '+cast+'((' + block.domainBlock.type + ')' + block.variable+listindex + ').' + block.fields[j] + tostring + ';');
            }
          }
        });
        $.each($logicblock.find('.extrafield'), function(j) {
          var $save = $(this).find('.save');
          if($save.length > 0 && $save.find('button').hasClass('selected')) {
            var value = $save.find('input').val();
            var sign = "=";
            if(value.startsWith("+")) {
              value = value.substring(1);
              sign = "+=";
            }
            else if(value.startsWith("-")) {
              value = value.substring(1);
              sign = "-=";
            }
            if(value != "") {
              if(block.extraFieldTypes[j] == "string") {
                add(value + ' ' + sign + ' getExtraField('+block.variable+listindex+', "'+block.extraFieldRegexes[j]+'");');
                extraFieldFunctionNeededString = true;
              }
              else if(block.extraFieldTypes[j] == "float" || block.extraFieldTypes[j] == "power" || block.extraFieldTypes[j] == "energy") {
                add(value + ' ' + sign + ' getExtraFieldFloat('+block.variable+listindex+', "'+block.extraFieldRegexes[j]+'");');
                extraFieldFunctionNeededFloat = true;
              }
              else if(block.extraFieldTypes[j] == "degrees") {
                //result += ('getDegrees('+block.variable+listindex+') '+operator+' '+getValueByChunkAndExtraField(i, appliedExtraFields[j]));
                add(value + ' ' + sign + ' getDegrees('+block.variable+listindex+'.'+block.extraFieldRegexes[j]+');');
                extraFieldFunctionNeededDegrees = true;
              }
            }
          }
        });
        $.each($logicblock.find('.property'), function(j) {
          var $save = $(this).find('.save');
          if($save.length > 0 && $save.find('button').hasClass('selected')) {
            var value = $save.find('input').val();
            var sign = "=";
            if(value.startsWith("+")) {
              value = value.substring(1);
              sign = "+=";
            }
            else if(value.startsWith("-")) {
              value = value.substring(1);
              sign = "-=";
            }
            if(value != "") {
              var setType = getSetType(block.propertyTypes[j]);
              if(setType == "string") {
                var trimmedValue = value;
                if(value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
                  trimmedValue = value.substring(1, value.length-1);
                }
                add(value + ' ' + sign + ' ' + block.variable+listindex + '.'+block.properties[j]+';');
              }
              else if(setType == "textarea") {
                var trimmedValue = value;
                if(value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
                  trimmedValue = value.substring(1, value.length-1);
                }
                add(value + ' ' + sign + ' ' + block.variable+listindex + '.GetPublicText();');
              }
              else {
                // 1.1.1 - removing GetValue
                //add(value + ' ' + sign + ' ' + block.variable+listindex + '.GetValue'+setType+'(\"'+block.properties[j]+'\");');
                add(value + ' ' + sign + ' ' + block.variable+listindex + '.'+block.properties[j]+';');
              }
            }
          }
        });
        // 1.0.3
        for(var j = 0; j < block.inventories.length; j++) {
          $.each($logicblock.find('.invfield.inv'+j), function(k) {
            var $save = $(this).find('.save');
            if($save.length > 0 && $save.find('button').hasClass('selected')) {
              var value = $save.find('input').val();
              var sign = "=";
              if(value.startsWith("+")) {
                value = value.substring(1);
                sign = "+=";
              }
              else if(value.startsWith("-")) {
                value = value.substring(1);
                sign = "-=";
              }
              var cast = '';
              if(block.inventories[j].fieldTypes[k] == 'floatcast') {
                cast = '(float)';
              }
              if(value != "") {
                add(value + ' ' + sign + ' ' + cast + block.variable+listindex+'.GetInventory('+j+').' + block.inventories[j].fields[k] + ';');
              }
            }
          });
          $.each($logicblock.find('.item.inv'+j), function(k) {
          //$.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .inv'+j), function(k) {
            var $save = $(this).find('.save');
            if($save.length > 0 && $save.find('button').hasClass('selected')) {
              var value = $save.find('input').val();
              var sign = "=";
              if(value.startsWith("+")) {
                value = value.substring(1);
                sign = "+=";
              }
              else if(value.startsWith("-")) {
                value = value.substring(1);
                sign = "-=";
              }
              if(value != "") {
                add(value + ' ' + sign + ' countItem('+block.variable+listindex+'.GetInventory('+j+'), "'+block.inventories[j].items[k].typeId+'", "'+block.inventories[j].items[k].subTypeId+'");');
                countItemFunctionNeeded = true;
              }
            }
          });
        }
      }
      else {
        // variable logic
        $.each($logicblock.find('.math'), function(j) {
          if($(this).find('.mathset').find('button').hasClass('selected')) {
            var variable = $($(this).find('.mathset input')[0]).val();
            var value = $($(this).find('.mathset input')[1]).val();
            var inputType = $($(this).find('.multiselectdata')[0]).attr('vartype');
            if(variable == "" || value == "") {
              addError(i, "missing variable value");
            }
            else {
              validateVariableName(i, variable, "variable");
              validateInput(i, value, "variable value");
            }
            var sign = "=";
            var trimmedValue = value;
            var trimmed = false;
            if(value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
              trimmedValue = value.substring(1, value.length-1);
              trimmed = true;
            }
            if(trimmedValue.startsWith("++")) {
              trimmedValue = trimmedValue.substring(2);
              sign = "+=";
            }
            else if(trimmedValue.startsWith("--")) {
              trimmedValue = trimmedValue.substring(2);
              sign = "-=";
            }
            if(variable != "" && trimmedValue != "") {
              if(inputType == "string" && ((userStrings.indexOf(trimmedValue) == -1 && trimmedValue != 'argument') || trimmed == true)) {
                add(variable + ' ' + sign + ' "' + trimmedValue + '";');
              }
              else {
                add(variable + ' ' + sign + ' ' + trimmedValue + ';');
              }
            }
          }
        });
        
        // custom code
        if($logicblock.find('.code .codeset button').hasClass('selected')) {
          add($logicblock.find('.code .codeset textarea').val());
        }
      }
      if(!singleBlock) {
        indent--;
        add('}');
      }
      $logicblock.attr('indent', indent);
    };
    
    getBlockByChunk = function(i) {
      return blocks[namedBlockIndexes[i]];
    };
    
    getAppliedFieldsForChunk = function(i) {
      var fields = [];
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .field .fieldvalue .checkboxbutton:first-of-type'), function(i) {
        if($(this).hasClass('selected')) {
          fields.push($(this).val());
        }
      });
      return fields;
    };
    
    getAppliedExtraFieldsForChunk = function(i) {
      var extrafields = [];
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .extrafield .extrafieldvalue .checkboxbutton'), function(i) {
        if($(this).hasClass('selected')) {
          extrafields.push($(this).val());
        }
      });
      return extrafields;
    };
    
    getValueByChunkAndField = function(chunk, field) {
      var statustype = $($('#stage1 .logicblock:nth-of-type('+(chunk+1)+') .fieldvalue')[field]).find('input').attr('statustype');
      var result = $($('#stage1 .logicblock:nth-of-type('+(chunk+1)+') .fieldvalue')[field]).find('input').val();
      if(statustype != undefined) {
        result = statustype + '.' + result;
      }
      if(result == "") {
        addError(chunk, "no value entered for " + $($('#stage1 .logicblock:nth-of-type('+(chunk+1)+') .fieldname')[field]).html());
      }
      else {
        validateInput(chunk, result, "field");
      }
      return result;
    };
    
    getValueByChunkAndExtraField = function(chunk, extrafield) {
      var result = $($('#stage1 .logicblock:nth-of-type('+(chunk+1)+') .extrafieldvalue')[extrafield]).find('input').val();
      if(result == "") {
        addError(chunk, "no value entered for " + $($('#stage1 .logicblock:nth-of-type('+(chunk+1)+') .extrafieldname')[extrafield]).html());
      }
      else {
        validateInput(chunk, result, "extra field");
      }
      return result;
    };
    
    getValueByChunkAndProperty = function(chunk, property, propertyType) {
      var result = "";
      var statustype = $($('#stage1 .logicblock:nth-of-type('+(chunk+1)+') .propertyset')[property]).find('input').attr('statustype');
      if(statustype != undefined) {
        result = statustype + '.' + result;
      }
      if(propertyType == "textarea") {
        result = $($('#stage1 .logicblock:nth-of-type('+(chunk+1)+') .propertyset')[property]).find('textarea').val();
      }
      else {
        result = $($('#stage1 .logicblock:nth-of-type('+(chunk+1)+') .propertyset')[property]).find('input').val();
        if(result == "") {
          addError(chunk, "no value entered for " + $($('#stage1 .logicblock:nth-of-type('+(chunk+1)+') .propertyname')[property]).html());
        }
        else if(propertyType != "image"){
          validateInput(chunk, result, "property");
        }
      }
      return result;
    };
    
    getAppliedPropertiesForChunk = function(i) {
      var properties = [];
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .property .propertyset .checkboxbutton'), function(i) {
        if($(this).hasClass('selected')) {
          properties.push($(this).val());
        }
      });
      return properties;
    };
    
    getAppliedActionsForChunk = function(i) {
      var actions = [];
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .action .checkboxbutton'), function(i) {
        if($(this).hasClass('selected')) {
          actions.push($(this).val());
        }
      });
      return actions;
    };
    
    /*getSetVariablesForChunk = function(i) {
      var variables = [];
      var block = getBlockByChunk(i);
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .field'), function(j) {
        if($(this).find('.save').length > 0 && $(this).find('.save').find('button').hasClass('selected')) {
          var value = $(this).find('.save input').val();
          var sign = "=";
          if(value.startsWith("+")) {
            value = value.substring(1);
            sign = "+=";
          }
          else if(value.startsWith("-")) {
            value = value.substring(1);
            sign = "-=";
          }
          if(value != "") {
            variables.push(value + ' ' + sign + ' ' + block.variable + '.GetValue'+getSetType(block.fieldTypes[j])+'(\"'+block.fields[j]+'\");');
          }
        }
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .extrafield'), function(j) {
        if($(this).find('.save').length > 0 && $(this).find('.save').find('button').hasClass('selected')) {
          var value = $(this).find('.save input').val();
          var sign = "=";
          if(value.startsWith("+")) {
            value = value.substring(1);
            sign = "+=";
          }
          else if(value.startsWith("-")) {
            value = value.substring(1);
            sign = "-=";
          }
          if(value != "") {
            if(block.extraFieldTypes[j] == "string") {
              variables.push(value + ' ' + sign + ' getExtraField('+block.variable+', "'+block.extraFieldRegexes[j]+'");');
              extraFieldFunctionNeededString = true;
            }
            else if(block.extraFieldTypes[j] == "float") {
              variables.push(value + ' ' + sign + ' getExtraFieldFloat('+block.variable+', "'+block.extraFieldRegexes[j]+'");');
              extraFieldFunctionNeededFloat = true;
            }
          }
        }
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .property'), function(j) {
        if($(this).find('.save').length > 0 && $(this).find('.save').find('button').hasClass('selected')) {
          var value = $(this).find('.save input').val();
          var sign = "=";
          if(value.startsWith("+")) {
            value = value.substring(1);
            sign = "+=";
          }
          else if(value.startsWith("-")) {
            value = value.substring(1);
            sign = "-=";
          }
          if(value != "") {
            variables.push(value + ' ' + sign + ' ' + block.variable + '.GetValue'+getSetType(block.propertyTypes[j])+'(\"'+block.properties[j]+'\");');
          }
        }
      });
      return variables;
    };*/
    
    getSetType = function(str) {
      if(str == "bool") {
        return "Bool";
      }
      if(str == "int") {
        return "Int";
      }
      if(str == "string") {
        return "string";
      }
      if(str == "float") {
        return "Float";
      }
      if(str == "color") {
        return "Color";
      }
      if(str == "textarea") {
        return "textarea";
      }
      if(str == "ChargeMode") {
        return "ChargeMode";
      }
      if(str == "MyAssemblerMode") {
        return "MyAssemblerMode";
      }
      if(str == "FlightMode") {
        return "FlightMode";
      }
    };
    
    replaceVariables = function(str) {
      var open = "[";
      var close = "]";
      var sudoOpen = "[[";
      var sudoClose = "]]";
      
      var replaced = true;
      while(replaced == true) {
        replaced = false;
        var match = str.match("\\"+open + "\\"+open + "([^\\[\\]]*)" + "\\"+close + "\\"+close);
        if(match != null) {
          index = str.indexOf(match[0].toString());
          if(index != -1) {
            str = str.substring(0, index) + "\"+" + match[1].toString() + "+\"" + str.substring(index + match[0].toString().length);
            replaced = true;
          }
        }
      }
      var replaced = true;
      while(replaced == true) {
        replaced = false;
        $.each(userBools, function(i) {
          var index = str.indexOf(open + userBools[i] + close);
          //var match = str.match(/(\,|\\|\/|\(|\)|\||\[|\]|\{|\}|\;|\=|\'|\"|\:)/g);
          var match = str.match("\\"+open + userBools[i] + "\\?[^\\"+open+"\\"+close+"\\:]*\\:[^\\"+open+"\\"+close+"\\:]*"+"\\"+close);
          //"("+abc+"\\?[^\\"+"("+"\\"+")"+"\\:]*\\:[^\\"+"("+"\\"+")"+"\\:]*" + ")"
          if(index != -1) {
            //str = str.substring(0, index) + "\"+" + str.substring(index, index + userBools[i].length) + "+\"" + str.substring(index + userBools[i].length);
            str = str.substring(0, index) + "\"+" + userBools[i] + "+\"" + str.substring(index + open.length + userBools[i].length + close.length);
            replaced = true;
          }
          else if(match != null) {
            // (variable?true:false)
            // " "+(variable?"true":"false")+"
            index = str.indexOf(match.toString());
            if(index != -1) {
              var ifTrue = match.toString().split("?")[1].split(":")[0];
              var ifFalse = match.toString().split("?")[1].split(":")[1].slice(0,-1);
              str = str.substring(0, index) + "\"+(" + userBools[i] + "?\"" + ifTrue + "\":\"" + ifFalse + "\")+\"" + str.substring(index + open.length + userBools[i].length + ifTrue.length + ifFalse.length + close.length + 2);
              replaced = true;
            }
          }
        });
        $.each(userFloats, function(i) {
          var index = str.indexOf(open + userFloats[i] + close);
          if(index != -1) {
            str = str.substring(0, index) + "\"+" + userFloats[i] + "+\"" + str.substring(index + open.length + userFloats[i].length + close.length);
            replaced = true;
          }
        });
        $.each(userPowers, function(i) {
          var index = str.indexOf(open + userPowers[i] + close);
          if(index != -1) {
            str = str.substring(0, index) + "\"+powerFormat(" + userPowers[i] + ")+\"" + str.substring(index + open.length + userPowers[i].length + close.length);
            powerFormatFunctionNeeded = true;
            replaced = true;
          }
        });
        $.each(userEnergies, function(i) {
          var index = str.indexOf(open + userEnergies[i] + close);
          if(index != -1) {
            str = str.substring(0, index) + "\"+energyFormat(" + userEnergies[i] + ")+\"" + str.substring(index + open.length + userEnergies[i].length + close.length);
            energyFormatFunctionNeeded = true;
            replaced = true;
          }
        });
        $.each(userStrings, function(i) {
          var index = str.indexOf(open + userStrings[i] + close);
          if(index != -1) {
            str = str.substring(0, index) + "\"+" + userStrings[i] + "+\"" + str.substring(index + open.length + userStrings[i].length + close.length);
            replaced = true;
          }
        });
        var index = str.indexOf(open + "argument" + close);
        if(index != -1) {
          str = str.substring(0, index) + "\"+" + "argument" + "+\"" + str.substring(index + open.length + 8 + close.length);
          replaced = true;
        }
      }
      return str;
    };
    
    add = function(str) {
      var spaces = "";
      for(var i = 0; i < indent; i++) {
        spaces += "  ";
      }
      script.push(spaces+str);
    };
    
    //  v1.WritePublicText("full: "+(full?"Y":"N")+"\nmass: "+mass+"\nmax vol: "+mv+"\ncurr vol: "+cv+"\nstone: "+stone+"\ngravel: "+gravel+"", false);
    addMultiLine = function(str) {
      var cut = str.indexOf("\\n");
      if(cut == -1) {
        add(str);
      }
      else {
        var front = str.substr(0, cut+2) + '"+';
        var back = '  "' + str.substring(cut+2, str.length);
        var spaces = "";
        for(var i = 0; i < indent; i++) {
          spaces += "  ";
        }
        script.push(spaces+front);
        addMultiLine(back);
      }
    };
    
    // adds the str to the script before the last line starting with "if"
    addBeforeLastIf = function(str) {
      var result = "";
      for(var i = 0; i < indent; i++) {
        result += "  ";
      }
      var line = script.length;
      for(var i = 0; i < script.length; i++) {
        if(script[i].substring((indent*2), (indent*2) + 2) == "if"){
          line = i;
        }
      }
      if(line < script.length) {
        script.splice(line, 0, result+str);
      }
      else {
        add(str);
      }
    }
    
    clickMultiselectOption = function (e) {
      $(e).parents('.multiselectdata').attr('hidden', 'hidden');
      $(e).parents('.multiselectdata').prev('.multiselect').val($(e).attr('value')).change();
    };
    
    /*clickCheckboxButton = function (e) {
      if($(e).parents('.invalidproduct').length > 0 || $(e).hasClass('disabled')) {
        return;
      }
      else if($(e).hasClass('selected')) {
        $(e).removeClass('selected');
      }
      else {
        $(e).addClass('selected');
        if($(e).html() == "Apply Action") {
          lockBlockTypeChange(e);
        }
      }
      //stateChanged();
      generateScript();
    };*/
    
    clickCheckboxButton = function (e) {
      if($(e).hasClass('disabled')) {
        return;
      }
      else if($(e).hasClass('selected')) {
        $(e).removeClass('selected');
      }
      else {
        $(e).addClass('selected');
        if($(e).html() == "Apply Action") {
          lockBlockTypeChange(e);
        }
      }
      stateChanged();
      //generateScript();
    };

    /*
    clickCheckboxButton = function (e) {
      if($(e).hasClass('disabled')) {
        return;
      }
      else {
        var $input = $(e).parent().find('input, textarea');
        var selected = $(e).hasClass('selected');
        // if one input found and still has focus, and either input is empty and button is selected, or vice versa
        if($input.length == 1 && $input.is(':focus') && ($input.val().length == 0) == selected) {
          return;
        }
        else {
          if(selected) {
            $(e).removeClass('selected');
          }
          else {
            $(e).addClass('selected');
            if($(e).html() == "Apply Action") {
              lockBlockTypeChange(e);
            }
          }
        }
      }
      stateChanged();
    };
    */
    
    clickCheckboxRadioButton = function (e) {
      if($(e).hasClass('disabled')) {
        return;
      }
      $.each($($(e).parent().children()), function (i) {
        if($(this).hasClass('selected')) {
          $(this).removeClass('selected');
        }
      });
      $(e).addClass('selected');
      generateScript();
    };
    
    clickSign = function (e) {
      var currentSign = $(e).html();
      var result = '=';
      if(currentSign == '=')
        result = '!=';
      else if(currentSign == '!=')
        result = '&gt;';
      else if(currentSign == '&gt;')
        result = '&gt;=';
      else if(currentSign == '&gt;=')
        result = '&lt;';
      else if(currentSign == '&lt;')
        result = '&lt;=';
      $(e).html(result);
      stateChanged();
      //generateScript();
    };
    
    clickSignSimple = function (e) {
      var currentSign = $(e).html();
      var result = '=';
      if(currentSign == '=')
        result = '!=';
      $(e).html(result);
      stateChanged();
      //generateScript();
    };
    
    toFrom = function (e) {
      if($(e).html() == "to") {
        $(e).html("from");
        $(e).parent().find('button').html("Take");
      }
      else {
        $(e).html("to");
        $(e).parent().find('button').html("Send");
      }
      stateChanged();
      //generateScript();
    };
    
    promptBlockTypeChange = function (e) {
      if($(e).parents('.blocktable').find('.blockmenu').attr('disabled') == 'disabled' && $(e).find('.overlay').length == 0) {
        hideHelp();
        var $temp = $('<div class="overlay" onClick="hideBlockTypeChangePrompt(this);" hidden="hidden"></div><div class="blockTypePopup" hidden="hidden"><div class="deleteTitle">Are You Sure You Want To Change Block Type?</div><div class="deleteContent">You have made changes that will be wiped out. When you change the Block Type, you will lose your changes to fields, properties, actions, inventories, variables, and custom code in this chunk.</div><div class="helpX unselectable" onClick="hideBlockTypeChangePrompt(this);">X</div><div class="confirmDelete"><button class="actualDeleteButton" onclick="unlockBlockTypeChange(this);">Yes, Let Me Choose A Different Block Type</button></div><div class="confirmDelete"><button class="cancelDeleteButton" onclick="hideBlockTypeChangePrompt(this);">No, I Want To Keep The Current Block Type</button></div></div>');
        $(e).parents('.blocktable').append($temp);
        $(e).parents('.blocktable').css('background-color', 'rgb(255, 255, 127)');
        $('.overlay').fadeIn(200);
        $('.blockTypePopup').fadeIn(200);
      }
    };
    
    hideBlockTypeChangePrompt = function (e) {
      $(e).parents('.blocktable').css('background-color', '');
      $('.overlay').remove();
      $('.blockTypePopup').remove();
    };
    
    unlockBlockTypeChange = function (e) {
      $(e).parents('.blocktable').find('.blockmenu').removeAttr('disabled');
      hideBlockTypeChangePrompt(e);
    };
    
    lockBlockTypeChange = function (e) {
      $(e).parents('.blocktable').find('.blockmenu').attr('disabled', 'disabled');
    };
    
    promptDelete = function (e) {
      hideHelp();
      var $temp = $('<div class="overlay" onClick="hideDeletePrompt(this);" hidden="hidden"></div><div class="deletePopup" hidden="hidden"><div class="deleteTitle">Are You Sure You Want To Delete This Chunk?</div><div class="deleteContent">This chunk will be permanently deleted!<br>This cannot be undone!</div><div class="helpX unselectable" onClick="hideDeletePrompt(this);">X</div><div class="confirmDelete"><button class="actualDeleteButton" onclick="deleteBlock(this);">Yes, Delete This Chunk</button></div><div class="confirmDelete"><button class="cancelDeleteButton" onclick="hideDeletePrompt(this);">No, Keep This Chunk</button></div></div>');
      $(e).parent().append($temp);
      $('.overlay').fadeIn(200);
      $('.deletePopup').fadeIn(200);
    };
    
    hideDeletePrompt = function (e) {
      $button = $(e).parents('.removeButton').find('.deleteButton');
      $('.overlay').remove();
      $('.deletePopup').remove();
      mouseOutDelete($button);
    };
    
    deleteBlock = function (e) {
      var thislogic = $($($(e).parents('.logicblock')).children('.logic')).children('.selected').val();
      var nextlogic = $($($(e).parents('.logicblock')).next().children('.logic')).children('.selected').val();
      var nextblock = $($($(e).parents('.logicblock')).next());
      $($(e).parents('.logicblock')).fadeOut(200, function() {
        $($(e).parents('.logicblock')).remove();
        // if this logic = IF / ELSE IF, and next logic is AND or OR
        // ex: IF a OR b -> (delete a) -> IF b
        // or
        // if this logic = SET / ELSE, and next logic is AND
        // ex: SET a AND b -> (delete a) -> SET b
        // set next logic to this logic
        if(nextblock.size() == 1 && (((thislogic == 2 || thislogic == 4) && (nextlogic == 0 || nextlogic == 1)) || ((thislogic == 3 || thislogic == 5) && nextlogic == 0))) {
          // set next to this logic
          // problem
          $($($(nextblock).children('.logic')).children().get(logicToOrder(thislogic)+1)).removeClass('disabled').click();
        }
        generateScript();
      });
    };
    
    // takes a logic value (ex. if = 2) and returns its position in order (ex. if = 0)
    logicToOrder = function (i) {
      var orderOf = [2, 3, 0, 1, 4, 5];
      return orderOf[i];
    };
    
    appendBlock = function (e) {
      $($('#blocktemplate').children().get(0)).clone().insertAfter($(e).parents('.logicblock')).hide().fadeIn(200);
      $(e).parents('.logicblock').next().find('.blockmenu').val(2).change();
      //generateScript();
    };
    
    addFirstBlock = function() {
      $($('#blocktemplate').children().get(0)).clone().prependTo('#stage1').hide().fadeIn(200);
      $($('#stage1').find('.logicblock')[0]).find('.blockmenu').val(2).change();
      //generateScript();
    };
    
    addLastBlockInstantly = function() {
      $($('#blocktemplate').children().get(0)).clone().appendTo('#stage1');
      //generateScript();
    };
    
    clearAllBlocks = function() {
      $.each($('#stage1 .logicblock'), function() {
        $(this).remove();
      });
      generateScript();
    };
    
    // updates the visual components
    updateScreen = function() {
      updateScreenForLogic();
      updateInventories();
    };
    
    // updates the visual components when logic type is changed
    updateScreenForLogic = function() {
      $.each($('#stage1 .logicblock'), function(i) {
        //console.time('enableAll');
        enableAll(i);
        //console.timeEnd('enableAll');
        
        //console.time('enableAllLogic');
        enableAllLogic(i);
        //console.timeEnd('enableAllLogic');
        
        //console.time('enableAllBlockOptions');
        enableAllBlockOptions(i);
        //console.timeEnd('enableAllBlockOptions');
        
        //console.time('restEach');
        var logicIndex = logicIndexes[i];
        var block = getBlockByChunk(i);
        var preview = '';
        var previewDo = false;
        // and
        if(logicIndex == 0) {
          preview += 'And';
          var previousIf = false;
          for(var j = i-1; j >= 0; j--) {
            if(logicIndexes[j]==2 || logicIndexes[j]==4) {
              previousIf = true;
              break;
            }
            else if(logicIndexes[j]==3 || logicIndexes[j]==5) {
              previousIf = false;
              break;
            }
          }
          if(previousIf) {
            //disableProperties(i);
            //disableActions(i);
            enableFieldValue(i);
            preview += ' if';
          }
          else {
            disableFieldValue(i);
            disableBlockOption(i, 2);
            preview += ' for';
            previewDo = true;
          }
        }
        // or
        else if(logicIndex == 1){
          //disableProperties(i);
          //disableActions(i);
          enableFieldValue(i);
          preview += 'Or if';
        }
        // if
        else if(logicIndex == 2){
          //disableProperties(i);
          //disableActions(i);
          enableFieldValue(i);
          preview += 'If';
        }
        // do
        else if(logicIndex == 3){
          disableFieldValue(i);
          disableBlockOption(i, 2);
          preview += 'For';
          previewDo = true;
        }
        // else if
        else if(logicIndex == 4){
          //disableProperties(i);
          //disableActions(i);
          enableFieldValue(i);
          preview += 'Else if';
        }
        // else do
        else if(logicIndex == 5){
          disableFieldValue(i);
          disableBlockOption(i, 2);
          preview += 'Else for';
          previewDo = true;
        }
        // block indent
        // remove previous indent class
        //$(this).removeClass(function (index, css) {
        //  return (css.match (/(^|\s)indent\d+/g) || []).join(' ');
        //});
        //$(this).addClass('indent' + $(this).attr('indent'));
        $(this).css('border-left', 1+(5*($(this).attr('indent')-1))+'px solid '+indentColor);
        if(i == 0) {
          disableLogic(i, 0);
          disableLogic(i, 1);
          disableLogic(i, 4);
          disableLogic(i, 5);
        }
        else {
          var previouslogic = logicIndexes[i-1];
          var previousIf = false;
          var previousElse = false;
          for(var j = i-2; j >= 0; j--) {
            if(logicIndexes[j]==2 || logicIndexes[j]==4) {
              previousIf = true;
              break;
            }
            else if(logicIndexes[j]==3 || logicIndexes[j]==5) {
              previousIf = false;
              break;
            }
          }
          for(var j = i-1; j >= 0; j--) {
            if(logicIndexes[j]==5) {
              previousElse = true;
              break;
            }
            else if(logicIndexes[j]==3) {
              previousElse = false;
              break;
            }
          }
          if(previouslogic == 0) {
            if(previousIf || (previousElse && ($('#stage1 .logicblock:nth-of-type('+(i)+')').attr('indent') <= 2))) {
              disableLogic(i, 4);
              disableLogic(i, 5);
            }
            if(!previousIf) {
              disableLogic(i, 1);
            }
          }
          // or
          else if(previouslogic == 1){
            disableLogic(i, 4);
            disableLogic(i, 5);
          }
          // if
          else if(previouslogic == 2){
            disableLogic(i, 4);
            disableLogic(i, 5);
          }
          // do
          else if(previouslogic == 3){
            disableLogic(i, 1);
          }
          // else if
          else if(previouslogic == 4){
            disableLogic(i, 4);
            disableLogic(i, 5);
          }
          // else
          else if(previouslogic == 5){
            disableLogic(i, 1);
            if($('#stage1 .logicblock:nth-of-type('+(i)+')').attr('indent') <= 2) {
              disableLogic(i, 4);
              disableLogic(i, 5);
            }
          }
          if($('#stage1 .logicblock:nth-of-type('+(i)+')').attr('indent') <= 1) {
            disableLogic(i, 4);
            disableLogic(i, 5);
          }
        }
        
        //updateChunkPreview
        var blockNum = $(this).find('.blockoptions .selected').val();
        var blockType = domainBlocks[$(this).find('.blockmenu option:selected').val()].name;
        var blockName = $(this).find('.blockname').val();
        var groupName = $(this).find('.groupname').val();
        if(groupName != "") {
          groupName = ' from group \"' + groupName + '\"'
        }
        
        if(blockNum == 0) {
          if(blockName == "") {
            blockName = blockType;
          }
          var aOrAn = " a ";
          if(blockType.startsWith("A") || 
             blockType.startsWith("E") ||
             blockType.startsWith("I") || 
             blockType.startsWith("O") || 
             blockType.startsWith("U")) {
            aOrAn = " an ";
          }
          preview += aOrAn + blockType + ' called \"' + blockName + '\"' + groupName;
          if(previewDo) {
            preview += ', set this stuff';
          }
          else {
            preview += ' meets the selected conditions';
          }
        }
        if(blockNum == 1) {
          if(blockName != "") {
            blockName = ' with \"' + blockName + '\" in their names';
          }
          blockType = (blockType.endsWith("ry")?(blockType.substring(0,blockType.length-2)+"ries"):(blockType.endsWith("s")?(blockType+"es"):(blockType+"s")));
          preview += ' all ' + blockType + blockName + groupName;
          if(previewDo) {
            preview += ', set this stuff';
          }
          else {
            preview += ' meet the selected conditions';
          }
        }
        if(blockNum == 2) {
          if(blockName != "") {
            blockName = ' with \"' + blockName + '\" in their names';
          }
          blockType = (blockType.endsWith("ry")?(blockType.substring(0,blockType.length-2)+"ries"):(blockType.endsWith("s")?(blockType+"es"):(blockType+"s")));
          preview += ' any ' + blockType + blockName + groupName +' meet the selected conditions';
          
          // also if we're using Any Blocks of Type, disable DO and ELSE DO
          disableLogic(i, 3);
          disableLogic(i, 5);
        }
        //1.0.5 - variable overhaul
        if(blockNum == 3) {
          affectVariables(i);
          if(previewDo) {
            preview = preview.replace("for", "set").replace("For", "Set") + " variables or custom code";
          }
          else {
            preview += " variables or custom code meets conditions";
          }
        }
        $(this).find('.chunkpreview').html(preview);
        //console.timeEnd('restEach');
      });
      $.each($('.logic'), function(i) {
        if($(this).find('button.selected.disabled').length > 0) {
          addError(i, "invalid logic selection - change logic type");
        }
      });
      $.each($('.logicblock'), function(i) {
        var block = getBlockByChunk(i);
        if(block != undefined &&
           $(this).find('.blockoptions .selected').val() == 0 &&
           (block.domainBlockIndex == 0 || block.domainBlockIndex == 1) &&
           $(this).find('.blockname').val() == '') {
          addError(i, block.customName + " needs defined name for Single Block logic");
        }
      });
    };
    
    updateInventories = function() {
      //console.time('rest');
      $.each($(".multiselectdata[varType='bool']"), function(i) {
        var m_this = $(this);
        $.each($(this).find('.multiselectOption.var'), function(j) {
          $(this).remove();
        });
        $.each(userBools, function(j) {
          $("<div class=\"multiselectOption var\" onclick=\"clickMultiselectOption(this);\" value=\""+ userBools[j] +"\">"+ userBools[j] +"</div>").appendTo(m_this);
        });
      });
      $.each($(".multiselectdata[varType='float']"), function(i) {
        var m_this = $(this);
        $.each($(this).find('.multiselectOption.var'), function(j) {
          $(this).remove();
        });
        $.each(userFloats, function(j) {
          $("<div class=\"multiselectOption var\" onclick=\"clickMultiselectOption(this);\" value=\""+ userFloats[j] +"\">"+ userFloats[j] +"</div>").appendTo(m_this);
        });
      });
      $.each($(".multiselectdata[varType='power']"), function(i) {
        var m_this = $(this);
        $.each($(this).find('.multiselectOption.var'), function(j) {
          $(this).remove();
        });
        $.each(userPowers, function(j) {
          $("<div class=\"multiselectOption var\" onclick=\"clickMultiselectOption(this);\" value=\""+ userPowers[j] +"\">"+ userPowers[j] +"</div>").appendTo(m_this);
        });
      });
      $.each($(".multiselectdata[varType='energy']"), function(i) {
        var m_this = $(this);
        $.each($(this).find('.multiselectOption.var'), function(j) {
          $(this).remove();
        });
        $.each(userEnergies, function(j) {
          $("<div class=\"multiselectOption var\" onclick=\"clickMultiselectOption(this);\" value=\""+ userEnergies[j] +"\">"+ userEnergies[j] +"</div>").appendTo(m_this);
        });
      });
      $.each($(".multiselectdata[varType='string']"), function(i) {
        var m_this = $(this);
        $.each($(this).find('.multiselectOption.var'), function(j) {
          $(this).remove();
        });
        $.each(userStrings, function(j) {
          $("<div class=\"multiselectOption var\" onclick=\"clickMultiselectOption(this);\" value=\""+ userStrings[j] +"\">"+ userStrings[j] +"</div>").appendTo(m_this);
        });
      });
      $.each($(".multiselectdata[varType='inventory']"), function(i) {
        var m_this = $(this);
        $.each($(this).find('.multiselectOption.var'), function(j) {
          $(this).remove();
        });
        $.each(userInventories, function(j) {
          $("<div class=\"multiselectOption var\" onclick=\"clickMultiselectOption(this);\" value=\""+ userInventories[j] +"\">"+ userInventories[j] +"</div>").appendTo(m_this);
        });
      });
      //console.timeEnd('rest');
    };
    
    enableAll = function(i) {
      if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .blockheader').is(':visible') == false) {
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .blockheader').show();
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .dyn').show();
      }
      $('#stage1 .logicblock:nth-of-type('+(i+1)+') .dyn').show();
      if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .mathheader').is(':visible') == true) {
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .mathheader').hide();
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .math').hide();
      }
      if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .codeheader').is(':visible') == true) {
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .codeheader').hide();
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .code').hide();
      }
      
      //console.time('EA-enableDyn');
      
      //$.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .dyn'), function () {
        //enableRow(this);
        //$(this).show();
        //$(this).find('.checkboxbutton').show();
        //$(this).find('.fieldvalue').show();
        //$(this).find('.propertyvalue').show();
        //$(this).find('.propertyset').show();
        //$(this).find('.save').show();
      //});
      //console.timeEnd('EA-enableDyn');
      
      //console.time('EA-showing');
      if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .fieldheader').find('.hideshow').html() == "[show]") {
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .field').hide();
      }
      if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .extrafieldheader').find('.hideshow').html() == "[show]") {
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .extrafield').hide();
      }
      if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .propheader').find('.hideshow').html() == "[show]") {
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .property').hide();
      }
      if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .actionheader').find('.hideshow').html() == "[show]") {
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .action').hide();
      }
      
      
      
      
      //console.timeEnd('EA-showing');
      
      //console.time('EA-GBBC');
      var block = getBlockByChunk(i);
      //console.timeEnd('EA-GBBC');
      
      //console.time('EA-inventory');
      
      for(var j = 0; j < block.inventories.length; j++) {
        if($($('#stage1 .logicblock:nth-of-type('+(i+1)+')').find('.inventoryheader')[j]).find('.hideshow').html() == "[show]") {
          $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .inv'+j), function() {
            $(this).hide();
          });
        }
      }
      //console.timeEnd('EA-inventory');
      //if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .mathheader').find('.hideshow').html() == "[show]") {
      //  $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .math'), function() {
      //    $(this).hide();
      //  });
      //}
      
    };
    
    disableFieldValue = function(i) {
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .field'), function () {
        //$(this).find('.fieldvalue').hide();
        $(this).find('.fieldvalue').css('visibility', 'hidden');
        //$(this).find('.save').show();
        $(this).find('.save').css('visibility', 'visible');
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .extrafield'), function () {
        //$(this).find('.extrafieldvalue').hide();
        $(this).find('.extrafieldvalue').css('visibility', 'hidden');
        //$(this).find('.save').show();
        $(this).find('.save').css('visibility', 'visible');
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .property'), function () {
        $(this).find('.propertyvalue').hide();
        $(this).find('.propertyset').show();
        $(this).find('.save').show();
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .invfield'), function () {
        $(this).find('.fieldvalue').css('visibility', 'hidden');
        $(this).find('.save').css('visibility', 'visible');
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .item'), function () {
        $(this).find('.itemvalue').hide();
        $(this).find('.transfer').show();
        $(this).find('.save').show();
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .math'), function () {
        $(this).find('.mathvalue').hide();
        $(this).find('.mathset').show();
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .code'), function () {
        $(this).find('.codevalue').hide();
        $(this).find('.codeset').show();
        $(this).find('.setcodename').show();
        $(this).find('.ifcodename').hide();
      });
    };
    
    enableFieldValue = function(i) {
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .field'), function () {
        //$(this).find('.fieldvalue').show();
        $(this).find('.fieldvalue').css('visibility', 'visible');
        //$(this).find('.save').val("");
        //$(this).find('.save').hide();
        $(this).find('.save').css('visibility', 'hidden');
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .extrafield'), function () {
        //$(this).find('.extrafieldvalue').show();
        $(this).find('.extrafieldvalue').css('visibility', 'visible');
        //$(this).find('.save').val("");
        //$(this).find('.save').hide();
        $(this).find('.save').css('visibility', 'hidden');
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .property'), function () {
        $(this).find('.propertyvalue').show();
        $(this).find('.propertyset').hide();
        //$(this).find('.save').val("");
        $(this).find('.save').hide();
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .invfield'), function () {
        $(this).find('.fieldvalue').css('visibility', 'visible');
        $(this).find('.save').css('visibility', 'hidden');
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .item'), function () {
        $(this).find('.itemvalue').show();
        $(this).find('.transfer').hide();
        //$(this).find('.save').val("");
        $(this).find('.save').hide();
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .math'), function () {
        $(this).find('.mathvalue').show();
        $(this).find('.mathset').hide();
      });
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .code'), function () {
        $(this).find('.codevalue').show();
        $(this).find('.codeset').hide();
        $(this).find('.setcodename').hide();
        $(this).find('.ifcodename').show();
      });
      disableActions(i);
    };
    
    /*disableProperties = function(i) {
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .property'), function (j) {
        if(j == 0) {
          disableRow($(this).prev());
          $(this).prev().hide();
        }
        disableRow(this);
        $(this).hide();
      });
    };*/
    
    /*disableActions = function(i) {
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .action'), function (j) {
        if(j == 0) {
          disableRow($(this).prev());
          $(this).prev().hide();
        }
        disableRow(this);
        $(this).hide();
      });
    };*/
    
    enableActions = function(i) {
      //$('#stage1 .logicblock:nth-of-type('+(i+1)+') .actionheader').show();
      //if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .actionheader .hideshow').html() == "[hide]"){
      //  $('#stage1 .logicblock:nth-of-type('+(i+1)+') .action').show();
      //}
    };
    disableActions = function(i) {
      $('#stage1 .logicblock:nth-of-type('+(i+1)+') .actionheader').hide();
      $('#stage1 .logicblock:nth-of-type('+(i+1)+') .action').hide();
    };
    
    enableRow = function(e) {
      var row = $(e).hasClass('dyn')?$(e):$(e).parents('.dyn').get(0);
      if(row.hasClass('invalidproduct')) {
        row.removeClass('invalidproduct');
      }
    };
    
    disableRow = function(e) {
      var row = $(e).hasClass('dyn')?$(e):$(e).parents('.dyn').get(0);
      if(!row.hasClass('invalidproduct')) {
        row.addClass('invalidproduct');
      }
    };
    
    enableAllLogic = function(i) {
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .logic .checkboxbutton'), function() {
        $(this).removeClass('disabled');
      });
    };
    
    enableAllBlockOptions = function(i) {
      $.each($('#stage1 .logicblock:nth-of-type('+(i+1)+') .blockoptions .checkboxbutton'), function() {
        $(this).removeClass('disabled');
      });
    };
    
    disableLogic = function(i, logic) {
      $("#stage1 .logicblock:nth-of-type("+(i+1)+") .logic .checkboxbutton[value='"+logic+"']").addClass('disabled');
    };
    
    disableBlockOption = function(i, option) {
      $("#stage1 .logicblock:nth-of-type("+(i+1)+") .blockoptions .checkboxbutton[value='"+option+"']").addClass('disabled');
    };
    
    affectVariables = function(i) {
      $('#stage1 .logicblock:nth-of-type('+(i+1)+') .blockheader').hide();
      $('#stage1 .logicblock:nth-of-type('+(i+1)+') .dyn').hide();
      $('#stage1 .logicblock:nth-of-type('+(i+1)+') .mathheader').show();
      if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .mathheader').find('.hideshow').html() == "[hide]") {
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .math').show();
      }
      $('#stage1 .logicblock:nth-of-type('+(i+1)+') .codeheader').show();
      if($('#stage1 .logicblock:nth-of-type('+(i+1)+') .codeheader').find('.hideshow').html() == "[hide]") {
        $('#stage1 .logicblock:nth-of-type('+(i+1)+') .code').show();
      }
    };
    
    updateColor = function(e) {
      if($.trim($(e).val()) == "") {
        $(e).val(0);
      }
      lockBlockTypeChange(e);
      refreshColor(e);
      var button = $(e).parent().find('button');
      if(button.length > 0 && !button.hasClass('selected')) {
        button.click();
      }
      else {
        stateChanged();
        //generateScript();
      }
    };
    
    refreshColor = function(e) {
      var box = $(e).parent();
      var red = $($(box).find('.red')).val();
      var green = $($(box).find('.green')).val();
      var blue = $($(box).find('.blue')).val();
      if(red > 255) {
        $($(box).find('.red')).val(255);
        red = 255;
      }
      if(green > 255) {
        $($(box).find('.green')).val(255);
        green = 255;
      }
      if(blue > 255) {
        $($(box).find('.blue')).val(255);
        blue = 255;
      }
      $(box).css('background-color', 'rgb('+red+','+green+','+blue+')');
    };
    
    updateOverview = function() {
      $.each($('.pseudocode').children(), function(i) {
        if(i > 0) {
          $(this).remove();
        }
      });
      
      $.each($('#stage1 .logicblock'), function(i) {
        var indent = $(this).attr('indent');
        var logic = $(this).find('.logic .selected').val();
        if(logic == "5") {
          indent--;
        }
        var previewText = $(this).find('.chunkpreview').html();
        $("<div class=\"overviewitem"+i+" unselectable\" style=\"padding-left: "+((indent*4)-3)+"px;\" onmouseover=\"mouseOverHighlight("+i+");\" onmouseout=\"mouseOutHighlight("+i+");\" onclick=\"scrollToBlock("+i+");\" title=\"click to scroll\">"+(i+1)+") "+previewText+"</div>").appendTo($('.pseudocode'));
      });
      
      if($('.pseudocode').children().length == 1) {
        $('.pseudocode').parent().hide();
      }
      else {
        $('.pseudocode').parent().show();
      }
    };
    
    validateVariableName = function(blockIndex, variableName, str) {
      var match = $.trim(variableName).match(/(\,|\\|\/|\.|\(|\)|\||\[|\]|\{|\}|\;|\=|\'|\"|\:)/g);
      if(match != null) {
        addError(blockIndex, "invalid character in "+str+": " + match.toString().replace(/(.)./g, "$1"));
      }
      match = $.trim(variableName).match(/ /g);
      if(match != null) {
        addError(blockIndex, "whitespace not allowed in "+str);
      }
      match = $.trim(variableName).match(/(^true$|^false$|^null$|^filterRunning$|^filterThis$|^l_this$|^this$|^new$|^l[0-9]+$|^v[0-9]+$)/g);
      if(match != null) {
        addError(blockIndex, "invalid "+str+": " + match.toString().replace(/\,/g, ""));
      }
    };
    
    validateInput = function(blockIndex, inputName, str) {
      var match = $.trim(inputName).match(/(\,|\\|\/|\(|\)|\||\[|\]|\{|\}|\;|\=|\'|\:)/g);
      if(match != null) {
        addError(blockIndex, "invalid character in "+str+": " + match.toString().replace(/(.)./g, "$1"));
      }
      match = $.trim(inputName).match(/ /g);
      if(match != null) {
        addError(blockIndex, "whitespace not allowed in "+str);
      }
      match = $.trim(inputName).match(/(^null$|^filterRunning$|^filterThis$|^l_this$|^this$|^new$|^l[0-9]+$|^v[0-9]+$)/g);
      if(match != null) {
        addError(blockIndex, "invalid "+str+": " + match.toString().replace(/\,/g, ""));
      }
    };
    
    addError = function(line, str) {
      errorlines.push(line);
      errors.push(str);
    };
    
    showErrors = function() {
      $.each($('#stage1 .logicblock'), function(i) {
        var result = "";
        for(var j = 0; j < errors.length; j++) {
          if(errorlines[j] == i) {
            result += (errors[j] + "<br>");
          }
        }
        $(this).find('.errors').html(result);
      });
      /*
      for(var i = 0; i < errors.length; i++) {
        result += ("Block " + errorlines[i] + " - " + errors[i] + "<br>");
      }
      if(result != "") {
        result = ("<b>ERRORS<br>" + result + "</b>");
        $('.errorsection').css('color', 'red');
      }
      else {
        result = "Script has no errors. Make sure your block names match what you used in-game.";
        $('.errorsection').css('color', 'green');
      }
      $('.errorsection').html(result);*/
      $.each($('.pseudocode div'), function(j){
        $(this).removeClass("red");
      });
      var hasErrors = false;
      $.each(errorlines, function(j) {
        $('.overviewitem'+(errorlines[j])).addClass("red");
        hasErrors = true;
      });
      if(hasErrors) {
        $('.pseudocode > div:first-child').html("Overview - contains errors");
        $('.pseudocode > div:first-child').css("color", "red");
        $('.errorsection').html("<b>SCRIPT HAS ERRORS</b>");
      }
      else {
        $('.pseudocode > div:first-child').html("Overview of Logic Chunks");
        $('.pseudocode > div:first-child').css("color", "");
        $('.errorsection').html("");
      }

    };
    
    decodeLogic = function(i) {
      switch(i) {
        case "0":
          return "and";
        case "1":
          return "or";
        case "2":
          return "if";
        case "3":
          return "set";
        case "4":
          return "else if";
        case "5":
          return "else set";
        default:
          return "";
      }
    };
    
    decodeOption = function(i) {
      switch(i) {
        case "1":
          return "all";
        case "2":
          return "any";
        default:
          return "";
      }
    };
    
    scrollToBlock = function(i) {
      $('html, body').animate({scrollTop: $('.logicblock:nth-of-type('+(i+1)+')').offset().top - 4}, 500);
    };
    
    var scrollGoal = 0;
    
    scrollToElement = function(e, topSpace) {
      scrollGoal = $(e).offset().top - topSpace;
      $('html, body').animate({scrollTop: ($(e).offset().top - topSpace)}, 500);
    };
    
    // returns true if ver1 is newer or equal to ver2
    upToDate = function(ver1, ver2) {
      var ver1Nums = ver1.split('.');
      var ver2Nums = ver2.split('.');
      for(var i = 0; i < 3; i++) {
        if(ver1Nums[i] != ver2Nums[i]) {
          return (ver1Nums[i] > ver2Nums[i]);
        }
      }
      return true;
    };
    
    // -------------------------- SAVE / LOAD -------------------------------- //
    
    
    
    var delim0 = "%";
    var delim1 = ",";
    var delim2 = "#";
    var delim3 = "@";
    var delim4 = "~";
    var delim5 = ":";
    var delimescape = "\\";
    //%,#@~:
    
    saveShort = function() {
      var saved = save();
      var result = "x" + saved;
      var canShorten = true;
      if(saved.match(/\[\d+\]/) == null) {
        for(var i = 15; i >= 3; i--) {
          var regex = new RegExp("\\,{"+i+"}", "g");
          result = result.replace(regex, "["+i+"]");
        }
      }
      else {
        canShorten = false;
        return saved;
      }
      
      if(canShorten) {
        return result;
      }
      else {
        return saved;
      }
    };
    
    loadShort = function(str) {
      //var str = $('#import').val();
      str = $.trim(str);
      if(str.startsWith("//")) {
        str = $.trim(str.substring(2));
      }
      if(str.indexOf("x") == 0){
        str = str.substring(1);
        commastring = ",,";
        for(var i = 3; i <= 15; i++) {
          commastring += ",";
          var regex = new RegExp("\\["+i+"\\]", "g");
          str = str.replace(regex, commastring);
        }
        //$('#import').val(str);
      }
      load(str);
    };
    
    sanitize = function(str) {
      if(str == undefined) {
        return "";
      }
      return str.replace(/\\/g, "\\b").replace(/%/g, "\\0").replace(/,/g, "\\1").replace(/#/g, "\\2").replace(/@/g, "\\3").replace(/~/g, "\\4").replace(/:/g, "\\5").replace(/ /g, "\\6");
    };
    
    sanitizeTextarea = function(str) {
      if(str == undefined) {
        return "";
      }
      return str.replace(/\\/g, "\\b").replace(/%/g, "\\0").replace(/,/g, "\\1").replace(/#/g, "\\2").replace(/@/g, "\\3").replace(/~/g, "\\4").replace(/:/g, "\\5").replace(/ /g, "\\6").replace(/\n/g, '\\n');
    };
    
    unsanitize = function(str) {
      if(str == undefined) {
        return "";
      }
      return str.replace(/\\0/g, "%").replace(/\\1/g, ",").replace(/\\2/g, "#").replace(/\\3/g, "@").replace(/\\4/g, "~").replace(/\\5/g, ":").replace(/\\6/g, " ").replace(/\\b/g, "\\");
    };
    
    unsanitizeTextarea = function(str) {
      if(str == undefined) {
        return "";
      }
      return str.replace(/\\0/g, "%").replace(/\\1/g, ",").replace(/\\2/g, "#").replace(/\\3/g, "@").replace(/\\4/g, "~").replace(/\\5/g, ":").replace(/\\6/g, " ").replace(/\\b/g, "\\").replace(/\\n/g, '\n');
    };
    
    getBlockMenuValueById = function(id) {
      var result = id;
      for(var i = 0; i < domainBlocks.length; i++) {
        if(domainBlocks[i].id == id) {
          result = i;
          break;
        }
      };
      return result;
    };
    
    // [0] logic
    // [1] blockoption
    // [2] blockname
    // [3] blocktype
    // [4] fields
    // [5] save fields
    // [6] extrafields
    // [7] save extrafields
    // [8] properties
    // [9] save properties
    // [10] actions
    // [11] items
    // [12] variable logic (1.0.1+)
    // 3,0,,55,,,,,2@5#3@asdf,2@fric#3@ffff,12,inv1#inv2,
    // ,inv1#inv2,
    // ,inv1Name@ifs@transfers@saves#inv2,
    // ,inv1Name@1:=:ifval~2:!=:ifval2@0:num:0/1:container#inv2Name@,
    save = function() {
      var result = "";
      $.each($('#stage1 .logicblock'), function(i) {
        var logic = $(this).find('.logic .checkboxbutton.selected').val();
        var blockoption = $(this).find('.blockoptions .checkboxbutton.selected').val();
        var blockname = sanitize($(this).find('input.blockname').val());
        var groupname = sanitize($(this).find('input.groupname').val());
        // updated blockmenu to use id in 1.0.3 so alphabetization works with old versions and new blocks
        var blocktype = domainBlocks[$(this).find('.blockmenu option:selected').val()].id;
        var appliedfields = [];
        var appliedsavefields = [];
        var appliedextrafields = [];
        var appliedsaveextrafields = [];
        var appliedprops = [];
        var appliedifprops = [];
        var appliedsaveprops = [];
        var appliedactions = [];
        var appliedinventories = [];
        var appliedvariables = [];
        var appliedifvariables = [];
        var appliedcode = "";
        var appliedifcode = "";
        $.each($(this).find('.field .fieldvalue'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            var select = $(this).find('select');
            if(input.length > 0) {
              appliedfields.push($(this).find('.checkboxbutton').val() + delim5 + $(this).find('.sign').html() + delim5 + sanitize($(input).val()));
            }
            else if(select.length > 0) {
              appliedfields.push($(this).find('.checkboxbutton').val() + delim5 + $(select).find('option:selected').val());
            }
          }
        });
        $.each($(this).find('.field .save'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            appliedsavefields.push($(this).find('.checkboxbutton').val() + delim5 + sanitize($(input).val()));
          }
        });
        $.each($(this).find('.extrafield .extrafieldvalue'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            var select = $(this).find('select');
            if(input.length > 0) {
              appliedextrafields.push($(this).find('.checkboxbutton').val() + delim5 + $(this).find('.sign').html() + delim5 + sanitize($(input).val()));
            }
            else if(select.length > 0) {
              appliedextrafields.push($(this).find('.checkboxbutton').val() + delim5 + $(select).find('option:selected').val());
            }
          }
        });
        $.each($(this).find('.extrafield .save'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            appliedsaveextrafields.push($(this).find('.checkboxbutton').val() + delim5 + sanitize($(input).val()));
          }
        });
        $.each($(this).find('.property .propertyset'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            var select = $(this).find('select');
            var textarea = $(this).find('textarea');
            if(input.length == 1) {
              appliedprops.push($(this).find('.checkboxbutton').val() + delim5 + sanitize($(input).val()));
            }
            else if(input.length == 3) {
              appliedprops.push($(this).find('.checkboxbutton').val() + delim5 + $(input[0]).val() + delim5 + $(input[1]).val() + delim5 + $(input[2]).val());
            }
            else if(select.length > 0) {
              appliedprops.push($(this).find('.checkboxbutton').val() + delim5 + $(select).find('option:selected').val());
            }
            else if(textarea.length > 0) {
              appliedprops.push($(this).find('.checkboxbutton').val() + delim5 + sanitizeTextarea($(textarea).val()));
            }
          }
        });
        $.each($(this).find('.property .propertyvalue'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            var textarea = $(this).find('textarea');
            if(input.length == 1) {
              appliedifprops.push($(this).find('.checkboxbutton').val() + delim5 + $(this).find('.sign').html() + delim5 + sanitize($(input).val()));
            }
            else if(textarea.length > 0) {
              appliedifprops.push($(this).find('.checkboxbutton').val() + delim5 + $(this).find('.sign').html() + delim5 + sanitizeTextarea($(textarea).val()));
            }
          }
        });
        $.each($(this).find('.property .save'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            appliedsaveprops.push($(this).find('.checkboxbutton').val() + delim5 + sanitize($(input).val()));
          }
        });
        $.each($(this).find('.action .checkboxbutton'), function(i) {
          if($(this).hasClass('selected')) {
            appliedactions.push($(this).val());
          }
        });
        $.each($(this).find('.math .mathset'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            if(input.length == 2) {
              appliedvariables.push($(this).find('.checkboxbutton').val() + delim5 + sanitize($($(input)[0]).val()) + delim5 + sanitize($($(input)[1]).val()));
            }
          }
        });
        $.each($(this).find('.math .mathvalue'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            if(input.length == 2) {
              appliedifvariables.push($(this).find('.checkboxbutton').val() + delim5 + sanitize($($(input)[0]).val()) + delim5 + $(this).find('.sign').html() + delim5 + sanitize($($(input)[1]).val()));
            }
          }
        });
        if($(this).find('.code .codeset .checkboxbutton').hasClass('selected')) {
          var input = $(this).find('.code .codeset textarea').val();
          appliedcode = sanitizeTextarea(input);
        }
        if($(this).find('.code .codevalue .checkboxbutton').hasClass('selected')) {
          var input = $(this).find('.code .codevalue textarea').val();
          appliedifcode = sanitizeTextarea(input);
        }
        if(i > 0) {
          result += delim0;
        }
        var names = blockname;
        if(groupname != "") {
          names += delim2 + groupname;
        }
        result += logic + delim1 + blockoption + delim1 + names + delim1 + blocktype + delim1;
        $.each(appliedfields, function(j) {
          if(j > 0) {
            result += delim2;
          }
          result += appliedfields[j];
        });
        result += delim1;
        $.each(appliedsavefields, function(j) {
          if(j > 0) {
            result += delim2;
          }
          result += appliedsavefields[j];
        });
        result += delim1;
        $.each(appliedextrafields, function(j) {
          if(j > 0) {
            result += delim2;
          }
          result += appliedextrafields[j];
        });
        result += delim1;
        $.each(appliedsaveextrafields, function(j) {
          if(j > 0) {
            result += delim2;
          }
          result += appliedsaveextrafields[j];
        });
        result += delim1;
        $.each(appliedprops, function(j) {
          if(j > 0) {
            result += delim2;
          }
          result += appliedprops[j];
        });
        // no delim here - if props are length 3, set props are 2 or 4
        $.each(appliedifprops, function(j) {
          if(j > 0 || appliedprops.length > 0) {
            result += delim2;
          }
          result += appliedifprops[j];
        });
        result += delim1;
        $.each(appliedsaveprops, function(j) {
          if(j > 0) {
            result += delim2;
          }
          result += appliedsaveprops[j];
        });
        result += delim1;
        $.each(appliedactions, function(j) {
          if(j > 0) {
            result += delim2;
          }
          result += appliedactions[j];
        });
        // 012345
        // %,#@~:
        // ,inv1Name@1:=:ifval~2:!=:ifval2@0:num:0/1:container#inv2Name@,
        result += delim1;
        var inventoryResult = "";
        $.each($(this).find('.inventoryheader'), function(j) {
          if(j > 0) {
            inventoryResult += delim2;
          }
          inventoryResult += $(this).find('input').val() + delim3;
          var found = false;
          $.each($(this).parent().find('.item.inv'+j+' .itemvalue'), function(k) {
            if($(this).find('button').hasClass('selected')) {
              if(found == true) {
                inventoryResult += delim4;
              }
              found = true;
              inventoryResult += ("" + k + delim5 + $(this).find('.sign').html() + delim5 + sanitize($(this).find('input').val()));
            }
          });
          inventoryResult += delim3;
          found = false;
          $.each($(this).parent().find('.item.inv'+j+' .transfer'), function(k) {
            if($(this).find('button').hasClass('selected')) {
              if(found == true) {
                inventoryResult += delim4;
              }
              found = true;
              var toFrom = $(this).find('label').html().charAt(0);
              inventoryResult += ("" + k + delim5 + sanitize($($(this).find('input')[0]).val()) + delim5 + toFrom + delim5 + sanitize($($(this).find('input')[1]).val()));
            }
          });
          inventoryResult += delim3;
          found = false;
          $.each($(this).parent().find('.item.inv'+j+' .save'), function(k) {
            if($(this).find('button').hasClass('selected')) {
              if(found == true) {
                inventoryResult += delim4;
              }
              found = true;
              inventoryResult += ("" + k + delim5 + sanitize($(this).find('input').val()));
            }
          });
          // 1.0.3 addition
          inventoryResult += delim3;
          found = false;
          $.each($(this).parent().find('.invfield.inv'+j+' .fieldvalue'), function(k) {
            if($(this).find('button').hasClass('selected')) {
              if(found == true) {
                inventoryResult += delim4;
              }
              found = true;
              // fixed in 1.1.1 - missed sign from 1.0.3 to 1.1.0 - may have only 2 values
              // inventoryResult += ("" + k + delim5 + sanitize($(this).find('input').val())); 
              inventoryResult += ("" + k + delim5 + $(this).find('.sign').html() + delim5 + sanitize($(this).find('input').val()));
            }
          });
          inventoryResult += delim3;
          found = false;
          $.each($(this).parent().find('.invfield.inv'+j+' .save'), function(k) {
            if($(this).find('button').hasClass('selected')) {
              if(found == true) {
                inventoryResult += delim4;
              }
              found = true;
              inventoryResult += ("" + k + delim5 + sanitize($(this).find('input').val()));
            }
          });
        });
        if(inventoryResult == ("" + delim3 + delim3 + delim3 + delim3 + delim3) || inventoryResult == ("" + delim3 + delim3 + delim3 + delim3 + delim3 + delim2 + delim3 + delim3 + delim3 + delim3 + delim3)) {
          inventoryResult = "";
        }
        result += inventoryResult;
        // 1.0.1
        result += delim1;
        $.each(appliedvariables, function(j) {
          if(j > 0) {
            result += delim2;
          }
          result += appliedvariables[j];
        });
        result += delim1;
        $.each(appliedifvariables, function(j) {
          if(j > 0) {
            result += delim2;
          }
          result += appliedifvariables[j];
        });
        result += delim1;
        if(appliedcode != "") {
          result += appliedcode;
        }
        result += delim1;
        if(appliedifcode != "") {
          result += appliedifcode;
        }
      });
      var miscdata = "";
      var hideshowbinary = "";
      $.each($('.hideshow'), function(i) {
        hideshowbinary += ($(this).html() == "[show]"?"1":"0");
      });
      var padding = hideshowbinary.length%4;
      for(var i = 0; i < padding; i++) {
        hideshowbinary += '0';
      }
      if(hideshowbinary.indexOf('1') > -1) {
        for(var i = 0; i < hideshowbinary.length; i+=4) {
          miscdata += parseInt(hideshowbinary.substring(i, i+4), 2).toString(16);
        }
      }
      miscdata += delim1;
      if($('.thisGridButton').hasClass('selected')) {
        miscdata += "y";
      }
      miscdata += delim1;
      var miscdata2 = "";
      var found = false;
      if($('.allowMissingBlocks').hasClass('selected')) {
        miscdata2 += "y";
        found = true;
      }
      miscdata2 += delim2;
      if($('.powerprecision input').val() != 2) {
        miscdata2 += $('.powerprecision input').val();
        found = true;
      }
      miscdata2 += delim2;
      if($('.energyprecision input').val() != 2) {
        miscdata2 += $('.energyprecision input').val();
        found = true;
      }
      miscdata2 += delim2;
      if($('.itemprecision input').val() != 4) {
        miscdata2 += $('.itemprecision input').val();
        found = true;
      }
      miscdata2 += delim2;
      if($('.frequency select').val() != '0') {
        miscdata2 += $('.frequency select').val();
        found = true;
      }
      if(found) {
        miscdata += miscdata2;
      }
      miscdata += (delim1 + sanitize(versionNumber));
      result += (delim0 + miscdata);
      return result;
    };
    
    load = function(fullStr) {
      isLoading = true;
      //var str = $('#import').val();
      var str = $.trim(fullStr);
      if(str.startsWith("//")) {
        str = $.trim(str.substring(2));
      }
      if(str == "") {
        return;
      }
      clearAllBlocks();
      var blocks = str.split(delim0);
      var miscdata = blocks.pop().split(delim1);
      var version = miscdata[3];
      $.each(blocks, function(i) {
        // blockdata
        // [0] logic
        // [1] blockoption
        // [2] blockname
        // [3] blocktype
        // [4] fields
        var blockdata = blocks[i].split(delim1);
        if(blockdata.length < 2) {
          generateScript();
          isLoading = false;
          return;
        }
        var names = blockdata[2].split(delim2);
        var fields = blockdata[4].split(delim2);
        var savefields = blockdata[5].split(delim2);
        var extrafields = blockdata[6].split(delim2);
        var saveextrafields = blockdata[7].split(delim2);
        var props = blockdata[8].split(delim2);
        var saveprops = blockdata[9].split(delim2);
        var actions = blockdata[10].split(delim2);
        var inventories = blockdata[11].split(delim2);
        var setvariables = [];
        var ifvariables = [];
        var setcode = "";
        var ifcode = "";
        if(upToDate(version, "1.0.1")) {
          setvariables = blockdata[12].split(delim2);
          ifvariables = blockdata[13].split(delim2);
        }
        if(upToDate(version, "1.1.0") && blockdata.length >= 16) {
          setcode = blockdata[14];
          ifcode = blockdata[15];
        }
        addLastBlockInstantly();
        var block = $('#stage1 .logicblock:nth-of-type('+(i+1)+')');
        $.each($(block).find('.logic .checkboxbutton'), function(j) {
          $(this).removeClass('selected');
          // problem
          if($(this).attr('value') == blockdata[0]) {
            $(this).addClass('selected');
          }
        });
        $.each($(block).find('.blockoptions .checkboxbutton'), function(j) {
          $(this).removeClass('selected');
          // problem
          if($(this).attr('value') == blockdata[1]) {
            $(this).addClass('selected');
          }
        });
        $(block).find('input.blockname').val(unsanitize(names[0]));
        $(block).find('input.groupname').val(unsanitize(names[1]));
        $(block).find('select.blockmenu').val(getBlockMenuValueById(blockdata[3])).change();
        $.each(fields, function(j) {
          // [0] field index
          // [] possible =
          // [1] value
          var fielddata = fields[j].split(delim5);
          var thisfield = $(block).find('.field .fieldvalue')[fielddata[0]];
          // this field is boolean
          if(fielddata.length == 2) {
            $(thisfield).find('.checkboxbutton').addClass('selected');
            $(thisfield).find('select').val(fielddata[1]);
          }// this field is float
          else if(fielddata.length == 3) {
            $(thisfield).find('.checkboxbutton').addClass('selected');
            $(thisfield).find('.sign').html(fielddata[1]);
            $(thisfield).find('input').val(unsanitize(fielddata[2]));
          }
        });
        $.each(savefields, function(j) {
          var savefielddata = savefields[j].split(delim5);
          var thissavefield = $(block).find('.field .save')[savefielddata[0]];
          if(savefielddata.length == 2) {
            $(thissavefield).find('.checkboxbutton').addClass('selected');
            $(thissavefield).find('input').val(unsanitize(savefielddata[1]));
          }
        });
        $.each(extrafields, function(j) {
          var extrafielddata = extrafields[j].split(delim5);
          var thisextrafield = $(block).find('.extrafield .extrafieldvalue')[extrafielddata[0]];
          // this field is boolean
          if(extrafielddata.length == 2) {
            $(thisextrafield).find('.checkboxbutton').addClass('selected');
            $(thisextrafield).find('select').val(extrafielddata[1]);
          }// this field is float
          else if(extrafielddata.length == 3) {
            $(thisextrafield).find('.checkboxbutton').addClass('selected');
            $(thisextrafield).find('.sign').html(extrafielddata[1]);
            $(thisextrafield).find('input').val(unsanitize(extrafielddata[2]));
          }
        });
        $.each(saveextrafields, function(j) {
          var saveextrafielddata = saveextrafields[j].split(delim5);
          var thissaveextrafield = $(block).find('.extrafield .save')[saveextrafielddata[0]];
          if(saveextrafielddata.length == 2) {
            $(thissaveextrafield).find('.checkboxbutton').addClass('selected');
            $(thissaveextrafield).find('input').val(unsanitize(saveextrafielddata[1]));
          }
        });
        // added CustomData as first property to all blocks in 1.1.0
        // loading older scripts must have an offset index
        var extraPropIndex = 0;
        if(!upToDate(version, '1.1.0')) {
          extraPropIndex = 1;
        }
        $.each(props, function(j) {
          var propdata = props[j].split(delim5);
          // this prop is boolean/float
          if(propdata.length == 2) {
            var thisprop = $(block).find('.property')[parseInt(propdata[0])+extraPropIndex];
            $(thisprop).find('.propertyset .checkboxbutton').addClass('selected');
            $(thisprop).find('.propertyset input').val(unsanitize(propdata[1]));
            $(thisprop).find('.propertyset select').val(propdata[1]);
            $(thisprop).find('.propertyset textarea').val(unsanitizeTextarea(propdata[1]));
          }// this prop is color
          else if(propdata.length == 4) {
            var thisprop = $(block).find('.property')[parseInt(propdata[0])+extraPropIndex];
            $(thisprop).find('.propertyset .checkboxbutton').addClass('selected');
            $($(thisprop).find('.propertyset input').get(0)).val(propdata[1]==""?0:propdata[1]);
            $($(thisprop).find('.propertyset input').get(1)).val(propdata[2]==""?0:propdata[2]);
            $($(thisprop).find('.propertyset input').get(2)).val(propdata[3]==""?0:propdata[3]);
            refreshColor($($(thisprop).find('.propertyset input').get(0)));
          }// if prop (propertyvalue, not propertyset)
          else if(propdata.length == 3) {
            var thisprop = $(block).find('.property')[parseInt(propdata[0])+extraPropIndex];
            $(thisprop).find('.propertyvalue .checkboxbutton').addClass('selected');
            $($(thisprop).find('.propertyvalue .sign')).html(propdata[1]);
            $($(thisprop).find('.propertyvalue input')).val(unsanitize(propdata[2]));
            $($(thisprop).find('.propertyvalue textarea')).val(unsanitizeTextarea(propdata[2]));
          }
        });
        $.each(saveprops, function(j) {
          var savepropdata = saveprops[j].split(delim5);
          var thissaveprop = $(block).find('.property')[parseInt(savepropdata[0])+extraPropIndex];
          if(savepropdata.length == 2) {
            $(thissaveprop).find('.save .checkboxbutton').addClass('selected');
            $(thissaveprop).find('.save input').val(unsanitize(savepropdata[1]));
          }
        });
        $.each(actions, function(j) {
          $($(block).find('.action .checkboxbutton')[actions[j]]).addClass('selected');
        });
        // 012345
        // %,#@~:
        // ,inv1Name@1:=:ifval~2:!=:ifval2@0:num:to:container#inv2Name@,
        $.each(inventories, function(j) {
          if(inventories[j] != "") {
            var inventory = inventories[j].split(delim3);
            $($(block).find('.inventoryheader')[j]).find('input').val(unsanitize(inventory[0]));
            var itemvalues = inventory[1].split(delim4);
            $.each(itemvalues, function(k) {
              var itemvalue = itemvalues[k].split(delim5);
              var thisitem = $(block).find('.inv'+j+' .itemvalue')[itemvalue[0]];
              $(thisitem).find('.checkboxbutton').addClass('selected');
              $(thisitem).find('.sign').html(itemvalue[1]);
              $(thisitem).find('input').val(unsanitize(itemvalue[2]));
            });
            var transfers = inventory[2].split(delim4);
            $.each(transfers, function(k) {
              var transfer = transfers[k].split(delim5);
              var thistransfer = $(block).find('.inv'+j+' .transfer')[transfer[0]];
              $(thistransfer).find('.checkboxbutton').addClass('selected');
              $($(thistransfer).find('input')[0]).val(unsanitize(transfer[1]));
              if(transfer[2] == "f") {
                $(thistransfer).find('label').click();
              }
              $($(thistransfer).find('input')[1]).val(unsanitize(transfer[3]));
            });
            var saveitems = inventory[3].split(delim4);
            $.each(saveitems, function(k) {
              var saveitem = saveitems[k].split(delim5);
              var thissaveitem = $(block).find('.item.inv'+j+' .save')[saveitem[0]];
              $(thissaveitem).find('.checkboxbutton').addClass('selected');
              $(thissaveitem).find('input').val(unsanitize(saveitem[1]));
            });
            // 1.0.3
            var invfields = inventory[4].split(delim4);
            $.each(invfields, function(k) {
              var invfield = invfields[k].split(delim5);
              var thisinvfield = $(block).find('.invfield.inv'+j+' .fieldvalue')[invfield[0]];
              $(thisinvfield).find('.checkboxbutton').addClass('selected');
              // sign was missing from 1.0.3 to 1.1.0
              if(invfield.length == 2) {
                $(thisinvfield).find('input').val(unsanitize(invfield[1]));
              }
              // sign added in 1.1.1
              else {
                $(thisinvfield).find('.sign').html(invfield[1]);
                $(thisinvfield).find('input').val(unsanitize(invfield[2]));
              }
            });
            var saveinvfields = inventory[5].split(delim4);
            $.each(saveinvfields, function(k) {
              var saveinvfield = saveinvfields[k].split(delim5);
              var thissaveinvfield = $(block).find('.invfield.inv'+j+' .save')[saveinvfield[0]];
              $(thissaveinvfield).find('.checkboxbutton').addClass('selected');
              $(thissaveinvfield).find('input').val(unsanitize(saveinvfield[1]));
            });
          }
        });
        $.each(setvariables, function(j) {
          var setvariabledata = setvariables[j].split(delim5);
          var thissetvariable = $(block).find('.math .mathset')[setvariabledata[0]];
          if(setvariabledata.length == 3) {
            $(thissetvariable).find('.checkboxbutton').addClass('selected');
            $($(thissetvariable).find('input')[0]).val(unsanitize(setvariabledata[1]));
            $($(thissetvariable).find('input')[1]).val(unsanitize(setvariabledata[2]));
          }
        });
        $.each(ifvariables, function(j) {
          var ifvariabledata = ifvariables[j].split(delim5);
          var thisifvariable = $(block).find('.math .mathvalue')[ifvariabledata[0]];
          if(ifvariabledata.length == 4) {
            $(thisifvariable).find('.checkboxbutton').addClass('selected');
            $($(thisifvariable).find('input')[0]).val(unsanitize(ifvariabledata[1]));
            $(thisifvariable).find('label').html(ifvariabledata[2])
            $($(thisifvariable).find('input')[1]).val(unsanitize(ifvariabledata[3]));
          }
        });
        if(setcode != "") {
          $(block).find('.code .codeset textarea').val(unsanitizeTextarea(setcode));
          $(block).find('.code .codeset .checkboxbutton').addClass('selected');
        }
        if(ifcode != "") {
          $(block).find('.code .codevalue textarea').val(unsanitizeTextarea(ifcode));
          $(block).find('.code .codevalue .checkboxbutton').addClass('selected');
        }
    /*
    $.each($(this).find('.math .mathset'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            if(input.length == 2) {
              appliedvariables.push($(this).find('.checkboxbutton').val() + delim5 + sanitize($($(input)[0]).val()) + delim5 + sanitize($($(input)[1]).val()));
            }
          }
        });
        $.each($(this).find('.math .mathvalue'), function(i) {
          if($(this).find('.checkboxbutton').hasClass('selected')) {
            var input = $(this).find('input');
            if(input.length == 2) {
              appliedifvariables.push($(this).find('.checkboxbutton').val() + delim5 + sanitize($($(input)[0]).val()) + delim5 + $(this).find('.sign').html() + delim5 + sanitize($($(input)[1]).val()));
            }
          }
        });
        if($(this).find('.code .codeset .checkboxbutton').hasClass('selected')) {
          var input = $(this).find('.code .codeset textarea').val();
          appliedcode = sanitizeTextarea(input);
        }
        if($(this).find('.code .codevalue .checkboxbutton').hasClass('selected')) {
          var input = $(this).find('.code .codevalue textarea').val();
          appliedifcode = sanitizeTextarea(input);
        }
    */
      });
      if(miscdata[1] != "") {
        $('.thisGridButton').addClass('selected');
      }
      if(miscdata[2] != "") {
        settingsInput = miscdata[2].split(delim2);
        //$('.thisGridName').val(unsanitize(settingsInput[0]));
        if(settingsInput[1] != "") {
          $('.powerprecision input').val(unsanitize(settingsInput[1]));
        }
        if(settingsInput[2] != "") {
          $('.energyprecision input').val(unsanitize(settingsInput[2]));
        }
        if(settingsInput[0] != "") {
          $('.allowMissingBlocks').addClass('selected');
        }
        if(settingsInput[3] != "") {
          $('.itemprecision input').val(unsanitize(settingsInput[3]));
        }
        if(settingsInput[4] != "") {
          $('.frequency select').val(unsanitize(settingsInput[4]));
        }
      }
      generateScript();
      if(miscdata[0] != "") {
        var hideshowbinary = "";
        for(var i = 0; i < miscdata[0].length; i++) {
          var bit = parseInt(miscdata[0].charAt(i), 16).toString(2);
          while (bit.length < 4) bit = "0" + bit;
          hideshowbinary += bit;
        }
        //var hideshowvalue = parseInt(miscdata[0], 16);
        //var hideshowbinary = hideshowvalue.toString(2);
        //hideshowbinary = Array($('.hideshow').length-hideshowbinary.length+1).join('0')+hideshowbinary;
        $.each($('.hideshow'), function(i) {
          if(hideshowbinary.charAt(i) == "1") {
            $(this).click();
          }
        });
      }
      generateScript();
      isLoading = false;
    };
    
    
    // -------------------------- TUTORIAL MODE -------------------------------- //
    
    // indexes for help text
    //  0 Logic
    //  1 Affect
    //  2 Remove
    //  3 Affect only this grid
    //  4 Grid Block Name
    //  5 Power Precision
    //  6 Energy Precision
    //  7 Add New Chunk
    //  8 Script Settings
    //  9 Block Name
    // 10 Group Name
    // 11 Block Type
    // 12 Fields
    // 13 Extra Fields
    // 14 Properties
    // 15 Actions
    // 16 Inventories
    // 17 User Variables (math)
    // 18 Overview of Logic Chunks
    // 19 Allow Missing Blocks
    // 20 Item Precision
    // 21 Frequency
    // 22 Custom Code
    var helptext = [
      ['Logic', 'Select whether you want to perform an action (DO) or check a condition (IF) with this chunk. Though there are 6 logic choices, there are only two main types of logic.'
        +'<br><br>IF logic means that this chunk will check values. If the overall result of this chunk is <i>true</i>, the next chunk will be executed.'
        +'<br><br>DO logic means the chunk will do any combination of setting values, saving variables, applying actions, and transferring items.'
        +'<br><br>AND can be either IF or DO logic, but it will always match the chunk before it. This lets you create more complex logic statements. Four logic chunks configured as <i>IF-AND-DO-AND</i> creates the following logic: <i>IF (a) AND (b), then DO (c) AND DO (d)</i>. In order for action (d) to be executed only when conditions (a) and (b) are met, the fourth chunk must use AND, not DO. If the fourth chunk used DO logic, it would always execute action (d), regardless of conditions (a) and (b).'
        +'<br><br>OR always acts as IF logic, and can only be used following an IF logic chunk. For example: <i>IF (a) OR (b), then DO (c)</i>. The logic <i>DO (a) OR (b)</i> is not valid.'
        +'<br><br>ELSE IF is always IF logic. It only works after an IF logic chunk followed by a DO logic chunk. For example: <i>IF (a), then DO (b), ELSE IF (c), then DO (d)</i>. In this case, condition (c) would only be checked if condition (a) did not succeed. This way, actions (b) and (d) cannot both be executed.'
        +'<br><br>ELSE DO is always DO logic. It works similarly to ELSE IF, but always executes if the previous IF logic didn\'t succeed. For example: <i>IF (a), then DO (b), ELSE DO (c)</i>. In this case, either action (b) or (c) will be executed, depending on condition (a).'
        +'<br><br>For more information on logic types, see the <a target=\"_blank\" href=\"http://dco.pe#LOGIC\">detailed instructions</a>.'],
      ['Affect', 'Will this action/condition affect one block, multiple blocks, or no blocks?'
        +'<br><br>Single Block - Logic affects one in-game block, selected by name.'
        +'<br><br>All Blocks of Type - Logic affects all blocks of the selected type, filtered by group and name (optional). This will loop through each selected block and apply an action or check a condition. When used with IF logic, it checks that the chosen condition(s) hold for all blocks. When used with DO logic, the action(s) are applied for each block.'
        +'<br><br>Any Blocks of Type - Works the same as All Blocks of Type, but only works with IF logic. This checks that the chosen condition(s) hold for one or more blocks.'
        +'<br><br>Custom - No blocks are affected, but user defined variables can be checked or modified and custom code can be written.'
        +'<br><br>For more information on affecting Single/Multiple blocks, see the <a target=\"_blank\" href=\"http://dco.pe#AFFECT\">detailed instructions</a>.'],
      ['Remove Chunk', 'This will remove the entire logic chunk. There is no way to undo this!'
        +'<br><br>You will be prompted with a popup window to confirm that you\'re really sure you want to delete this chunk. Once you click the red button, it will be gone!'],
      ['Affect only this grid', 'When enabled, this script will only affect blocks on the programmable block\'s grid, not ships/stations connected by connectors or landing gear.'
        +'<br><br>Enable to prevent this script from modifying or getting data from blocks on other ships/stations when they become connected.'],
      ['Grid Block Name', 'Enter the name of the programmable block that will be running this script, or any block on the grid. This is used to determine which grid the script applies to, so make sure the block has a unique name.'
        +'<br><br>If left blank, this will default to the running programmable block, which should work in most cases. However, problems may arise when multiple programmable blocks are executing scripts simultaneously.'],
      ['Power Precision', 'Precision of power (W, kW, MW, etc) formatted values for display on text/LCD panels. The default is 2, which will round to 2 decimal places on power output. For example: 13.25 kW.'
        +'<br><br>This will only be included in the script if a power variable is displayed on an LCD panel.'],
      ['Energy Precision', 'Precision of energy (Wh, kWh, MWh, etc) formatted values for display on text/LCD panels. The default is 2, which will round to 2 decimal places when displaying energy stored. For example: 10.40 MWh.'
        +'<br><br>This will only be included in the script if an energy variable is displayed on an LCD panel.'],
      ['Add New Chunk', 'Click to add a new logic chunk at the green line.'
        +'<br><br>Logic chunks cannot be moved once created, but they can be deleted. A new chunk can be added before or after any other chunk.'
        +'<br><br>A \'chunk\' represents one piece of code. It consists of a type of logic (IF, DO, ELSE, etc), the affected block or blocks, and the associated properties/actions/fields.'
        +'<br><br>A script to turn on all interior lights could be represented with one chunk. (DO, Interior Lights, Turn On)'
        +'<br><br>A script to turn on a light if a refinery is working would take two chunks. (IF, Refinery, Is Working) (DO, Light, Turn On)'],
      ['Script Settings', 'These settings affect the entire script.'],
      ['Block Name', 'The custom name of an in-game block.'
        +'<br><br>Single Block - Enter the full name of a block as it appears in the console. The Block Name must match exactly to the block\'s in-game name. For example, \'Interior Light 7\' or \'Main Hall Door\'. If left blank, the default block name will be used. The default name is exactly what is shown in the Block Type menu above.'
        +'<br><br>All/Any Blocks of Type - The Block Name acts as a filter when used with multiple blocks. Only blocks with names containing the specified Block Name will be affected. For example, if Block Name is \'Interior\', then \'Interior Light\' and \'Interior Light 2\' would be affected, but an interior light named \'Hallway Light\' would not.'],
      ['Group Name', 'The name of the in-game group that will be affected.'
        +'<br><br>If specified, the in-game group name must match this field exactly for any blocks to be affected by the logic in this chunk. For example, if you create a group called \'Hangar Doors\', you can enter \'Hangar Doors\' as the Group Name and select \'Airtight Hangar Door\' as the Block Type to affect only the Airtight Hangar Doors in the \'Hangar Doors\' group.'
        +'<br><br>You\'ll still need to select a Block Type from the dropdown menu above, so if your group contains more than one type of block, you will only be able to affect one type of block from your group. To affect the other types of blocks in the group, you can add another chunk below with the same Group Name, but different Block Type, and select the appropriate logic.'],
      ['Block Type', 'Choose which type of in-game block to affect. For example, you can choose \"Interior Light\" if you want to check the status of one or more interior lights, or \"Refinery\" if you want to turn on a refinery.'
        +'<br><br>Block Types that are already part of the script will be highlighted so you can quickly find Block Types you\'re already using.'
        +'<br><br>Warning: Since all the blocks have different fields, properties, and actions, changing the Block Type will wipe out the changes you\'ve made to the fields, properties, and actions in this chunk. Changing the Block Type back will not bring back your work.'],
      ['Fields', 'These are the fields associated with the chosen block type.'
        +'<br><br>Using IF logic, you can check a field\'s value. Enter a value in the box next to the field name, and make sure the If button is selected. Click the equals sign between the button and the box to switch between the different logic choices (=, !=, >, >=, <, <=).'
        +'<br><br>Using DO logic, some fields and properties can be saved as variables to use later. When you enter a value into the Save As box, you\'re saving that field\'s value for use later in this script. You can then set a property to that variable\'s value in another chunk, or even display it on an LCD panel.'
        +'<br><br>Saving variables with a plus sign or minus sign at the beginning will add to or subtract from the variable\'s value. This is useful for summing values from multiple blocks. For example, getting total Battery power is as simple as choosing "All Blocks of Type" and saving a variable "+power". The variable "power" could then be displayed on an LCD panel, or compared with another value to drive logic.'
        +'<br><br>For more information on saving and using variables, see the <a target=\"_blank\" href=\"http://dco.pe#VAR\">detailed instructions</a>.'],
      ['Extra Fields', 'These are the extra fields associated with the chosen block type.'
        +'<br><br>Using IF logic, you can check a field\'s value. Enter a value in the box next to the field name, and make sure the If button is selected. Click the equals sign between the button and the box to switch between the different logic choices (=, !=, >, >=, <, <=).'
        +'<br><br>Using DO logic, some fields and properties can be saved as variables to use later. When you enter a value into the Save As box, you\'re saving that field\'s value for use later in this script. You can then set a property to that variable\'s value in another chunk, or even display it on an LCD panel.'
        +'<br><br>Saving variables with a plus sign or minus sign at the beginning will add to or subtract from the variable\'s value. This is useful for summing values from multiple blocks. For example, getting total Battery power is as simple as choosing "All Blocks of Type" and saving a variable "+power". The variable "power" could then be displayed on an LCD panel, or compared with another value to drive logic.'
        +'<br><br>For more information on saving and using variables, see the <a target=\"_blank\" href=\"http://dco.pe#VAR\">detailed instructions</a>.'],
      ['Properties', 'These are the properties associated with the chosen block type.'
        +'<br><br>Using IF logic, you can check a property\'s value. Enter a value in the box next to the property name, and make sure the If button is selected. Click the equals sign between the button and the box to switch between the different logic choices (=, !=, >, >=, <, <=).'
        +'<br><br>Using DO logic, you can set properties to specified values. You can also set properties to the value of a variable you created earler. If you have any variables of the appropriate type, clicking the box will show a list of your variables to choose from.'
        +'<br><br>Properties can also be saved with DO logic. When you enter a value into the Save As box, you\'re saving that property\'s value for use later in this script. You can then set a property to that variable\'s value in another chunk, or even display it on an LCD panel.'
        +'<br><br>Saving variables with a plus sign or minus sign at the beginning will add to or subtract from the variable\'s value. This is useful for summing values from multiple blocks. For example, getting total Battery power is as simple as choosing "All Blocks of Type" and saving a variable "+power". The variable "power" could then be displayed on an LCD panel, or compared with another value to drive logic.'
        +'<br><br>For more information on saving and using variables, see the <a target=\"_blank\" href=\"http://dco.pe#VAR\">detailed instructions</a>.'],
      ['Actions', 'These are the actions associated with the chosen block type. Actions trigger a block\'s action as though you pushed a button in the in-game menu.'
        +'<br><br>Some of these actions have three similar actions associated with it. The base action, then one ending in \"_On\" and one ending in \"_Off\". For any like this, the first is a toggle action, the \"_On\" is an \"On\" or \"True\" action, and the \"_Off\" is an \"Off\" or \"False\" action.'
        +'<br><br>Many block types have three \"OnOff\" actions. \"OnOff\" toggles the block from its current state, \"OnOff_On\" turns the block on, and \"OnOff_Off\" turns the block off.'
        +'<br><br>For doors, \"Open\" toggles the door open or closed, \"Open_On\" opens the door, and \"Open_Off\" closes the door.'],
      ['Inventories', 'These are the inventories associated with the chosen block. Currently, only the Assembler has two inventories (input and output), which is why inventories are numbered.'
        +'<br><br>Using IF logic, you can check the quantity of items and use that value to drive logic.'
        +'<br><br>Using DO logic, items can be transferred between inventories, but the inventories must first be given a name. By filling out the <i>Send Amount To Inventory</i> fields, you can specify how much material to send (numerically or with a percentage), and to which inventory it should be sent. Clicking "to" switches the action to <i>Take Amount From Inventory</i>.'
        +'<br><br>Quantities of items can be saved as variables, just like with fields and actions.'
        +'<br><br>For more information on inventories and items, see the <a target=\"_blank\" href=\"http://dco.pe#INV\">detailed instructions</a>.'],
      ['User Variables', 'This section allows you to check conditions or set values of your custom variables. These are the variables that are created from fields, properties, and inventories using the Save As field.'
        +'<br><br>These variables are not necessarily tied to the current logic chunk.'
        +'<br><br>Text Variables can be checked or set, but if checking against a text string, you must put quotation marks around the text. For example, if you want to check if one of your variables is equal to \"Hello\", you\'d have to choose the variable name from the dropdown list, and type \"Hello\" (including the quotation marks) into the text box.'
        +'<br><br>You can access the argument passed into the Programmable Block through the variable <i>argument</i>, which is already in the text variable list.'],
      ['Overview of Logic Chunks', 'Every logic chunk is shown here.'],
      ['Allow Missing Blocks', 'By default, the script will cancel execution if any blocks can\'t be found. This allows the Programmable Block output to show useful errors to pinpoint which blocks have problems.'
        +'<br><br>When missing blocks are allowed, the script will still attempt to run with missing blocks. This can cause errors during execution which require the script to be recompiled. However, if the script includes blocks that aren\'t used, this setting allows you to bypass the errors and run the script anyway.'],
      ['Item Precision', 'Decimal precision of Ore/Ingot amounts for display on text/LCD panels.'
        +'<br><br>Maximum rounding is 4 decimal places; any value higher than 4 will use the raw unrounded value when displaying quantities of items.'],
      ['Run Frequency', 'Control how often the script runs. Timer blocks are no longer required. There are 60 ticks per second, which translates to the following:'
        +'<br><br>Every Tick = script runs 60 times per second'
        +'<br><br>Every 10 Ticks = script runs 6 times per second'
        +'<br><br>Every 100 Ticks = script runs once every 1.66 seconds, or 3 times every 5 seconds'],
      ['Custom Code', '<b>ADVANCED</b>'
        +'<br><br>This section allows you to write custom code.'
        +'<br><br>When using IF logic, the result of your custom code must be a boolean.'
        +'<br><br>When using DO logic, your code can do anything within the Main() method.'
        +'<br><br>This custom code is executed just like the rest of the code generated in VSB. It\'s called in order, and can be combined with other logic to perform complex operations.'
        +'<br><br>There is no validation on this field, so be careful. This can easily mess up your scripts and result in errors compiling on the Programmable Block.']
    ];
    
    showHelp = function (e, index, scroll) {
      if((index >= 12 && index <= 17) || index == 22) {
        showHelpMask(e, index, scroll);
      }
      else {
        showHelpNormal(e, index, scroll);
      }
    };

    showHelpNormal = function (e, index, scroll) {
      hideHelp();
      if(scroll == undefined || scroll == true) {
        // 203 puts it at the top of the (?)
        scrollToElement(e, 160);
      }
      var $temp = $('<div class="overlay" onClick="hideHelp();" hidden="hidden"></div><div class="popup" hidden="hidden"><div class="helpTitle"></div><div class="helpContent"></div><div class="helpX unselectable" onClick="hideHelp();">X</div></div>');
      $(e).parents('.section').append($temp);
      updateHelpText(index);
      $(e).closest('div, td').addClass('hl');
      $('.overlay').fadeIn(200);
      $('.popup').fadeIn(200);
      $('body').css('overflow', 'hidden');
    };
    
    showHelpMask = function (e, index, scroll) {
      hideHelp();
      if(scroll == undefined || scroll == true) {
        // 203 puts it at the top of the (?)
        scrollToElement(e, 160);
      }
      var $temp = $('<div class="popup" hidden="hidden"><div class="helpTitle"></div><div class="helpContent"></div><div class="helpX unselectable" onClick="hideHelp();">X</div></div>');
      $(e).parents('.section').append($temp);
      updateHelpText(index);
      //$('.popup').fadeIn(200, function () {
      //  maskFields(e);
      //});
      if(index == 12) {
        maskFields(e);
      }
      else if(index == 13) {
        maskExtraFields(e);
      }
      else if(index == 14) {
        maskProperties(e);
      }
      else if(index == 15) {
        maskActions(e);
      }
      else if(index == 16) {
        maskInventories(e);
      }
      else if(index == 17) {
        maskUserVariables(e);
      }
      else if(index == 22) {
        maskUserCode(e);
      }
      $('.popup').fadeIn(200);
      
    };
    
    hideHelp = function () {
      $('.hl').removeClass('hl');
      $('.overlay').remove();
      $('.popup').remove();
      $('.mask').hide();
      $('body').css('overflow', '');
    };
    
    updateHelpText = function (index) {
      $('.popup .helpTitle').html("Help: " + helptext[index][0]);
      $('.popup .helpContent').html(helptext[index][1]);
    };
    
    maskFields = function (e) {
      var row = $(e).closest('.fieldheader');
      if($(row).find('.hideshow').html() == "[show]") {
        hideShowFields($(row).find('.hideshow'));
      }
      var a = $(row).offset().top;
      var b = $(row).offset().left;
      var c = $(row).width();
      var d = ($(row).siblings('tr.field').last().offset().top + $(row).siblings('.field').last().height()) - a;
      if(a != undefined && b != undefined && c != undefined && d != undefined) {
        greyOutAround(a, b, c, d);
      }
    };
    
    maskExtraFields = function (e) {
      var row = $(e).closest('.extrafieldheader');
      if($(row).find('.hideshow').html() == "[show]") {
        hideShowExtraFields($(row).find('.hideshow'));
      }
      var a = $(row).offset().top;
      var b = $(row).offset().left;
      var c = $(row).width();
      var d = ($(row).siblings('tr.extrafield').last().offset().top + $(row).siblings('.extrafield').last().height()) - a;
      if(a != undefined && b != undefined && c != undefined && d != undefined) {
        greyOutAround(a, b, c, d);
      }
    };
    
    maskProperties = function (e) {
      var row = $(e).closest('.propheader');
      if($(row).find('.hideshow').html() == "[show]") {
        hideShowProps($(row).find('.hideshow'));
      }
      var a = $(row).offset().top;
      var b = $(row).offset().left;
      var c = $(row).width();
      var d = ($(row).siblings('tr.property').last().offset().top + $(row).siblings('.property').last().height()) - a;
      if(a != undefined && b != undefined && c != undefined && d != undefined) {
        greyOutAround(a, b, c, d);
      }
    };
    
    maskActions = function (e) {
      var row = $(e).closest('.actionheader');
      if($(row).find('.hideshow').html() == "[show]") {
        hideShowActions($(row).find('.hideshow'));
      }
      var a = $(row).offset().top;
      var b = $(row).offset().left;
      var c = $(row).width();
      var d = ($(row).siblings('tr.action').last().offset().top + $(row).siblings('.action').last().height()) - a;
      if(a != undefined && b != undefined && c != undefined && d != undefined) {
        greyOutAround(a, b, c, d);
      }
    };
    
    maskInventories = function (e) {
      var row = $(e).closest('.inventoryheader');
      var inv = 0;
      if($(row).next().hasClass('inv1')) {
        inv = 1;
      }
      if($(row).find('.hideshow').html() == "[show]") {
        hideShowInventory($(row).find('.hideshow'));
      }
      var a = $(row).offset().top;
      var b = $(row).offset().left;
      var c = $(row).width();
      var d = ($(row).siblings('tr.inv'+inv).last().offset().top + $(row).siblings('.inv'+inv).last().height()) - a;
      if(a != undefined && b != undefined && c != undefined && d != undefined) {
        greyOutAround(a, b, c, d);
      }
    };
    
    maskUserVariables = function (e) {
      var row = $(e).closest('.mathheader');
      if($(row).find('.hideshow').html() == "[show]") {
        hideShowMath($(row).find('.hideshow'));
      }
      var a = $(row).offset().top;
      var b = $(row).offset().left;
      var c = $(row).width();
      var d = ($(row).siblings('tr.math').last().offset().top + $(row).siblings('.math').last().height()) - a;
      if(a != undefined && b != undefined && c != undefined && d != undefined) {
        greyOutAround(a, b, c, d);
      }
    };
    
    maskUserCode = function (e) {
      var row = $(e).closest('.codeheader');
      if($(row).find('.hideshow').html() == "[show]") {
        hideShowCode($(row).find('.hideshow'));
      }
      var a = $(row).offset().top;
      var b = $(row).offset().left;
      var c = $(row).width();
      var d = ($(row).siblings('tr.code').last().offset().top + $(row).siblings('.code').last().height()) - a;
      if(a != undefined && b != undefined && c != undefined && d != undefined) {
        greyOutAround(a, b, c, d);
      }
    };
    
    // a - distance to top
    // b - distance from left
    // c - width
    // d - height
    greyOutAround = function (a, b, c, d) {
      var bigNumber = 10000;
      $('.masktop').css('height', a+bigNumber);
      $('.masktop').css('top', -bigNumber);
      
      $('.maskbottom').css('top', a + d);
      $('.maskbottom').css('bottom', 0);
      $('.maskleft').css('width', b);
      $('.maskleft').css('left', 0);
      $('.maskleft').css('top', a);
      $('.maskleft').css('height', d);
      
      $('.maskright').css('left', b + c);
      $('.maskright').css('right', 0);
      $('.maskright').css('top', a);
      $('.maskright').css('height', d);

      $('.mask').fadeIn(200);
      $('body').css('overflow', 'hidden');
    };
    
    // initial stuff
    $('.version').html("version "+versionNumber);
    $('#generate').hide();
    $('#copied').hide();
    $('#saved').hide();
    loadCookieScripts();
    $('.manage').hide();
    $('.importdrawer').hide();
  });
  
  // hey kid
  // im a computer
  // stop all the downloading