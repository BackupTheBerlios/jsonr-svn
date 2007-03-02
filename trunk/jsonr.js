/* Copyright (C) 2007 Real Software nv/sa

This library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA */

var JSONR = Class.create();

JSONR.prototype.initialize = function (_this, model, instance) {
	this._this = _this;
	this.jsonr= model;
	this.json = instance;
	this.errors = false;
}
JSONR.prototype.set = function (ns, v) {
	eval(["this.json", ns, " = v;"].join('')); return v;
}
JSONR.prototype.test = function (el, v) {
	var s = v.toString();
	if (el.value != s) {
		el.value = s; this.error(el, v); 
	} else
		setTimeout(this._this + '.onValid(' + el.id.toJSONString() + ')', 1);
}
JSONR.prototype.error = function (el, v) {
	setTimeout(this._this + '.onInvalid(' + 
		el.id.toJSONString() + ', ' + v.toJSONString() + 
		')', 1);
}
JSONR.prototype.Null = function (el) {
	var v; try {v = el.value.parseJSON();} catch (e) {v = el.value;}
	this.set(el.id, v);
}
JSONR.prototype.Boolean = function (el) {
	this.set(el.id, el.checked);
}
JSONR.prototype.String = function (el) {
	this.set(el.id, el.value);
}
JSONR.prototype.Number = function (el) {
	var v = parseFloat(el.value); this.set(el.id, v); this.test(el, v);
}
JSONR.prototype.Regular = function (el, regular) {
	if (el.value.match(regular) == null) 
		this.error(el, el.value);
	else {
		this.set(el.id, el.value);
		setTimeout(this._this + '.onValid(' + el.id.toJSONString() + ')', 1);
	}
}
JSONR.prototype.Decimal = function (el, pow) {
	var v = Math.round((parseFloat(el.value)*pow))/pow;
	this.set(el.id, v); this.test(el, v);
}
 
