var jsonrTest = new JSONR('jsonrTest');
jsonrTest.json = new Object();

function jsonrTestInterpret () {
	try {
		jsonrTest.jsonr = eval('('+$('jsonrModel').value+')');
		$('jsonrModelError').innerHTML = '';
	} catch (e) {
		$('jsonrModelError').innerHTML = e.toString().escapeHTML();
		return;
	}
	$('jsonrView').innerHTML = jsonrTest.html();
	$('jsonrModelTab').hide();
	$('jsonrViewTab').show();
}

function jsonrTestSerialize () {
	$('jsonrString').value = jsonrTest.json.toJSONString(true);
	$('jsonrViewTab').hide();
	$('jsonrObjectTab').show();
}

function jsonrTestModelize () {
	$('jsonrObjectTab').hide();
	$('jsonrViewTab').hide();
	$('jsonrModelTab').show();
}

function jsonrTestRefresh () {
	try {
		jsonrTest.json= eval('('+$('jsonrString').value+')');
		$('jsonrObjectError').innerHTML = '';
	} catch (e) {
		$('jsonrObjectError').innerHTML = e.toString().escapeHTML();
	}
	$('jsonrView').innerHTML = jsonrTest.html();
	$('jsonrObjectTab').hide();
	$('jsonrViewTab').show();
}