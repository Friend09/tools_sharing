
var first = 1;
Event.observe( document, 'dom:loaded', FinishedLoading );

var MyUtils = {
  supershow: function(element, html){
    return $(element).removeClassName('hidden').show();
  }
};
Element.addMethods(MyUtils);

var gKMCurrentPage = "Welcome";
var gKMPageStack = [];
var gKMRecentMacros = [];
var gKMMacroTriggerCount;

var gKMWatchingMacrosID;
var gKMTestingTimeoutID;
var gKMTesting1aTimeoutID;
var gKMCheckMacroTimeoutID;
var gKMAccessibilityKeyID;

// DO NOT EDIT - SCRIPT GENERATED - START

function KMPOSTCurrentPageChanged( v ) {
	window.webkit.messageHandlers.jsHandler.postMessage( ["CurrentPageChanged", v] );
}

function KMPOSTNoteAutoOpenChanged( v ) {
	window.webkit.messageHandlers.jsHandler.postMessage( ["NoteAutoOpenChanged", v] );
}

function KMPOSTStartTestingExpected() {
	window.webkit.messageHandlers.jsHandler.postMessage( ["StartTestingExpected"] );
}

function KMPOSTStopTestingExpected() {
	window.webkit.messageHandlers.jsHandler.postMessage( ["StopTestingExpected"] );
}

function KMPOSTStartWatchingMacros() {
	window.webkit.messageHandlers.jsHandler.postMessage( ["StartWatchingMacros"] );
}

function KMPOSTStopWatchingMacros() {
	window.webkit.messageHandlers.jsHandler.postMessage( ["StopWatchingMacros"] );
}

function KMPOSTStartSetMacros() {
	window.webkit.messageHandlers.jsHandler.postMessage( ["StartSetMacros"] );
}

function KMPOSTStartCheckingMacro( v ) {
	window.webkit.messageHandlers.jsHandler.postMessage( ["StartCheckingMacro", v] );
}

function KMPOSTStopCheckingMacro() {
	window.webkit.messageHandlers.jsHandler.postMessage( ["StopCheckingMacro"] );
}

function KMPOSTPerformTutorial() {
	window.webkit.messageHandlers.jsHandler.postMessage( ["PerformTutorial"] );
}

function KMPOSTPerformQuitEngine() {
	window.webkit.messageHandlers.jsHandler.postMessage( ["PerformQuitEngine"] );
}

function KMPOSTPerformLaunchEngine() {
	window.webkit.messageHandlers.jsHandler.postMessage( ["PerformLaunchEngine"] );
}

function KMPOSTEditMacro( v ) {
	window.webkit.messageHandlers.jsHandler.postMessage( ["EditMacro", v] );
}

function KMPOSTLinkThru( v ) {
	window.webkit.messageHandlers.jsHandler.postMessage( ["LinkThru", v] );
}

// DO NOT EDIT - SCRIPT GENERATED - END

function FinishedLoading() {
 	document.body.className = window.KeyboardMaestro.AppearanceClassName;

	if ( first ) {
		first = 0;

		var ip = window.KeyboardMaestro.InitalPage;
		var ips = ip.split( ":" );
		for (var i = 0; i < ips.length; i++) {
			SwitchTo( ips[i] );
		}

		$('autoopen').checked = window.KeyboardMaestro.AutoOpenWelcome;
	}
}

// MARK: Body

function SetAppearance( arg ) // FROM KM
{
	document.body.className = arg;
}

// MARK: Page Switching

function JustSwitchTo( arg )
{
	$(gKMCurrentPage).hide();
	if ( arg == "Welcome" ) {
		$('SideSupport').hide();
		$('SideAssistance').supershow();
	} else if ( arg == "Assistance" ) {
		$('SideAssistance').hide();
		$('SideSupport').supershow();
	}
	$(arg).supershow();
}

function FinishSwitchTo( arg )
{
	if ( gKMCurrentPage == "Expected" ) {
		StopTestingExpected();
	}
	if ( gKMCurrentPage == "Unexpected" ) {
		StopWatchingMacros();
	}
	if ( gKMCurrentPage == "Expected1a" ) {
		StopExpected1a();
	}
	if ( gKMCurrentPage == "Expected2" ) {
		StopExpected2();
	}
	if ( gKMCurrentPage == "Expected3" ) {
		StopExpected3();
	}
	gKMCurrentPage = arg;
	KMPOSTCurrentPageChanged( gKMCurrentPage );
	if ( gKMCurrentPage == "Welcome" ) {
		window.document.title = "Welcome to Keyboard Maestro"
	}
	if ( gKMCurrentPage == "Assistance" ) {
		window.document.title = "Interactive Help"
	}
	if ( gKMCurrentPage == "Expected" ) {
		StartTestingExpected();
	}
	if ( gKMCurrentPage == "Unexpected" ) {
		StartWatchingMacros();
	}
	if ( gKMCurrentPage == "Expected1a" ) {
		StartExpected1a();
	}
	if ( gKMCurrentPage == "Expected2" ) {
		StartExpected2();
	}
	if ( gKMCurrentPage == "Expected3" ) {
		StartExpected3();
	}
}

