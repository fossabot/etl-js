const winston = require('winston');
const Fs = require('fs');
const util = require('util');
const Promises = require('./promises');

ModClass = function( pETL, pSettings ) {
	this.mSettings = pSettings || {};
	var that = this;
	if( pETL ) pETL.mod( 'image_charts', this, function( pSettings ) {
		that.mSettings = pSettings;
	});
}

var get_data_file_content = function( pParent, pKey, pDataFile, pCmdOptions, pExecutor ) {
	return new Promise(function( resolve, reject ) {
		winston.log('debug', '[%s] Getting data file content...', pParent);
		var oProcess = pExecutor.exec( 'cat ' + pDataFile, pCmdOptions, function( error, stdout, stderr ) {
			if ( error ) {
				reject( util.format.apply(null, [ 'Could not get data file content. Exit code %s: %s.', pKey, error.code, error] ));
			} else {
				winston.log('debug', '[%s] Done getting data file content for [%s].', pParent, pKey);
				resolve( stdout );
			}
		});
	});
}

var create_image_charts_url = function( pArgs ) {
	var oArgs = pArgs.join("&");
	return "https://image-charts.com/chart?" + oArgs;
}

ModClass.prototype._exec = function( pParent, pKey, pSpecs, pExecutor ) {
	return function( pPreviousResult ) {
		return new Promise( function( resolve, reject ) {
			var oResult = [];
			if ( pPreviousResult != null ) {
				if ( Array.isArray( pPreviousResult ) ) {
					oResult = pPreviousResult.slice();
				} else {
					oResult.push( pPreviousResult );
				}
			}
			try {
				winston.log('debug', '[%s] Creating image-charts [%s]...', pParent, pKey);
				var oChartArgs = [];
				for (var i in pSpecs) {
					switch (i) {
						case "chs":
							oChartArgs.push('chs=' + pSpecs[i]);
							break;
						case "cht":
							oChartArgs.push('cht=' + pSpecs[i]);
							break;
						case "chxt":
							oChartArgs.push('chxt=' + pSpecs[i]);
							break;
						case "chxs":
							oChartArgs.push('chxs=' + pSpecs[i]);
							break;
						default:
							//TODO
							break;
					}
				}
				var oChartDataFile = pSpecs['data'];
				
				var oCmdOptions = {};
				oCmdOptions['context'] = pKey;
				
				get_data_file_content( pParent, pKey, oChartDataFile, oCmdOptions, pExecutor ).then( function( data ) {
					var oArgs = data.split(/\r?\n/);
					if ( oArgs.length >= 3) {
						oChartArgs.push('chxl=0:|' + oArgs[0]);
						oChartArgs.push('chdl=' + oArgs[1]);
						oChartArgs.push('chd=a:' + oArgs[2]);
						var url = create_image_charts_url(oChartArgs);
						winston.log('info', '[%s] Url for [%s]:\n%s', pParent, pKey, url);
						oResult.push( url );
					} else {
						winston.log('warn', '[%s] Could not parse output: [%s]. Could not create chart url from it.', pParent, data);
					}
					resolve( oResult );
				}, function( error ) {
					console.log( error );
					reject( error );
				});
				
			} catch ( e ) {
				winston.log('error', '[%s] Unexpected error creating image-chart [%s].', pParent, pKey);
				reject( e );
			}
		});
	}
}

ModClass.prototype.handle = function( pParent, pConfig, pExecutor, pPreviousStepData ) {
	var that = this;
	return new Promise( function( resolve, reject ) {
		winston.log('debug', '[%s] Processing image-charts...', pParent);
		try {
			var oPromises = [];
			for (var i in pConfig) {
				oPromises.push( that._exec( pParent, i, pConfig[i], pExecutor ));
			}
			Promises.seq( oPromises, null ).then(function( pData ) {
				winston.log('debug', '[%s] Done processing image-charts.', pParent);
				resolve( pData );
			}, function( pError ) {
				winston.log('error', '[%s] Unexpected error running image-charts.', pParent, pError);
				reject( pError );
			});
		} catch (e) {
			winston.log('error', '[%s] Unexpected error processing image-charts.', pParent, e);
			reject( e );
		}
	});
}



exports = module.exports = ModClass;