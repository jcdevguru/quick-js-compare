# quick-js-compare
Compare two Javascript values and report differences

// diffObjs: return differences between JavaScript values
//
// Function:
//
//    Compare two JavaScript values, and return a two-element
//    array that contains a minimal representation of the difference
//    between the two.
//
//    Values may be scalar (e.g., string, integer, boolean) or objects,
//    including arrays.  When the two values match exactly, that is,
//    if the '===' operator between the two would return 'true', we return NULL.
//    
//    When the result contains an object or array, only data, not references,
//    are copied from the arguments.  This makes for a large size result
//    but one whose manipulation will not affect the original arguments.
//
// Args:
//    v1, v2: values to compare
//
// Specific behaviors:
//
//    *Return NULL if v1 === v2*
//
//    This happens when two scalar (non-object) values match, or when the same
//    object or array is passed in both arguments.
//    e.g.,
//        
//        var my_obj = { member1: 0, member1: 'dog' };
//        var my_array = [ 1, 'cat' ];
//        var my_int = 7;
//        var no_val = null;
//
//        diffObjs(my_int, my_int)        ==> NULL
//        diffObjs(1, 1)                  ==> NULL
//        diffObjs(my_obj, my_obj)        ==> NULL
//        diffObjs({x:1,y:2}, {x:1,y:2})  ==> NULL
//        diffObjs(my_array, my_array)    ==> NULL
//        diffObjs([1,'a'], [1,'1'])      ==> NULL
//        diffObjs(null, null)            ==> NULL
//        diffObjs(no_val, null)          ==> NULL
//
//    *Return copies of v1 and v2 on type mismatch*:
//
//    When type of v1 and v2 are different or one is an array and the other
//    is an object, the result array will contain exect copies of both
//    v1 and v2.
//
//    *Return minimal representation of differences among non-array objects*:
//
//    Otherwise, when two objects are passed in, element 0
//    in the result array contains the members and their values
//    that exist in v1 but not v2, or members that exist in both
//    v1 and v2 that have different values.  Element 1 contains
//    the same but with respect to v2, that is members and their
//    values that exist in v2 but not v1, or members that exist in
//    both v1 and v2 that have different values.
//    
//    Note: The members are represented in the result objects only when
//    they are specific to the object of the corresponding value argument
//    or when the members exist in both and have different values.  The
//    caller therefore can tell whether the object mismatch exists 
//    because of specificity of a member to one object vs. a mismatch
//    in values where one is null and the other is not.
//
//    Examples:
//        diffObjs({a:10, b:"dog"}, {a:1, b:"dog"}    ==> [ {a:10}, {a:1} ]
//        diffObjs({a:10},          {a:10, b:"dog"}   ==> [ {}, {b:"dog"} ]
//        diffObjs({a:10, c:null},  {a:10, b:"dog"}   ==> [ {c:null}, {b:"dog"} ]
//        diffObjs({a:[1], b:"cat"},{a:1, b:"dog"}    ==> [ {a:[1], b:"cat"}, {a:1, b:"dog"} ]
//        diffObjs(
//            {a:{ m1:"x", m2:"y"}, b:3 },
//            {a:{ m1:"x", m2:"z", m3:1 }, b:3 } )    ==> [ {a:{m2:"y"}}, {a:{m2:"z",m3:1}} ]
//
//    *Return copies of compared arrays when differing by position or value*
//
//    If the two arguments arrays, the results in elements 0 and 1
//    will contain results in array form that do not match with respect
//    to both value and order.  If two positionally corresponding
//    elements in the array arguments have identical value (e.g., two
//    scalars with matching values or two references to the same object), 
//    the corresponding values in the array will be null.  The
//    cardinality of the arrays within the result array will therefore
//    always match that of the corresponding arguments.
//
//    Examples:
//        diffObjs([1,2],        [1,2])   ==> [ [null,null], [null,null] ]
//        diffObjs([1,2],        [2,1])   ==> [ [1,2], [2,1] ]
//        diffObjs([1,2],        [1,2,3]) ==> [ [1,2,null], [2,1,3] ]
//        diffObjs([1,1,2,3],    [1,2,3]) ==> [ [null,1,2,3], [null,2,3] ]
//