function SwitchTo( arg ) // FROM KM
{
	JustSwitchTo( arg );
	if ( arg == "Welcome" ) {
		gKMPageStack = [];
	} else if ( arg == "Assistance" ) {
		gKMPageStack = ["Welcome"];
	} else {
		gKMPageStack.push( gKMCurrentPage );
	}
	FinishSwitchTo( arg );
}

function SwitchBack()
{
	var n = gKMPageStack.pop();
	if ( n == "Expected1a" ) {
		n = gKMPageStack.pop();
	}
	JustSwitchTo( n );
	FinishSwitchTo( n );
}

// MARK: Unexpected

function StartWatchingMacros()
{
	gKMRecentMacros = [];
	UpdateMacroDisplay();
	KMPOSTStartWatchingMacros();
}

function StopWatchingMacros()
{
	KMPOSTStopWatchingMacros();
}

function MacroTriggered( uid, name ) // FROM KM
{
	gKMRecentMacros.push( [uid, name] );
	if ( gKMRecentMacros.length > 3 ) {
		gKMRecentMacros.shift();
	}
	UpdateMacroDisplay();
}

function UpdateMacroDisplay() {
	if ( gKMRecentMacros.length == 0 ) {
		$("Macros0").show();
	} else {
		$("Macros0").hide();
	}
	if ( gKMRecentMacros.length >= 1 ) {
		UpdateMacroDisplayFor( "Macros1", gKMRecentMacros[0][0], gKMRecentMacros[0][1] );
	} else {
		$("Macros1").hide();
	}
	if ( gKMRecentMacros.length >= 2 ) {
		UpdateMacroDisplayFor( "Macros2", gKMRecentMacros[1][0], gKMRecentMacros[1][1] );
	} else {
		$("Macros2").hide();
	}
	if ( gKMRecentMacros.length >= 3 ) {
		UpdateMacroDisplayFor( "Macros3", gKMRecentMacros[2][0], gKMRecentMacros[2][1] );
	} else {
		$("Macros3").hide();
	}
}

function UpdateMacroDisplayFor( id, uid, name )
{
	$(id+"Link").innerHTML = name;
	$(id+"Link").onclick = function() { 
		EditMacro( uid )
	}
	$(id).show();
}

// MARK: Expected

function StartTestingExpected()
{
 	$("CheckEngine").className = "checking";
 	$("CheckEngineLogin").className = "checking";
 	$("ChecCommunicate").className = "checking";
 	$("CheckTranslocation").className = "checking";
 	$("CheckSecureInput").className = "checking";
 	$("CheckAccessibility").className = "checking";
 	$("CheckChecking").className = "checking";
	KMPOSTStartTestingExpected();
}

function StopTestingExpected()
{
	KMPOSTStopTestingExpected();
}

function CheckEngineIsRunning( good ) // FROM KM
{
	$("CheckEngine").className = good ? "good" : "bad";
	CheckContinue();
}

function CheckEngineIsLaunchedAtLogin( good ) // FROM KM
{
	$("CheckEngineLogin").className = good ? "good" : "bad";
}

function CheckEngineCanCommunicate( good ) // FROM KM
{
	$("ChecCommunicate").className = good ? "good" : "bad";
	CheckContinue();
}

function CheckTranslocateOK( good ) // FROM KM
{
	$("CheckTranslocation").className = good ? "good" : "bad";
	CheckContinue();
}

function CheckSecureInputOK( good ) // FROM KM
{
	$("CheckSecureInput").className = good ? "good" : "bad";
	CheckContinue();
}

function CheckAccessibilityOK( good ) // FROM KM
{
	$("CheckAccessibility").className = good ? "good" : "bad";
	CheckContinue();
}

function CheckContinue()
{
	var ids = ["CheckEngine","ChecCommunicate","CheckTranslocation","CheckSecureInput","CheckAccessibility"];
	var checkings = 0;
	var goods = 0;
	var bads = 0;
	for ( var i = 0; i < ids.length; i++ ) {
		var className = $(ids[i]).className;
		if ( className == "checking" ) {
			checkings++;
		} else if ( className == "good" ) {
			goods++;
		} else if ( className == "bad" ) {
			bads++;
		}
	}
	if ( checkings > 0 ) {
		$("CheckChecking").className = "checking";
	} else if ( bads > 0 ) {
		$("CheckChecking").className = "bad";
	} else {
		$("CheckChecking").className = "good";
	}
}

function RetryCheck()
{
	StartTestingExpected();
}

// MARK: Expected1a

function SwitchToExpected1aOr2()
{
	if ( window.KeyboardMaestro.NeedAccessibilitCheck ) {
		SwitchTo( 'Expected1a' );
	} else {
		SwitchTo( 'Expected2' );
	}
}

