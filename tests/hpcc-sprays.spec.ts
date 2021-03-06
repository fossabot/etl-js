import { IETL, ModCallback } from "../lib/etl";
import Mod from "../lib/mod";
import Context from "../lib/context";
import { Callback, NoOpExecutor } from "../lib/executors";
import { assert } from "chai";
import { loadFile } from "./utils";
import HPCCSpraysMod from "../lib/hpcc-sprays";

describe("hpcc-sprays", function() {
  beforeEach(function(done: Function) {
    done();
  });

  afterEach(function(done: Function) {
    done();
  });

  /**
   * @return Context
   */
  function emptyContext(): Context {
    return { env: {}, vars: {} };
  }

  class ETLMock implements IETL {
    mod(_pKey: string, _pSource: Mod, pCallback: ModCallback): void {
      pCallback({ test: true });
    }
  }

  it("mod", function(done) {
    const oTested = new HPCCSpraysMod();
    oTested.register(new ETLMock());
    assert.deepEqual(oTested.mSettings, { test: true });
    done();
  });

  it("tagsMixSingleAndMultipleValues", function(done) {
    class ExecutorClass extends NoOpExecutor {
      exec(pCmd: string, _pCmdOpts: any, pCallback: Callback): void {
        pCallback(null, pCmd, "");
      }
    }
    const oTemplate = {
      root: {
        "noaa::ghcn::daily::{{ years }}::raw": {
          format: "csv",
          sourceIP: "192.168.0.10",
          sourcePath:
            "/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/{{ single }}/{{ years }}.csv"
        }
      }
    };
    const oContext: Context = {
      env: {},
      vars: {},
      years: [2018, 2019, 2020],
      single: "hello"
    };
    const oExecutor = new ExecutorClass();
    const oTested = new HPCCSpraysMod();
    oTested.register(new ETLMock());

    oTested.handle("root", oTemplate["root"], oExecutor, oContext).then(
      function(pData: any) {
        // console.dir( pData );
        try {
          assert.property(pData["hpcc-sprays"], "noaa::ghcn::daily::2018::raw");
          assert.property(pData["hpcc-sprays"], "noaa::ghcn::daily::2019::raw");
          assert.property(pData["hpcc-sprays"], "noaa::ghcn::daily::2020::raw");
          assert.include(
            pData["hpcc-sprays"]["noaa::ghcn::daily::2018::raw"]["result"],
            "srcfile=/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/hello/2018.csv"
          );
          assert.include(
            pData["hpcc-sprays"]["noaa::ghcn::daily::2019::raw"]["result"],
            "srcfile=/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/hello/2019.csv"
          );
          assert.include(
            pData["hpcc-sprays"]["noaa::ghcn::daily::2020::raw"]["result"],
            "srcfile=/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/hello/2020.csv"
          );
          done();
        } catch (e) {
          done(e);
        }
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });

  it("tagsMultipleValues", function(done) {
    class ExecutorClass extends NoOpExecutor {
      exec(pCmd: string, _pCmdOpts: any, pCallback: Callback): void {
        pCallback(null, pCmd, "");
      }
    }
    const oTemplate = {
      root: {
        "noaa::ghcn::daily::{{ years }}::raw": {
          format: "csv",
          sourceIP: "192.168.0.10",
          sourcePath:
            "/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/{{ years }}.csv"
        }
      }
    };
    const oContext: Context = {
      env: {},
      vars: {},
      years: [2018, 2019, 2020]
    };
    const oExecutor = new ExecutorClass();
    const oTested = new HPCCSpraysMod();
    oTested.register(new ETLMock());

    oTested.handle("root", oTemplate["root"], oExecutor, oContext).then(
      function(pData: any) {
        // console.dir( pData );
        try {
          assert.property(pData["hpcc-sprays"], "noaa::ghcn::daily::2018::raw");
          assert.property(pData["hpcc-sprays"], "noaa::ghcn::daily::2019::raw");
          assert.property(pData["hpcc-sprays"], "noaa::ghcn::daily::2020::raw");
          assert.include(
            pData["hpcc-sprays"]["noaa::ghcn::daily::2018::raw"]["result"],
            "srcfile=/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/2018.csv"
          );
          assert.include(
            pData["hpcc-sprays"]["noaa::ghcn::daily::2019::raw"]["result"],
            "srcfile=/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/2019.csv"
          );
          assert.include(
            pData["hpcc-sprays"]["noaa::ghcn::daily::2020::raw"]["result"],
            "srcfile=/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/2020.csv"
          );
          done();
        } catch (e) {
          done(e);
        }
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });

  it("tagsInTargetAndSourcePath", function(done) {
    class ExecutorClass extends NoOpExecutor {
      exec(pCmd: string, _pCmdOpts: any, pCallback: Callback): void {
        pCallback(null, pCmd, "");
      }
    }
    const oTemplate = {
      root: {
        "noaa::ghcn::daily::{{ year }}::raw": {
          format: "csv",
          sourceIP: "192.168.0.10",
          sourcePath:
            "/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/{{ year }}.csv"
        }
      }
    };
    const oContext: Context = {
      env: {},
      vars: {},
      year: "2018"
    };
    const oExecutor = new ExecutorClass();
    const oTested = new HPCCSpraysMod();
    oTested.register(new ETLMock());

    oTested.handle("root", oTemplate["root"], oExecutor, oContext).then(
      function(pData: any) {
        // console.dir( pData );
        try {
          assert.property(pData["hpcc-sprays"], "noaa::ghcn::daily::2018::raw");
          assert.include(
            pData["hpcc-sprays"]["noaa::ghcn::daily::2018::raw"]["result"],
            "srcfile=/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/2018.csv"
          );
          done();
        } catch (e) {
          done(e);
        }
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });

  it("executorThrowingError", function(done) {
    class ExecutorClass extends NoOpExecutor {
      exec(_pCmd: string, _pCmdOpts: any, _pCallback: Callback): void {
        throw new Error("Error generated for testing purposes.");
      }
    }
    const oTemplate = {
      root: {
        something: {
          format: "csv"
        }
      }
    };
    const oExecutor = new ExecutorClass();
    const oTested = new HPCCSpraysMod();
    oTested.register(new ETLMock());

    oTested.handle("root", oTemplate["root"], oExecutor, emptyContext()).then(
      function() {
        done("Expecting error.");
      },
      function() {
        done();
      }
    );
  });

  it("error", function(done) {
    class ExecutorClass extends NoOpExecutor {
      exec(_pCmd: string, _pCmdOpts: any, pCallback: Callback): void {
        pCallback(
          new Error("Error generated for testing purposes."),
          "",
          "some stderr stuff"
        );
      }
    }
    const oTemplate = {
      root: {
        something: {
          format: "csv"
        }
      }
    };
    const oExecutor = new ExecutorClass();
    const oTested = new HPCCSpraysMod();
    oTested.register(new ETLMock());

    oTested.handle("root", oTemplate["root"], oExecutor, emptyContext()).then(
      function() {
        done("Expecting error.");
      },
      function() {
        done();
      }
    );
  });

  it("safe_parse_int", function(done) {
    class ExecutorClass extends NoOpExecutor {
      exec(pCmd: string, _pCmdOpts: any, pCallback: Callback): void {
        assert.include(pCmd, "nowait=0");
        pCallback(null, "", "");
      }
    }
    const oTemplate = {
      root: {
        something: {
          format: "csv",
          timeout: "abcd"
        }
      }
    };
    const oExecutor = new ExecutorClass();
    const oTested = new HPCCSpraysMod();
    oTested.register(new ETLMock());

    oTested.handle("root", oTemplate["root"], oExecutor, emptyContext()).then(
      function() {
        done();
      },
      function(pError: Error) {
        // console.log( pError );
        done(pError);
      }
    );
  });

  it("apply_settings", function(done) {
    class ExecutorClass extends NoOpExecutor {
      exec(pCmd: string, _pCmdOpts: any, pCallback: Callback): void {
        assert.include(pCmd, "server=127.0.0.1");
        assert.include(pCmd, "username=foobar");
        assert.include(pCmd, "password=foobar");
        pCallback(null, "", "");
      }
    }

    const oExecutor = new ExecutorClass();
    const oSettings = {
      "*": {
        server: "127.0.0.1",
        username: "foobar",
        password: "foobar"
      }
    };
    const oTested = new HPCCSpraysMod(oSettings);

    const oTemplate = {
      root: {
        something: {
          format: "csv",
          sourcePath:
            "/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/2018.csv"
        }
      }
    };

    oTested.handle("root", oTemplate["root"], oExecutor, emptyContext()).then(
      function() {
        done();
      },
      function(pError: Error) {
        // console.log( pError );
        done(pError);
      }
    );
  });

  it("xml", function(done) {
    const oExecutor = new NoOpExecutor();
    const oTested = new HPCCSpraysMod();
    oTested.register(new ETLMock());

    const oTemplate = loadFile("./hpcc-sprays/xml.yml");

    oTested.handle("root", oTemplate["root"], oExecutor, emptyContext()).then(
      function() {
        done("Update test (xml spray not supported before).");
      },
      function() {
        done();
      }
    );
  });

  it("fixed", function(done) {
    const oExecutor = new NoOpExecutor();
    const oTested = new HPCCSpraysMod();
    oTested.register(new ETLMock());

    const oTemplate = loadFile("./hpcc-sprays/fixed.yml");

    oTested.handle("root", oTemplate["root"], oExecutor, emptyContext()).then(
      function() {
        done("Update test (f spray not supported before).");
      },
      function() {
        done();
      }
    );
  });

  it("missingFormat", function(done) {
    const oExecutor = new NoOpExecutor();
    const oTested = new HPCCSpraysMod({
      "*": { server: "1.2.3.4" }
    });

    const oTemplate = {
      root: {
        "noaa::ghcn::daily::2018::raw": {
          sourceIP: "192.168.0.10"
        }
      }
    };

    oTested.handle("root", oTemplate["root"], oExecutor, emptyContext()).then(
      function() {
        done("Expected error due to missing format information in template.");
      },
      function() {
        done();
      }
    );
  });

  it("invalidFormat", function(done) {
    const oExecutor = new NoOpExecutor();
    const oTested = new HPCCSpraysMod({
      "*": { server: "1.2.3.4" }
    });

    const oTemplate = {
      root: {
        "noaa::ghcn::daily::2018::raw": {
          sourceIP: "192.168.0.10",
          format: "concrete"
        }
      }
    };

    oTested.handle("root", oTemplate["root"], oExecutor, emptyContext()).then(
      function() {
        done();
      },
      function(pError: Error) {
        done(pError);
      }
    );
  });

  it("delimited", function(done) {
    class ExecutorClass extends NoOpExecutor {
      exec(pCmd: string, _pCmdOpts: any, pCallback: Callback): void {
        // console.log('cmd=' + pCmd );
        assert.include(pCmd, "action=spray");
        assert.include(pCmd, "server=1.2.3.4");
        assert.include(
          pCmd,
          "srcfile=/var/lib/HPCCSystems/mydropzone/noaa/ghcn/daily/by_year/2018.csv"
        );
        assert.include(pCmd, "format=csv");
        assert.include(pCmd, "srcip=192.168.0.10");
        assert.include(pCmd, "maxrecordsize=4096");
        assert.include(pCmd, "srccsvseparator=\\,");
        assert.include(pCmd, "srccsvterminator=\\n,\\r\\n");
        assert.include(pCmd, 'quote=\\"');
        assert.include(pCmd, "dstcluster=mythor");
        assert.include(pCmd, "dstname=noaa::ghcn::daily::2018::raw");
        assert.include(pCmd, "nowait=1");
        assert.include(pCmd, "server=");
        assert.include(pCmd, "connect=1");
        assert.include(pCmd, "overwrite=0");
        assert.include(pCmd, "replicate=0");
        assert.include(pCmd, "compress=0");
        assert.include(pCmd, "username=foo");
        assert.include(pCmd, "password=bar");
        assert.include(pCmd, "escape=");
        assert.include(pCmd, "failifnosourcefile=0");
        assert.include(pCmd, "recordstructurepresent=0");
        assert.include(pCmd, "quotedTerminator=0");
        assert.include(pCmd, "encoding=ascii");
        assert.include(pCmd, "expiredays=-1");
        pCallback(null, "", "");
      }
    }

    const oExecutor = new ExecutorClass();
    const oTested = new HPCCSpraysMod({
      "*": { server: "1.2.3.4", username: "foo", password: "bar" }
    });

    const oTemplate = loadFile("./hpcc-sprays/delimited.yml");

    oTested.handle("root", oTemplate["root"], oExecutor, emptyContext()).then(
      function() {
        done();
      },
      function(pError: Error) {
        // console.log( pError );
        done(pError);
      }
    );
  });
  /*
	it('fixed',function(done){
    	
    	var ExecutorClass = function() {};
    	ExecutorClass.prototype.exec = function( pCmd, pCmdOpts, pCallback ) {
    		pCallback( null, "", "" );
    	}
    	
    	var oExecutor = new ExecutorClass();
    	var oTested = new HPCCSpraysMod();
    	
		var oConfig = load_file( "./sprays/fixed.yaml" );
		
		oTested.handle( 'root' , oConfig['root'], oExecutor ).then(function() {
			done();
		}, function( pError ) {
			console.log( pError );
			done( pError );
		})
		
    	
	});
	
	it('xml',function(done){
    	
    	var ExecutorClass = function() {};
    	ExecutorClass.prototype.exec = function( pCmd, pCmdOpts, pCallback ) {
    		pCallback( null, "", "" );
    	}
    	
    	var oExecutor = new ExecutorClass();
    	var oTested = new HPCCSpraysMod();
    	
		var oConfig = load_file( "./sprays/xml.yaml" );
		
		oTested.handle( 'root' , oConfig['root'], oExecutor ).then(function() {
			done();
		}, function( pError ) {
			console.log( pError );
			done( pError );
		})
		
    	
	});
	*/
});