JSONR.prototype.IntegerRange = function (el, lower, higher) {
	var v = parseInt(el.value);
	if (v < lower) v = lower; else if (v > higher) v = higher;
	this.set(el.id, v); this.test(el, v);
}
JSONR.prototype.FloatRange = function (el, lower, higher) {
	var v = parseFloat(el.value);
	if (v < lower) v = lower;else if (v > higher) v = higher;
	this.set(el.id, v);this.test(el, v);
}
JSONR.prototype.DecimalRange = function (el, lower, higher, pow) {
	var v = Math.round((parseFloat(el.value)*pow))/pow;
	if (v < lower) v = lower;else if (v > higher) v = higher;
	this.set(el.id, v);this.test(el, v);
}
JSONR.prototype.htmlNull = function (sb, ns, nm, ob) {
	sb.push('<textarea class="jsonrNull" name="');
	sb.push(nm);
	sb.push('" id="');
	sb.push(ns.replace('"', '&quot;'));
	sb.push('" onblur="{');
	sb.push(this._this);
	if (ob == null)
		sb.push('.Null(this);}">null</textarea>');
	else {
		sb.push('.Null(this);}">');
		sb.push(ob.toString());
		sb.push("</textarea>");
	}
	return sb;
} 
JSONR.prototype.htmlBoolean = function (sb, ns, nm, ob) {
	sb.push('<input class="jsonrBoolean" name="');
	sb.push(nm);
	sb.push('" id="');
	sb.push(ns.replace('"', '&quot;'));
	sb.push('" onclick="{');
	sb.push(this._this);
	if (ob) {
		sb.push('.Boolean(this);}" type="checkbox" checked />');
		this.set(ns, true);
	} else {
		sb.push('.Boolean(this);}" type="checkbox" />');
		this.set(ns, false);
	}
	return sb;
}
JSONR.prototype.htmlString = function (sb, ns, nm, ob) {
	sb.push('<textarea class="jsonrString" name="');
	sb.push(nm);
	sb.push('" id="');
	sb.push(ns.replace('"', '&quot;'));
	sb.push('" onblur="{');
	sb.push(this._this);
	if (ob == null) {
		sb.push('.String(this);}"></textarea>');
		this.set(ns, "");
	} else {
		sb.push('.String(this);}">');
		sb.push(ob);
		sb.push("</textarea>");
	} 
	return sb;
}
JSONR.prototype.htmlNumber = function (sb, ns, nm, ob, pt) {
	var decimals = 0, s = pt.toString();
	sb.push('<input type="text"');
	if (ob == null) {
		sb.push(' value="0" name="'); 
		this.set(ns, 0);
	} else {
		sb.push(' value="');
		sb.push(ob.toString());
		sb.push('" name="');
	}
	sb.push(nm);
	sb.push('" id="');
	sb.push(ns.replace('"', '&quot;'));
	if (pt == 0) {
		sb.push('" onblur="{');
		sb.push(this._this);
		sb.push(".Number(this));}\" class='jsonrNumber' />");
	} else {
		sb.push('" size="');
		sb.push(pt.toString().length);
		sb.push('" onblur="{');
		sb.push(this._this);
		if (parseInt(s)==pt) {
			sb.push(".IntegerRange(this");
		} else {
			sb.push(".DecimalRange(this");
			decimals = s.split('.')[1].length;
		}
		if (pt < 0) {
			sb.push(", ");
			sb.push(pt);
			sb.push(", ");
			sb.push(-pt);
		} else {
			sb.push(", 0, ");
			sb.push(pt);
		}
		if (decimals > 0) {
			for (var i=1, pow=10; i<decimals; i++) pow = pow*10;
			sb.push(", ");
			sb.push(pow);
		}
		sb.push(');}" class="jsonrNumber" />');
	}
	return sb;
}
JSONR.prototype.htmlRegular = function (sb, ns, nm, ob, pt) {
	sb.push('<input name="');
	sb.push(nm);
	sb.push('" id="');
	sb.push(ns.replace('"', '&quot;'));
	sb.push('" onblur="{');
	sb.push(this._this);
	sb.push(".Regular(this, /");
	sb.push(pt);
	if (ob == null) {
		sb.push('/);}" type="text"');
		ob = this.set(ns, "");
	} else {
		sb.push('/);}" type="text" value="');
		sb.push(ob);
		sb.push('"');
	} 
	if (ob.match(new RegExp(pt))==null) {
		sb.push('class="jsonrRegular jsonrError" />');
		this.errors += 1;
	} else
		sb.push('class="jsonrRegular" />');
	return sb;
}
JSONR.prototype.htmlCollection = function (sb, md, ns, nm, ob) {
	sb.push('<div class="jsonrCollection" id="');
	sb.push(ns.replace('"', '&quot;'));
	sb.push('">');
	if (ob != null) for (var i=0, L=ob.length; i<L; i++) 
		this.htmlValue(sb, md + "[0]", ns + "[" + i + "]", nm);
	sb.push('<input class="jsonrAdd" onclick="{');
	sb.push(this._this);
	sb.push(".htmlExtend(this, &quot;");
	sb.push(md);
	sb.push("&quot;, &quot;");
	sb.push(ns.replace('"', '\&quot;'));
	sb.push("&quot;, &quot;");
	sb.push(nm);
	sb.push("&quot;);}\" type='button' value='+' /></div>");
	return sb;
}
JSONR.prototype.htmlRelation = function (sb, md, ns, nm, ob, pt) {
	sb.push('<div class="jsonrRelation ');
	sb.push(nm);
	sb.push('" id="');
	sb.push(ns.replace('"', '&quot;'));
	sb.push('">');
	if (ob == null) ob = this.set(ns, new Array());
	for (var i=0, L=pt.length; i<L; i++) 
		this.htmlValue(sb, md+"["+i+"]", ns+"["+i+"]", nm+i.toString());
	sb.push("</div>");
	return sb;
}
JSONR.prototype.htmlDictionnary = function (sb, md, ns, k, v) {
	;
}
JSONR.prototype.htmlNamespace = function (sb, md, ns, nm, ob, keys) {
	if (ob == null) {
		sb.push("<input class='jsonrOpen' onclick=\"{this.parentNode.innerHTML=");
		sb.push(this._this);
		sb.push(".htmlOpen(new Array(), &quot;");
		sb.push(md);
		sb.push("&quot;, &quot;");
		sb.push(ns.replace('"', '\&quot;'));
		sb.push("&quot;).join('');}\" type='button' value='+' />");
	} else {
		sb.push('<table><tbody>');
		for (var i=0; i<keys.length; i++) {
			k = keys[i];
			sb.push("<tr><td class='jsonrName'>");
			sb.push(k.escapeHTML());
			sb.push("</td><td class='jsonrValue'>");
			this.htmlValue(sb, md + "['" + k + "']", ns + "['" + k + "']", k);
			sb.push("</td></tr>");
		}
		sb.push("</tbody></table>");
	}
    return sb;
}
JSONR.prototype.htmlExtend = function (el, md, ns, nm) {
	var ob = eval("this.json" + ns);
	if (ob == null)
		ob = this.set(ns, new Array());
	var i = ob.length;
	var id = ns+"["+i+"]"
	new Insertion.Before(el, this.htmlValue(
		new Array(), md + "[0]", id, nm + i.toString()).join('')
		);
	var pt = eval("this.jsonr" + md + "[0]");
	if (typeof pt == "object" && ob != null) {
		if (pt.length == null) {
			for (var k in pt) if (!(typeof pt[k]=="function")) break;
			id += "['" + k + "']";
		} else
			id += "[0]";
	}
	setTimeout(
		'{el=$(' + id.toJSONString() + '); el.focus(); el.select();}', 10
		);
}
JSONR.prototype.htmlOpen = function (sb, md, ns, nm) {
	var pt = eval("this.jsonr" + md);
	var ob = eval("this.json" + ns);
	if (ob == null)
		ob = this.set(ns, new Object());
	var keys = new Array(), k;
	for (k in pt) if (!(typeof pt[k]=="function")) keys.push(k);
	this.htmlNamespace(sb, md, ns, nm, ob, keys)
	var id = (md + "['" + keys[0] + "']").toJSONString()
	setTimeout(
		'{el=$(' + id + '); el.focus(); el.select();}', 10
		);
    return sb;
}
JSONR.prototype.htmlExtensions = {
	"yyyy-MM-ddTHH:mm:ss": function (sb, ns, nm, ob, pt) {
		; // TODO: implement a DateTime pattern
	}
}
JSONR.prototype.htmlValue = function (sb, md, ns, nm) {
	var pt = eval("this.jsonr" + md);
	var ob = eval("this.json" + ns);
	switch (typeof pt) {
	case "boolean": 
		return this.htmlBoolean(sb, ns, nm, (ob==true||(pt==true&&ob==null)));
	case "string": ;
		if (pt=="")
			return this.htmlString(sb, ns, nm, ob);
		else {
			var htmlExtension = this.htmlExtensions[pt];
			if (htmlExtension==null)
				return this.htmlRegular(sb, ns, nm, ob, pt);
			else
				return htmlExtension(sb, ns, nm, ob, pt);
		}
	case "number":  return this.htmlNumber(sb, ns, nm, ob, pt);
	case "object":
		if (pt==null) 
			return this.htmlNull(sb, ns, nm, ob);
		var L=pt.length;
		if (L==null) {
			sb.push('<div class="jsonrObject">');
			var keys = new Array(), k;
			for (k in pt) if (!(typeof pt[k]=="function")) keys.push(k);
			if (keys.length == 0) {keys.push(null); pt[".+"] = null;}
			if (keys.length == 1) 
				return this.htmlDictionnary(sb, md, ns, keys[0], pt[keys[0]])
			else
				return this.htmlNamespace(sb, md, ns, nm, ob, keys);
			sb.push('</div>');
		} else if (L==1)
			return this.htmlCollection(sb, md, ns, nm, ob);
		else
			return this.htmlRelation(sb, md, ns, nm, ob, pt);
	}
}
JSONR.prototype.html = function () {
	var sb = new Array();
	this.htmlValue(sb, "", "", this._this);
	return sb.join('');
}
JSONR.prototype.onInvalid = function (id, v) {
	var el = $(id); 
	el.addClassName('jsonrError'); 
	if (!this.errors) {
		el.focus();
		el.select(); 
		this.errors = true;
	}
}
JSONR.prototype.onValid = function (id) {
	$(id).removeClassName('jsonrError');
	this.errors = false;
}

