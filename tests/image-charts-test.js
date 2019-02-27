const assert = require('chai').assert
const TestedClass = require('../lib/image-charts');

describe('image-charts',function(){
	
	before(function(done) {
		done();
	});
	
	after(function(done) {
		done();
	});
	
	it('mod', function(done) {
		var ETLMock = { mod: function( pKey, pSource, pCallback ) {
			pCallback({"test":true});
		} };
		var oTested = new TestedClass( ETLMock );
		assert.deepEqual( oTested.mSettings, {"test":true} );
		done();
	});
	
	it('invalidData',function(done){
    	var ExecutorClass = function() {};
    	ExecutorClass.prototype.exec = function( pCmd, pCmdOpts, pCallback ) {
    		pCallback( null, "PRCP|SNOW", "");
    	}
    	var oExecutor = new ExecutorClass();
    	var oTested = new TestedClass();
    	
		var oConfig = {
				root: {
					"001_chart": {
						data: "test.csv",
				        chs: "700x200",
				        cht: "bvg",
				        chxt: "x,y",
				        chxs: "1N*s* inches,000000"
					}
				}
		}
		oTested.handle( 'root', oConfig['root'], oExecutor ).then(function( pData ) {
			done('Excepting error.');
		}, function( pError ) {
			done();
		})
	});
	
	it('error',function(done){
    	var ExecutorClass = function() {};
    	ExecutorClass.prototype.exec = function( pCmd, pCmdOpts, pCallback ) {
    		pCallback( new Error("error"), "", "some stderr stuff");
    	}
    	var oExecutor = new ExecutorClass();
    	var oTested = new TestedClass();
    	
		var oConfig = {
				root: {
					"001_chart": {
						data: "test.csv",
				        chs: "700x200",
				        cht: "bvg",
				        chxt: "x,y",
				        chxs: "1N*s* inches,000000"
					}
				}
		}
		oTested.handle( 'root', oConfig['root'], oExecutor ).then(function( pData ) {
			done('Excepting error.');
		}, function( pError ) {
			done();
		})
	});

	it('basic',function(done){
    	var ExecutorClass = function() {};
    	ExecutorClass.prototype.exec = function( pCmd, pCmdOpts, pCallback ) {
    		pCallback( null, "PRCP|SNOW\nUS1|US2\n1,1|2,2", "");
    	}
    	var oExecutor = new ExecutorClass();
    	var oTested = new TestedClass();
    	
		var oConfig = {
				root: {
					"001_chart": {
						data: "test.csv",
				        chs: "700x200",
				        cht: "bvg",
				        chxt: "x,y",
				        chxs: "1N*s* inches,000000"
					}
				}
		}
		oTested.handle( 'root', oConfig['root'], oExecutor ).then(function( pData ) {
			console.log("##### Result: ");
			console.dir( pData );
			if ( pData ) {
				//assert.isArray( pData );
				//assert.equal( 1, pData.length );
				assert.exists( pData );
				assert.exists( pData['image_charts' ] );
				assert.exists( pData['image_charts' ][ '001_chart' ] );
				
				var oUrl = pData['image_charts' ][ '001_chart' ]['result'];
				// https://image-charts.com/chart?chs=700x200&cht=bvg&chxt=x,y&chxs=1N*s* inches,000000&chxl=0:|PRCP|SNOW&chdl=US1|US2&chd=a:1,1|2,2
				assert.include(oUrl, "https://image-charts.com/chart");
				assert.include(oUrl, "chs=700x200");
				assert.include(oUrl, "cht=bvg");
				assert.include(oUrl, "chxt=x,y");
				assert.include(oUrl, "chxs=1N*s* inches,000000");
				assert.include(oUrl, "chxl=0:|PRCP|SNOW");
				assert.include(oUrl, "chdl=US1|US2&chd=a:1,1|2,2");
				done();
			} else {
				done('Bad data. Something went wrong.');
			}
		}, function( pError ) {
			console.log( pError );
			done( pError );
		})
	});
});
