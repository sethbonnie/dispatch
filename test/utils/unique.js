var assert  = require( 'assert' );
var unique  = require( '../../src/utils/unique' );

describe( 'unique( array )', function() {

  it( 'returns an equivalent array if the array contained no duplicates', function() {
    var arr = [1,2,3];

    assert.deepEqual( unique(arr), arr );
  });

  it( 'returns an array with duplicates removes', function() {
    var arr = [1,1,2,3,3,4,5,5];

    assert.deepEqual( unique( arr ), [1,2,3,4,5] );
  });

  it( 'removes duplicates of objects', function() {
    var obj1 = { foo: 1 };
    var obj2 = { foo: 2 };
    var obj3 = { foo: 3 };
    var obj4 = obj2;

    var arr = [obj1, obj2, obj3, obj4, obj1];

    assert.deepEqual( unique( arr ), [obj1,obj2,obj3] );
  });

});