/* Synopsis
 * 
 * This is a proof-of-concept, an unstable and incomplete implementation, so
 * consider the API presented as temporary.
 * 
 * The demonstration found in jsonrTest.js and jsonr.html show a typical use 
 * of jsonr.js:
 * 
 *    // create a new instance of a JSONR controller with ...
 *    var jsonrController = new JSONR(
 *        "jsonrController", // ... the name of the controller, ...
 *        {"test": ".+$", "options": {"a": true, "b": false}} // the model ...
 *        {} // ... and the controlled instance
 *        );
 *    // generate the HTML view and assign it to the element with ID "view".
 *    $('view').innerHTML = jsonrController.html();
 * 
 * then, serialize the JSON before transmission over HTTP:
 * 
 *    new Ajax.Request('/some_url', {
 *        method: 'post',
 *        contentType: 'application/json',
 *        postBody: jsonrController.json.toJSONString(),
 *        onSuccess: function(transport){
 *            var response = transport.responseText || "no response text";
 *            alert("Success! \n\n" + response);
 *            },
 *        onFailure: function(){ alert('Something went wrong...') }
 *        });
 * 
 * 
 * Note about this implementation
 *
 * With a 2.4Ghz CPU and running inside Firefox it takes around 22 milliseconds 
 * to generate an HTML view and controller for a relatively complex object 
 * such as:
 * 
 * {
 *   "number range": 0,
 *   "any string": "",
 *   "regular string": "",
 *   "relation": [true, "", 0],
 *   "table": [[true, false, ""]], 
 *   "options": {"test": "", "again": false}, 
 *   "collection":[0,0,0,0]
 *   }
 *  
 * Adding ten rows in the "table" slows the process to 58 milliseconds and
 * further tests have shown that the algorithm scales up linearly with the
 * size of the objects.
 * 
 * So most JSONR modelised objects can be displayed in less than 0.1 seconds
 * on a middle-aged PC, at a speed unoticeable by users.
 * 
 */