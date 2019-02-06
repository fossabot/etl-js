const winston = require('winston');
const Fs = require('fs');
const Promise = require("promised-io/promise").Promise;
const PromiseSeq = require("promised-io/promise").seq;

ModClass = function( pSettings ) {
	this.mSettings = pSettings || {};
}

ModClass.prototype._apply_settings = function( pParent, pKey, pConfig ) {
	//console.log('###### Before applying settings...');
	//console.dir( pConfig );
	
	var apply_settings = function( pConfig, pSettings ) {
		for (var i in pSettings) {
			if ( pConfig[i] == null ) pConfig[i] = pSettings[i];
		}
	}
	if ( this.mSettings[ pKey ] ) apply_settings( pConfig, this.mSettings[ pKey ] );
	else if ( this.mSettings[ pParent ] ) apply_settings( pConfig, this.mSettings[ pParent ] );
	else if ( this.mSettings[ '*' ] ) apply_settings( pConfig, this.mSettings[ '*' ] );
	
	//console.log('###### AFTER applying settings...');
	//console.dir( pConfig );
	
}

ModClass.prototype._read_options = function( pParent, pKey, pConfig ) {
	var oOptions = {
		bind_address: null,
		columns: null,
		compress: null,
		debug: null,
		debug_check: null,
		debug_info: null,
		default_auth: null,
		default_character_set: null,
		defaults_extra_file: null,
		defaults_file: null,
		defaults_group_suffix: null,
		delete: null,
		enable_cleartext_plugin: null,
		fields_enclosed_by: null,
		fields_escaped_by: null,
		fields_optionally_enclosed_by: null,
		fields_terminated_by: null,
		force: null,
		get_server_public_key: null,
		host: null,
		ignore: null,
		ignore_lines: null,
		lines_terminated_by: null,
		local: true,
		lock_tables: null,
		login_path: null,
		low_priority: null,
		no_defaults: null,
		password: null,
		pipe: null,
		plugin_dir: null,
		port: null,
		protocol: null,
		replace: null,
		secure_auth: null,
		server_public_key_path: null,
		shared_memory_base_name: null,
		silent: null,
		socket: null,
		ssl_ca: null,
		ssl_capath: null,
		ssl_cert: null,
		ssl_cipher: null,
		ssl_crl: null,
		ssl_crlpath: null,
		ssl_fips_mode: null,
		ssl_key: null,
		ssl_mode: null,
		tls_cipheruites: null,
		tls_version: null,
		use_threads: null,
		user: null
	}
	
	// WARNING: defaults will be affected here, don't make it a global thing, or change logic here, by first copying defaults into empty object.
	var oConfig = oOptions;
	for (var i in pConfig) {
		oConfig[ i.toLowerCase() ] = pConfig[i];
	}
	
	this._apply_settings( pParent, pKey, oConfig);
	
	return oConfig;
}


ModClass.prototype._wrap_run = function( pParent, pKey, pConfig, pExecutor ) {
	var that = this;
	return function() { 
		winston.log('debug', '[%s] Executing mysqlimport...', pParent );
		try {
			return that._run( pParent, pKey, pConfig, pExecutor );
		} catch (e) {
			winston.log('error', '[%s] Error executing mysqlimport.', pParent );
		} finally {
			winston.log('debug', '[%s] Done executing mysqlimport.', pParent );
		}
	};
}

