# Copyright (C) 2007 Laurent A.V. Szyster
# 
# This library is free software; you can redistribute it and/or modify
# it under the terms of version 2 of the GNU General Public License as
# published by the Free Software Foundation.
# 
#         http://www.gnu.org/copyleft/gpl.html
# 
# This library is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# 
# You should have received a copy of the GNU General Public License
# along with this library; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 

from decimal import Decimal


class Error (Exception): pass

def _null (instance): return instance

def compile (pattern, named):
        if pattern == None:
                return _null
        
        elif pattern in (True, False):
                return bool
        
        t = type (pattern)
        if t == unicode:
                if len (pattern) == 0:
                        return unicode
                
                try:
                        return named[pattern]
                
                except:
                        pattern = re.compile (pattern)
                        def _regular (instance):
                                if (pattern.match (
                                        unicode (instance)
                                        ) != None):
                                        return instance
                                
                                raise Error (
                                        '%r not a regular string' % instance
                                        )
                                        
                        return _regular
                
        elif t in (int, long):
                if pattern == 0:
                        return long
                
                elif pattern > 0:
                        def _integerPositive (instance): 
                                i = long (instance)
                                if 0 < i <= pattern:
                                        return i

                                raise Error ('overflow: %d' % i)
                                
                        return _integerPositive
                
                else:
                        def _integerAbsolute (instance):
                                i = long (instance)
                                if -pattern <= i <= pattern:
                                        return i

                                raise Error ('overflow: %d' % i)
                                
                        return _integerAbsolute
                
        elif t == float:
                if pattern == 0.0:
                        return float # zero-dot-zero is a float
                                        
                elif pattern > 0.0:
                        # force to use 0.5000001 for JSON
                        def _floatPositive (instance):
                                f = int (instance)
                                if 0.0 <= f <= pattern:
                                        return f

                                raise Error ('overflow: %f' % f)
                                
                        return _floatPositive
                
                else:
                        def _floatAbsolute (instance):
                                f = float (instance)
                                if -pattern <= f <= pattern:
                                        return f

                                raise Error ('overflow: %f' % f)
                                
                        return _floatAbsolute
                
        elif t == Decimal: 
                if pattern == 0:
                        def _decimal (instance):
                                return Decimal (
                                        str (instance)
                                        ).quantize (pattern)
                        
                        return _decimal
                        
                elif pattern > 0:
                        def _decimalPositive (instance):
                                d = Decimal (
                                        str (instance)
                                        ).quantize (pattern)
                                if 0 <= d < pattern:
                                        return d

                                raise Error ('overflow: %s' % d)
                                
                        return _decimalPositive
                
                else:
                        def _decimalAbsolute (instance):
                                d = Decimal (
                                        str (instance)
                                        ).quantize (pattern)
                                if -pattern < d < pattern:
                                        return d

                                raise Error ('overflow: %s' % d)
                                
                        return _decimalAbsolute
                
        elif t == list:
                if len (pattern) == 1:
                        t = compile (pattern[0], named)
                        def _collection (instance): 
                                return [t (i) for i in instance]
                        
                        return _collection
                
                elif len (pattern) > 1:
                        t = [compile (p, named) for p in pattern]
                        T = range (len (types))
                        def _relation (instance):
                                return [t[i] (instance[i]) for i in T]
                        
                        return _relation
                
                else:
                        return _null
                
        elif t == dict:
                items = pattern.items ()
                if len (items) == 1:
                        match = re.compile (items[0]).match
                        t = compile (items[1], named)
                        def _dictionary (instance):
                                return dict ((
                                        (k, t (v)) 
                                        for k, v in instance.items ()
                                        if (
                                                type (k) == unicode and 
                                                match (k) != None
                                                )
                                        ))
                        return _dictionary
                
                elif len (items) > 1:
                        ns = {}
                        for k, v in items:
                                named[k] = ns[k] = compile (v, named)
                        mandatory = set ((k for k, v in items if not (
                                v == u"" or type (v) in (list, dict)
                                )))
                        def _namespace (instance):
                                d = dict ((
                                        (k, ns[k] (v)) 
                                        for k, v in instance.items ()
                                        if (
                                                type (k) == unicode and 
                                                match (k) != None
                                                )
                                        ))
                                keys = set (instance.keys ())
                                if mandatory.issubset (keys):
                                        return d
                                
                                raise Error ("mandatory: " + ','.join (
                                        ns.difference (keys)
                                        ))
                        
                        return _namespace
                
                else:
                        return _null