// function SetupWindowForCheckAccessibilityA()
// {
// 	$("CheckCheckingA").className = "checking";
// 	$("CheckAccessibilityA").className = "checking";
//   	gKMAccessibilityKeyID = window.setTimeout(function() { 
//  		$("CheckAccessibilityA").className = "bad";
// 		$("CheckCheckingA").className = "bad";
//  	},6000);
// }

function StartExpected1a()
{
// 	window.KeyboardMaestro.StartDetectingKeys();
// 	SetupWindowForCheckAccessibilityA();
	$("CheckCheckingA").className = "good";
}

function RetryCheckA()
{
// 	SetupWindowForCheckAccessibilityA();
}

function StopExpected1a()
{
// 	window.clearTimeout( gKMAccessibilityKeyID );
// 	gKMAccessibilityKeyID = undefined;
// 	window.KeyboardMaestro.StopDetectingKeys();
}

// MARK: Expected2

function SetMacros( uid, macros ) // FROM KM
{
	var ms = macros;
	var s = uid;
	var r = "";
	for (var i = 0; i < ms.length; i++) {
		var mg = ms[i];
		var mgname = mg[0];
		var mgm = mg[1];
		if ( mgm.length > 0 ) {
			r = r + "<optgroup label='" + mgname + "'>";
			for ( var j = 0; j < mgm.length; j++ ) {
				var m = mgm[j];
				var uid = m[0];
				var name = m[1];
				if ( !s ) {
					s = uid;
				}
				r = r + "<option value='" + uid + "'";
				if ( s == uid ) {
					r = r + " selected='selected'";
				}
				r = r + ">" + name + "</option>";
			}
			r = r + "</optgroup>";
		}
	}
	$("MacroSelection").innerHTML = r;
	MacroSelectionChanged();
}

function StartExpected2()
{
	KMPOSTStartSetMacros();
}

function MacroSelectionChanged()
{
	KMPOSTStopCheckingMacro();
 	$("MacroGroupEnabled").className = "checking";
 	$("MacroGroupActive").className = "checking";
 	$("MacroEnabled").className = "checking";
 	$("MacroHasTriggers").className = "checking";
 	$("MacroHasActions").className = "checking";
 	$("MacroHasTriggered").className = "checking";
	gKMMacroTriggerCount = 0;
	var select = $('MacroSelection');
	KMPOSTStartCheckingMacro( select.options[select.selectedIndex].value );
}

function MacroGroupEnabled( good ) // FROM KM
{
	$("MacroGroupEnabled").className = good ? "good" : "bad";
}

function MacroGroupActive( good ) // FROM KM
{
	$("MacroGroupActive").className = good ? "good" : "bad";
}

function MacroEnabled( good ) // FROM KM
{
	$("MacroEnabled").className = good ? "good" : "bad";
}

function MacroHasTriggers( good ) // FROM KM
{
	$("MacroHasTriggers").className = good ? "good" : "bad";
}

function MacroHasActions() // FROM KM
{
	$("MacroHasActions").className = "good";
}

function MacroHasNoActions() // FROM KM
{
	$("MacroHasActions").className = "bad";
}

function MacroHasNoEnabledActions() // FROM KM
{
	$("MacroHasActions").className = "bad2";
}

function CheckMacroTriggered() // FROM KM
{
	gKMMacroTriggerCount++;
	if ( gKMMacroTriggerCount == 1 ) {
		$('TriggerCount2').innerHTML = "once";
		$('TriggerCount3').innerHTML = "once";
	} else {
		$('TriggerCount2').innerHTML = "" + gKMMacroTriggerCount + " times";
		$('TriggerCount3').innerHTML = "" + gKMMacroTriggerCount + " times";
	}
	$("MacroHasTriggered").className = "good";
	if ( gKMCurrentPage == "Expected2" ) {
		SwitchTo( "Expected3" );
	}
}

function StopExpected2()
{
	KMPOSTStopCheckingMacro();
}

// MARK: Expected3

function StartExpected3()
{
	var select = $('MacroSelection');
	KMPOSTStartCheckingMacro( select.options[select.selectedIndex].value );
	$('TriggerMacroName').innerHTML = "" + select.options[select.selectedIndex].innerHTML + "";
	$('TriggerMacroName2').innerHTML = "" + select.options[select.selectedIndex].innerHTML + "";
}

function StopExpected3()
{
	KMPOSTStopCheckingMacro();
}

function EditTriggerMacro()
{
	var select = $('MacroSelection');
	EditMacro( select.options[select.selectedIndex].value );
}

// MARK: Call Keyboard Maestro

function PerformTutorial()
{
	KMPOSTPerformTutorial();
}

function PerformQuitEngine()
{
	KMPOSTPerformQuitEngine();
}

function PerformLaunchEngine()
{
	KMPOSTPerformLaunchEngine();
}

function LinkThru( arg )
{
	KMPOSTLinkThru( arg );
}

function PerformAction( arg )
{
	KMPOSTPerformAction( arg );
}

function EditMacro( arg )
{
	KMPOSTEditMacro( arg );
}