ModClass.prototype._run = function( pParent, pKey, pConfig, pExecutor ) {
	var oPromise = new Promise();
	var enclose = function( pValue ) {
		if ( pValue.indexOf('"') >= 0) {
			return "'" + pValue + "'";
		} else if ( pValue.indexOf("'") >= 0 ) {
			return '"' + pValue + '"';
		}
		return '"' + pValue + '"';
	}
	try {
		var oCmdArgs = [];
		for ( var i in pConfig ) {
			if ( pConfig[i] == null ) continue;
			switch (i) {
				case "bind_address":
				    oCmdArgs.push("--bind-address=" + pConfig[i]);
				    break;
				case "columns":
				    oCmdArgs.push("--columns=" + pConfig[i]);
				    break;
				case "compress":
				    if ( pConfig[i] ) oCmdArgs.push("--compress");
				    break;
				case "debug":
				    oCmdArgs.push("--debug=" + pConfig[i]);
				    break;
				case "debug_check":
				    if ( pConfig[i] ) oCmdArgs.push("--debug-check");
				    break;
				case "debug_info":
					if ( pConfig[i] ) oCmdArgs.push("--debug-info");
				    break;
				case "default_auth":
				    oCmdArgs.push("--default-auth=" + pConfig[i]);
				    break;
				case "default_character_set":
				    oCmdArgs.push("--default-character-set=" + pConfig[i]);
				    break;
				case "defaults_extra_file":
				    oCmdArgs.push("--defaults-extra-file=" + pConfig[i]);
				    break;
				case "defaults_file":
				    oCmdArgs.push("--defaults-file=" + pConfig[i]);
				    break;
				case "defaults_group_suffix":
				    oCmdArgs.push("--defaults-group-suffix=" + pConfig[i]);
				    break;
				case "delete":
					if ( pConfig[i] ) oCmdArgs.push("--delete");
				    break;
				case "enable_cleartext_plugin":
					if ( pConfig[i] ) oCmdArgs.push("--enable-cleartext-plugin");
				    break;
				case "fields_enclosed_by":
				    oCmdArgs.push("--fields-enclosed-by=" + enclose( pConfig[i] ));
				    break;
				case "fields_escaped_by":
				    oCmdArgs.push("--fields-escaped-by=" + enclose( pConfig[i] ));
				    break;
				case "fields_optionally_enclosed_by":
				    oCmdArgs.push("--fields-optionally-enclosed-by=" + enclose( pConfig[i] ));
				    break;
				case "fields_terminated_by":
				    oCmdArgs.push("--fields-terminated_by=" + enclose( pConfig[i] ));
				    break;
				case "force":
					if ( pConfig[i] ) oCmdArgs.push("--force");
				    break;
				case "get_server_public_key":
					if ( pConfig[i] ) oCmdArgs.push("--get-server-public-key");
				    break;
				case "host":
				    oCmdArgs.push("--host=" + pConfig[i]);
				    break;
				case "ignore":
					if ( pConfig[i] ) oCmdArgs.push("--ignore");
				    break;
				case "ignore_lines":
				    oCmdArgs.push("--ignore-lines=" + pConfig[i]);
				    break;
				case "lines_terminated_by":
				    oCmdArgs.push("--lines-terminated-by=" + enclose( pConfig[i] ));
				    break;
				case "local":
					if ( pConfig[i] ) oCmdArgs.push("--local");
				    break;
				case "lock_tables":
					if ( pConfig[i] ) oCmdArgs.push("--lock-tables");
				    break;
				case "login_path":
				    oCmdArgs.push("--login-path=" + pConfig[i]);
				    break;
				case "low_priority":
					if ( pConfig[i] ) oCmdArgs.push("--low-priority");
				    break;
				case "no_defaults":
					if ( pConfig[i] ) oCmdArgs.push("--no-defaults");
				    break;
				case "password":
				    oCmdArgs.push("--password=" + pConfig[i]);
				    break;
				case "pipe":
					if ( pConfig[i] ) oCmdArgs.push("--pipe");
				    break;
				case "plugin_dir":
				    oCmdArgs.push("--plugin-dir=" + pConfig[i]);
				    break;
				case "port":
				    oCmdArgs.push("--port=" + pConfig[i]);
				    break;
				case "protocol":
				    oCmdArgs.push("--protocol=" + pConfig[i]);
				    break;
				case "replace":
					if ( pConfig[i] ) oCmdArgs.push("--replace");
				    break;
				case "secure_auth":
					if ( pConfig[i] ) oCmdArgs.push("--secure-auth");
				    break;
				case "server_public_key_path":
				    oCmdArgs.push("--server-public-key-path=" + pConfig[i]);
				    break;
				case "shared_memory_base_name":
				    oCmdArgs.push("--shared-memory-base-name=" + pConfig[i]);
				    break;
				case "silent":
					if ( pConfig[i] ) oCmdArgs.push("--silent");
				    break;
				case "socket":
				    oCmdArgs.push("--socket=" + pConfig[i]);
				    break;
				case "ssl_ca":
				    oCmdArgs.push("--ssl-ca=" + pConfig[i]);
				    break;
				case "ssl_capath":
				    oCmdArgs.push("--ssl-capath=" + pConfig[i]);
				    break;
				case "ssl_cert":
				    oCmdArgs.push("--ssl-cert=" + pConfig[i]);
				    break;
				case "ssl_cipher":
				    oCmdArgs.push("--ssl-cipher=" + pConfig[i]);
				    break;
				case "ssl_crl":
				    oCmdArgs.push("--ssl-crl=" + pConfig[i]);
				    break;
				case "ssl_crlpath":
				    oCmdArgs.push("--ssl-crlpath=" + pConfig[i]);
				    break;
				case "ssl_fips_mode":
				    oCmdArgs.push("--ssl-fips_mode=" + pConfig[i]);
				    break;
				case "ssl_key":
				    oCmdArgs.push("--ssl-key=" + pConfig[i]);
				    break;
				case "ssl_mode":
				    oCmdArgs.push("--ssl-mode=" + pConfig[i]);
				    break;
				case "tls_cipheruites":
				    oCmdArgs.push("--tls-cipheruites=" + pConfig[i]);
				    break;
				case "tls_version":
				    oCmdArgs.push("--tls-version=" + pConfig[i]);
				    break;
				case "use_threads":
				    oCmdArgs.push("--use-threads=" + pConfig[i]);
				    break;
				case "user":
				    oCmdArgs.push("--user=" + pConfig[i]);
				    break;
				default:
					//TODO
					break;
			}
			//console.log('i=' + i + ', config=' + pConfig[i]);
		}
		
		oCmdArgs.push( pConfig[ 'db_name' ] );
		oCmdArgs.push( pKey );
		//TODO: if "table_name" given in config, maybe rename file before running mysqlimport command...or so a "ln -s" maybe???
		
		var oCmd = "/usr/bin/mysqlimport " + oCmdArgs.join(' ');
		pExecutor.exec( oCmd, { context: pKey }, function( error, stdout, stderr ) {
			winston.log('debug', '[%s] Done executing mysqlimport.', pParent);
			if ( error ) {
				winston.log('error', '[%s] Error executing mysqlimport.', pParent, error);
				oPromise.reject( error );
			} else {
				oPromise.resolve( stdout );
			}
		});
		
	} catch (e) {
		oPromise.reject( e );
		winston.log('error', '[%s] Unexpected error running mysqlimport.', pParent, e);
	}
	return oPromise;
}

ModClass.prototype.handle = function( pParent, pConfig, pExecutor ) {
	var oPromise = new Promise();
	winston.log('info', '[%s] Processing mysqlimport...', pParent);
	try {
		var oPromises = [];
		
		for (var i in pConfig) {
			var oOptions = this._read_options( pParent, i, pConfig[i] );
			oPromises.push( this._wrap_run( pParent, i, oOptions, pExecutor ) );
		}
		PromiseSeq( oPromises, {} ).then(function( pData ) {
			winston.log('info', '[%s] Done running mysqlimports.', pParent);
			oPromise.resolve( pData );
		}, function( pError ) {
			winston.log('error', '[%s] Error running mysqlimport.', pParent, pError);
			oPromise.reject( pError );
			
		});
	} catch (e) {
		oPromise.reject( e );
		winston.log('error', '[%s] Unexpected error running mysqlimport.', pParent, e);
	}
	return oPromise;
}



exports = module.exports = ModClass;